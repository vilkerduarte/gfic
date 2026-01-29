import axios from 'axios';
import { writeFileSync, readFileSync } from 'fs';
import { markdownToPdf } from './markdown-pdf.js';
import { analyzeStockData } from './analysis.js';
import fs from 'fs';
import prisma from './prisma.js';

export async function getStockList(BR = false) {
    async function fetchList(BR = false) {
        try {
            let { data } = await axios.get(`https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?count=250&formatted=true&scrIds=MOST_ACTIVES&sortField=&sortType=&start=0&useRecordsResponse=false&fields=symbol%2CshortName&lang=pt-BR&region=BR${BR ? '&marketRegion=BR' : ''}`)
            return data.finance.result[0].quotes;
        } catch (error) {
            return false;
        }
    }
    const pathName = `.cache/stock${BR ? '.br' : ''}.json`
    async function writeList() {
        let data = await fetchList(BR);
        if (data) {
            try {
                fs.mkdirSync('.cache');
            } catch (error) {
            }

            fs.writeFileSync(pathName, JSON.stringify({ created: Date.now(), data }, null, 2));
            return data;
        } else {
            return false;
        }
    }
    if (!fs.existsSync(pathName)) {
        return await writeList();
    } else {

        let cache = fs.readFileSync(pathName, 'utf-8');
        cache = JSON.parse(cache);
        if (cache.created < (Date.now() - (3 * 3600 * 1000))) {
            return await writeList();
        } else {
            return cache.data;
        }
    }
}

const textPlainPrompt = 'Me dê o resultado em texto pleno e corrido para ser inserido em um relatório de intenção de investimento.'

export default class StockAnalyzer {
    constructor() {
        this.deepseekApiKey = process.env.DEEPSEEK_API_KEY || 'sua-chave-aqui';
        this.baseUrl = 'https://api.deepseek.com/v1';
        this.timestamp_now = Date.now();
        this.researchData = {
            stockInfo: {},
            news: [],
            executives: [],
            projects: [],
            technicalAnalysis: {},
            fundamentalAnalysis: {},
            whaleActivity: [],
            marketContext: {}
        };
        this.hash = null;
    }

    async analyzeStock(symbol, hash = '') {
        console.log(`🔍 Iniciando análise completa para: ${symbol}`);

        try {
            // Coleta de dados em paralelo
            await this.fetchStockData(symbol);
            await this.searchNews(symbol);
            await this.searchExecutives(symbol);

            // Geração do relatório
            const markdownContent = await this.generateReport(symbol);

            await this.saveMarkdown(markdownContent, symbol, hash);

            await prisma.reports.update({
                where: { hash },
                data: {
                    path: `reports/${symbol}_${hash}_${this.timestamp_now}.md`,
                    status: 'active'
                }
            });

            console.log(`✅ Análise completa concluída! Relatórios gerados.`);

        } catch (error) {
            await prisma.reports.update({
                where: { hash },
                data: {
                    status: 'error'
                }
            });
            console.error('❌ Erro na análise:', error.message);
        }
    }

    async fetchStockData(symbol) {
        console.log('📊 Coletando dados da ação...');

        try {
            // Dados da NYSE
            const nyseUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
            const nyseResponse = await axios.get(nyseUrl);

            const analises = analyzeStockData(nyseResponse.data);
            this.researchData.stockInfo = analises;

        } catch (error) {
            console.log('⚠️ Erro ao buscar dados da ação:', error.message);
        }
    }

    async searchNews(symbol) {
        console.log('📰 Buscando notícias recentes...');
        let { companyName } = this.researchData.stockInfo;
        const queries = [
            `Me conte as últimas notícias e fofocas sobre essa empresa: ${companyName} (${symbol}).\n${textPlainPrompt}`,
            `Me fale sobre os últimos produtos/serviços dessa empresa: ${companyName} (${symbol}).\n${textPlainPrompt}`,
            `Me fale sobre os últimos investimentos anunciados dessa empresa: ${companyName} (${symbol}).\n${textPlainPrompt}`
        ];

        for (const query of queries) {
            try {
                const news = await this.callDeepSeekAI(query);
                // console.log(news);
                this.researchData.news.push(news);
            } catch (error) {
                console.log(`⚠️ Erro na busca de notícias: ${error.message}`);
            }
        }
    }

