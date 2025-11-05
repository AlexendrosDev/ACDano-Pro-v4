/**
 * PreferenceManager - Sistema de persistencia de preferencias de usuario
 * Guarda y restaura configuraciones como región y sector seleccionados
 * Compatible con migración desde ACDaño PRO legacy
 */

const STORAGE_KEY = 'laborcompli-preferences';
const LEGACY_KEY = 'acdano-preferences';

export const PreferenceManager = {
  /**
   * Guarda las preferencias del usuario en localStorage
   * @param {Object} preferences - Objeto con las preferencias
   * @param {string} preferences.region - ID de la región seleccionada
   * @param {string} preferences.sector - ID del sector seleccionado
   */
  save({ region, sector }) {
    const data = {
      region,
      sector,
      timestamp: Date.now(),
      version: '4.0.0'
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      
      // Emitir evento para sincronización UI
      window.dispatchEvent(new CustomEvent('preferencesSaved', {
        detail: { region, sector, timestamp: data.timestamp }
      }));
      
      console.log('✅ Preferencias guardadas:', { region, sector });
    } catch (error) {
      console.warn('⚠️ Error guardando preferencias:', error.message);
      // Modo degradado: continúa sin persistencia
    }
  },

  /**
   * Carga las preferencias del usuario desde localStorage
   * Incluye migración automática desde versiones legacy
   * @returns {Object} Objeto con region y sector (null si no existen)
   */
  load() {
    try {
      let rawData = window.localStorage.getItem(STORAGE_KEY);
      
      // Migración automática desde ACDaño PRO legacy
      if (!rawData) {
        const legacyData = window.localStorage.getItem(LEGACY_KEY);
        if (legacyData) {
          console.log('🔄 Migrando preferencias desde ACDaño PRO legacy');
          window.localStorage.setItem(STORAGE_KEY, legacyData);
          rawData = legacyData;
        }
      }
      
      if (rawData) {
        const parsed = JSON.parse(rawData);
        const preferences = {
          region: parsed.region || null,
          sector: parsed.sector || null,
          timestamp: parsed.timestamp || null,
          version: parsed.version || 'legacy'
        };
        
        console.log('📂 Preferencias cargadas:', { 
          region: preferences.region, 
          sector: preferences.sector,
          version: preferences.version
        });
        
        return preferences;
      }
    } catch (error) {
      console.warn('⚠️ Error cargando preferencias:', error.message);
    }
    
    // Valores por defecto
    return {
      region: null,
      sector: null,
      timestamp: null,
      version: null
    };
  },

  /**
   * Limpia todas las preferencias guardadas
   */
  clear() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_KEY); // Limpia también legacy
      
      // Emitir evento para sincronización UI
      window.dispatchEvent(new CustomEvent('preferencesCleared'));
      
      console.log('🗑️ Preferencias eliminadas');
    } catch (error) {
      console.warn('⚠️ Error eliminando preferencias:', error.message);
    }
  },

  /**
   * Verifica si las preferencias están disponibles (localStorage funcional)
   * @returns {boolean} true si localStorage está disponible
   */
  isAvailable() {
    try {
      const testKey = '__laborcompli_test__';
      window.localStorage.setItem(testKey, 'test');
      window.localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Exporta las preferencias actuales para debugging
   * @returns {string} JSON string con las preferencias
   */
  export() {
    try {
      const data = window.localStorage.getItem(STORAGE_KEY);
      return data || '{}';
    } catch (error) {
      return '{}';
    }
  }
};

export default PreferenceManager;