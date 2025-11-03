// LimpiezaCalculator.js - Lógica específica del sector Limpieza
import BaseCalculator from '../../backend/calculators/BaseCalculator.js';
import ConvenioLimpieza from './ConvenioLimpieza.js';
import { round2 } from '../../shared/utils.js';

export class LimpiezaCalculator extends BaseCalculator {
  calcularConceptosSalariales(datosTrabajador) {
    const salarioBase = ConvenioLimpieza.obtenerSalarioBase(datosTrabajador.tabla, datosTrabajador.nivel);
    const prorrata = round2((salarioBase * ConvenioLimpieza.NUM_PAGAS_EXTRAORDINARIAS) / 12);

    let plusFormacion = 0, plusNocturnidad = 0, plusPenosidad = 0;
    if (datosTrabajador.aplica_plus_formacion) plusFormacion = ConvenioLimpieza.COMPLEMENTOS.PLUS_FORMACION;
    if (datosTrabajador.aplica_plus_nocturnidad) plusNocturnidad = ConvenioLimpieza.COMPLEMENTOS.PLUS_NOCTURNIDAD;
    if (datosTrabajador.aplica_plus_penosidad) plusPenosidad = ConvenioLimpieza.COMPLEMENTOS.PLUS_PENOSIDAD;

    return {
      salario_base: round2(salarioBase),
      prorrata_pagas: prorrata,
      plus_formacion: round2(plusFormacion),
      plus_nocturnidad: round2(plusNocturnidad),
      plus_penosidad: round2(plusPenosidad),
      manutencion: round2(datosTrabajador.aplica_manutencion ? ConvenioLimpieza.COMPLEMENTOS.MANUTENCION : 0)
    };
  }

  calcularConceptosNoSalariales(datosTrabajador) {
    let plusTransporte = 0;
    if (datosTrabajador.aplica_plus_transporte) {
      plusTransporte = datosTrabajador.transporte_urbano 
        ? ConvenioLimpieza.COMPLEMENTOS.PLUS_TRANSPORTE.URBANO
        : ConvenioLimpieza.COMPLEMENTOS.PLUS_TRANSPORTE.INTERURBANO;
    }

    let epi = 0;
    if (datosTrabajador.elementos_epi && Array.isArray(datosTrabajador.elementos_epi)) {
      epi = datosTrabajador.elementos_epi.reduce((sum, elemento) => {
        const precio = ConvenioLimpieza.COMPLEMENTOS.EPI.ELEMENTOS[elemento]?.precio || 0;
        return sum + precio;
      }, 0);
    }

    const total = round2(plusTransporte + epi);
    return { plus_transporte: round2(plusTransporte), epi: round2(epi), total };
  }
}

export default LimpiezaCalculator;