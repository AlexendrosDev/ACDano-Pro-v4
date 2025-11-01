import { describe, expect, test } from '@jest/globals';
import DataIntegrityValidator from '../../src/backend/validators/DataIntegrityValidator.js';
import convenio from '../../src/data/convenio_valencia_2025.json' assert { type: 'json' };

describe('DataIntegrityValidator', () => {
  test('valida hash correcto (OK)', async () => {
    await expect(DataIntegrityValidator.validateJsonIntegrity('convenio_valencia_2025.json', convenio)).resolves.toBe(true);
  });

  test('detecta hash incorrecto (KO)', async () => {
    const copia = JSON.parse(JSON.stringify(convenio));
    copia.version = 'MUTADO';
    await expect(DataIntegrityValidator.validateJsonIntegrity('convenio_valencia_2025.json', copia)).rejects.toThrow('INTEGRIDAD COMPROMETIDA');
  });
});