    async searchExecutives(symbol) {
        console.log('👔 Buscando informações executivas...');
        let { companyName } = this.researchData.stockInfo;
        let executives = await this.callDeepSeekAI(`Me fale sobre os principais executivos da empresa: ${companyName} (${symbol}). E me dê o perfil de cada um deles nos detalhes que você souber.\n${textPlainPrompt}`)
        let news = await this.callDeepSeekAI(`${textPlainPrompt}\n Eu quero que busque por notícias relacionadas ao executivos mencionados abaixo, e qualquer notícia que possa ter relevância no contexto empresarial da empresa ${companyName} (${symbol}). Se baseie no texto à seguir:\n${executives}`);
        this.researchData.news.push(news);
        this.researchData.executives = executives;
    }


    async callDeepSeekAI(prompt, onProgress = null) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios.post(`${this.baseUrl}/chat/completions`, {
                    model: "deepseek-chat",
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: 8000,
                    stream: true, // ⭐ AGORA COM STREAMING!
                    temperature: 0.9
                }, {
                    headers: {
                        'Authorization': `Bearer ${this.deepseekApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    responseType: 'stream', // ⭐ Importante para streaming
                    timeout: 120000 // 2 minutos
                });

                let fullContent = '';
                let buffer = '';

                response.data.on('data', (chunk) => {
                    const lines = chunk.toString().split('\n');

                    for (const line of lines) {
                        const trimmedLine = line.trim();

                        if (trimmedLine.startsWith('data: ')) {
                            const data = trimmedLine.substring(6);

                            if (data === '[DONE]') {
                                return;
                            }

                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.choices &&
                                    parsed.choices[0] &&
                                    parsed.choices[0].delta &&
                                    parsed.choices[0].delta.content) {

                                    const content = parsed.choices[0].delta.content;
                                    fullContent += content;

                                    // Callback de progresso opcional
                                    if (onProgress) {
                                        onProgress(content);
                                    }
                                }
                            } catch (e) {
                                // Ignora erros de parse em chunks incompletos
                            }
                        }
                    }
                });

                response.data.on('end', () => {
                    console.log('✅ Stream concluído');
                    resolve(fullContent);
                });

                response.data.on('error', (error) => {
                    console.error('❌ Erro no stream:', error);
                    reject(error);
                });

            } catch (error) {
                console.error('❌ Erro na chamada da API:', error.message);
                reject(error);
            }
        });
    }

    async generateReport(symbol) {
        console.log('📝 Gerando relatório com streaming...');
        
        const analysisPrompt = this.createAnalysisPrompt(symbol);
        let fullReport = '';
        
        // Cria arquivo vazio primeiro
        const tempFilename = `reports/temp_${symbol}_${this.timestamp_now}.md`;
        writeFileSync(tempFilename, '', 'utf8');
        
        console.log('🔄 Iniciando stream do relatório...');
        
        await this.callDeepSeekAI(
            analysisPrompt,
            // Callback de progresso que vai salvando incrementalmente
            (chunk) => {
                fullReport += chunk;
                // Salva incrementalmente a cada 1000 caracteres
                if (fullReport.length % 1000 < chunk.length) {
                    writeFileSync(tempFilename, fullReport, 'utf8');
                }
            }
        );
        
        // Salva conteúdo final
        writeFileSync(tempFilename, fullReport, 'utf8');
        console.log('✅ Relatório completo gerado com streaming');
        
        return fullReport;
        // return this.formatMarkdownReport(symbol, aiAnalysis);
    }

    createAnalysisPrompt(symbol) {
        return `
Com base nos dados coletados abaixo, crie um relatório COMPLETO de análise de ações para ${symbol}.
Eu quero que você me forneça o máximo de informação possível, e recomendações. Eu quero que forneça o melhor ponto de entrada no mercado, o melhor ponto de saída, stop loss, etc.
Eu quero que você faça recomendações se baseando nas informações que forneci e que você encontrou.
Se essa ação é recomendavel para recebimento de dividendos, se tem potencial de valorização, e/ou se é um bom investimento como reserva de valor. No caso se for um fundo, me dê o máximo de informação sobre os prós e os contras desse investimento.
Se conseguir fazer considerações de curto, médio e longo prazo, melhor.
Seja criativo e discursivo, pode fazer textos mais elaborados e inteligentes.

Eu vou fornecer um modelo, mas ele só tem o propósito de organizar mais ou menos. Fique à vontade para sair um pouco do modelo se você tiver informações, fundamentos ou colocações que eu não consegui prever no modelo. Você tem total autonomia para fornecer esse relatório, desde que seja o mais completo e poderoso possível.

DADOS COLETADOS:
${JSON.stringify(this.researchData, null, 2)}

INSTRUÇÕES PARA O RELATÓRIO:

1. ANÁLISE FUNDAMENTALISTA DETALHADA:
   - Valuation e métricas financeiras
   - Dívida e liquidez
   - Crescimento de receita e lucro
   - Análise do setor
   - Competidores diretos

2. ANÁLISE TÉCNICA AVANÇADA:
   - Tendências de preço (curto, médio e longo prazo)
   - Suportes e resistências
   - Indicadores técnicos (MACD, RSI, Médias Móveis)
   - Volume e momentum

3. ANÁLISE DE DIVIDENDOS:
   - Histórico de dividendos
   - Yield atual e sustentabilidade
   - Política de dividendos
   - Potencial de crescimento

4. ANÁLISE DE EXECUTIVOS E GOVERNANÇA:
   - Experiência da equipe executiva
   - Histórico de decisões
   - Alinhamento com acionistas
   - Projetos sob gestão atual

5. PROJETOS E INOVAÇÕES:
   - Lançamentos recentes
   - Projetos em desenvolvimento
   - Investimentos em P&D
   - Parcerias estratégicas

6. ATIVIDADE DAS BALEIAS (WHALES):
   - Movimentos de grandes investidores
   - Fundos institucionais relevantes
   - Mudanças significativas em posições
   - Impacto no preço das ações

7. CONTEXTO DE MERCADO:
   - Cenário macroeconômico
   - Bolsa de NY (NYSE) vs Bolsa do Brasil (B3)
   - Fatores setoriais relevantes
   - Riscos e oportunidades

8. RECOMENDAÇÕES ESPECÍFICAS:
   - Melhor momento para COMPRA (com justificativa)
   - Melhor momento para VENDA (com justificativa)
   - Horizonte de investimento recomendado
   - Nível de risco (Baixo/Médio/Alto)

Formato obrigatório: MARKDOWN com seções bem estruturadas
Destaque pontos críticos com **negrito**
Não utilize tabelas.
Inclua uma classificação final de 1-5 estrelas

Seja extremamente detalhado e baseie todas as conclusões nos dados fornecidos.

Comece sua resposta com markdown e assim vá até o fim. Sem comentários ou respostas ou instruções fora do markdown.


Siga o modelo abaixo:
# 📊 RELATÓRIO COMPLETO DE ANÁLISE: {COMPANY}

## 📈 RESUMO EXECUTIVO

{Escrever Aqui}

---

## 🔍 ANÁLISE FUNDAMENTALISTA

{Escrever Aqui}

---

## 📊 ANÁLISE TÉCNICA

{Escrever Aqui}

---

## 💰 ANÁLISE DE DIVIDENDOS

{Escrever Aqui}

---

## 👔 ANÁLISE EXECUTIVA E GOVERNANÇA

{Escrever Aqui}

---

## 🚀 PROJETOS E INOVAÇÕES

{Escrever Aqui}

---

## 🐋 ATIVIDADE DAS BALEIAS (WHALES)

{Escrever Aqui}

---

## 🌍 CONTEXTO DE MERCADO

### Bolsa de NY (NYSE)
{Escrever Aqui}

### Bolsa do Brasil (B3)
{Escrever Aqui}

---

## 🎯 RECOMENDAÇÕES E ESTRATÉGIAS

{Escrever Aqui}

---

## ⚠️ RISCOS IDENTIFICADOS

{Escrever Aqui}

---

## 📋 DADOS COLETADOS (RESUMO)

### Notícias Relevantes (Top 5)
{Escrever Aqui}

### Executivos Identificados
{Escrever Aqui}

### Projetos em Destaque
{Escrever Aqui}

---

## 🎖️ CLASSIFICAÇÃO FINAL

**⭐⭐⭐⭐⭐ (Excelente)**

`;
    }

    async saveMarkdown(content, symbol, idnt) {
        const filename = `reports/${symbol}_${idnt}_${this.timestamp_now}.md`;
        writeFileSync(filename, content, 'utf8');
        console.log(`📄 Relatório Markdown salvo: ${filename}`);
        return filename;
    }

}