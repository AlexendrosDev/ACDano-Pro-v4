// hosteleriaPlugin.test.js - Verifica registro del plugin de hostelería
import { describe, it, expect, beforeEach } from '@jest/globals';
import SectorManager from '../../src/core/SectorManager.js';
import registerHosteleria from '../../src/sectors/hosteleria/HosteleriaPlugin.js';

describe('HosteleriaPlugin', () => {
  beforeEach(() => {
    SectorManager._sectors = new Map();
  });

  it('registra hostelería con los componentes necesarios', () => {
    registerHosteleria();
    const s = SectorManager.getSector('hosteleria_valencia');
    expect(s).not.toBeNull();
    expect(s.name).toBe('Hostelería Valencia');
    expect(s.convenio).toBeTruthy();
    expect(s.calculator).toBeTruthy();
    expect(s.validator).toBeTruthy();
    expect(Array.isArray(s.categories)).toBe(true);
    expect(s.categories.length).toBeGreaterThan(0);
  });
});