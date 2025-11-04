// regionManager.test.js - Tests básicos de RegionManager
import { describe, it, expect, beforeEach } from '@jest/globals';
import RegionManager from '../../src/core/RegionManager.js';

describe('RegionManager', () => {
  beforeEach(() => {
    RegionManager._regions = new Map();
  });

  it('registra y obtiene una región', () => {
    RegionManager.registerRegion('madrid', { name: 'Comunidad de Madrid', irpf: {} });
    const r = RegionManager.getRegion('madrid');
    expect(r).not.toBeNull();
    expect(r.name).toBe('Comunidad de Madrid');
  });

  it('lista regiones', () => {
    RegionManager.registerRegion('madrid', { name: 'Comunidad de Madrid', irpf: {} });
    RegionManager.registerRegion('cataluna', { name: 'Cataluña', irpf: {} });
    expect(RegionManager.listRegions().length).toBe(2);
  });
});