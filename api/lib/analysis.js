export function analyzeStockData(apiData) {
  const result = apiData?.chart?.result?.[0];
  if (!result) return { error: "Invalid API data" };

  const meta = result.meta || {};
  const quotes = result.indicators?.quote?.[0] || {};
  const timestamps = result.timestamp || [];

  // Construir dataset limpo
  const validData = timestamps.map((timestamp, i) => ({
    timestamp,
    date: new Date(timestamp * 1000),
    open: quotes.open?.[i],
    high: quotes.high?.[i],
    low: quotes.low?.[i],
    close: quotes.close?.[i],
    volume: quotes.volume?.[i]
  })).filter(d =>
    d.open != null && d.high != null && d.low != null && d.close != null
  );

  if (!validData.length) return { error: "No valid price data" };

  const prices = validData.map(d => d.close);
  const volumes = validData.map(d => d.volume).filter(v => v != null && v > 0);

  const currentPrice = prices.at(-1);
  const previousClose = meta.regularMarketPreviousClose ?? meta.previousClose ?? prices.at(-2) ?? currentPrice;
  const priceChange = currentPrice - previousClose;
  const priceChangePercent = (previousClose ? (priceChange / previousClose) * 100 : 0);

  const dayHigh = Math.max(...validData.map(d => d.high));
  const dayLow = Math.min(...validData.map(d => d.low));
  const dayRange = dayHigh - dayLow;
  const dayRangePercent = ((dayHigh - dayLow) / ((dayHigh + dayLow) / 2)) * 100;

  const firstPrice = prices[0];
  const dayPerformance = ((currentPrice - firstPrice) / firstPrice) * 100;

  // Corrigido: cálculo de horas de pregão
  const marketOpen = validData[0].date;
  const marketClose = validData.at(-1).date;
  const tradingHours = (marketClose - marketOpen) / (1000 * 60 * 60);

  // Volume
  const totalVolume = volumes.reduce((sum, v) => sum + v, 0);
  const avgVolume = volumes.length ? totalVolume / volumes.length : 0;
  const maxVolume = Math.max(...volumes);
  const minVolume = Math.min(...volumes);

  // Volatilidade (desvio padrão dos retornos)
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    const prev = prices[i - 1];
    const curr = prices[i];
    if (prev > 0) returns.push(((curr - prev) / prev) * 100);
  }

  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length || 0;
  const volatility = Math.sqrt(
    returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length || 1)
  );

  // Suporte / resistência (básico)
  const resistance = dayHigh;
  const support = dayLow;

  // Momentum
  const refIndex = Math.max(0, prices.length - 30);
  const priceMomentum = ((currentPrice - prices[refIndex]) / prices[refIndex]) * 100;

  // Frequência de dados
  const dataPoints = validData.length;
  const dataFrequency = tradingHours > 0 ? (tradingHours * 60) / dataPoints : 0;

  // VWAP
  let cumulativeTPV = 0;
  let cumulativeVolume = 0;
  for (const d of validData) {
    if (d.volume != null && d.volume > 0) {
      const typicalPrice = (d.high + d.low + d.close) / 3;
      cumulativeTPV += typicalPrice * d.volume;
      cumulativeVolume += d.volume;
    }
  }
  const vwap = cumulativeVolume ? cumulativeTPV / cumulativeVolume : 0;

  // Sentimento de mercado
  const upMoves = returns.filter(r => r > 0).length;
  const downMoves = returns.filter(r => r < 0).length;
  const bullishBias = returns.length ? (upMoves / returns.length) * 100 : 0;

  // Proteção para divisões nulas
  const relativeVolume =
    meta.regularMarketVolume && meta.regularMarketVolume > 0
      ? (totalVolume / meta.regularMarketVolume) * 100
      : null;

  return {
    symbol: meta.symbol,
    companyName: meta.longName,
    currency: meta.currency,
    exchange: meta.fullExchangeName,

    priceMetrics: {
      currentPrice: round(currentPrice),
      previousClose: round(previousClose),
      priceChange: round(priceChange),
      priceChangePercent: round(priceChangePercent),
      dayHigh: round(dayHigh),
      dayLow: round(dayLow),
      dayRange: round(dayRange),
      dayRangePercent: round(dayRangePercent),
      performanceSinceOpen: round(dayPerformance)
    },

    technicalMetrics: {
      volatility: round(volatility),
      resistanceLevel: round(resistance),
      supportLevel: round(support),
      vwap: round(vwap),
      priceMomentum: round(priceMomentum),
      bullishBias: round(bullishBias)
    },

    volumeMetrics: {
      totalVolume: formatNumber(totalVolume),
      averageVolume: formatNumber(avgVolume),
      maxVolume: formatNumber(maxVolume),
      volumeRatio: avgVolume > 0 ? round(maxVolume / avgVolume) : 0,
      relativeVolume
    },

    sessionInfo: {
      dataPoints,
      dataFrequency: round(dataFrequency),
      tradingHours: round(tradingHours),
      marketOpen: marketOpen.toLocaleTimeString(),
      marketClose: marketClose.toLocaleTimeString(),
      dataGranularity: meta.dataGranularity
    },

    summary: {
      trend: getTrendDescription(priceChangePercent, volatility),
      marketCondition: getMarketCondition(volatility, bullishBias),
      volumeActivity: getVolumeActivity(totalVolume, avgVolume),
      strength: getStrengthDescription(priceMomentum, bullishBias)
    }
  };
}

// === Funções auxiliares ===
function round(value, decimals = 2) {
  return typeof value === "number" && isFinite(value)
    ? Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
    : 0;
}

function formatNumber(num) {
  if (!isFinite(num)) return "0";
  if (num >= 1e6) return round(num / 1e6, 2) + "M";
  if (num >= 1e3) return round(num / 1e3, 2) + "K";
  return round(num);
}

function getTrendDescription(changePercent, volatility) {
  if (Math.abs(changePercent) < 0.1) return "Lateral";
  if (changePercent > 0) return volatility > 1 ? "Alta Volátil" : "Alta Consistente";
  return volatility > 1 ? "Baixa Volátil" : "Baixa Consistente";
}

function getMarketCondition(volatility, bullishBias) {
  if (volatility > 2) return "Mercado Volátil";
  if (bullishBias > 60) return "Tendência de Alta";
  if (bullishBias < 40) return "Tendência de Baixa";
  return "Mercado Equilibrado";
}

function getVolumeActivity(totalVolume, avgVolume) {
  if (!avgVolume) return "Sem Dados";
  const ratio = totalVolume / avgVolume;
  if (ratio > 1.5) return "Volume Alto";
  if (ratio < 0.7) return "Volume Baixo";
  return "Volume Normal";
}

function getStrengthDescription(momentum, bullishBias) {
  if (momentum > 2 && bullishBias > 60) return "Forte";
  if (momentum < -2 && bullishBias < 40) return "Fraco";
  return "Moderado";
}
