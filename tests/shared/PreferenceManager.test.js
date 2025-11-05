/**
 * Tests unitarios para PreferenceManager
 * Validación de persistencia región/sector en localStorage
 */

import { PreferenceManager } from '../../src/shared/PreferenceManager.js';

// Mock localStorage para entorno de pruebas
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => store[key] = value,
    removeItem: (key) => delete store[key],
    clear: () => store = {},
    get length() { return Object.keys(store).length; }
  };
})();

// Mock window y eventos
const windowMock = {
  localStorage: localStorageMock,
  dispatchEvent: jest.fn(),
  CustomEvent: class {
    constructor(type, options) {
      this.type = type;
      this.detail = options?.detail;
    }
  }
};

describe('PreferenceManager', () => {
  beforeEach(() => {
    // Reset localStorage mock
    localStorageMock.clear();
    windowMock.dispatchEvent.mockClear();
    
    // Mock global window
    global.window = windowMock;
    global.console = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
  });

  describe('save()', () => {
    test('debe guardar preferencias correctamente', () => {
      const preferences = {
        region: 'madrid',
        sector: 'hosteleria_valencia'
      };

      PreferenceManager.save(preferences);

      const stored = JSON.parse(localStorageMock.getItem('laborcompli-preferences'));
      expect(stored.region).toBe('madrid');
      expect(stored.sector).toBe('hosteleria_valencia');
      expect(stored.version).toBe('4.0.0');
      expect(stored.timestamp).toBeGreaterThan(0);
    });

    test('debe emitir evento preferencesSaved', () => {
      const preferences = { region: 'cataluna', sector: 'limpieza_nacional' };
      
      PreferenceManager.save(preferences);
      
      expect(windowMock.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'preferencesSaved',
          detail: expect.objectContaining({
            region: 'cataluna',
            sector: 'limpieza_nacional',
            timestamp: expect.any(Number)
          })
        })
      );
    });

    test('debe manejar errores de localStorage graciosamente', () => {
      // Simular error en localStorage
      localStorageMock.setItem = jest.fn(() => {
        throw new Error('QuotaExceededError');
      });
      
      const preferences = { region: 'valencia', sector: 'comercio' };
      
      // No debe lanzar excepción
      expect(() => PreferenceManager.save(preferences)).not.toThrow();
      expect(console.warn).toHaveBeenCalledWith(
        '⚠️ Error guardando preferencias:',
        'QuotaExceededError'
      );
    });
  });

  describe('load()', () => {
    test('debe cargar preferencias existentes', () => {
      const testData = {
        region: 'andalucia',
        sector: 'hosteleria_valencia',
        timestamp: Date.now(),
        version: '4.0.0'
      };
      
      localStorageMock.setItem('laborcompli-preferences', JSON.stringify(testData));
      
      const loaded = PreferenceManager.load();
      
      expect(loaded.region).toBe('andalucia');
      expect(loaded.sector).toBe('hosteleria_valencia');
      expect(loaded.version).toBe('4.0.0');
    });

    test('debe retornar valores por defecto si no existen preferencias', () => {
      const loaded = PreferenceManager.load();
      
      expect(loaded).toEqual({
        region: null,
        sector: null,
        timestamp: null,
        version: null
      });
    });

    test('debe migrar desde clave legacy ACDaño PRO', () => {
      const legacyData = {
        region: 'galicia',
        sector: 'limpieza_nacional',
        timestamp: Date.now(),
        version: 'legacy'
      };
      
      // Solo existe clave legacy
      localStorageMock.setItem('acdano-preferences', JSON.stringify(legacyData));
      
      const loaded = PreferenceManager.load();
      
      expect(loaded.region).toBe('galicia');
      expect(loaded.sector).toBe('limpieza_nacional');
      expect(console.log).toHaveBeenCalledWith('🔄 Migrando preferencias desde ACDaño PRO legacy');
      
      // Debe haber copiado a nueva clave
      const newKey = localStorageMock.getItem('laborcompli-preferences');
      expect(newKey).toBe(JSON.stringify(legacyData));
    });

    test('debe manejar datos corruptos graciosamente', () => {
      localStorageMock.setItem('laborcompli-preferences', 'invalid-json{');
      
      const loaded = PreferenceManager.load();
      
      expect(loaded).toEqual({
        region: null,
        sector: null,
        timestamp: null,
        version: null
      });
      expect(console.warn).toHaveBeenCalledWith(
        '⚠️ Error cargando preferencias:',
        expect.any(String)
      );
    });

    test('debe manejar preferencias legacy parciales', () => {
      const partialLegacy = {
        region: 'murcia'
        // sector faltante
      };
      
      localStorageMock.setItem('laborcompli-preferences', JSON.stringify(partialLegacy));
      
      const loaded = PreferenceManager.load();
      
      expect(loaded.region).toBe('murcia');
      expect(loaded.sector).toBeNull();
      expect(loaded.version).toBeNull();
    });
  });

  describe('clear()', () => {
    test('debe eliminar preferencias y legacy', () => {
      localStorageMock.setItem('laborcompli-preferences', JSON.stringify({ region: 'test' }));
      localStorageMock.setItem('acdano-preferences', JSON.stringify({ region: 'legacy' }));
      
      PreferenceManager.clear();
      
      expect(localStorageMock.getItem('laborcompli-preferences')).toBeNull();
      expect(localStorageMock.getItem('acdano-preferences')).toBeNull();
    });

    test('debe emitir evento preferencesCleared', () => {
      PreferenceManager.clear();
      
      expect(windowMock.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'preferencesCleared'
        })
      );
    });

    test('debe manejar errores al limpiar', () => {
      localStorageMock.removeItem = jest.fn(() => {
        throw new Error('Storage access denied');
      });
      
      expect(() => PreferenceManager.clear()).not.toThrow();
      expect(console.warn).toHaveBeenCalledWith(
        '⚠️ Error eliminando preferencias:',
        'Storage access denied'
      );
    });
  });

  describe('isAvailable()', () => {
    test('debe retornar true cuando localStorage funciona', () => {
      expect(PreferenceManager.isAvailable()).toBe(true);
    });

    test('debe retornar false cuando localStorage falla', () => {
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = jest.fn(() => {
        throw new Error('SecurityError');
      });
      
      expect(PreferenceManager.isAvailable()).toBe(false);
      
      // Restore
      localStorageMock.setItem = originalSetItem;
    });
  });

  describe('export()', () => {
    test('debe exportar preferencias como JSON string', () => {
      const testData = { region: 'canarias', sector: 'comercio' };
      localStorageMock.setItem('laborcompli-preferences', JSON.stringify(testData));
      
      const exported = PreferenceManager.export();
      
      expect(exported).toBe(JSON.stringify(testData));
    });

    test('debe retornar objeto vacío si no hay preferencias', () => {
      const exported = PreferenceManager.export();
      expect(exported).toBe('{}');
    });
  });

  describe('Casos integrados', () => {
    test('flujo completo: save -> load -> clear -> load', () => {
      const originalPrefs = { region: 'extremadura', sector: 'construccion' };
      
      // 1. Guardar
      PreferenceManager.save(originalPrefs);
      
      // 2. Cargar
      let loaded = PreferenceManager.load();
      expect(loaded.region).toBe('extremadura');
      expect(loaded.sector).toBe('construccion');
      
      // 3. Limpiar
      PreferenceManager.clear();
      
      // 4. Cargar nuevamente (debería estar vacío)
      loaded = PreferenceManager.load();
      expect(loaded.region).toBeNull();
      expect(loaded.sector).toBeNull();
    });

    test('debe priorizar nueva clave sobre legacy', () => {
      const newData = { region: 'la_rioja', sector: 'hosteleria_valencia' };
      const legacyData = { region: 'old_region', sector: 'old_sector' };
      
      localStorageMock.setItem('laborcompli-preferences', JSON.stringify(newData));
      localStorageMock.setItem('acdano-preferences', JSON.stringify(legacyData));
      
      const loaded = PreferenceManager.load();
      
      // Debe usar nueva clave, no legacy
      expect(loaded.region).toBe('la_rioja');
      expect(loaded.sector).toBe('hosteleria_valencia');
    });
  });
});

