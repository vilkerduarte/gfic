import axios from 'axios';
import { Agent } from 'https';
import { readFileSync } from 'fs';

class InterBank {
    constructor() {
        this.clientId = process.env.INTER_CLIENT_ID;
        this.clientSecret = process.env.INTER_CLIENT_SECRET;
        this.certPath = process.env.INTER_CERT_PATH;
        this.keyPath = process.env.INTER_KEY_PATH;
        this.contaCorrente = process.env.INTER_CONTA_CORRENTE;
        
        if (!this.clientId || !this.clientSecret || !this.certPath || !this.keyPath || !this.contaCorrente) {
            throw new Error('Variáveis de ambiente INTER_CLIENT_ID, INTER_CLIENT_SECRET, INTER_CERT_PATH, INTER_KEY_PATH e INTER_CONTA_CORRENTE são obrigatórias');
        }

        this.token = null;
        this.tokenExpiry = null;
        this.urlOauth = 'https://cdpj.partners.bancointer.com.br/oauth/v2/token';
        this.baseUrl = 'https://cdpj.partners.bancointer.com.br';
        
        this.scopes = [
            'extrato.read',
            'boleto-cobranca.read',
            'boleto-cobranca.write',
            'cob.write',
            'cob.read',
            'cobv.write',
            'cobv.read',
            'pix.read',
            'lotecobv.read',
            'lotecobv.write'
        ].join(' ');
        
        // Configuração do axios com certificados
        this.axiosInstance = axios.create({
            httpsAgent: new Agent({
                cert: readFileSync(this.certPath),
                key: readFileSync(this.keyPath)
            })
        });
    }

    async getToken() {
        // Verifica se o token atual ainda é válido (50 minutos)
        if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.token;
        }

        try {
            const response = await this.axiosInstance.post(this.urlOauth, 
                `client_id=${this.clientId}&client_secret=${this.clientSecret}&scope=${this.scopes}&grant_type=client_credentials`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            if (!response.data || !response.data.access_token) {
                throw new Error('Resposta do serviço OAuth sem access_token');
            }

            this.token = response.data.access_token;
            
            // Define a expiração para 50 minutos (3000000 ms)
            this.tokenExpiry = Date.now() + 3000000;
            
            console.log('Token renovado com sucesso');
            return this.token;

        } catch (error) {
            console.error('Erro ao obter token OAuth:', error.message);
            
            if (error.response) {
                console.error('Detalhes da resposta:', error.response.data);
            }
            
            throw new Error(`Falha na autenticação: ${error.message}`);
        }
    }

    // Método para forçar renovação do token
    async renewToken() {
        this.token = null;
        this.tokenExpiry = null;
        return await this.getToken();
    }

    // Método para verificar se o token está expirado
    isTokenExpired() {
        return !this.token || !this.tokenExpiry || Date.now() >= this.tokenExpiry;
    }

    /**
     * Cria uma cobrança PIX
     * @param {Object} cobrancaData - Dados da cobrança PIX
     * @param {string} cobrancaData.txid - TXID da cobrança
     * @param {Object} cobrancaData.calendario - Dados do calendário
     * @param {number} cobrancaData.calendario.expiracao - Tempo de expiração em segundos
     * @param {Object} cobrancaData.devedor - Dados do devedor
     * @param {string} cobrancaData.devedor.cnpj - CNPJ do devedor
     * @param {string} cobrancaData.devedor.nome - Nome do devedor
     * @param {Object} cobrancaData.valor - Dados do valor
     * @param {string} cobrancaData.valor.original - Valor original
     * @param {number} cobrancaData.valor.modalidadeAlteracao - Modalidade de alteração
     * @param {string} cobrancaData.chave - Chave PIX
     * @param {string} cobrancaData.solicitacaoPagador - Solicitação ao pagador
     * @param {Array} cobrancaData.infoAdicionais - Informações adicionais
     * @returns {Promise<Object>} - Resposta da API
     */
    async criarCobrancaPix(cobrancaData) {
        try {
            const token = await this.getToken();

            let hasTXID = cobrancaData.txid ? true : false;
            
            const url = `${this.baseUrl}/pix/v2/cob/${cobrancaData.txid||''}`;

            let opt = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'x-conta-corrente': this.contaCorrente
                }
            }
            
            const response = hasTXID ? await this.axiosInstance.put(url, cobrancaData, opt) : await this.axiosInstance.post(url, cobrancaData, opt);

            return response.data;

        } catch (error) {
            console.error('Erro ao criar cobrança PIX:', error.message);
            
            if (error.response) {
                console.error('Detalhes do erro:', error.response.data);
                throw new Error(`Erro API: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            }
            
            throw new Error(`Falha ao criar cobrança PIX: ${error.message}`);
        }
    }

    /**
     * Busca uma cobrança PIX por TXID
     * @param {string} txid - TXID da cobrança
     * @returns {Promise<Object>} - Dados da cobrança PIX
     */
    async buscarCobrancaPix(txid) {
        try {
            const token = await this.getToken();
            
            const url = `${this.baseUrl}/pix/v2/cob/${txid}`;
            
            const response = await this.axiosInstance.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'x-conta-corrente': this.contaCorrente
                }
            });

            return response.data;

        } catch (error) {
            console.error('Erro ao buscar cobrança PIX:', error.message);
            
            if (error.response) {
                console.error('Detalhes do erro:', error.response.data);
                throw new Error(`Erro API: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            }
            
            throw new Error(`Falha ao buscar cobrança PIX: ${error.message}`);
        }
    }

    /**
     * Busca um PIX recebido por e2eId
     * @param {string} e2eId - End-to-End ID do PIX
     * @returns {Promise<Object>} - Dados do PIX
     */
    async buscarPix(e2eId) {
        try {
            const token = await this.getToken();
            
            const url = `${this.baseUrl}/pix/v2/pix/${e2eId}`;
            
            const response = await this.axiosInstance.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'x-conta-corrente': this.contaCorrente
                }
            });

            return response.data;

        } catch (error) {
            console.error('Erro ao buscar PIX:', error.message);
            
            if (error.response) {
                console.error('Detalhes do erro:', error.response.data);
                throw new Error(`Erro API: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            }
            
            throw new Error(`Falha ao buscar PIX: ${error.message}`);
        }
    }

    /**
     * Método auxiliar para criar dados padrão de cobrança PIX
     * @param {Object} dados - Dados personalizados
     * @returns {Object} - Estrutura padrão de cobrança PIX
     */
    criarEstruturaCobrancaPadrao(dados = {}) {
        const estruturaPadrao = {
            calendario: {
                expiracao: 3600
            },
            devedor: {
                cnpj: "",
                nome: ""
            },
            valor: {
                original: "0.00",
                modalidadeAlteracao: 1
            },
            chave: "",
            solicitacaoPagador: "",
            infoAdicionais: []
        };

        return { ...estruturaPadrao, ...dados };
    }
}
const Bank = new InterBank();
export default Bank;