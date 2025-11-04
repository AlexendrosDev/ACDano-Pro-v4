// irpfValencia.test.js - Tests de estructura IRPF Valencia
import { describe, it, expect } from '@jest/globals';
import IRPFValencia2025 from '../../src/regions/valencia/IRPFValencia2025.js';

describe('IRPFValencia2025', () => {
  it('define tramos estatales en orden creciente', () => {
    const t = IRPFValencia2025.TRAMOS_ESTATALES;
    expect(Array.isArray(t)).toBe(true);
    expect(t[0].hasta).toBeLessThan(t[1].hasta);
    expect(t.at(-1).infinito).toBe(true);
  });

  it('define tramos autonómicos valencianos', () => {
    const t = IRPFValencia2025.TRAMOS_AUTONOMICOS;
    expect(Array.isArray(t)).toBe(true);
    expect(t[0].hasta).toBeLessThan(t[1].hasta);
    expect(t.at(-1).infinito).toBe(true);
  });

  it('calcula mínimo familiar por hijos', () => {
    expect(IRPFValencia2025.calcularMinimoFamiliar(0)).toBe(0);
    expect(IRPFValencia2025.calcularMinimoFamiliar(1)).toBeGreaterThan(0);
    expect(IRPFValencia2025.calcularMinimoFamiliar(2)).toBeGreaterThan(IRPFValencia2025.calcularMinimoFamiliar(1));
  });
});