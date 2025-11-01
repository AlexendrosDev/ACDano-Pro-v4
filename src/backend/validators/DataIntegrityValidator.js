// DataIntegrityValidator.js - Verificación de integridad de datos normativos (con checksums)
export class DataIntegrityValidator {
  // SHA-256 calculados sobre JSON minificado (sin espacios)
  static CHECKSUMS = {
    'convenio_valencia_2025.json': 'b7d50ed635be21749ac357c83ebf1d973b5b1b55c1f41d932f7b2588dba42f1c',
    'seguridad_social_2025.json': '8d2579ddcbaaf63ac0f1701ee316b1783a4366e6bfa4de8e8c96c948c8f25038',
    'irpf_valencia_2025.json': '51e17d0049cf36175e58afab58f618b003475d188763c03d64f8975b6120dfdc'
  };

  static async sha256String(str) {
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
      // Navegador: Web Crypto API
      const enc = new TextEncoder();
      const buffer = await window.crypto.subtle.digest('SHA-256', enc.encode(str));
      return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } else {
      // Node.js: usar crypto module (para tests)
      const { createHash } = await import('crypto');
      return createHash('sha256').update(str).digest('hex');
    }
  }

  static async validateJsonIntegrity(fileName, jsonObject) {
    const jsonMinified = JSON.stringify(jsonObject, null, 0);
    const calculatedHash = await this.sha256String(jsonMinified);
    const expectedHash = this.CHECKSUMS[fileName];
    if (expectedHash && calculatedHash !== expectedHash) {
      throw new Error(`INTEGRIDAD COMPROMETIDA en ${fileName}: esperado ${expectedHash.slice(0,8)}... vs ${calculatedHash.slice(0,8)}...`);
    }
    return true;
  }
}

export default DataIntegrityValidator;