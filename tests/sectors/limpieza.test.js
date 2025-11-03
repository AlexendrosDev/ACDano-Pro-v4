// limpieza.test.js - Tests del sector Limpieza
import { describe, it, expect, beforeEach } from '@jest/globals';
import SectorManager from '../../src/core/SectorManager.js';
import registerLimpieza from '../../src/sectors/limpieza/LimpiezaPlugin.js';
import ConvenioLimpieza from '../../src/sectors/limpieza/ConvenioLimpieza.js';
import LimpiezaCalculator from '../../src/sectors/limpieza/LimpiezaCalculator.js';
import LimpiezaValidator from '../../src/sectors/limpieza/LimpiezaValidator.js';

describe('Sector Limpieza', () => {
  beforeEach(() => {
    SectorManager._sectors = new Map();
  });

  describe('ConvenioLimpieza', () => {
    it('tiene salarios por nivel', () => {
      expect(ConvenioLimpieza.obtenerSalarioBase('TABLA_I', 'NIVEL_I')).toBe(1450.80);
      expect(ConvenioLimpieza.obtenerSalarioBase('TABLA_I', 'NIVEL_V')).toBe(1084.50);
    });

    it('tiene complementos definidos', () => {
      expect(ConvenioLimpieza.COMPLEMENTOS.PLUS_NOCTURNIDAD).toBe(95.50);
      expect(ConvenioLimpieza.COMPLEMENTOS.EPI.ELEMENTOS.guantes_latex.precio).toBe(3.45);
    });
  });

  describe('LimpiezaCalculator', () => {
    it('calcula conceptos salariales', () => {
      const datos = {
        tabla: 'TABLA_I',
        nivel: 'NIVEL_III',
        aplica_plus_formacion: true,
        aplica_plus_nocturnidad: false,
        aplica_plus_penosidad: true
      };
      const calc = new LimpiezaCalculator();
      const result = calc.calcularConceptosSalariales(datos);
      expect(result.salario_base).toBe(1215.50);
      expect(result.plus_formacion).toBe(25.00);
      expect(result.plus_penosidad).toBe(87.30);
    });

    it('calcula EPI por elementos', () => {
      const datos = {
        elementos_epi: ['guantes_latex', 'mascarilla_ffp2']
      };
      const calc = new LimpiezaCalculator();
      const result = calc.calcularConceptosNoSalariales(datos);
      expect(result.epi).toBe(6.25); // 3.45 + 2.80
    });
  });

  describe('LimpiezaValidator', () => {
    it('detecta horas nocturnas excesivas', () => {
      const result = LimpiezaValidator.validar({}, { horasNocturnas: 150 });
      expect(result.warnings.some(w => w.codigo === 'LIMPIEZA_HORAS_NOCTURNAS_ALTAS')).toBe(true);
    });
  });

  describe('LimpiezaPlugin', () => {
    it('registra sector correctamente', () => {
      registerLimpieza();
      const s = SectorManager.getSector('limpieza_nacional');
      expect(s).not.toBeNull();
      expect(s.name).toBe('Limpieza de Edificios');
      expect(s.categories.length).toBe(5);
    });
  });
});