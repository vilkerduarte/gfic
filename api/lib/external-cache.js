import axios from 'axios';
import fs from 'fs';
import { MD5, retroDate } from './utils.js';
import { brapiClient } from './indexer-utils.js';
const nasdaqClient = axios.create({
  baseURL: 'https://api.nasdaq.com',
  timeout: 10000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.nasdaq.com/',
    'Origin': 'https://www.nasdaq.com',
    'Connection': 'keep-alive'
  }
});

function getCache(md5Path, time = 60) {
  if (fs.existsSync(`cache/${md5Path}`)) {
    let data = fs.readFileSync(`cache/${md5Path}`, 'utf8');
    if (data) {
      data = JSON.parse(data);
      if (data.timestamp >= (Date.now() - (time * 1000))) {
        return data.content;
      }
    }
  }
  return null;
}
function writeCache(md5Path, data) {
  let dt = {
    timestamp: Date.now(),
    content: data
  }
  fs.writeFileSync(`cache/${md5Path}`, JSON.stringify(dt, null, 2));
}

export async function fetchWithCache(url, cacheTime = 60) {
  try {
    let path = `${MD5('AAA' + url)}.json`;
    let data = getCache(path, cacheTime);
    if (!data) {
      const response = await nasdaqClient.get(
        url
      );
      data = response.data;
      writeCache(path, data);
    }
    return data;
  } catch (error) {
    console.error(error);
    return error
  }
}

export class NASDAQ {
  static async getInfo(symbol) {
    return await fetchWithCache(`/api/quote/${symbol.toUpperCase()}/info?assetclass=stocks`, 60);
  }
  static async getAnalysis(symbol) {
    return await fetchWithCache(`/api/analyst/${symbol.toUpperCase()}/earnings-date`, 1800);
  }
  static async list(limit = 0, offset = 0) {
    return await fetchWithCache(`/api/screener/stocks?limit=${limit}&offset=${offset}`, 300);
  }
  static async history(symbol, fromDate = '2026-01-01', limit = 0, offset = 0) {
    return await fetchWithCache(`/api/quote/${symbol.toUpperCase()}/historical?assetclass=stocks&fromdate=${fromDate}&limit=${limit}&offset=${offset}`, 3600 * 3);
  }
  static async getProfile(symbol) {
    return await fetchWithCache(`/api/company/${symbol.toUpperCase()}/company-profile`, ((3600 * 24) * 5));
  }
  static async getRevenue(symbol) {
    return await fetchWithCache(`/api/company/${symbol.toUpperCase()}/revenue`, (3600 * 24));
  }
  static async getFinances(symbol) {
    return await fetchWithCache(`/api/company/${symbol.toUpperCase()}/financials`, (3600 * 24));
  }
  static async getHoldings(symbol, limit = 0) {
    return await fetchWithCache(`/api/company/${symbol.toUpperCase()}/institutional-holdings?limit=${limit}`, ((3600 * 24) * 2));
  }
  static async getInsiderTrades(symbol, limit = 0) {
    return await fetchWithCache(`/api/company/${symbol.toUpperCase()}/insider-trades?limit=${limit}`, 3600);
  }
  static async getSummary(symbol) {
    return await fetchWithCache(`/api/quote/${symbol.toUpperCase()}/summary?assetclass=stocks`, 60);
  }
  static async getDividends(symbol) {
    return await fetchWithCache(`/api/quote/${symbol.toUpperCase()}/dividends?assetclass=stocks`, 3600 * 24);
  }
  static async getAllData(symbol) {
    let profile = await NASDAQ.getProfile(symbol);
    let general_info = await NASDAQ.getInfo(symbol);
    let history = await NASDAQ.history(symbol, retroDate(90),20000);
    let summary = await NASDAQ.getSummary(symbol);
    let insider_trades = await NASDAQ.getInsiderTrades(symbol, 50);
    let dividends = await NASDAQ.getDividends(symbol);
    let revenue = await NASDAQ.getRevenue(symbol);
    let financials = await NASDAQ.getFinances(symbol);
    let result = {
      profile,
      general_info,
      history,
      summary,
      insider_trades,
      dividends,
      revenue,
      financials,
    }
    Object.keys(result).forEach((key) => {
      result[key] = result[key]?.data ?? null;
    });
    return result;
  }
}

export function adequarNasdaq(data) {
  const toBigIntMoney = (value) => {
    if (!value) return null

    const normalized = value
      .replace('$', '')
      .replace(/,/g, '')
      .trim()

    if (!normalized) return null

    const float = Number(normalized)
    if (Number.isNaN(float)) return null

    // multiplica por 100 para preservar centavos
    return BigInt(Math.round(float * 100))
  }

  const toBigIntInt = (value) => {
    if (!value) return null

    let normalized = value
      .replace(/,/g, '')
      .trim()

    normalized = parseFloat(normalized);
    if(isNaN(normalized)) return null;
    normalized = Math.round(normalized * 100);
    if (!normalized) return null;

    return BigInt(normalized)
  }

  return {
    currency: 'USD',
    name: data?.name ?? null,
    symbol: data?.symbol ?? null,
    mic: 'XNAS',
    figi: null,
    type: 'stock',
    close: toBigIntMoney(data?.lastsale),
    change: toBigIntMoney(data?.netchange),
    volume: null,
    market_cap: toBigIntMoney(data?.marketCap),
    sector: null,
    logo: null
  }
}


export class CryptoData {
  static async fetch(url,options={}){
    let md5_ = MD5('AB'+url+'__'+JSON.stringify(options));
    let cache = getCache(md5_,60);
    if(cache){
      return cache;
    }else{
      let result = await fetch(url,options);
      if(result && result.ok){
        result = await result.json();
        writeCache(md5_,result);
        return result;
      }
    }
    return null;
  }
  static async getQuotes(symbol){
    const apiKey = brapiClient.apiKey;
    fetch("https://brapi.dev/api/v2/crypto?coin=string", {
      method: "GET",
      headers: {
        "Authorization": "Bearer "
      }
    })
  }
}