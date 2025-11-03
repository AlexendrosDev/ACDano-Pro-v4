// SecurityValidator.js - Sanitización y validación básica de entrada
// Uso: SecurityValidator.sanitizeInput(value, { type: 'text'|'number'|'select', field: 'categoria' })
//      SecurityValidator.validateObject(obj, schema)

export class SecurityValidator {
  static ALLOWED = {
    categoria: [
      'jefe_cocina_I','maitre_I','jefe_recepcion_I',
      'segundo_cocina_II','jefe_comedor_II','recepcionista_II',
      'cocinero_III','camarero_III','barman_III',
      'ayudante_cocina_IV','ayudante_camarero_IV','lavavajillas_IV',
      'pinche_cocina_V','limpieza_V','auxiliar_V'
    ],
    tabla: ['TABLA_I','TABLA_II'],
    tipo_jornada: ['continuada','partida']
  };

  static sanitizeString(str) {
    if (str == null) return '';
    return String(str)
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on[a-z]+\s*=\s*(['"]).*?\1/gi, '')
      .replace(/[\u0000-\u001F\u007F]/g, '')
      .trim();
  }

  static sanitizeNumber(val, { min = 0, max = 999999 } = {}) {
    const n = Number(val);
    if (!Number.isFinite(n)) return min;
    return Math.min(Math.max(n, min), max);
  }

  static sanitizeSelect(val, field) {
    const v = this.sanitizeString(val);
    const allow = this.ALLOWED[field] || [];
    return allow.includes(v) ? v : '';
  }

  static sanitizeInput(value, { type = 'text', field, min, max } = {}) {
    switch (type) {
      case 'number': return this.sanitizeNumber(value, { min, max });
      case 'select': return this.sanitizeSelect(value, field);
      case 'text':
      default: return this.sanitizeString(value).slice(0, 200);
    }
  }

  static validateObject(obj, schema) {
    const errors = [];
    for (const [key, rule] of Object.entries(schema)) {
      const val = obj[key];
      if (rule.required && (val === undefined || val === null || val === '')) {
        errors.push(`Campo requerido: ${key}`);
        continue;
      }
      if (val === undefined || val === null || val === '') continue; // opcional

      if (rule.type === 'string' && typeof val !== 'string') errors.push(`"${key}" debe ser string`);
      if (rule.type === 'number' && typeof val !== 'number') errors.push(`"${key}" debe ser número`);
      if (rule.type === 'boolean' && typeof val !== 'boolean') errors.push(`"${key}" debe ser booleano`);
      if (rule.type === 'array' && !Array.isArray(val)) errors.push(`"${key}" debe ser array`);

      if (rule.enum && !rule.enum.includes(val)) errors.push(`"${key}" fuera de valores permitidos`);
      if (rule.pattern && typeof val === 'string' && !rule.pattern.test(val)) errors.push(`"${key}" no cumple el patrón`);

      if (rule.min != null && typeof val === 'number' && val < rule.min) errors.push(`"${key}" < mínimo (${rule.min})`);
      if (rule.max != null && typeof val === 'number' && val > rule.max) errors.push(`"${key}" > máximo (${rule.max})`);

      if (rule.items && Array.isArray(val)) {
        for (const it of val) {
          if (rule.items.type && typeof it !== rule.items.type) errors.push(`Elemento de "${key}" debe ser ${rule.items.type}`);
          if (rule.items.enum && !rule.items.enum.includes(it)) errors.push(`Elemento de "${key}" fuera de enumeración`);
        }
      }
    }
    return { valid: errors.length === 0, errors };
  }
}

export default SecurityValidator;
