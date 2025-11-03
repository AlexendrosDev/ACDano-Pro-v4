// LimpiezaValidator.js - Validaciones específicas del sector Limpieza
export class LimpiezaValidator {
  static validar(resultados, opciones = {}) {
    const warnings = [];
    
    // Validación de jornadas nocturnas excesivas
    if (opciones.horasNocturnas > 120) {
      warnings.push({
        codigo: 'LIMPIEZA_HORAS_NOCTURNAS_ALTAS',
        mensaje: 'Horas nocturnas excepcionales (>120/mes)'
      });
    }

    // Validación de EPI obligatorio para ciertos trabajos
    if (resultados.datos_trabajador?.categoria?.includes('quimico') && !resultados.conceptos_no_salariales?.epi) {
      warnings.push({
        codigo: 'LIMPIEZA_EPI_REQUERIDO',
        mensaje: 'EPI obligatorio para trabajos con productos químicos'
      });
    }

    // Plus penosidad coherente con tipo de trabajo
    if (resultados.conceptos_salariales?.plus_penosidad > 0 && !resultados.datos_trabajador?.aplica_plus_penosidad) {
      warnings.push({
        codigo: 'LIMPIEZA_PENOSIDAD_INCOHERENTE',
        mensaje: 'Plus penosidad aplicado sin marcador de trabajo penoso'
      });
    }

    return { warnings };
  }
}

export default LimpiezaValidator;