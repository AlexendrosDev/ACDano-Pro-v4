// SectorCoherenceValidator.js - Validaciones avanzadas por categoría/nivel
export class SectorCoherenceValidator {
  static RATIOS_ESPERADOS = {
    // Valores orientativos; ajustar con datos sectoriales reales
    'cocinero_NIVEL_III': {
      salario_liquido_min: 900,
      salario_liquido_max: 1300,
      porcentaje_expolio_min: 25,
      porcentaje_expolio_max: 40,
    },
    'camarero_NIVEL_II': {
      salario_liquido_min: 850,
      salario_liquido_max: 1250,
      porcentaje_expolio_min: 24,
      porcentaje_expolio_max: 39,
    }
  };

  static validar(resultados) {
    const warnings = [];
    const categoria = resultados?.datos_trabajador?.categoria;
    const nivel = resultados?.datos_trabajador?.nivel;
    if (!categoria || !nivel) return { warnings };

    const key = `${categoria}_${nivel}`;
    const r = this.RATIOS_ESPERADOS[key];
    if (!r) return { warnings };

    if (resultados.salario_liquido < r.salario_liquido_min) {
      warnings.push({ codigo: 'SECTOR_LIQUIDO_BAJO', mensaje: `Salario líquido inusualmente bajo para ${key}` });
    }
    if (resultados.salario_liquido > r.salario_liquido_max) {
      warnings.push({ codigo: 'SECTOR_LIQUIDO_ALTO', mensaje: `Salario líquido inusualmente alto para ${key}` });
    }
    if (resultados.porcentaje_expolio < r.porcentaje_expolio_min || resultados.porcentaje_expolio > r.porcentaje_expolio_max) {
      warnings.push({ codigo: 'SECTOR_EXPOLIO_FUERA_RANGO', mensaje: `Porcentaje de expolio fuera de rango esperado para ${key}` });
    }

    return { warnings };
  }
}

export default SectorCoherenceValidator;
