import 'dotenv/config'
import fs from 'fs';
import { fetchAll, fetchCrypto, finnhubClient } from './lib/indexer-utils.js';
import prisma from './lib/prisma.js';
import { adequarNasdaq, NASDAQ } from './lib/external-cache.js';
import { findStockBySymbol } from './lib/market-data.js';
import { retroDate } from './lib/utils.js';

async function main() {
    let res = await fetchAll();
    if (res && res.length) {
        let lote = [];
        for (let x = 0; x < res.length; x++) {
            const element = res[x];
            lote.push(element);
            if (lote.length == 500) {
                await prisma.stocks.createMany({ data: lote });
                lote = [];
            }
        }
        await prisma.stocks.createMany({ data: lote });
    }
}
async function indexer(){
    await main();
    let list = await NASDAQ.list(0,0);
    let lotes = [[]];
    let i = 0;
    if(list && list.data){
        list.data.table.rows.map((nsd)=>{
            if(lotes[i].length > 299){
                i++;
            }
            if(typeof lotes[i] == 'undefined'){
                lotes[i] = [];
            }
            lotes[i].push(adequarNasdaq(nsd));
        })
        for (let x = 0; x < lotes.length; x++) {
            const lote = lotes[x];
            await prisma.stocks.createMany({data:lote});
        }
    }
}
async function tst() {
    let data = await NASDAQ.getAllData('AAPL');
    fs.writeFileSync('model-nasdaq-output.json',JSON.stringify(data,null,2));

    let stock = await findStockBySymbol('AAPL');
    let profile = await NASDAQ.getProfile(stock.symbol);
    let summary = await NASDAQ.getSummary(stock.symbol);
    let info = await NASDAQ.getInfo(stock.symbol);
    let history = await NASDAQ.history(stock.symbol,retroDate(15),20000);
    fs.writeFileSync('__model-asset-output.json',JSON.stringify({data:{ stock, profile, info, summary, history }},null,2));
}
// main();
// tst();
indexer();