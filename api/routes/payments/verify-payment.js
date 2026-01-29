// routes/payments/verify-payment.js
import { Router } from 'express'
import { authenticateToken } from '../../middleware/authentication.js'
import prisma from '../../lib/prisma.js'

const router = Router()

// Verificar status do pagamento (apenas consulta)
router.get('/verify/:txid', authenticateToken, async (req, res) => {
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

export default router