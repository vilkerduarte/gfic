import fs from 'fs';
import { PrismaClient } from '@prisma/client'
import axios from 'axios';
// MOST_ACTIVES_ETFS
const prisma = new PrismaClient()
async function main2() {
    let list = await prisma.stocks.findMany();
    for (let x = 0; x < list.length; x++) {
        const { symbol, name, id } = list[x];
        if (!name) {
            console.log(`Sem nome em: ${symbol} no ID ${id}`);
        } else {
            let image = `/files/logo/${symbol}.svg?q=${name.replaceAll(' ', '+').replaceAll('.', '').replaceAll(',', '') || ''}`
            await prisma.stocks.update({
                where: { id },
                data: { logo: image }
            });
        }
    }
}

async function main() {
    let list = await prisma.stocks.findMany();
    async function executeTime(x){
        process.stdout.write(`\rExecutando: ${x}`);
        if(x >= list.length){
            return;
        }
        const { symbol, name, id } = list[x];
        if (!name) {
            console.log(`Sem nome em: ${symbol} no ID ${id}`);
        } else {
            let pathFile = `assets/logos/${symbol}.svg`;
            if (fs.existsSync(pathFile)) {
                
            } else {
                let q = name.replaceAll(' ', '+').replaceAll('.', '').replaceAll(',', '').replaceAll('/','');
                const _axios = axios.create({
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
                    }
                });
                let busca = await _axios.get(`https://worldvectorlogo.com/search/${q || symbol}`);
                const regex = /(https:\/\/cdn\.worldvectorlogo\.com\/logos\/.*?\.svg)/gi;
                const matches = busca.data.match(regex);
                let urls = matches || [];
                let { data } = await _axios.get(urls[0]);
                // console.log(urls[0],data);
                fs.writeFileSync(pathFile, data);
                await new Promise((resolve)=>{
                    setTimeout(()=>{
                        resolve()
                    },1000);
                })
            }
        }
        x++;
        executeTime(x);
    }
    executeTime(0);
}
main();
