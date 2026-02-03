import axios from 'axios'
import prisma from './prisma.js'
import {
  finnhubClient,
  brapiClient,
  micNameMap,
  classifyB3Symbol
} from './indexer-utils.js'

const FINNHUB_TOKEN = process.env.FINNHUB_API_KEY

const toFloat = (value, divisor = 1) =>
  value === null || value === undefined ? null : Number(value) / divisor

export const findStockBySymbol = async (symbol) => {
  if (!symbol) return null
  return prisma.stocks.findFirst({
    where: { symbol: symbol.toUpperCase() }
  })
}

export const formatStockForClient = (stock) => {
  if (!stock) return null
  const close = toFloat(stock.close, 100)
  const changeAbs = toFloat(stock.change, 100000)
  const previousClose =
    close != null && changeAbs != null ? close - changeAbs : null
  const changePercent =
    previousClose && previousClose !== 0
      ? (changeAbs / previousClose) * 100
      : null

  const marketCap = stock.market_cap != null ? toFloat(stock.market_cap, 100) : null

  const logoPath =
    stock.logo ||
    `/files/logo/${stock.symbol}.svg?q=${encodeURIComponent(stock.name || '')}`

  return {
    id: stock.id,
    symbol: stock.symbol,
    name: stock.name,
    currency: stock.currency || null,
    mic: stock.mic || null,
    exchange: micNameMap[stock.mic] || stock.mic || null,
    type: stock.type || classifyB3Symbol(stock.symbol, stock.name) || null,
    price: close,
    change: changeAbs,
    changePercent,
    volume: stock.volume != null ? Number(stock.volume) : null,
    marketCap,
    sector: stock.sector || null,
    logo: logoPath,
    image: logoPath
  }
}

async function callFinnhub(methodName, ...args) {
  return new Promise((resolve, reject) => {
    const callback = (error, data) => {
      if (error) {
        reject(error)
      } else {
        resolve(data)
      }
    }
    finnhubClient[methodName](...args, callback)
  })
}

export async function fetchFinnhubQuote(symbol) {
  if (!symbol || !FINNHUB_TOKEN) return null
  const data = await callFinnhub('quote', symbol)
  if (!data) return null
  return {
    current: data.c ?? null,
    change: data.d ?? null,
    changePercent: data.dp ?? null,
    previousClose: data.pc ?? null,
    volume: data.v ?? null
  }
}

export async function hydrateStocksWithPrices(stocks = []) {
  const list = Array.isArray(stocks) ? [...stocks] : []
  const targets = list.filter(
    (item) => item && item.close == null && item.type !== 'CRYPTO'
  )

  const symbols = [...new Set(targets.map((s) => s.symbol))].slice(0, 25)
  const quotePairs = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const quote = await fetchFinnhubQuote(symbol)
        return [symbol, quote]
      } catch (error) {
        return [symbol, null]
      }
    })
  )
  const quoteMap = Object.fromEntries(
    quotePairs.filter(([, quote]) => quote && quote.current != null)
  )

  list.forEach((stock) => {
    const quote = quoteMap[stock.symbol]
    if (quote) {
      stock.close = Math.round(quote.current * 100)
      stock.change =
        quote.change != null ? Math.round(quote.change * 100000) : stock.change
      stock.volume =
        quote.volume != null ? BigInt(Math.round(quote.volume)) : stock.volume
    }
  })

  return list.map(formatStockForClient)
}

export async function searchExternalStocks(query, limit = 6) {
  const [br, us] = await Promise.all([
    searchBrapi(query, limit),
    searchFinnhub(query, limit)
  ])

  const combined = [...br, ...us]
  const seen = new Set()
  const result = []
  for (const item of combined) {
    if (!item || !item.symbol) continue
    if (seen.has(item.symbol)) continue
    seen.add(item.symbol)
    result.push(item)
    if (result.length >= limit) break
  }
  return result
}

async function searchBrapi(query, limit = 6) {
  try {
    const resp = await brapiClient.quote.list({
      search: query,
      limit
    })
    const stocks = resp?.stocks || []
    return stocks.slice(0, limit).map((item) => {
      const close = item.close != null ? Number(item.close) : null
      const change = item.change != null ? Number(item.change) : null
      const previous = close != null && change != null ? close - change : null
      const changePercent =
        previous && previous !== 0 ? (change / previous) * 100 : null

      return {
        symbol: item.stock,
        name: item.name,
        currency: 'BRL',
        mic: 'BVMF',
        exchange: micNameMap.BVMF,
        type: item.type || classifyB3Symbol(item.stock, item.name),
        price: close,
        change,
        changePercent,
        volume: item.volume ?? null,
        marketCap: item.market_cap ?? null,
        sector: item.sector ?? null,
        logo: item.logo || null,
        image: item.logo || null
      }
    })
  } catch (error) {
    return []
  }
}

async function searchFinnhub(query, limit = 6) {
  if (!FINNHUB_TOKEN) return []
  try {
    const { data } = await axios.get('https://finnhub.io/api/v1/search', {
      params: { q: query, token: FINNHUB_TOKEN }
    })
    const list = data?.result || []
    const trimmed = list
      .filter((r) => r.symbol || r.displaySymbol)
      .slice(0, limit)

    const enriched = await Promise.all(
      trimmed.map(async (item) => {
        const symbol = item.symbol || item.displaySymbol
        const quote = await fetchFinnhubQuote(symbol).catch(() => null)
        const price = quote?.current ?? null
        const change = quote?.change ?? null
        const changePercent =
          quote?.changePercent ??
          (quote?.previousClose && change
            ? (change / quote.previousClose) * 100
            : null)

        return {
          symbol,
          name: item.description || symbol,
          currency: item.currency || 'USD',
          mic: item.exchange || null,
          exchange: item.exchange || null,
          type: item.type || 'stock',
          price,
          change,
          changePercent,
          volume: quote?.volume ?? null,
          marketCap: null,
          sector: null,
          logo: null,
          image: null
        }
      })
    )

    return enriched.filter(Boolean)
  } catch (error) {
    return []
  }
}

