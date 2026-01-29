import { Router } from 'express'
import { authenticateToken, optionalAuth } from '../../middleware/authentication.js'
import StockAnalyzer, { getStockList } from '../../lib/search.js'
import axios from 'axios'
import prisma from '../../lib/prisma.js'
function format(dados) {
    return {
        currency: dados.currency || null,
        symbol: dados.symbol || null,
        exchangeName: dados.exchange || null,
        type: dados.typeDisp || 'Ação',
        fullExchangeName: dados.exchDisp || null,
        instrumentType: dados.quoteType || null,
        gmtoffset: dados.gmtoffset || null, // Não disponível no novo formato
        timezone: dados.timezone || null, // Não disponível no novo formato
        exchangeTimezoneName: dados.exchangeTimezoneName || null, // Não disponível no novo formato
        longName: dados.longname || dados.shortname || null,
        market: dados.market || null, // Não disponível no novo formato
        shortName: dados.shortname || null,
        image: `/files/logo/${dados.symbol}.svg?q=${encodeURI(dados.longname || dados.shortname || '')}`
    }
}
const router = Router()
router.get('/',async(req,res)=>{
  let {region} = req.query;
  let dados = await getStockList(region && region.toLowerCase() == 'br' ? true : false);
  res.status(200).json(dados);
});
router.get('/search', optionalAuth, async (req, res) => {
    const { q } = req.query
    let busca = await prisma.assets.findMany({
        where: {
            OR: [
                { symbol: { startsWith: q } },
                { shortName: { contains: q } },
                { longName: { contains: q } }
            ]
        }, take: 6
    });
    if (!busca || busca.length < 1) {
        try {
            busca = await axios.get(`https://query2.finance.yahoo.com/v1/finance/search?q=${q}&lang=pr-BR&region=BR&quotesCount=6&newsCount=3&listsCount=2&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query&multiQuoteQueryId=multi_quote_single_token_query&newsQueryId=news_cie_vespa&enableCb=false&enableNavLinks=true&enableEnhancedTrivialQuery=true&enableResearchReports=true&enableCulturalAssets=true&enableLogoUrl=true&enableLists=false&recommendCount=5`);
            busca = busca.data.quotes.map(a => format(a));
        } catch (error) {
        }
    }
    //   let busca = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
    res.status(200).json(busca || []);

});
router.get('/my-assets', authenticateToken, async (req, res) => {
    let { q , page} = req.query
    page = page ? parseInt(page) : 1;
    const where = {
            OR: [
                { symbol: { startsWith: q } },
                { name: { contains: q } },
                { data: {string_contains: q} }
            ],
            user_id:req.user.id,
            
        }
    let busca = await prisma.my_assets.findMany({
        where, take: 20, skip:((page - 1) * 20)
    });
    let ids = busca.map(a => a.symbol);
    
    if(ids.length){
        let repo = {}
        let reports = await prisma.reports.findMany({
            where:{
                user_id:req.user.id,
                status:{in:['active','pending']},
                symbol:{in:ids}
            },
            orderBy:{
                id:'asc'
            }
        })
        reports = reports.map((r)=>{
            repo[r.symbol] = r;
            return r;
        });
        busca = busca.map(a => {
            return {...a,report:repo[a.symbol] || null}
        });
    }
    let num = await prisma.my_assets.count({where});
    res.status(200).json({total_pages:Math.ceil(num / 20), total_items:num, page, list:busca || []});
});
export default router