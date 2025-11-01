// DataIntegrityValidator.js - Verificación de integridad de datos normativos
import { createHash } from 'crypto';

export class DataIntegrityValidator {
  // SHA-256 calculados sobre JSON minificado (sin espacios)
  static CHECKSUMS = {
    'convenio_valencia_2025.json': '',
    'seguridad_social_2025.json': '',
    'irpf_valencia_2025.json': ''
  };

  static sha256String(str) {
    try {
      // Node runtime (CI/local): usar crypto
      return createHash('sha256').update(str).digest('hex');
    } catch (e) {
      // Fallback para navegador: Web Crypto
      if (typeof window !== 'undefined' && window.crypto?.subtle) {
        const enc = new TextEncoder();
        return window.crypto.subtle.digest('SHA-256', enc.encode(str)).then(buf =>
          Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
        );
      }
      throw e;
    }
  }

  static async validateJsonIntegrity(name, jsonObject) {
    const jsonMin = JSON.stringify(jsonObject);
    const hash = await this.sha256String(jsonMin);
    const expected = this.CHECKSUMS[name];
    if (expected && typeof expected === 'string') {
      if (hash !== expected) {
        throw new Error(`Integridad comprometida en ${name}: esperado ${expected} vs ${hash}`);
      }
    }
    return true;
  }
}

export default DataIntegrityValidator;
