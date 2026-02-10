import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cookie from 'cookie'
import fs from 'fs'
import { randomUUID } from 'crypto'

// Import routes
import prisma from './lib/prisma.js'
import assetsRouter from './routes/assets.js'
import authRouter from './routes/auth.js'
import filesRouter from './routes/files/file.js'
import uploadRouter from './routes/files/upload.js'
import paymentsRouter from './routes/payments.js'
import productsRouter from './routes/products.js'
import reportsRouter from './routes/reports/stock.js'
import adminUsersRouter from './routes/admin/users.js'
import adminPaymentsRouter from './routes/admin/payments.js'
import adminCreditsRouter from './routes/admin/credits.js'
import adminAssetsRouter from './routes/admin/assets.js'
import appPropsInfoRouter from './routes/app.js'
import { retroDate, sanitizeData, verifyToken } from './lib/utils.js'
import { sanitizeUser } from './lib/utils.js'
import { findStockBySymbol, fetchHistoricalDataForStock, hydrateStocksWithPrices, searchExternalStocks } from './lib/market-data.js'
import { analyzeStockData } from './lib/analysis.js'
import { Worker } from 'node:worker_threads'
import Admin from './lib/manager.js'
import { NASDAQ } from './lib/external-cache.js'

const app = express()
const httpServer = createServer(app)
const PORT = process.env.PORT || 3000

const cookies = (req,res,next) => {
  req.cookies = {};
  if(req.headers.cookie){
    req.headers.cookie.split(';').map((a)=>{ let [b,c] = a.trim().split('='); req.cookies[b] = c; });
  }
  next();
}
const isDev = process.env.NODE_ENV === 'development';

const authorizedFrontend = isDev ? "http://localhost:5173":process.env.FRONTEND_URL
const io = new Server(httpServer, {
  cors: {
    origin: authorizedFrontend,
    credentials: true
  }
})

// Middleware básico
app.use(express.json())
app.use(cors({
  origin: authorizedFrontend,
  credentials: true,
}));
app.use(express.urlencoded({ extended: true }))
app.use(cookies);
// Servir arquivos estáticos
app.use('/uploads', express.static('uploads'))

// Rotas de autenticação
app.use('/auth', authRouter)

// Rotas de arquivos
app.use('/files/upload', uploadRouter)
app.use('/files', filesRouter)
app.use('/reports', reportsRouter)
app.use('/assets', assetsRouter)
app.use('/payments', paymentsRouter)
app.use('/products', productsRouter)
app.use('/admin/users', adminUsersRouter)
app.use('/admin/payments', adminPaymentsRouter)
app.use('/admin/credits', adminCreditsRouter)
app.use('/admin/assets', adminAssetsRouter)
app.use('/app', appPropsInfoRouter)



async function timed(callbacks=[async()=>{}],time=600){
  for (let x = 0; x < callbacks.length; x++) {
    const caller = callbacks[x];
    await caller();
  }
  setTimeout(()=>{
    timed(callbacks,time)
  },time * 1000)
}


const cronJobs = {
  expireReport : async()=>{
    let ref = new Date(Date.now() - (23 * 3600 * 1000));
    await prisma.reports.updateMany({where:{
      created_at: {
        lt: ref
      }
    }, data:{status:'expired'}})
  }
}

function parseSessionTokenFromSocket(socket) {
  const cookieHeader = socket.handshake.headers.cookie || ''
  const cookies = cookie.parse(cookieHeader || '')
  const bearer = socket.handshake.auth?.token || null
  if (bearer && bearer.startsWith('Bearer ')) return bearer.split(' ')[1]
  return cookies.session_token || null
}

async function authenticateSocket(socket, next) {
  try {
    const token = parseSessionTokenFromSocket(socket)
    if (!token) return next(new Error('unauthorized'))
    const decoded = verifyToken(token)
    if (!decoded) return next(new Error('forbidden'))

    const session = await prisma.session.findFirst({
      where: { id: decoded.sessionId, expiresAt: { gte: new Date() } },
      include: {
        user: { include: { permissions: true, userConfigs: true, my_assets: { select: { symbol: true } } } }
      }
    })
    if (!session) return next(new Error('forbidden'))

    socket.data.user = session.user
    socket.data.token = token
    next()
  } catch (err) {
    next(new Error('unauthorized'))
  }
}

io.use(authenticateSocket)

