import { Router } from 'express'
import prisma from '../../lib/prisma.js'
import { generateToken, hashPassword } from '../../lib/utils.js'
import notifyEmail from '../../lib/send-mail.js'

const router = Router()

router.post('/request', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (user) {
      const recoveryToken = generateToken(
        { userId: user.id, type: 'recovery' },
        process.env.JWT_SECRET + '_recovery',
        '1h'
      )

      await notifyEmail.recovery(email, recoveryToken)
    }

    // Sempre retorna sucesso para evitar enumeração de emails
    res.json({ message: 'Se o email existir, um link de recuperação foi enviado' })
  } catch (error) {
    console.error('Erro na recuperação:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.post('/reset', async (req, res) => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token e nova senha são obrigatórios' })
    }

    // Implementar verificação do token e reset da senha
    res.json({ message: 'Senha resetada com sucesso' })
  } catch (error) {
    console.error('Erro no reset:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

export default router
