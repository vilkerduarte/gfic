import { Router } from 'express'
import { authenticateToken } from '../../middleware/authentication.js'
import prisma from '../../lib/prisma.js'
import { hashPassword, sanitizeUser } from '../../lib/utils.js'

const router = Router()

router.use(authenticateToken)

router.get('/account', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        permissions: true,
        userConfigs: true
      }
    });
    let my = await prisma.my_assets.findMany({
      where: {
        user_id: user.id
      }, select: { symbol: true }
    });

    my = my.map(a => a.symbol).join('!');
    user.assets = my;
    res.json({ user: sanitizeUser(user) })
  } catch (error) {
    console.error('Erro ao buscar dados:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.put('/account', async (req, res) => {
  try {
    const { name, email } = req.body

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(email && { email })
      },
      include: {
        permissions: true
      }
    })

    res.json({
      message: 'Dados atualizados com sucesso',
      user: sanitizeUser(updatedUser)
    })
  } catch (error) {
    console.error('Erro ao atualizar:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.get('/account/assets', async (req, res) => {
  try {
    
    let my = await prisma.my_assets.findMany({
      where: {
        user_id: req.user.id
      }, select: { symbol: true }
    });

    my = my.map(a => a.symbol).join('!');
    res.json({ assets:my })
  } catch (error) {
    console.error('Erro ao buscar dados:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})



export default router