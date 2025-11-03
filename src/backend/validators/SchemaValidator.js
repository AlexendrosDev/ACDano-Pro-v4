// SchemaValidator.js - Esquemas estrictos para validación de datos
// Uso: SchemaValidator.validate('datosTrabajador', obj)

export class SchemaValidator {
  static SCHEMAS = {
    datosTrabajador: {
      categoria: { type: 'string', required: true, enum: [
        'jefe_cocina_I','maitre_I','jefe_recepcion_I',
        'segundo_cocina_II','jefe_comedor_II','recepcionista_II',
        'cocinero_III','camarero_III','barman_III',
        'ayudante_cocina_IV','ayudante_camarero_IV','lavavajillas_IV',
        'pinche_cocina_V','limpieza_V','auxiliar_V'
      ] },
      tabla: { type: 'string', required: true, enum: ['TABLA_I','TABLA_II'] },
      nivel: { type: 'string', required: true, pattern: /^NIVEL_[IVX]+$/ },
      tipo_jornada: { type: 'string', required: true, enum: ['continuada','partida'] },
      es_hotel: { type: 'boolean', required: false },
      aplica_plus_formacion: { type: 'boolean', required: false },
      aplica_plus_transporte: { type: 'boolean', required: false },
      aplica_manutencion: { type: 'boolean', required: false },
      elementos_uniforme: { type: 'array', required: false, items: { type: 'string' } }
    },
    datosFamiliares: {
      num_hijos: { type: 'number', required: true, min: 0, max: 10 }
    }
  };

  static validate(schemaName, obj) {
    const schema = this.SCHEMAS[schemaName];
    if (!schema) return { valid: true, errors: [] };
    const errors = [];

    for (const [key, rule] of Object.entries(schema)) {
      const val = obj[key];
      if (rule.required && (val === undefined || val === null || val === '')) {
        errors.push(`Campo requerido: ${key}`);
        continue;
      }
      if (val === undefined || val === null || val === '') continue;

      if (rule.type === 'string' && typeof val !== 'string') errors.push(`${key} debe ser string`);
      if (rule.type === 'number' && typeof val !== 'number') errors.push(`${key} debe ser número`);
      if (rule.type === 'boolean' && typeof val !== 'boolean') errors.push(`${key} debe ser booleano`);
      if (rule.type === 'array' && !Array.isArray(val)) errors.push(`${key} debe ser array`);

      if (rule.enum && !rule.enum.includes(val)) errors.push(`${key} fuera de valores permitidos`);
      if (rule.pattern && typeof val === 'string' && !rule.pattern.test(val)) errors.push(`${key} no cumple el patrón`);

      if (rule.min != null && typeof val === 'number' && val < rule.min) errors.push(`${key} inferior al mínimo (${rule.min})`);
      if (rule.max != null && typeof val === 'number' && val > rule.max) errors.push(`${key} superior al máximo (${rule.max})`);

      if (rule.items && Array.isArray(val)) {
        for (const it of val) {
          if (rule.items.type && typeof it !== rule.items.type) errors.push(`Elemento de ${key} debe ser ${rule.items.type}`);
          if (rule.items.enum && !rule.items.enum.includes(it)) errors.push(`Elemento de ${key} fuera de enumeración`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }
}

export default SchemaValidator;
