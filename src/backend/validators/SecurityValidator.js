/**
 * 🛡️ SecurityValidator - Sistema de seguridad robusta
 * 
 * Proporciona:
 * - Sanitización de inputs maliciosos (XSS, injection)
 * - Validación de esquemas con whitelist
 * - Límites por tipo de campo
 * 
 * @author ACDaño Team
 * @version 4.0
 */

export class SecurityValidator {
  static ALLOWED_VALUES = {
    categoria: [
      'jefe_cocina_I', 'maitre_I', 'jefe_recepcion_I',
      'segundo_cocina_II', 'jefe_comedor_II', 'recepcionista_II',
      'cocinero_III', 'camarero_III', 'barman_III',
      'ayudante_cocina_IV', 'ayudante_camarero_IV', 'lavavajillas_IV',
      'pinche_cocina_V', 'limpieza_V', 'auxiliar_V'
    ],
    tabla: ['TABLA_I', 'TABLA_II'],
    nivel: ['NIVEL_I', 'NIVEL_II', 'NIVEL_III', 'NIVEL_IV', 'NIVEL_V'],
    tipo_jornada: ['continuada', 'partida'],
    tipo_establecimiento: ['restaurante', 'hotel'],
    elementos_uniforme: [
      'chaquetilla_cocina', 'gorro_cocina', 'pantalon_cocina', 'zapatos_cocina',
      'chaqueta_camarero', 'pantalon_camarero', 'camisa_camarero', 'corbata',
      'zapatos_camarero', 'delantal', 'mandil', 'gorra_servicio',
      // EPI Limpieza
      'bata_trabajo', 'guantes_latex', 'mascarilla_ffp2',
      'calzado_seguridad', 'gorro_higiene', 'delantal_impermeable'
    ]
  };

  /**
   * Sanitiza input eliminando contenido malicioso
   * @param {*} value - Valor a sanitizar
   * @param {string} type - Tipo de dato
   * @param {string} fieldName - Nombre del campo para validación específica
   * @returns {*} Valor sanitizado
   */
  static sanitizeInput(value, type = 'text', fieldName = '') {
    if (value === null || value === undefined) return '';
    
    // Eliminar scripts y HTML malicioso
    const cleanValue = value.toString()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
    
    switch (type) {
      case 'number': 
        const num = Number(cleanValue) || 0;
        return Math.max(0, Math.min(num, fieldName === 'num_hijos' ? 10 : 99999));
      case 'select': 
        return this.ALLOWED_VALUES[fieldName] && this.ALLOWED_VALUES[fieldName].includes(cleanValue) ? cleanValue : '';
      case 'array':
        if (!Array.isArray(value)) return [];
        return value.filter(item => this.ALLOWED_VALUES[fieldName] && this.ALLOWED_VALUES[fieldName].includes(item));
      default: 
        return cleanValue.slice(0, 100);
    }
  }

  /**
   * Valida esquema de datos contra definición
   * @param {Object} data - Datos a validar
   * @param {string} schemaName - Nombre del esquema
   * @returns {Object} Resultado de validación
   */
  static validateSchema(data, schemaName) {
    const schemas = {
      datosTrabajador: {
        categoria: { required: true, type: 'select', field: 'categoria' },
        tabla: { required: true, type: 'select', field: 'tabla' },
        nivel: { required: true, type: 'select', field: 'nivel' },
        tipo_jornada: { required: true, type: 'select', field: 'tipo_jornada' },
        elementos_uniforme: { required: false, type: 'array', field: 'elementos_uniforme' }
      },
      datosFamiliares: {
        num_hijos: { required: true, type: 'number', field: 'num_hijos' }
      }
    };

    const schema = schemas[schemaName];
    if (!schema) return { valid: false, errors: [`Esquema desconocido: ${schemaName}`] };

    const errors = [];
    for (const [field, rules] of Object.entries(schema)) {
      if (rules.required && (!data[field] && data[field] !== 0)) {
        errors.push(`Campo requerido: ${field}`);
      }
      if (data[field] !== undefined && data[field] !== null) {
        const sanitized = this.sanitizeInput(data[field], rules.type, rules.field);
        if (rules.type === 'select' && sanitized === '' && data[field] !== '') {
          errors.push(`Valor inválido en ${field}: ${data[field]}`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Valida y sanitiza datos del trabajador
   * @param {Object} datosTrabajador - Datos del trabajador sin sanitizar
   * @returns {Object} Datos sanitizados
   */
  static sanitizeWorkerData(datosTrabajador) {
    return {
      categoria: this.sanitizeInput(datosTrabajador.categoria, 'select', 'categoria'),
      tabla: this.sanitizeInput(datosTrabajador.tabla, 'select', 'tabla'),
      nivel: this.sanitizeInput(datosTrabajador.nivel, 'select', 'nivel'),
      tipo_jornada: this.sanitizeInput(datosTrabajador.tipo_jornada, 'select', 'tipo_jornada'),
      es_hotel: Boolean(datosTrabajador.es_hotel),
      aplica_plus_formacion: Boolean(datosTrabajador.aplica_plus_formacion),
      aplica_plus_transporte: Boolean(datosTrabajador.aplica_plus_transporte),
      aplica_manutencion: Boolean(datosTrabajador.aplica_manutencion),
      aplica_plus_nocturnidad: Boolean(datosTrabajador.aplica_plus_nocturnidad),
      aplica_plus_penosidad: Boolean(datosTrabajador.aplica_plus_penosidad),
      zona_metropolitana: Boolean(datosTrabajador.zona_metropolitana),
      elementos_uniforme: this.sanitizeInput(datosTrabajador.elementos_uniforme, 'array', 'elementos_uniforme')
    };
  }

  /**
   * Valida y sanitiza datos familiares
   * @param {Object} datosFamiliares - Datos familiares sin sanitizar
   * @returns {Object} Datos sanitizados
   */
  static sanitizeFamilyData(datosFamiliares) {
    return {
      num_hijos: this.sanitizeInput(datosFamiliares.num_hijos, 'number', 'num_hijos')
    };
  }
}