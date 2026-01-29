
import fs from 'fs';
import { PrismaClient } from '@prisma/client'
import axios from 'axios';
// MOST_ACTIVES_ETFS
const prisma = new PrismaClient()
async function fetchList(BR = false,page=1,screener='MOST_ACTIVES') {
    try {
        let { data } = await axios.get(`https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?count=250&formatted=true&scrIds=${screener}&sortField=&sortType=&start=${(page-1)*250}&useRecordsResponse=false&fields=symbol%2CshortName&lang=pt-BR&region=BR${BR ? '&marketRegion=BR' : ''}`)
        return data.finance.result[0].quotes;
    } catch (error) {
        return false;
    }
}
function format(dados){
    /*
    {
        "fullExchangeName": "NasdaqGM",
        "symbol": "BITF",
        "gmtOffSetMilliseconds": -14400000,
        "quoteType": "EQUITY",
        "typeDisp": "Ação",
        "exchangeTimezoneName": "America/New_York",
        "exchangeTimezoneShortName": "EDT",
        "market": "us_market",
        "exchange": "NGM",
        "shortName": "Bitfarms Ltd.",
        "region": "BR",
        "triggerable": false
    }
    */
    return {
        currency:dados.currency || null,
        symbol:dados.symbol || null,
        exchangeName:dados.exchange || null,
        type:dados.typeDisp || 'Ação',
        fullExchangeName:dados.fullExchangeName || null,
        instrumentType:dados.quoteType || null,
        gmtoffset:Math.floor(dados.gmtOffSetMilliseconds / 1000) || null,
        timezone:dados.exchangeTimezoneShortName || null,
        exchangeTimezoneName:dados.exchangeTimezoneName || null,
        longName:dados.shortName || null,
        market:dados.market || null,
        shortName:dados.shortName || null,
        image:`/files/logo/${dados.symbol}.svg?q=${encodeURI(dados.longName||dados.shortName)}`
    }
}
async function main(page=1,BR=false,screener='MOST_ACTIVES'){
    try {
        console.log(`Coletando${BR ? ' (BR)' : ''} de ${(page - 1) * 250} até ${(page * 250)-1}`);
        let data = await fetchList(BR,page,screener);
        if(data){
            console.log('Resultados: ',data.length)
            data = data.map(a => format(a));
            await prisma.assets.createMany({data,skipDuplicates:true});
            if(data.length > 249){
                main(page+1,BR);
            }else{
                console.log('Completo!');
            }
        }else{
            console.log('Completo!');
        }
    } catch (error) {
        console.error(error);
        process.exit();
    }
}
/*
ENDPOINT DE PESQUISA
https://query2.finance.yahoo.com/v1/finance/search?q=Petrobr&lang=pr-BR&region=BR&quotesCount=6&newsCount=3&listsCount=2&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query&multiQuoteQueryId=multi_quote_single_token_query&newsQueryId=news_cie_vespa&enableCb=false&enableNavLinks=true&enableEnhancedTrivialQuery=true&enableResearchReports=true&enableCulturalAssets=true&enableLogoUrl=true&enableLists=false&recommendCount=5
*/


// FIFTY_TWO_WK_GAINERS
// ALL_CRYPTOCURRENCIES_US
// main(1,false,'FIFTY_TWO_WK_GAINERS');
// main(1,false,'ALL_CRYPTOCURRENCIES_US');
/*
main().then(()=>{
    console.log('\n\n---------------------------------------');
    console.log('Iniciando busca de ativos brasileiros');
    console.log('****************************************\n');
    main(1,true);
})
*/