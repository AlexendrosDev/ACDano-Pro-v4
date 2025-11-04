// regionCoherence.test.js - Tests del validador de coherencia regional
import { describe, it, expect } from '@jest/globals';
import RegionCoherenceValidator from '../../src/backend/validators/RegionCoherenceValidator.js';

const OK_TRAMOS = [
  { hasta: 10000, tipo: 9.5 },
  { hasta: 20000, tipo: 12 },
  { infinito: true, tipo: 22.5 }
];

const BAD_TRAMOS_ORDER = [
  { hasta: 20000, tipo: 12 },
  { hasta: 10000, tipo: 9.5 },
  { infinito: true, tipo: 22.5 }
];

const BAD_TRAMOS_NO_INFINITE = [
  { hasta: 10000, tipo: 9.5 },
  { hasta: 20000, tipo: 12 },
  { hasta: 30000, tipo: 15 }
];

describe('RegionCoherenceValidator', () => {
  it('valida tramos correctos', () => {
    const res = RegionCoherenceValidator.validarTramos(OK_TRAMOS);
    expect(res.ok).toBe(true);
    expect(res.errores.length).toBe(0);
  });

  it('detecta desorden de límites', () => {
    const res = RegionCoherenceValidator.validarTramos(BAD_TRAMOS_ORDER);
    expect(res.ok).toBe(false);
    expect(res.errores.some(e => e.startsWith('E_DESORDEN_LIMITE'))).toBe(true);
  });

  it('detecta ausencia de tramo infinito', () => {
    const res = RegionCoherenceValidator.validarTramos(BAD_TRAMOS_NO_INFINITE);
    expect(res.ok).toBe(false);
    expect(res.errores.some(e => e.startsWith('E_SIN_INFINITO'))).toBe(true);
  });
});
