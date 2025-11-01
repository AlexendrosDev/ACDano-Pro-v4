/**
 * Validaciones sectoriales adicionales (horas extra, nocturnidad, festivos) y avisos de tramos topados
 */
export class SectorValidator {
  /**
   * @param {Object} resultados - Objeto de resultados del cálculo
   * @param {Object} opciones - { horasExtra, horasNocturnas, festivosTrabajados }
   */
  static validar(resultados, opciones = {}) {
    const warnings = [];

    // Aviso de topes aplicados
    if (Math.abs(resultados.base_cotizacion - resultados.conceptos_salariales.total) > 0.01) {
      warnings.push({
        tipo: 'INFO',
        codigo: 'TOPE_APLICADO',
        mensaje: 'Se han aplicado topes mínimos/máximos a la base de cotización',
      });
    }

    // Horas extra (si se proporcionan)
    if (opciones.horasExtra && opciones.horasExtra > 0) {
      if (opciones.horasExtra > 80) {
        warnings.push({
          tipo: 'WARNING',
          codigo: 'HORAS_EXTRA_ALTAS',
          mensaje: `Horas extra muy elevadas (${opciones.horasExtra}) - revisar cumplimiento y coste`,
        });
      }
    }

    // Nocturnidad
    if (opciones.horasNocturnas && opciones.horasNocturnas > 0) {
      if (opciones.horasNocturnas > 60) {
        warnings.push({
          tipo: 'WARNING',
          codigo: 'NOCTURNIDAD_ALTA',
          mensaje: `Horas nocturnas elevadas (${opciones.horasNocturnas}) - verificar plus nocturnidad`,
        });
      }
    }

    // Festivos trabajados
    if (opciones.festivosTrabajados && opciones.festivosTrabajados > 0) {
      if (opciones.festivosTrabajados > 6) {
        warnings.push({
          tipo: 'WARNING',
          codigo: 'FESTIVOS_ELEVADOS',
          mensaje: `Número de festivos trabajados alto (${opciones.festivosTrabajados}) - confirmar compensación`,
        });
      }
    }

    return { warnings };
  }
}

export default SectorValidator;
