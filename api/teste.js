import 'dotenv/config'
import fs from 'fs';
import { fetchAll, fetchCrypto } from './lib/indexer-utils.js';
import prisma from './lib/prisma.js';

async function main() {
    let res = await fetchAll();
    if(res && res.length){
        let lote = [];
        for (let x = 0; x < res.length; x++) {
            const element = res[x];
            lote.push(element);
            if(lote.length == 500){
                await prisma.stocks.createMany({data:lote});
                lote=[];
            }
        }
        await prisma.stocks.createMany({data:lote});
    }
}
main();