function formatAssetsForUser(list, user) {
  if (!user) return list
  const set = new Set()
  if (user.my_assets) {
    user.my_assets.forEach((a) => set.add(a.symbol))
  }
  return list.map((asset) => ({ ...asset, isInMyAssets: set.has(asset.symbol) }))
}
if(!fs.existsSync('cache')){
  fs.mkdirSync('cache',{recursive: true});
}
async function socketHomeFetch(payload, user) {
  const { region = 'all', page = 1, type = '' } = payload || {}
  const where = {}
  if (region === 'br') {
    where.currency = 'BRL'
    where.NOT = { type: 'CRYPTO' }
  } else if (region === 'us') {
    where.currency = 'USD'
    where.NOT = { type: 'CRYPTO' }
  } else if (region === 'crypto') {
    where.type = 'CRYPTO'
  }
  if (type) where.type = type

  const [total, list, types] = await Promise.all([
    prisma.stocks.count({ where }),
    prisma.stocks.findMany({
      where,
      orderBy: [{ volume: 'desc' }, { market_cap: 'desc' }, { id: 'desc' }],
      skip: (Math.max(page, 1) - 1) * 12,
      take: 12
    }),
    prisma.stocks.findMany({ where, distinct: ['type'], select: { type: true } })
  ])

  const hydrated = await hydrateStocksWithPrices(list)
  
  let formatted = hydrated

  if (user && hydrated.length) {
    const symbols = hydrated.map((a) => a.symbol)
    const [myAssets, reports] = await Promise.all([
      prisma.my_assets.findMany({
        where: { user_id: user.id, symbol: { in: symbols } },
        select: { symbol: true }
      }),
      prisma.reports.findMany({
        where: { user_id: user.id, symbol: { in: symbols }, status: { in: ['active', 'pending'] } },
        select: { symbol: true, status: true, hash: true, path: true, created_at: true }
      })
    ])
    const mySet = new Set(myAssets.map((m) => m.symbol))
    const repoMap = {}
    reports.forEach((r) => (repoMap[r.symbol] = r))
    formatted = hydrated.map((a) => ({
      ...a,
      isInMyAssets: mySet.has(a.symbol),
      report: repoMap[a.symbol] || null
    }))
  } else {
    formatted = formatAssetsForUser(hydrated, user)
  }

  return {
    list: formatted,
    page: Math.max(page, 1),
    totalPages: Math.max(1, Math.ceil(total / 12)),
    total,
    types: types.map((t) => t.type).filter(Boolean).sort()
  }
}

