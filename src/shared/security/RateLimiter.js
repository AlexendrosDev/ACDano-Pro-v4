/**
 * ⏱️ RateLimiter - Protección contra inundación de solicitudes
 * 
 * Funcionalidades:
 * - Límite de 30 requests/minuto por cliente
 * - Ventana deslizante de 60 segundos
 * - Client ID único por sesión
 * - Limpieza automática de requests expirados
 * 
 * @author ACDaño Team
 * @version 4.0
 */

export class RateLimiter {
  static requests = new Map();
  static MAX_REQUESTS = 30; // por minuto
  static WINDOW_MS = 60000; // 1 minuto
  
  /**
   * Verifica si el cliente puede hacer una nueva request
   * @param {string} clientId - ID único del cliente
   * @returns {boolean} true si puede continuar
   * @throws {Error} Si excede el límite
   */
  static checkLimit(clientId = 'default') {
    const now = Date.now();
    const window = this.requests.get(clientId) || [];
    
    // Filtrar requests dentro de la ventana de tiempo
    const validRequests = window.filter(time => now - time < this.WINDOW_MS);
    
    if (validRequests.length >= this.MAX_REQUESTS) {
      throw new Error(`Límite de ${this.MAX_REQUESTS} consultas/minuto superado. Espera un momento antes de volver a calcular.`);
    }
    
    // Agregar nueva request y actualizar
    this.requests.set(clientId, [...validRequests, now]);
    return true;
  }

  /**
   * Obtiene estadísticas del rate limiter para un cliente
   * @param {string} clientId - ID único del cliente
   * @returns {Object} Estadísticas de uso
   */
  static getStats(clientId = 'default') {
    const now = Date.now();
    const window = this.requests.get(clientId) || [];
    const validRequests = window.filter(time => now - time < this.WINDOW_MS);
    
    return {
      requestsUsed: validRequests.length,
      requestsRemaining: Math.max(0, this.MAX_REQUESTS - validRequests.length),
      resetTime: validRequests.length > 0 ? validRequests[0] + this.WINDOW_MS : null,
      windowMs: this.WINDOW_MS
    };
  }

  /**
   * Limpia requests expirados para liberar memoria
   */
  static cleanup() {
    const now = Date.now();
    
    for (const [clientId, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => now - time < this.WINDOW_MS);
      
      if (validRequests.length === 0) {
        this.requests.delete(clientId);
      } else {
        this.requests.set(clientId, validRequests);
      }
    }
  }

  /**
   * Resetea el límite para un cliente específico (solo para testing)
   * @param {string} clientId - ID único del cliente
   */
  static reset(clientId = 'default') {
    this.requests.delete(clientId);
  }

  /**
   * Genera un ID único para un cliente
   * @returns {string} Client ID único
   */
  static generateClientId() {
    return 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// Limpieza automática cada 5 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    RateLimiter.cleanup();
  }, 5 * 60 * 1000);
}