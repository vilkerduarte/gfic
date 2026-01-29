// routes/assets/add-remove.js
import { Router } from 'express'
import axios from 'axios';
import { generateUUID } from '../lib/utils.js'
import { analyzeStockData } from '../lib/analysis.js';
import { authenticateToken, optionalAuth } from '../middleware/authentication.js'
import StockAnalyzer, { getStockList } from '../lib/search.js'
import prisma from '../lib/prisma.js'

const router = Router()

router.get('/configs',  /* optionalAuth, */ async (req, res) => {
    let publicConfigs = {
        'credit-price':250
    }
    let configs = await prisma.config.findMany({
        where:{
            config:{in:Object.keys(publicConfigs)}
        }
    });
    configs.map(a => {
        if(publicConfigs[a.config]){
            publicConfigs[a.config] = a.value;
        }
    })

    res.status(200).json(publicConfigs);

})
export default router