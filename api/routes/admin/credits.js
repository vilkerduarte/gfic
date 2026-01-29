import { Router } from 'express'
import prisma from '../../lib/prisma.js'
import { authenticateToken } from '../../middleware/authentication.js'
import { requireSupportOrMaster } from '../../middleware/authorization.js'
import Admin from '../../lib/manager.js'

const router = Router()

router.use(authenticateToken)
router.use(requireSupportOrMaster)

const findUser = async (id) => {
  const userId = parseInt(id)
  if (isNaN(userId)) return null
  return prisma.user.findUnique({ where: { id: userId } })
}

router.post('/:id/add', async (req, res) => {
  try {
    const user = await findUser(req.params.id)
    if (!user) return res.status(404).json({ error: 'Usuario nao encontrado' })

    const value = parseInt(req.body.value)
    if (isNaN(value) || value <= 0) {
      return res.status(400).json({ error: 'Valor invalido' })
    }

    const description = req.body.description || 'Ajuste de creditos (admin)'
    const credit = await Admin.addCredits(user, value, description)

    res.json({ message: 'Creditos adicionados', credit })
  } catch (error) {
    console.error('Erro ao adicionar creditos:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.post('/:id/remove', async (req, res) => {
  try {
    const user = await findUser(req.params.id)
    if (!user) return res.status(404).json({ error: 'Usuario nao encontrado' })

    const value = parseInt(req.body.value)
    if (isNaN(value) || value <= 0) {
      return res.status(400).json({ error: 'Valor invalido' })
    }

    const description = req.body.description || 'Remocao de creditos (admin)'
    const credit = await Admin.removeCredits(user, value, description)

    res.json({ message: 'Creditos removidos', credit })
  } catch (error) {
    console.error('Erro ao remover creditos:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

export default router
