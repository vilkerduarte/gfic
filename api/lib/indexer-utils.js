import path from 'path';
import axios from 'axios';
import finnhub from 'finnhub';
import fs from 'fs';
import Brapi from 'brapi';
import prisma from './prisma.js';

const finnhubClient = new finnhub.DefaultApi(process.env.FINNHUB_API_KEY)
const client = new Brapi({
    apiKey: process.env.BRAPI_API_KEY,
    environment: 'production', // 'production' ou 'sandbox'
    maxRetries: 2, // Número de tentativas (padrão: 2)
    timeout: 60000,
});

export async function downloadFile(url, outputPath) {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(outputPath));
        writer.on('error', reject);
    });
}

export function classifyB3Symbol(symbol, label) {
    if (!symbol || typeof symbol !== "string") return null;

    const s = symbol.toUpperCase();
    const l = label.toUpperCase();

    // BDRs (ações estrangeiras)
    if (s.endsWith("34") || s.endsWith("33") || s.endsWith("35")) {
        return "BDR";
    }

    if (l.split(' ').some(a => ['UNIT', 'UNITS'].includes(a))) {
        return "Unit";
    }

    if (l.search(/(^([A-Z]{1})|[- ])+(FII)+([\-\ ]{0,1})/g) > -1 || l.includes("IMOBILI")) {
        return "FII"
    }

    // ETFs (inclui ETFs internacionais)
    if (
        s.endsWith("11")
    ) {
        return "ETF";
    }


    // Ações ordinárias
    if (s.endsWith("3") && isNaN(Number(s.charAt(s.length - 2)))) {
        return "Common Stock";
    }

    // Ações preferenciais
    if (["4", "5", "6", "7", "8"].some(n => s.endsWith(n)) && isNaN(Number(s.charAt(s.length - 2)))) {
        return "Preference";
    }

    // Direitos de subscrição
    if (s.endsWith("1") || s.endsWith("2") || s.endsWith("9")) {
        return "Misc.";
    }

    return null;
}

export const instrumentTypeMap = {
    "Common Stock": "Ação ordinária",
    "Preference": "Ação preferencial",
    "Unit": "Unit (pacote de ações)",
    "ETP": "Produto negociado em bolsa",
    "Open-End Fund": "Fundo aberto",
    "Closed-End Fund": "Fundo fechado",
    "REIT": "Fundo imobiliário",
    "ETF": "Fundos de Investimento Negociados",
    "CRYPTO": "Criptomoedas",
    "MLP": "Parceria limitada negociada",
    "Tracking Stk": "Ação vinculada a uma divisão da empresa",
    "Stapled Security": "Título composto inseparável",
    "Equity WRT": "Warrant de ações",
    "Right": "Direito de subscrição",
    "Receipt": "Recibo representativo de ativo",
    "ADR": "Recibo de ações estrangeiras nos EUA",
    "GDR": "Recibo global de ações",
    "BDR": "Ações Estrangeiras",
    "FII": "Fundo de Investimento Imobiliário",
    "Canadian DR": "Recibo depositário canadense",
    "Dutch Cert": "Certificado holandês de ações",
    "Foreign Sh.": "Ação estrangeira",
    "NVDR": "Recibo depositário sem direito a voto",
    "Savings Share": "Ação de poupança",
    "Royalty Trst": "Fundo de royalties",
    "Ltd Part": "Parceria limitada",
    "PUBLIC": "Empresa pública",
    "PRIVATE": "Empresa privada",
    "NY Reg Shrs": "Ações registradas em Nova York",
    "CDI": "Certificado de depósito",
    "SDR": "Direitos especiais de saque",
    "Misc.": "Outros instrumentos"
};

export const micNameMap = {
    OOTC: "Mercado de Balcão (OTC)",
    ARCX: "NYSE Arca",
    XNYS: "New York Stock Exchange (NYSE)",
    BATS: "Cboe BATS Exchange",
    XNAS: "Nasdaq Stock Market",
    XASE: "NYSE American",
    IEXG: "Investors Exchange (IEX)",
    BVMF: "B3 - São Paulo"
};

