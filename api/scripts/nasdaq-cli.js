import 'dotenv/config';
import NasdaqClient from '../lib/nasdaq-client.js';

const [,, command = 'help', rawSymbols] = process.argv;
const symbols = rawSymbols
  ? rawSymbols.split(',').map((s) => s.trim()).filter(Boolean)
  : [];

const client = new NasdaqClient();

const printUsage = () => {
  console.log('Uso: node scripts/nasdaq-cli.js <comando> [SIMBOLOS]');
  console.log('Comandos:');
  console.log('  list                     Lista os símbolos disponíveis (exibe os 20 primeiros)');
  console.log('  detail <SYM>             Mostra detalhes de um símbolo');
  console.log('  quote <SYM1,SYM2>        Último book (bid/ask) dos símbolos');
  console.log('  snapshot <SYM1,SYM2>     Snapshot com OHLC, volume e variação');
  console.log('  sale <SYM1,SYM2>         Último negócio elegível');
  console.log('');
  console.log('Exemplo: node scripts/nasdaq-cli.js snapshot AAPL,MSFT');
};

async function run() {
  switch (command) {
    case 'list': {
      const data = await client.listSymbols();
      const list = Array.isArray(data) ? data : [];
      console.log(`Total retornado: ${list.length}`);
      console.table(list.slice(0, 20));
      break;
    }
    case 'detail': {
      const sym = symbols[0] || 'AAPL';
      const detail = await client.getSymbolDetails(sym);
      console.log(detail);
      break;
    }
    case 'quote': {
      const quote = await client.getLastQuote(symbols.length ? symbols : 'AAPL');
      console.log(JSON.stringify(quote, null, 2));
      break;
    }
    case 'snapshot': {
      const snap = await client.getSnapshot(symbols.length ? symbols : 'AAPL');
      console.log(JSON.stringify(snap, null, 2));
      break;
    }
    case 'sale': {
      const sale = await client.getLastSale(symbols.length ? symbols : 'AAPL');
      console.log(JSON.stringify(sale, null, 2));
      break;
    }
    default:
      printUsage();
  }
}

run().catch((err) => {
  const payload = err?.response?.data || err.message || err;
  console.error('Erro ao chamar API Nasdaq:', payload);
  process.exitCode = 1;
});