// Tests de integración básica (opcional)
describe('PreferenceManager Integration', () => {
  test('debe funcionar con datos reales de ejemplo', () => {
    const realRegions = ['madrid', 'cataluna', 'valencia', 'andalucia'];
    const realSectors = ['hosteleria_valencia', 'limpieza_nacional'];
    
    realRegions.forEach(region => {
      realSectors.forEach(sector => {
        PreferenceManager.clear();
        PreferenceManager.save({ region, sector });
        
        const loaded = PreferenceManager.load();
        expect(loaded.region).toBe(region);
        expect(loaded.sector).toBe(sector);
      });
    });
  });

  test('debe mantener estructura de datos consistente', () => {
    const testCases = [
      { region: null, sector: 'hosteleria_valencia' },
      { region: 'madrid', sector: null },
      { region: '', sector: 'limpieza_nacional' },
      { region: 'valencia', sector: '' }
    ];
    
    testCases.forEach((testCase, index) => {
      PreferenceManager.save(testCase);
      const loaded = PreferenceManager.load();
      
      expect(loaded).toHaveProperty('region');
      expect(loaded).toHaveProperty('sector');
      expect(loaded).toHaveProperty('timestamp');
      expect(loaded).toHaveProperty('version');
      
      expect(loaded.region).toBe(testCase.region);
      expect(loaded.sector).toBe(testCase.sector);
    });
  });
});