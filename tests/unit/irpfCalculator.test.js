import { describe, expect, test } from '@jest/globals';
import IRPFCalculator from '../../src/backend/calculators/IRPFCalculator.js';

describe('IRPFCalculator', () => {
  test('retorna 0 cuando base liquidable ≤ 0', () => {
    const ir = new IRPFCalculator();
    const res = ir.calcularIRPFSimplificado(1000, 5); // mínimos superan base
    expect(res.cuota_anual).toBe(0);
    expect(res.retencion_mensual).toBe(0);
    expect(res.tipo_medio).toBe(0);
  });
});
