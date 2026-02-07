import axios from 'axios';

/**
 * Cliente fino para a Nasdaq Cloud Data Service REST API.
 * - Autentica via OAuth2 client_credentials em /v1/auth/token.
 * - Expõe métodos mínimos para listar símbolos e buscar dados em tempo real.
 */
export default class NasdaqClient {
  constructor(options = {}) {
    this.baseUrl = (options.baseUrl || process.env.NASDAQ_API_BASE_URL || '').replace(/\/+$/, '');
    this.clientId = options.clientId || process.env.NASDAQ_CLIENT_ID;
    this.clientSecret = options.clientSecret || process.env.NASDAQ_CLIENT_SECRET;
    this.source = (options.source || process.env.NASDAQ_SOURCE || 'nasdaq').toLowerCase();
    this.offset = (options.offset || process.env.NASDAQ_OFFSET || 'realtime').toLowerCase();

    if (!this.baseUrl) throw new Error('NASDAQ_API_BASE_URL não configurada');
    if (!this.clientId || !this.clientSecret) throw new Error('NASDAQ_CLIENT_ID / NASDAQ_CLIENT_SECRET não configurados');

    this.http = axios.create({ baseURL: this.baseUrl });
    this.accessToken = null;
    this.tokenExpiresAt = 0;
  }

  async authenticate() {
    const now = Date.now();
    const nearExpiry = now > this.tokenExpiresAt - 5_000;
    if (this.accessToken && !nearExpiry) return this.accessToken;

    const { data } = await this.http.post(
      '/v1/auth/token',
      { client_id: this.clientId, client_secret: this.clientSecret },
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (!data?.access_token) {
      throw new Error('Falha ao autenticar na Nasdaq: access_token ausente');
    }

    const expiresIn = Number(data.expires_in) || 1_800; // fallback 30min
    this.accessToken = data.access_token;
    this.tokenExpiresAt = now + expiresIn * 1000;
    return this.accessToken;
  }

  async authorizedGet(path, params = {}) {
    const token = await this.authenticate();
    const { data } = await this.http.get(path, {
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  }

  buildSymbolsPath(symbols) {
    if (!symbols) throw new Error('Informe ao menos um símbolo');
    if (Array.isArray(symbols)) {
      const cleaned = symbols.filter(Boolean).map((s) => s.toUpperCase());
      if (!cleaned.length) throw new Error('Informe ao menos um símbolo');
      return cleaned.join(',');
    }
    return String(symbols).toUpperCase();
  }

  // Reference
  async listSymbols() {
    return this.authorizedGet('/v1/reference/symbols');
  }

  async getSymbolDetails(symbol) {
    const symbolPath = this.buildSymbolsPath(symbol);
    return this.authorizedGet(`/v1/reference/symbol/${symbolPath}`);
  }

  // Real-time / delayed
  async getLastQuote(symbols) {
    const symbolPath = this.buildSymbolsPath(symbols);
    return this.authorizedGet(`/v1/${this.source}/${this.offset}/equities/lastquote/${symbolPath}`);
  }

  async getSnapshot(symbols) {
    const symbolPath = this.buildSymbolsPath(symbols);
    return this.authorizedGet(`/v1/${this.source}/${this.offset}/equities/snapshot/${symbolPath}`);
  }

  async getLastSale(symbols) {
    const symbolPath = this.buildSymbolsPath(symbols);
    return this.authorizedGet(`/v1/${this.source}/${this.offset}/equities/lastsale/${symbolPath}`);
  }
}
