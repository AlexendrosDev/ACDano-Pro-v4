// RateLimiter.js - Límite de peticiones por cliente (anti-abuse)
// Ventana deslizante: 60s | Máximo 30 solicitudes

export class RateLimiter {
  static WINDOW_MS = 60_000;
  static MAX_REQUESTS = 30;
  static STORE = new Map(); // clientId -> [timestamps]

  static _now() { return Date.now(); }

  static getClientId() {
    // Generar ID simple de sesión si no existe (para runtime navegador)
    if (typeof window !== 'undefined') {
      const key = '__acdao_client_id__';
      let id = window.__ACDAO_CLIENT_ID__;
      if (!id) {
        id = `${Math.random().toString(36).slice(2)}-${this._now()}`;
        window.__ACDAO_CLIENT_ID__ = id;
      }
      return id;
    }
    // Fallback Node (tests/SSR)
    return 'server';
  }

  static checkLimit(clientId = this.getClientId()) {
    const now = this._now();
    const windowStart = now - this.WINDOW_MS;
    const arr = this.STORE.get(clientId) || [];
    const recent = arr.filter(ts => ts >= windowStart);

    if (recent.length >= this.MAX_REQUESTS) {
      throw new Error('Demasiadas solicitudes. Intenta de nuevo en unos segundos.');
    }

    recent.push(now);
    this.STORE.set(clientId, recent);
    return true;
  }
}

export default RateLimiter;
