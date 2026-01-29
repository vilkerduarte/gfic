// workers/stock-analyzer.worker.js
import { parentPort, workerData } from 'node:worker_threads'
import StockAnalyzer from '../lib/search.js'

(async () => {
  try {
    const { symbol, hash } = workerData
    const analisador = new StockAnalyzer()
    await analisador.analyzeStock(symbol, hash)
    parentPort.postMessage({ success: true })
  } catch (err) {
    parentPort.postMessage({ success: false, error: err.message })
  }
})()
