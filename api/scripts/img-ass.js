import fs from 'fs';
import { PrismaClient } from '@prisma/client'
import axios from 'axios';
import { createHash } from 'crypto';
// MOST_ACTIVES_ETFS
const prisma = new PrismaClient()

const ass = {}
async function main2() {
    let list = await prisma.assets.findMany();
    for (let x = 0; x < list.length; x++) {
        const { symbol, shortName, id, longName } = list[x];
        process.stdout.write(`\rExecutando: ${x}`);
        let pathFile = `assets/logos/${symbol}.svg`;
        if (fs.existsSync(pathFile)) {
            let file = fs.readFileSync(pathFile,'utf-8');
            let hash = createHash('sha256').update(file).digest('hex')
            if(typeof ass[hash] == 'undefined'){
                ass[hash] = []
            }
            ass[hash].push(symbol)
        }
    }
    fs.writeFileSync('ass.json',JSON.stringify(ass,null,2));
}
async function main() {
    let list = await prisma.assets.findMany();
    for (let x = 0; x < list.length; x++) {
        process.stdout.write(`\rExecutando: ${x}`);
        const { symbol, shortName, id, longName } = list[x];
        const name = shortName || longName || '';
        ass[symbol] = name;
    }
    fs.writeFileSync('ass.json',JSON.stringify(ass,null,2));
}
main2();