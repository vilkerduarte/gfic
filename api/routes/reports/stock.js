import { Router } from 'express'
import path from 'path'
import fs from 'fs'
import { authenticateToken, optionalAuth } from '../../middleware/authentication.js'
import StockAnalyzer from '../../lib/search.js'
import prisma from '../../lib/prisma.js'
import { generateUUID } from '../../lib/utils.js'
import Admin from '../../lib/manager.js'
import { Worker } from 'node:worker_threads'
import {
  fetchHistoricalDataForStock,
  findStockBySymbol
} from '../../lib/market-data.js'
import { analyzeStockData } from '../../lib/analysis.js'

const router = Router()
router.get('/verify/:symbol', optionalAuth, async(req, res) => {
    const { symbol } = req.params
    try {
      const stock = await findStockBySymbol(symbol)
      if (!stock) return res.status(404).json({ message:'Not Found' })
      const series = await fetchHistoricalDataForStock(stock)
      const snapshot = analyzeStockData(series)
      res.status(200).json(snapshot);
    } catch (error) {
      res.status(404).json({message:'Not Found'})
    }
});
router.get('/create/:symbol', authenticateToken, async(req, res) => {
  try {
    const { symbol } = req.params
    console.log(symbol);
    if(req.user.balance){
      try {
        const stock = await findStockBySymbol(symbol)
        if (!stock) return res.status(404).json({message:'Not Found'})
        await fetchHistoricalDataForStock(stock) // valida disponibilidade de dados
        const analisador = new StockAnalyzer();
        let item = await prisma.reports.create({
          data:{
            user_id:req.user.id,
            symbol,
            created_at: new Date(Date.now()),
            status:'pending',
            hash:generateUUID()
          }
        });
        
        await Admin.removeCredits(req.user,-1,"Relatório "+symbol)
        // analisador.analyzeStock(symbol,item.hash);

        const workerPath = path.resolve('workers/stock-analyzer.worker.js')
        const worker = new Worker(workerPath, {
          workerData: { symbol, hash: item.hash }
        })

        worker.on('message', msg => {
          if (msg.success) {
            console.log(`[Worker] Análise ${symbol} concluída com sucesso`)
            // opcional: atualizar status no banco
            
          } else {
            console.error(`[Worker] Erro analisando ${symbol}:`, msg.error)
            prisma.reports.update({
              where: { id: item.id },
              data: { status: 'error' }
            }).catch(console.error)
          }
        })

        worker.on('error', err => {
          console.error('Erro no worker:', err)
        })

        
        res.status(200).json({message:'ok'})
      } catch (error) {
        console.error(error);
        res.status(404).json({message:'Not Found'})
      }
    }else{
      res.status(403).json({message:'Créditos Insuficientes'});
    }

  } catch (error) {
    console.error('Erro ao servir arquivo:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})
router.get('/view/:hash',authenticateToken, async(req,res)=>{
  const { hash } = req.params;
  let report = await prisma.reports.findFirst({
    where:{
      hash,
      user_id:req.user.id
    }
  });
  if(report && fs.existsSync(report.path)){
    if(report.status == 'active'){
      let data = fs.readFileSync(report.path,'utf-8');
      res.set('Content-Type', 'text/plain');
      
      res.status(200).send(data);
    }else{
      res.status(400).json({message:"Relatório Inválido!"});
    }
  }else{
    res.status(404).send('');
  }
})
export default router
