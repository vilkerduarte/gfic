import { Router } from 'express'
import { generateUUID } from '../lib/utils.js'
import { analyzeStockData } from '../lib/analysis.js'
import {
  authenticateToken,
  optionalAuth
} from '../middleware/authentication.js'
import prisma from '../lib/prisma.js'
import {
  findStockBySymbol,
  fetchHistoricalDataForStock,
  hydrateStocksWithPrices,
  searchExternalStocks
} from '../lib/market-data.js'

const router = Router()

const typeCache = new Map() // key: region, value: {ts, types}
const CACHE_TTL_MS = 60 * 60 * 1000

function buildRegionWhere(region) {
  const r = (region || '').toLowerCase()
  if (r === 'br') {
    return { currency: 'BRL', NOT: { type: 'CRYPTO' } }
  }
  if (r === 'us') {
    return { currency: 'USD', NOT: { type: 'CRYPTO' } }
  }
  if (r === 'crypto') {
    return { type: 'CRYPTO' }
  }
  return {}
}

async function getCachedTypes(region) {
  const key = (region || 'all').toLowerCase()
  const cached = typeCache.get(key)
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.types
  }

  const where = buildRegionWhere(region)
  const rows = await prisma.stocks.findMany({
    where,
    distinct: ['type'],
    select: { type: true }
  })
  const types = rows
    .map((r) => r.type)
    .filter(Boolean)
    .sort()

  typeCache.set(key, { ts: Date.now(), types })
  return types
}

router.get('/', async (req, res) => {
  try {
    const region = req.query.region || 'all'
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const perPage = Math.max(Math.min(parseInt(req.query.perPage) || 12, 100), 1)
    const type = req.query.type

    const where = {
      ...buildRegionWhere(region),
      ...(type ? { type } : {})
    }

    const [total, list, types] = await Promise.all([
      prisma.stocks.count({ where }),
      prisma.stocks.findMany({
        where,
        orderBy: [
          { volume: 'desc' },
          { market_cap: 'desc' },
          { id: 'desc' }
        ],
        skip: (page - 1) * perPage,
        take: perPage
      }),
      getCachedTypes(region)
    ])

    const payload = await hydrateStocksWithPrices(list)
    return res.status(200).json({
      list: payload,
      page,
      perPage,
      total,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
      types
    })
  } catch (error) {
    console.error('Erro ao listar assets:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q } = req.query
    if (!q || !q.trim()) return res.status(200).json([])

    const where = {
      OR: [
        { symbol: { startsWith: q.toUpperCase() } },
        { name: { contains: q } },
        { sector: { contains: q } }
      ]
    }

    const dbResults = await prisma.stocks.findMany({
      where,
      take: 10,
      orderBy: [
        { volume: 'desc' },
        { market_cap: 'desc' }
      ]
    })

    let formatted = await hydrateStocksWithPrices(dbResults)

    if (formatted.length < 6) {
      const external = await searchExternalStocks(q, 8)
      const already = new Set(formatted.map((a) => a.symbol))
      formatted = [
        ...formatted,
        ...external.filter((e) => !already.has(e.symbol)).slice(0, 8)
      ]
    }

    return res.status(200).json(formatted)
  } catch (error) {
    console.error('Erro ao buscar assets:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.get('/my-assets', authenticateToken, async (req, res) => {
  try {
    let { q, page } = req.query
    page = page ? parseInt(page) : 1

    const orFilters = q
      ? [
          { symbol: { startsWith: q.toUpperCase() } },
          { name: { contains: q } },
          { data: { string_contains: q } }
        ]
      : null

    const where = {
      user_id: req.user.id,
      ...(orFilters ? { OR: orFilters } : {})
    }

    let list = await prisma.my_assets.findMany({
      where,
      take: 20,
      skip: (page - 1) * 20
    })

    const ids = list.map((a) => a.symbol)
    let repo = {}
    if (ids.length) {
      const reports = await prisma.reports.findMany({
        where: {
          user_id: req.user.id,
          status: { in: ['active', 'pending'] },
          symbol: { in: ids }
        },
        orderBy: { id: 'asc' }
      })
      reports.forEach((r) => {
        repo[r.symbol] = r
      })
      list = list.map((item) => ({
        ...item,
        report: repo[item.symbol] || null
      }))
    }

    const num = await prisma.my_assets.count({ where })
    return res.status(200).json({
      total_pages: Math.ceil(num / 20),
      total_items: num,
      page,
      list
    })
  } catch (error) {
    console.error('Erro ao listar meus assets:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.post('/my-assets', authenticateToken, async (req, res) => {
  try {
    const { symbol } = req.body
    const userId = req.user.id

    if (!symbol) {
      return res.status(400).json({ error: 'Símbolo é obrigatório' })
    }

    const existingAsset = await prisma.my_assets.findFirst({
      where: { user_id: userId, symbol: symbol.toUpperCase() }
    })
    if (existingAsset) {
      return res.status(409).json({ error: 'Asset já está na sua lista' })
    }

    const stock = await findStockBySymbol(symbol)
    if (!stock) {
      return res.status(404).json({ error: 'Ativo não encontrado na base' })
    }

    const series = await fetchHistoricalDataForStock(stock)
    const analyzed = analyzeStockData(series)

    const asset = await prisma.my_assets.create({
      data: {
        symbol: stock.symbol,
        name: stock.name || stock.symbol,
        data: analyzed || {},
        user_id: userId,
        hash: generateUUID()
      }
    })

    return res.status(201).json({
      success: true,
      message: 'Asset adicionado com sucesso',
      asset
    })
  } catch (error) {
    console.error('Erro ao adicionar asset:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.delete('/my-assets/:symbol', authenticateToken, async (req, res) => {
  try {
    const { symbol } = req.params
    const userId = req.user.id

    if (!symbol) {
      return res.status(400).json({ error: 'Símbolo é obrigatório' })
    }

    const existingAsset = await prisma.my_assets.findFirst({
      where: { user_id: userId, symbol: symbol.toUpperCase() }
    })

    if (!existingAsset) {
      return res.status(404).json({ error: 'Asset não encontrado na sua lista' })
    }

    await prisma.my_assets.delete({ where: { id: existingAsset.id } })
    return res.json({ success: true, message: 'Asset removido com sucesso' })
  } catch (error) {
    console.error('Erro ao remover asset:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

export default router