export async function fetchHistoricalDataForStock(stock) {
  if (!stock) throw new Error('Ativo não encontrado na base')
  const mic = (stock.mic || '').toUpperCase()
  const isBR =
    mic === 'BVMF' ||
    (stock.currency || '').toUpperCase() === 'BRL' ||
    !!classifyB3Symbol(stock.symbol, stock.name)

  if (stock.type === 'CRYPTO') {
    return fetchCryptoSeries(stock.symbol)
  }

  if (isBR) return fetchBrapiSeries(stock)
  return fetchFinnhubSeries(stock)
}

export async function fetchHistoricalDataBySymbol(symbol) {
  const stock = await findStockBySymbol(symbol)
  return fetchHistoricalDataForStock(stock)
}

async function fetchBrapiSeries(stock) {
  const symbol = stock.symbol.toUpperCase()
  const resp = await brapiClient.quote.retrieve(symbol, {
    range: '3mo',
    interval: '1d',
    fundamental: false,
    dividends: false
  })

  const result = resp?.results?.[0] || {}
  const history = result.historicalDataPrice || []
  const candles = history
    .map((h) => ({
      timestamp: h.date > 1e12 ? Math.floor(h.date / 1000) : h.date,
      open: h.open ?? h.price ?? h.close,
      high: h.high ?? h.close ?? h.price,
      low: h.low ?? h.close ?? h.price,
      close: h.close ?? h.price,
      volume: h.volume
    }))
    .filter((c) => c.close != null)

  const currentPrice =
    result.regularMarketPrice ?? result.close ?? candles.at(-1)?.close ?? null

  if (!candles.length && currentPrice != null) {
    const now = Math.floor(Date.now() / 1000)
    candles.push({
      timestamp: now - 86400,
      open: currentPrice,
      high: currentPrice,
      low: currentPrice,
      close: currentPrice,
      volume: result.regularMarketVolume ?? null
    })
    candles.push({
      timestamp: now,
      open: currentPrice,
      high: result.fiftyTwoWeekHigh ?? currentPrice,
      low: result.fiftyTwoWeekLow ?? currentPrice,
      close: currentPrice,
      volume: result.regularMarketVolume ?? null
    })
  }

  return {
    symbol,
    name:
      result.longName ||
      result.shortName ||
      stock.name ||
      result.symbol ||
      symbol,
    currency: result.currency || stock.currency || 'BRL',
    exchange: micNameMap.BVMF,
    mic: 'BVMF',
    type: stock.type || classifyB3Symbol(symbol, result.longName || result.shortName),
    previousClose: result.regularMarketPreviousClose ?? null,
    candles
  }
}

async function fetchFinnhubSeries(stock) {
  if (!FINNHUB_TOKEN) {
    throw new Error('FINNHUB_API_KEY não configurada')
  }
  const symbol = stock.symbol.toUpperCase()
  const to = Math.floor(Date.now() / 1000)
  const from = to - 90 * 24 * 3600

  const candles = await callFinnhub('stockCandles', symbol, 'D', from, to)
  if (!candles || candles.s !== 'ok' || !candles.c?.length) {
    throw new Error('Nenhum candle retornado pelo Finnhub')
  }

  const normalized = candles.t
    .map((t, i) => ({
      timestamp: t,
      open: candles.o?.[i],
      high: candles.h?.[i],
      low: candles.l?.[i],
      close: candles.c?.[i],
      volume: candles.v?.[i]
    }))
    .filter((c) => c.close != null)

  const profile = await callFinnhub('companyProfile2', { symbol }).catch(
    () => null
  )

  return {
    symbol,
    name: profile?.name || stock.name || symbol,
    currency: profile?.currency || stock.currency || 'USD',
    exchange: profile?.exchange || stock.mic || 'US',
    mic: stock.mic || profile?.exchange || null,
    type: stock.type || 'stock',
    previousClose: candles.pc ?? null,
    candles: normalized
  }
}

async function fetchCryptoSeries(symbol) {
  const resp = await brapiClient.v2.crypto.retrieve({
    coin: symbol,
    currency: 'USD'
  })

  const coin =
    resp?.coins?.find((c) => c.coin?.toUpperCase() === symbol.toUpperCase()) ||
    resp?.coins?.[0]

  if (!coin) throw new Error('Cripto não encontrada no Brapi')

  const price =
    coin.regularMarketPrice ??
    coin.close ??
    coin.price ??
    coin.marketPrice ??
    null

  const high = coin.regularMarketDayHigh ?? price
  const low = coin.regularMarketDayLow ?? price
  const open = coin.regularMarketOpen ?? price
  const volume = coin.regularMarketVolume24h ?? coin.volume ?? null

  const now = Math.floor(Date.now() / 1000)
  const candles = [
    {
      timestamp: now - 86400,
      open,
      high: open,
      low: open,
      close: open,
      volume
    },
    {
      timestamp: now,
      open,
      high,
      low,
      close: price,
      volume
    }
  ].filter((c) => c.close != null)

  return {
    symbol: coin.coin || symbol,
    name: coin.coinName || coin.name || symbol,
    currency: coin.currency || 'USD',
    exchange: 'CRYPTO',
    mic: null,
    type: 'CRYPTO',
    previousClose: open,
    candles
  }
}
