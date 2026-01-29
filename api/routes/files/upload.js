import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { authenticateToken } from '../../middleware/authentication.js'
import { generateUUID } from '../../lib/utils.js'

const router = Router()

// Configuração do multer para upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const uniqueName = `${generateUUID()}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Tipo de arquivo não permitido'))
    }
  }
})

router.use(authenticateToken)

router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' })
    }

    res.json({
      message: 'Arquivo enviado com sucesso',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        path: req.file.path
      }
    })
  } catch (error) {
    console.error('Erro no upload:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

export default router