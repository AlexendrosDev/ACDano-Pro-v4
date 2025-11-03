// sectorManager.test.js - Tests del registro de sectores
import { describe, it, expect, beforeEach } from '@jest/globals';
import SectorManager from '../../src/core/SectorManager.js';

describe('SectorManager', () => {
  beforeEach(() => {
    // Reset estático (hack de prueba):
    SectorManager._sectors = new Map();
  });

  it('registra y recupera un sector', () => {
    SectorManager.registerSector('demo', {
      name: 'Demo', convenio: {}, calculator: {}, validator: {}, categories: []
    });
    const s = SectorManager.getSector('demo');
    expect(s).not.toBeNull();
    expect(s.name).toBe('Demo');
  });

  it('lista sectores', () => {
    SectorManager.registerSector('a', { name: 'A', convenio: {}, calculator: {}, validator: {}, categories: [] });
    SectorManager.registerSector('b', { name: 'B', convenio: {}, calculator: {}, validator: {}, categories: [] });
    const list = SectorManager.listSectors();
    expect(list.length).toBe(2);
  });

  it('valida config requerida', () => {
    expect(() => SectorManager.registerSector('x', { name: 'X' })).toThrow();
  });
});