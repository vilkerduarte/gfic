import cors from 'cors'
import 'dotenv/config'
import express from 'express'

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


const app = express()
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

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`)
  console.log("Frontend: "+authorizedFrontend);
  timed([cronJobs.expireReport],600)
})
