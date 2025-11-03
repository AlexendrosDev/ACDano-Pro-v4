// rateLimiter.test.js - Tests del sistema anti-abuse
import { describe, it, expect, beforeEach } from '@jest/globals';
import RateLimiter from '../../src/shared/RateLimiter.js';

describe('RateLimiter', () => {
  beforeEach(() => {
    RateLimiter.STORE.clear();
  });

  it('permite hasta 30 requests en 60 segundos', () => {
    const clientId = 'test-client';
    
    // 30 requests OK
    for (let i = 0; i < 30; i++) {
      expect(() => RateLimiter.checkLimit(clientId)).not.toThrow();
    }
    
    // Request 31 bloqueada
    expect(() => RateLimiter.checkLimit(clientId))
      .toThrow('Demasiadas solicitudes. Intenta de nuevo en unos segundos.');
  });

  it('libera requests tras pasar la ventana', () => {
    const clientId = 'test-time';
    const oldNow = RateLimiter._now;
    let mockTime = 1000;
    RateLimiter._now = () => mockTime;

    // Llenar hasta el límite
    for (let i = 0; i < 30; i++) {
      RateLimiter.checkLimit(clientId);
    }
    
    // Avanzar tiempo 61 segundos
    mockTime += 61000;
    
    // Debería permitir nueva request
    expect(() => RateLimiter.checkLimit(clientId)).not.toThrow();
    
    RateLimiter._now = oldNow;
  });

  it('mantiene clients separados', () => {
    for (let i = 0; i < 30; i++) {
      RateLimiter.checkLimit('client-A');
      RateLimiter.checkLimit('client-B');
    }
    
    // Ambos han usado su límite
    expect(() => RateLimiter.checkLimit('client-A')).toThrow();
    expect(() => RateLimiter.checkLimit('client-B')).toThrow();
  });
});