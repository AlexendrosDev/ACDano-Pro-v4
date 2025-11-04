// irpfMadrid.test.js - Verifica estructura de tramos autonómicos de Madrid
import { describe, it, expect } from '@jest/globals';
import IRPFMadrid2025 from '../../src/regions/madrid/IRPFMadrid2025.js';

describe('IRPFMadrid2025', () => {
  it('define tramos en orden creciente', () => {
    const t = IRPFMadrid2025.TRAMOS_AUTONOMICOS;
    expect(Array.isArray(t)).toBe(true);
    expect(t[0].hasta).toBeLessThan(t[1].hasta);
    expect(t[1].hasta).toBeLessThan(t[2].hasta);
  });

  it('incluye tramo infinito final', () => {
    const last = IRPFMadrid2025.TRAMOS_AUTONOMICOS[IRPFMadrid2025.TRAMOS_AUTONOMICOS.length - 1];
    expect(last.infinito).toBe(true);
    expect(typeof last.tipo).toBe('number');
  });
});