export function adequarCripto(item) {
    return {
        currency: item.currency || 'USD',
        name: item.coinName ? item.coinName.toUpperCase() : null,
        symbol: item.coin || null,
        mic: null,
        figi: null,
        type: 'CRYPTO',

        close: item.regularMarketPrice != null
            ? BigInt(Math.round(item.regularMarketPrice * 100))
            : null,

        change: item.regularMarketChange != null
            ? BigInt(Math.round(item.regularMarketChange * 100000))
            : null,

        volume: item.regularMarketVolume != null
            ? BigInt(Math.round(item.regularMarketVolume))
            : null,

        market_cap: item.marketCap && item.marketCap > 0
            ? BigInt(Math.round(item.marketCap * 100))
            : null,

        sector: null,
        logo: null,
    }
}

export function adequarItem(item, baixarLogo = false) {
    let isBrapi = false;
    if (item.stock) {
        isBrapi = true;
        if (baixarLogo && item.logo) {
            let filename = item.logo.split('/');
            let pathname = '/brapi/icons/' + filename[filename.length - 1];
            downloadFile(item.logo.toString(), 'public/logos' + pathname);
            item.logo = pathname;
        }
    }
    return {
        currency: isBrapi ? 'BRL' : 'USD',
        name: isBrapi ? item.name.toUpperCase() : (item.description.toUpperCase() || null),
        symbol: isBrapi ? item.stock : (item.symbol || item.symbol2 || item.displaySymbol || null),
        mic: isBrapi ? 'BVMF' : (item.mic || null),
        figi: isBrapi ? null : (item.figi || null),
        type: isBrapi ? classifyB3Symbol(item.stock, item.name) : (item.type || null),
        close: isBrapi ? BigInt(Math.round(item.close * 100)) : null,
        change: isBrapi ? BigInt(Math.round(item.change * 100000)) : null,
        volume: isBrapi ? BigInt(Math.round(item.volume)) : null,
        market_cap: isBrapi && item.market_cap ? BigInt(Math.round(item.market_cap * 100)) : null,
        sector: isBrapi ? item.sector : null,
        logo: isBrapi ? item.logo : null,
    }
}

export async function fetchUS() {
    return new Promise((resolve, reject) => {
        finnhubClient.stockSymbols("US", {}, async (error, data, response) => {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    })
}
export async function fetchBR() {
    const quote = await client.quote.list();
    if (quote && quote.stocks) {
        return quote.stocks;
    }
    return [];
}
export async function fetchCrypto(moedas = false) {
    if (!moedas || !moedas.length) {
        moedas = [];
        const list = await client.v2.crypto.listAvailable();
        if (list && list.coins) {
            moedas = list.coins;
        }
    }
    let lote = [];
    let result = [];
    for (let x = 0; x < moedas.length; x++) {
        const m = moedas[x];
        lote.push(m);
        if (lote.length == 10) {
            console.log(lote.join(','));
            let quotes = await client.v2.crypto.retrieve({
                coin: lote.join(','),
                currency: 'BRL'
            });
            
            if (quotes && quotes.coins) {
                result = [...result, ...quotes.coins];
            }
            lote = [];
        }
    }
    if (lote.length) {
        console.log(lote.join(','));
        let quotes = await client.v2.crypto.retrieve({
            coin: lote.join(','),
            currency: 'BRL'
        });
        if (quotes) {
            result = [...result, ...quotes.coins];
        }
        lote = [];
    }
    return result;
}
export async function fetchAll() {
    let us = await fetchUS();
    let br = await fetchBR();
    let stocks = [...br, ...us].map(a => adequarItem(a));
    let crypto = await fetchCrypto();
    crypto = crypto.map((a) => adequarCripto(a));
    return [...stocks, ...crypto];
}
