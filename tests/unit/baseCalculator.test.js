import { describe, expect, test } from '@jest/globals';
import BaseCalculator from '../../src/backend/calculators/BaseCalculator.js';

describe('BaseCalculator', () => {
  test('calcula salario bruto total coherente', () => {
    const bc = new BaseCalculator();
    const salariales = { salario_base: 1200, prorrata_pagas: 300, plus_formacion: 20, manutencion: 40, total: 1560 };
    const noSalariales = { plus_transporte: 46.8, vestuario: 0, otros: 0, total: 46.8 };
    const bruto = bc.calcularSalarioBrutoTotal(salariales, noSalariales);
    expect(Math.round(bruto * 100) / 100).toBe(1606.8);
  });
});
