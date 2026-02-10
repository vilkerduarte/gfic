import { Router } from 'express'
import path from 'path'
import fs from 'fs'
import { optionalAuth } from '../../middleware/authentication.js'
import { downloadFile } from '../../lib/indexer-utils.js'

const router = Router()
router.get('/logo/:filename', async (req, res) => {
  try {
    const { filename } = req.params
    const ext = path.extname(filename)
    let [symbol,type,currency] = filename.replace(ext, '').split('--');
    type = type.toLowerCase().replaceAll(' ','-');
    // console.log(req.url,req.params);
    console.log(symbol,type);
    const mimeTypes = {
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp'
    }
    const logosDir = path.join(process.cwd(), 'assets', 'logos',type,currency);
    try {
      fs.mkdirSync(logosDir,{recursive:true});
    } catch (error) {
      
    }
    
    let targetFile = path.join(logosDir,symbol+'.svg');
    
    if (!fs.existsSync(targetFile)) {
      if(!fs.existsSync('no-icons.txt')){
        fs.writeFileSync('no-icons.txt','');
      }
      let noIconsFile = fs.readFileSync('no-icons.txt','utf-8');
      let url;
      if(currency == 'BRL' && type != 'crypto'){
        url = `https://icons.brapi.dev/icons/${symbol.toUpperCase()}.svg`
      }else if(type == 'common-stock'){
        url = `https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/${symbol.toUpperCase()}.svg`;
      }else if(type == 'crypto'){
        url = `https://cdn.changelly.com/icons-colored/${symbol.toLowerCase()}.svg`
      }else{
        return res.status(404).send('')
      }
      if(noIconsFile.includes(url)){
        return res.status(404).send('')
      }
      try {
        await downloadFile(url,targetFile);
      } catch (error) {
        console.error("Erro ao Baixar: "+url,targetFile);
      }
      if (!fs.existsSync(targetFile)) {
        fs.appendFileSync('no-icons.txt',`${url}\n`);
        return res.status(404).send('')
      }
    }
    // console.log(targetFile);

    const targetExt = path.extname(targetFile).toLowerCase()
    res.setHeader('Content-Type', mimeTypes[targetExt] || 'application/octet-stream')
    return res.sendFile(targetFile)
  } catch (error) {
    // console.error('Erro ao buscar logo:', error)
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
