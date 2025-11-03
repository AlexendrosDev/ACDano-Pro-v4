// LimpiezaPlugin.js - Plugin completo del sector Limpieza
import SectorManager from '../../core/SectorManager.js';
import ConvenioLimpieza from './ConvenioLimpieza.js';
import LimpiezaCalculator from './LimpiezaCalculator.js';
import LimpiezaValidator from './LimpiezaValidator.js';

export function registerLimpieza() {
  SectorManager.registerSector('limpieza_nacional', {
    name: 'Limpieza de Edificios',
    convenio: ConvenioLimpieza,
    calculator: LimpiezaCalculator,
    validator: LimpiezaValidator,
    categories: [
      'encargado_I',
      'especialista_II',
      'limpiador_experiencia_III',
      'limpiador_IV',
      'peon_V'
    ]
  });
}

export default registerLimpieza;