// routes/payments/confirm-payment.js
import { Router } from 'express'
import { authenticateToken } from '../../middleware/authentication.js'
import prisma from '../../lib/prisma.js'
import Bank from '../../lib/inter.js'
import Admin from '../../lib/manager.js'

const router = Router()

// Confirmar pagamento (busca ativa na API do banco)
router.post('/confirm-payment', authenticateToken, async (req, res) => {
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