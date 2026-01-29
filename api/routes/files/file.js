import { Router } from 'express'
import path from 'path'
import fs from 'fs'
import { optionalAuth } from '../../middleware/authentication.js'

const router = Router()
router.get('/logo/:filename', async (req, res) => {
  try {
    const { filename } = req.params
    const ext = path.extname(filename)
    const symbol = filename.replace(ext, '')
    const logosDir = path.join(process.cwd(), 'assets', 'logos')
    const mimeTypes = {
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp'
    }

    let targetFile = path.join(logosDir, filename)

    if (!fs.existsSync(targetFile)) {
      if (!fs.existsSync(logosDir)) {
        return res.status(404).send('')
      }
      const files = fs.readdirSync(logosDir)
      const found = files.find(f => f.toLowerCase().startsWith(symbol.toLowerCase() + '.'))
      if (found) {
        targetFile = path.join(logosDir, found)
      }
    }

    if (!fs.existsSync(targetFile)) {
      return res.status(404).send('')
    }

    const targetExt = path.extname(targetFile).toLowerCase()
    res.setHeader('Content-Type', mimeTypes[targetExt] || 'application/octet-stream')
    return res.sendFile(targetFile)
  } catch (error) {
    console.error('Erro ao buscar logo:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})
router.get('/:filename', optionalAuth, (req, res) => {
  try {
    const { filename } = req.params
    const filePath = path.join(process.cwd(), 'uploads', filename)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo nao encontrado' })
    }

    // Aqui voce pode adicionar logica de autorizacao baseada no usuario

    res.sendFile(filePath)
  } catch (error) {
    console.error('Erro ao servir arquivo:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})


export default router
