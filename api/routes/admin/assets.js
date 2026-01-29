import { Router } from 'express'
import prisma from '../../lib/prisma.js'
import { authenticateToken } from '../../middleware/authentication.js'
import { requireSupportOrMaster } from '../../middleware/authorization.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import fsPromises from 'fs/promises'

const router = Router()

router.use(authenticateToken)
router.use(requireSupportOrMaster)

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.svg', '.png', '.jpg', '.jpeg', '.webp']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('Tipo de arquivo nao permitido'))
    }
  }
})

const normalizeSymbol = (symbol) => symbol.trim().toUpperCase()
const logosDir = path.join(process.cwd(), 'assets', 'logos')

const findAsset = async (identifier) => {
  const idNumber = parseInt(identifier)
  if (!isNaN(idNumber)) {
    return prisma.assets.findUnique({ where: { id: idNumber } })
  }
  return prisma.assets.findFirst({ where: { symbol: normalizeSymbol(identifier) } })
}

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const perPage = parseInt(req.query.perPage) || 20
    const q = (req.query.q || '').trim()

    const where = {}
    const orFilters = []

    if (q) {
      orFilters.push(
        { symbol: { contains: q } },
        { longName: { contains: q } },
        { shortName: { contains: q } }
      )
    }

    if (orFilters.length) {
      where.OR = orFilters
    }

    const [total, list] = await Promise.all([
      prisma.assets.count({ where }),
      prisma.assets.findMany({
        where,
        orderBy: { id: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage
      })
    ])

    res.json({ list, total, page, perPage })
  } catch (error) {
    console.error('Erro ao listar assets:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const asset = await findAsset(req.params.id)
    if (!asset) return res.status(404).json({ error: 'Ativo nao encontrado' })
    res.json({ asset })
  } catch (error) {
    console.error('Erro ao buscar asset:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.post('/:symbol/logo', upload.single('logo'), async (req, res) => {
  try {
    const symbol = normalizeSymbol(req.params.symbol)
    if (!req.file) return res.status(400).json({ error: 'Arquivo nao enviado' })

    const asset = await prisma.assets.findFirst({ where: { symbol } })
    if (!asset) return res.status(404).json({ error: 'Ativo nao encontrado' })

    const ext = path.extname(req.file.originalname).toLowerCase()
    await fsPromises.mkdir(logosDir, { recursive: true })

    const files = await fsPromises.readdir(logosDir)
    const removals = files
      .filter(f => f.toLowerCase().startsWith(symbol.toLowerCase() + '.'))
      .map(f => fsPromises.unlink(path.join(logosDir, f)))
    await Promise.allSettled(removals)

    const filename = `${symbol}${ext}`
    const filePath = path.join(logosDir, filename)
    await fsPromises.writeFile(filePath, req.file.buffer)

    const imagePath = `/files/logo/${filename}`
    await prisma.assets.update({
      where: { id: asset.id },
      data: { image: imagePath }
    })

    res.json({ message: 'Logo atualizada', image: imagePath })
  } catch (error) {
    console.error('Erro ao salvar logo:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.delete('/:symbol/logo', async (req, res) => {
  try {
    const symbol = normalizeSymbol(req.params.symbol)
    const asset = await prisma.assets.findFirst({ where: { symbol } })
    if (!asset) return res.status(404).json({ error: 'Ativo nao encontrado' })

    const files = fs.existsSync(logosDir) ? await fsPromises.readdir(logosDir) : []
    const removals = files
      .filter(f => f.toLowerCase().startsWith(symbol.toLowerCase() + '.'))
      .map(f => fsPromises.unlink(path.join(logosDir, f)))
    await Promise.allSettled(removals)

    await prisma.assets.update({
      where: { id: asset.id },
      data: { image: null }
    })

    res.json({ message: 'Logo removida' })
  } catch (error) {
    console.error('Erro ao remover logo:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

export default router
