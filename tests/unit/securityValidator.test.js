// securityValidator.test.js - Tests de sanitización y validación
import { describe, it, expect } from '@jest/globals';
import SecurityValidator from '../../src/shared/SecurityValidator.js';

describe('SecurityValidator', () => {
  describe('sanitizeString', () => {
    it('elimina scripts maliciosos', () => {
      const malicious = '<script>alert("xss")</script>Texto';
      const result = SecurityValidator.sanitizeString(malicious);
      expect(result).toBe('Texto');
      expect(result).not.toContain('script');
    });

    it('elimina javascript: y atributos on*', () => {
      const malicious = 'javascript:alert(1) onclick="evil()" onload="bad()"';
      const result = SecurityValidator.sanitizeString(malicious);
      expect(result).not.toContain('javascript:');
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('onload');
    });

    it('elimina caracteres de control', () => {
      const withControl = 'texto\u0000\u001F\u007Flimpio';
      const result = SecurityValidator.sanitizeString(withControl);
      expect(result).toBe('textolimpio');
    });
  });

  describe('sanitizeNumber', () => {
    it('respeta límites min/max', () => {
      expect(SecurityValidator.sanitizeNumber(-5, { min: 0, max: 10 })).toBe(0);
      expect(SecurityValidator.sanitizeNumber(15, { min: 0, max: 10 })).toBe(10);
      expect(SecurityValidator.sanitizeNumber(5, { min: 0, max: 10 })).toBe(5);
    });

    it('maneja valores inválidos', () => {
      expect(SecurityValidator.sanitizeNumber('abc', { min: 0 })).toBe(0);
      expect(SecurityValidator.sanitizeNumber(null, { min: 5 })).toBe(5);
      expect(SecurityValidator.sanitizeNumber(undefined, { min: 0 })).toBe(0);
    });
  });

  describe('sanitizeSelect', () => {
    it('permite valores whitelist', () => {
      expect(SecurityValidator.sanitizeSelect('cocinero_III', 'categoria')).toBe('cocinero_III');
      expect(SecurityValidator.sanitizeSelect('TABLA_I', 'tabla')).toBe('TABLA_I');
    });

    it('rechaza valores no permitidos', () => {
      expect(SecurityValidator.sanitizeSelect('hacker_injection', 'categoria')).toBe('');
      expect(SecurityValidator.sanitizeSelect('TABLA_FAKE', 'tabla')).toBe('');
    });
  });

  describe('validateObject', () => {
    const schema = {
      name: { type: 'string', required: true },
      age: { type: 'number', min: 0, max: 120 },
      role: { enum: ['admin', 'user'] }
    };

    it('valida objeto correcto', () => {
      const obj = { name: 'Juan', age: 30, role: 'user' };
      const result = SecurityValidator.validateObject(obj, schema);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('detecta campos requeridos faltantes', () => {
      const obj = { age: 30 };
      const result = SecurityValidator.validateObject(obj, schema);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Campo requerido: name');
    });

    it('valida tipos y enums', () => {
      const obj = { name: 123, age: 'abc', role: 'hacker' };
      const result = SecurityValidator.validateObject(obj, schema);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});