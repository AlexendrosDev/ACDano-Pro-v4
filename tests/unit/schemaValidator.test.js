// schemaValidator.test.js - Tests de esquemas estrictos
import { describe, it, expect } from '@jest/globals';
import SchemaValidator from '../../src/backend/validators/SchemaValidator.js';

describe('SchemaValidator', () => {
  describe('datosTrabajador', () => {
    it('valida datos correctos', () => {
      const datos = {
        categoria: 'cocinero_III',
        tabla: 'TABLA_I',
        nivel: 'NIVEL_III',
        tipo_jornada: 'continuada',
        es_hotel: false,
        aplica_plus_formacion: true,
        elementos_uniforme: ['chaquetilla_cocina', 'gorro_cocina']
      };
      
      const result = SchemaValidator.validate('datosTrabajador', datos);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('detecta categoría inválida', () => {
      const datos = {
        categoria: 'hacker_injection',
        tabla: 'TABLA_I',
        nivel: 'NIVEL_III',
        tipo_jornada: 'continuada'
      };
      
      const result = SchemaValidator.validate('datosTrabajador', datos);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('categoria'))).toBe(true);
    });

    it('valida patrón de nivel', () => {
      const datos = {
        categoria: 'cocinero_III',
        tabla: 'TABLA_I',
        nivel: 'NIVEL_INVALID',
        tipo_jornada: 'continuada'
      };
      
      const result = SchemaValidator.validate('datosTrabajador', datos);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('nivel'))).toBe(true);
    });

    it('valida elementos_uniforme como array', () => {
      const datos = {
        categoria: 'cocinero_III',
        tabla: 'TABLA_I',
        nivel: 'NIVEL_III',
        tipo_jornada: 'continuada',
        elementos_uniforme: 'not_an_array'
      };
      
      const result = SchemaValidator.validate('datosTrabajador', datos);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('elementos_uniforme'))).toBe(true);
    });
  });

  describe('datosFamiliares', () => {
    it('valida num_hijos en rango válido', () => {
      const datos = { num_hijos: 2 };
      const result = SchemaValidator.validate('datosFamiliares', datos);
      expect(result.valid).toBe(true);
    });

    it('detecta num_hijos fuera de rango', () => {
      let result = SchemaValidator.validate('datosFamiliares', { num_hijos: -1 });
      expect(result.valid).toBe(false);
      
      result = SchemaValidator.validate('datosFamiliares', { num_hijos: 15 });
      expect(result.valid).toBe(false);
    });

    it('requiere num_hijos', () => {
      const result = SchemaValidator.validate('datosFamiliares', {});
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('num_hijos'))).toBe(true);
    });
  });
});