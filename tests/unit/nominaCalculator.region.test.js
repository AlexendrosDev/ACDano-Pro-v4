// nominaCalculator.region.test.js - Tests de cálculo con diferentes regiones
import { describe, it, expect, beforeEach } from '@jest/globals';
import NominaCalculator from '../../src/backend/NominaCalculator.js';
import RegionManager from '../../src/core/RegionManager.js';
import IRPFMadrid2025 from '../../src/regions/madrid/IRPFMadrid2025.js';
import IRPFCataluna2025 from '../../src/regions/cataluna/IRPFCataluna2025.js';

describe('NominaCalculator Regional', () => {
  beforeEach(() => {
    RegionManager._regions = new Map();
    RegionManager.registerRegion('madrid', { name: 'Madrid', irpf: IRPFMadrid2025 });
    RegionManager.registerRegion('cataluna', { name: 'Cataluña', irpf: IRPFCataluna2025 });
  });

  it('calcula diferente retención según región', async () => {
    const datosTrabajador = {
      categoria: 'cocinero_III',
      tabla: 'TABLA_I',
      nivel: 'NIVEL_III',
      tipo_jornada: 'continuada'
    };
    const datosFamiliares = { num_hijos: 0 };
    
    const calc = new NominaCalculator();
    
    // Madrid (fiscal competitiva)
    const resMadrid = await calc.calcularNominaCompleta(datosTrabajador, datosFamiliares, {}, 'madrid');
    
    // Cataluña (fiscal progresiva)
    const resCataluna = await calc.calcularNominaCompleta(datosTrabajador, datosFamiliares, {}, 'cataluna');
    
    // Madrid debe tener menor retención que Cataluña
    expect(resMadrid.resultados.deducciones.irpf.retencion_mensual)
      .toBeLessThan(resCataluna.resultados.deducciones.irpf.retencion_mensual);
  });
});