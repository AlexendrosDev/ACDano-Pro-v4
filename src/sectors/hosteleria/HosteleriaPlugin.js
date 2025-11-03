// HosteleriaPlugin.js - Registro del sector Hostelería (Valencia)
import SectorManager from '../../core/SectorManager.js';
import ConvenioValencia from '../../backend/models/ConvenioValencia.js';
import NominaCalculator from '../../backend/NominaCalculator.js';
import SectorValidator from '../../backend/validators/SectorValidator.js';

export function registerHosteleria() {
  SectorManager.registerSector('hosteleria_valencia', {
    name: 'Hostelería Valencia',
    convenio: ConvenioValencia,
    calculator: NominaCalculator,
    validator: SectorValidator,
    categories: [
      'jefe_cocina_I','maitre_I','jefe_recepcion_I',
      'segundo_cocina_II','jefe_comedor_II','recepcionista_II',
      'cocinero_III','camarero_III','barman_III',
      'ayudante_cocina_IV','ayudante_camarero_IV','lavavajillas_IV',
      'pinche_cocina_V','limpieza_V','auxiliar_V'
    ]
  });
}

export default registerHosteleria;