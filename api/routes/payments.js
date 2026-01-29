// routes/payments/buy-credits.js
import { Router } from 'express'
import { authenticateToken } from '../middleware/authentication.js'
import prisma from '../lib/prisma.js'
import Bank from '../lib/inter.js'
import { v4 as uuidv4 } from 'uuid'
import Admin from '../lib/manager.js'


const router = Router()


router.use(authenticateToken);

// Comprar créditos
router.post('/buy-credits', async (req, res) => {
  try {
    const { cpf, credits } = req.body
    const userId = req.user.id

    // Validações
    if (!cpf || !credits) {
      return res.status(400).json({ error: 'CPF e quantidade de créditos são obrigatórios' })
    }

    const creditsNum = parseInt(credits)
    if (isNaN(creditsNum) || creditsNum <= 0) {
      return res.status(400).json({ error: 'Quantidade de créditos inválida' })
    }

    if (creditsNum > 10000) {
      return res.status(400).json({ error: 'Máximo de 10.000 créditos por transação' })
    }

    // Validar CPF (formato básico)
    const cleanCPF = cpf.replace(/\D/g, '')
    if (cleanCPF.length !== 11) {
      return res.status(400).json({ error: 'CPF inválido' })
    }

    // Calcular valor em centavos
    const unitPrice = parseInt(await Admin.getConfig('credit-price') || 250) / 100  // R$ 2,50 por crédito
    const totalValue = creditsNum * unitPrice
    const valueInCents = Math.round(totalValue * 100)

    // Gerar TXID único
    const txid = uuidv4()

    // Preparar dados para PIX
    const cobrancaData = {
      calendario: {
        expiracao: 3600 // 1 hora
      },
      devedor: {
        cpf: cleanCPF,
        nome: req.user.name || `Cliente ${req.user.id}`
      },
      valor: {
        original: totalValue.toFixed(2),
        modalidadeAlteracao: 0
      },
      chave: process.env.INTER_PIX_KEY, // Chave PIX da empresa
      solicitacaoPagador: `Compra de ${creditsNum} créditos`,
      infoAdicionais: [
        {
          nome: "Produto",
          valor: "Créditos da Plataforma"
        },
        {
          nome: "Quantidade",
          valor: creditsNum.toString()
        }
      ]
    }

    // Criar cobrança no Inter
    const pixResponse = await Bank.criarCobrancaPix(cobrancaData)

    // Registrar invoice no banco
    const invoice = await prisma.invoices.create({
      data: {
        user_id: userId,
        credits: creditsNum,
        value: valueInCents,
        cpf: cleanCPF,
        txid: pixResponse.txid,
        data: pixResponse,
        status: 'pending'
      }
    })

    // Retornar dados para pagamento
    res.json({
      success: true,
      message: 'Cobrança PIX criada com sucesso',
      payment: {
        txid: pixResponse.txid,
        qrCode: pixResponse.loc?.location || pixResponse.location,
        pixCopiaECola:pixResponse?.pixCopiaECola,
        valor: totalValue.toFixed(2),
        expiracao: pixResponse.calendario.expiracao,
        status: pixResponse.status
      },
      credits: creditsNum,
      invoice: {
        id: invoice.id,
        status: invoice.status
      }
    })

  } catch (error) {
    console.error('Erro ao comprar créditos:', error)
    
    if (error.message.includes('Erro API:')) {
      return res.status(400).json({ error: 'Erro ao criar cobrança PIX: ' + error.message })
    }
    
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})
router.get('/verify/:txid', async (req, res) => {
  try {
    const { txid } = req.params
    const userId = req.user.id

    if (!txid) {
      return res.status(400).json({ error: 'TXID é obrigatório' })
    }

    // Buscar invoice no banco
    const invoice = await prisma.invoices.findFirst({
      where: {
        txid: txid,
        user_id: userId
      },
      select: {
        id: true,
        status: true,
        credits: true,
        value: true,
        created_at: true,
        updated_at: true
      }
    })

    if (!invoice) {
      return res.status(404).json({ error: 'Pagamento não encontrado' })
    }

    res.json({
      success: true,
      payment: {
        txid: txid,
        status: invoice.status,
        credits: invoice.credits,
        value: invoice.value,
        created_at: invoice.created_at,
        updated_at: invoice.updated_at
      }
    })

  } catch (error) {
    console.error('Erro ao verificar pagamento:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})
router.post('/confirm-payment', async (req, res) => {
  try {
    const { txid } = req.body
    const userId = req.user.id

    if (!txid) {
      return res.status(400).json({ error: 'TXID é obrigatório' })
    }

    // Buscar invoice no banco
    const invoice = await prisma.invoices.findFirst({
      where: {
        txid: txid,
        user_id: userId
      }
    })

    if (!invoice) {
      return res.status(404).json({ error: 'Pagamento não encontrado' })
    }

    // Se já está pago, apenas retorna sucesso
    if (invoice.status === 'paid') {
      return res.status(200).json({
        success: true,
        message: 'Pagamento já confirmado',
        payment: {
          txid: txid,
          status: 'paid',
          credits: invoice.credits
        }
      })
    }

    // Buscar cobrança na API do Inter
    const cobranca = await Bank.buscarCobrancaPix(txid)
    console.log(cobranca.status);

    if (!cobranca) {
      return res.status(404).json({ error: 'Cobrança não encontrada no banco' })
    }

    // Verificar se o pagamento foi realizado
    if (cobranca.status === 'CONCLUIDA') {
      // Atualizar invoice como paga
      await prisma.invoices.update({
        where: { id: invoice.id },
        data: {
          status: 'paid',
          data: cobranca
        }
      })

      await Admin.addCredits(req.user,invoice.credits,'Pagamento via PIX');

      return res.status(200).json({
        success: true,
        message: 'Pagamento confirmado e créditos adicionados!',
        payment: {
          txid: txid,
          status: 'paid',
          credits: invoice.credits
        }
      })

    } else if (cobranca.status === 'ATIVA') {
      // Pagamento ainda não realizado
      return res.status(200).json({
        success: false,
        message: 'Pagamento ainda não realizado',
        payment: {
          txid: txid,
          status: 'pending',
          credits: invoice.credits
        }
      })
    } else if (cobranca.status === 'REMOVIDA_PELO_USUARIO_RECEBEDOR' || cobranca.status === 'REMOVIDA_PELO_PSP') {
      // Cobrança expirada ou cancelada
      await prisma.invoices.update({
        where: { id: invoice.id },
        data: {
          status: 'expired'
        }
      })

      return res.json({
        success: false,
        message: 'Cobrança expirada ou cancelada',
        payment: {
          txid: txid,
          status: 'expired',
          credits: invoice.credits
        }
      })
    } else {
      // Outros status
      return res.json({
        success: false,
        message: `Status do pagamento: ${cobranca.status}`,
        payment: {
          txid: txid,
          status: cobranca.status.toLowerCase(),
          credits: invoice.credits
        }
      })
    }

  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error)
    
    if (error.message.includes('404') || error.message.includes('não encontrada')) {
      return res.status(404).json({ error: 'Cobrança não encontrada' })
    }
    
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

export default router