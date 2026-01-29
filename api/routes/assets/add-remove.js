// routes/assets/add-remove.js
import { Router } from 'express'
import { authenticateToken } from '../../middleware/authentication.js'
import prisma from '../../lib/prisma.js'
import axios from 'axios';
import {generateUUID} from '../../lib/utils.js'
import { analyzeStockData } from '../../lib/analysis.js';

const router = Router()

// Adicionar asset aos meus assets
router.post('/my-assets', authenticateToken, async (req, res) => {
  try {
    const { symbol, name } = req.body

    let {data} = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
    console.log(data.chart.result[0].meta);
    data = analyzeStockData(data);

    console.log(symbol,symbol.toUpperCase())

    const userId = req.user.id

    if (!symbol) {
      return res.status(400).json({ error: 'Símbolo é obrigatório' })
    }


    // Verificar se já existe
    const existingAsset = await prisma.my_assets.findFirst({
      where: {
        user_id: userId,
        symbol: symbol.toUpperCase()
      }
    })

    if (existingAsset) {
      return res.status(409).json({ error: 'Asset já está na sua lista' })
    }

    // Criar asset
    const asset = await prisma.my_assets.create({
      data: {
        symbol: symbol.toUpperCase(),
        name: name || symbol,
        data: data || {},
        user_id: userId,
        hash: generateUUID()
      }
    })

    
    res.status(201).json({
      success: true,
      message: 'Asset adicionado com sucesso',
      asset
    })

  } catch (error) {
    console.error('Erro ao adicionar asset:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

// Remover asset dos meus assets
router.delete('/my-assets/:symbol', authenticateToken, async (req, res) => {
  try {
    const { symbol } = req.params
    const userId = req.user.id

    console.log(req.url,symbol)

    if (!symbol) {
      return res.status(400).json({ error: 'Símbolo é obrigatório' })
    }

    // Verificar se existe
    const existingAsset = await prisma.my_assets.findFirst({
      where: {
        user_id: userId,
        symbol: symbol.toUpperCase()
      }
    })

    if (!existingAsset) {
      return res.status(404).json({ error: 'Asset não encontrado na sua lista' })
    }

    // Remover asset
    await prisma.my_assets.delete({
      where: { id: existingAsset.id }
    })

    res.json({
      success: true,
      message: 'Asset removido com sucesso'
    })

  } catch (error) {
    console.error('Erro ao remover asset:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

export default router