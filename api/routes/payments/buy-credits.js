// routes/payments/buy-credits.js
import { Router } from 'express'
import { authenticateToken } from '../../middleware/authentication.js'
import prisma from '../../lib/prisma.js'
import Bank from '../../lib/inter.js'
import { v4 as uuidv4 } from 'uuid'
import Admin from '../../lib/manager.js'

const router = Router()

// Comprar créditos
router.post('/buy-credits', authenticateToken, async (req, res) => {
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

export default router