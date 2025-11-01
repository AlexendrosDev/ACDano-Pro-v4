import { describe, expect, test } from '@jest/globals';
import CalculationAuditor from '../../src/backend/validators/CalculationAuditor.js';

describe('CalculationAuditor', () => {
  test('no emite warnings con datos coherentes', () => {
    const resultados = {
      salario_bruto_total: 1600,
      cotizaciones_empresa: { total: 500 },
      cotizaciones_trabajador: { total: 100 },
      coste_total_empresa: 2100,
      expolio_total: 600,
      porcentaje_expolio: (600/2100)*100,
    };
    const a = CalculationAuditor.audit(resultados);
    expect(a.warnings.length).toBe(0);
  });

  test('emite warnings con divergencias', () => {
    const resultados = {
      salario_bruto_total: 1600,
      cotizaciones_empresa: { total: 500 },
      cotizaciones_trabajador: { total: 100 },
      coste_total_empresa: 2099, // 1€ menos
      expolio_total: 598,        // 2€ menos
      porcentaje_expolio: 28.0,  // valor forzado
    };
    const a = CalculationAuditor.audit(resultados);
    expect(a.warnings.length).toBeGreaterThan(0);
  });
});