io.on('connection', (socket) => {
  // socket.onAny((event,...args)=>{
  //   console.log('===============================');
  //   console.log(event)
  //   console.log('===============================');
  //   console.log(args);
  //   console.log('.......................................')
  // })

  const user = socket.data.user
  const userRoom = user ? `user:${user.id}` : null
  if (userRoom) socket.join(userRoom)

  socket.on('home:fetch', async (payload = {}) => {
    const reqId = payload?.reqId || randomUUID()
    try {
      const data = await socketHomeFetch(payload, user)
      socket.emit('home:fetch:result', { reqId, ok: true, data })
    } catch (error) {
      console.error(error);
      socket.emit('home:fetch:result', { reqId, ok: false, error: error.message })
    }
  })

  socket.on('asset:details', async ({ symbol, reqId }) => {
    const id = reqId || randomUUID();
    try {
      let stock = await findStockBySymbol(symbol);
      if(stock.currency == 'USD'){
        // NASDAQ
        let profile = await NASDAQ.getProfile(stock.symbol);
        let summary = await NASDAQ.getSummary(stock.symbol);
        let info = await NASDAQ.getInfo(stock.symbol);
        let history = await NASDAQ.history(stock.symbol,retroDate(15),20000);
        let output = sanitizeData({ stock, profile, info, summary, history });
        
        socket.emit('asset:details:result', { reqId: id, ok: true, data: output })
      }else{
        console.log(stock);
        if (!stock) return socket.emit('asset:details:result', { reqId: id, ok: false, error: 'Ativo não encontrado' });
        stock = sanitizeData(stock);
        const series = await fetchHistoricalDataForStock(stock)
        const analysis = analyzeStockData(series)
        socket.emit('asset:details:result', { reqId: id, ok: true, data: { stock, analysis, series } })
      }
    } catch (error) {
      socket.emit('asset:details:result', { reqId: id, ok: false, error: error.message })
    }
  })

  socket.on('my-assets:fetch', async (payload = {}) => {
    const reqId = payload?.reqId || randomUUID()
    if (!user) return socket.emit('my-assets:fetch:result', { reqId, ok: false, error: 'unauthorized' })
    try {
      const { q = '', page = 1 } = payload
      const orFilters = q
        ? [
            { symbol: { startsWith: q.toUpperCase() } },
            { name: { contains: q } },
            { data: { string_contains: q } }
          ]
        : null
      const where = { user_id: user.id, ...(orFilters ? { OR: orFilters } : {}) }
      let list = await prisma.my_assets.findMany({
        where,
        take: 20,
        skip: (page - 1) * 20
      })
      const ids = list.map((a) => a.symbol)
      if (ids.length) {
        const repo = {}
        const reports = await prisma.reports.findMany({
          where: { user_id: user.id, status: { in: ['active', 'pending'] }, symbol: { in: ids } },
          orderBy: { id: 'asc' }
        })
        reports.forEach((r) => (repo[r.symbol] = r))
        list = list.map((item) => ({ ...item, report: repo[item.symbol] || null }))
      }
      const num = await prisma.my_assets.count({ where })
      socket.emit('my-assets:fetch:result', {
        reqId,
        ok: true,
        data: { list, total_pages: Math.ceil(num / 20), total_items: num, page }
      })
    } catch (error) {
      socket.emit('my-assets:fetch:result', { reqId, ok: false, error: error.message })
    }
  })

  socket.on('account:fetch', async (payload = {}) => {
    const reqId = payload?.reqId || randomUUID()
    if (!user) return socket.emit('account:fetch:result', { reqId, ok: false, error: 'unauthorized' })
    try {
      const fresh = await prisma.user.findUnique({
        where: { id: user.id },
        include: { permissions: true, userConfigs: true, my_assets: { select: { symbol: true } } }
      })
      const assets = fresh.my_assets.map((a) => a.symbol).join('!')
      socket.emit('account:fetch:result', { reqId, ok: true, data: { user: sanitizeUser({ ...fresh, assets }) } })
    } catch (error) {
      socket.emit('account:fetch:result', { reqId, ok: false, error: error.message })
    }
  })

  socket.on('report:create', async ({ symbol, reqId }) => {
    const id = reqId || randomUUID()
    if (!user) return socket.emit('report:create:result', { reqId: id, ok: false, error: 'unauthorized' })
    try {
      const existing = await prisma.my_assets.findFirst({
        where: { user_id: user.id, symbol: symbol.toUpperCase() }
      })
      if (!existing) {
        await prisma.my_assets.create({
          data: {
            symbol: symbol.toUpperCase(),
            name: symbol,
            data: {},
            user_id: user.id,
            hash: randomUUID()
          }
        })
      }
      const item = await prisma.reports.create({
        data: {
          user_id: user.id,
          symbol,
          created_at: new Date(Date.now()),
          status: 'pending',
          hash: randomUUID()
        }
      })

      await Admin.removeCredits(user, -1, 'Relatório ' + symbol)

      const workerPath = './workers/stock-analyzer.worker.js'
      const worker = new Worker(workerPath, { workerData: { symbol, hash: item.hash } })
      worker.on('message', (msg) => {
        if (!msg.success) {
          prisma.reports.update({ where: { id: item.id }, data: { status: 'error' } }).catch(() => {})
          if (userRoom) io.to(userRoom).emit('report:update', { symbol, report: { symbol, status: 'error', hash: item.hash } })
        } else {
          prisma.reports.findFirst({
            where: { hash: item.hash },
            select: { symbol: true, status: true, path: true, hash: true, created_at: true }
          }).then((r) => {
            if (r && userRoom) io.to(userRoom).emit('report:update', { symbol, report: r })
          }).catch(() => {})
        }
      })
      worker.on('error', () => {
        prisma.reports.update({ where: { id: item.id }, data: { status: 'error' } }).catch(() => {})
        if (userRoom) io.to(userRoom).emit('report:update', { symbol, report: { symbol, status: 'error', hash: item.hash } })
      })

      socket.emit('report:create:result', { reqId: id, ok: true, data: { status: 'queued', hash: item.hash } })
      if (userRoom) io.to(userRoom).emit('report:update', { symbol, report: { symbol, status: 'pending', hash: item.hash } })
    } catch (error) {
      socket.emit('report:create:result', { reqId: id, ok: false, error: error.message })
    }
  })

  const paymentIntervals = new Map()
  socket.on('payment:subscribe', async ({ txid, reqId }) => {
    const id = reqId || randomUUID()
    if (!user) return socket.emit('payment:subscribe:result', { reqId: id, ok: false, error: 'unauthorized' })
    try {
      const invoice = await prisma.invoices.findFirst({
        where: { txid, user_id: user.id },
        select: { id: true, status: true, credits: true, value: true }
      })
      if (!invoice) return socket.emit('payment:subscribe:result', { reqId: id, ok: false, error: 'Pagamento não encontrado' })
      socket.emit('payment:subscribe:result', { reqId: id, ok: true, data: invoice })
      if (paymentIntervals.has(txid)) return
      const interval = setInterval(async () => {
        const inv = await prisma.invoices.findFirst({
          where: { txid, user_id: user.id },
          select: { status: true, credits: true, value: true }
        })
        if (!inv) return
        socket.emit('payment:update', { txid, payment: inv })
        if (['paid', 'expired'].includes(inv.status)) {
          clearInterval(interval)
          paymentIntervals.delete(txid)
        }
      }, 4000)
      paymentIntervals.set(txid, interval)
    } catch (error) {
      socket.emit('payment:subscribe:result', { reqId: id, ok: false, error: error.message })
    }
  })

  socket.on('disconnect', () => {
    // clear intervals if any
  })
})
httpServer.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`)
  console.log("Frontend: "+authorizedFrontend);
  timed([cronJobs.expireReport],600)
})
