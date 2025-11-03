/**
 * 🧹 LimpiezaCalculator - Calculadora de nóminas sector limpieza
 * 
 * Especializada para el cálculo de nóminas en el sector limpieza:
 * - 2 pagas extra (vs 3 en hostelería)
 * - Plus nocturnidad y penosidad
 * - EPI (Equipos Protección Individual)
 * - Transporte urbano/metropolitano
 * 
 * @author ACDaño Team
 * @version 4.0
 * @extends BaseCalculator
 */

import { BaseCalculator } from './BaseCalculator.js';
import { ConvenioLimpieza } from '../models/ConvenioLimpieza.js';

export class LimpiezaCalculator extends BaseCalculator {
  
  /**
   * Calcula conceptos salariales específicos del sector limpieza
   * @param {Object} datosTrabajador - Datos del trabajador
   * @returns {Object} Conceptos salariales calculados
   */
  calcularConceptosSalariales(datosTrabajador) {
    const conceptosSalariales = {
      salario_base: ConvenioLimpieza.obtenerSalarioBase(datosTrabajador.tabla, datosTrabajador.nivel),
      prorrata_pagas: 0,
      plus_nocturnidad: 0,
      plus_penosidad: 0
    };

    // Prorrata pagas extraordinarias (2 en limpieza vs 3 en hostelería)
    conceptosSalariales.prorrata_pagas = 
      conceptosSalariales.salario_base * ConvenioLimpieza.NUM_PAGAS_EXTRAORDINARIAS / 12;

    // Plus nocturnidad (22:00 - 06:00)
    if (datosTrabajador.aplica_plus_nocturnidad) {
      conceptosSalariales.plus_nocturnidad = ConvenioLimpieza.COMPLEMENTOS.PLUS_NOCTURNIDAD;
    }

    // Plus penosidad (químicos, residuos peligrosos)
    if (datosTrabajador.aplica_plus_penosidad) {
      conceptosSalariales.plus_penosidad = ConvenioLimpieza.COMPLEMENTOS.PLUS_PENOSIDAD;
    }

    conceptosSalariales.total = this.sumarTodos(conceptosSalariales);
    return conceptosSalariales;
  }

  /**
   * Calcula conceptos no salariales del sector limpieza
   * @param {Object} datosTrabajador - Datos del trabajador
   * @returns {Object} Conceptos no salariales calculados
   */
  calcularConceptosNoSalariales(datosTrabajador) {
    const conceptosNoSalariales = {
      plus_transporte: 0,
      vestuario: 0, // EPI en sector limpieza
      otros: 0
    };

    // Plus transporte (diferenciado urbano vs metropolitano)
    if (datosTrabajador.aplica_plus_transporte) {
      conceptosNoSalariales.plus_transporte = datosTrabajador.zona_metropolitana ? 
        ConvenioLimpieza.COMPLEMENTOS.PLUS_TRANSPORTE.metropolitano :
        ConvenioLimpieza.COMPLEMENTOS.PLUS_TRANSPORTE.urbano;
    }

    // EPI/Vestuario - Equipos de Protección Individual
    if (datosTrabajador.elementos_uniforme && datosTrabajador.elementos_uniforme.length > 0) {
      conceptosNoSalariales.vestuario = ConvenioLimpieza.calcularCosteEPI(datosTrabajador.elementos_uniforme);
    }

    conceptosNoSalariales.total = this.sumarTodos(conceptosNoSalariales);
    return conceptosNoSalariales;
  }

  /**
   * Aplica validaciones específicas del sector limpieza
   * @param {Object} datosTrabajador - Datos del trabajador
   * @returns {Array} Lista de advertencias específicas
   */
  validarSectorLimpieza(datosTrabajador) {
    const warnings = [];

    // Verificar EPI obligatorios
    const epiObligatorios = ConvenioLimpieza.obtenerEPIObligatorios();
    const epiSeleccionados = datosTrabajador.elementos_uniforme || [];
    
    const epiFaltantes = epiObligatorios.filter(epi => !epiSeleccionados.includes(epi));
    if (epiFaltantes.length > 0) {
      warnings.push({
        codigo: 'EPI_OBLIGATORIOS_FALTANTES',
        mensaje: `EPI obligatorios no seleccionados: ${epiFaltantes.join(', ')}`,
        tipo: 'warning'
      });
    }

    // Verificar coherencia plus nocturnidad vs penosidad
    if (datosTrabajador.aplica_plus_nocturnidad && datosTrabajador.aplica_plus_penosidad) {
      warnings.push({
        codigo: 'PLUS_ACUMULADOS_ALTOS',
        mensaje: 'Plus nocturnidad + penosidad acumulados - verificar compatibilidad',
        tipo: 'info'
      });
    }

    // Verificar zona metropolitana sin plus transporte
    if (datosTrabajador.zona_metropolitana && !datosTrabajador.aplica_plus_transporte) {
      warnings.push({
        codigo: 'TRANSPORTE_METROPOLITANO_SIN_PLUS',
        mensaje: 'Zona metropolitana indicada pero plus transporte no aplicado',
        tipo: 'info'
      });
    }

    return warnings;
  }

  /**
   * Genera reporte específico del sector limpieza
   * @param {Object} resultados - Resultados del cálculo
   * @param {Object} datosTrabajador - Datos del trabajador
   * @returns {Object} Reporte sectorial
   */
  generarReporteSectorial(resultados, datosTrabajador) {
    const validacionesSectoriales = this.validarSectorLimpieza(datosTrabajador);
    
    return {
      sector: 'limpieza',
      caracteristicas_sector: {
        pagas_extraordinarias: ConvenioLimpieza.NUM_PAGAS_EXTRAORDINARIAS,
        plus_nocturnidad_aplicado: Boolean(datosTrabajador.aplica_plus_nocturnidad),
        plus_penosidad_aplicado: Boolean(datosTrabajador.aplica_plus_penosidad),
        zona_metropolitana: Boolean(datosTrabajador.zona_metropolitana),
        epi_seleccionados: datosTrabajador.elementos_uniforme?.length || 0
      },
      validaciones_sectoriales: validacionesSectoriales,
      diferencias_con_hosteleria: {
        pagas_menos: ConvenioValencia?.NUM_PAGAS_EXTRAORDINARIAS - ConvenioLimpieza.NUM_PAGAS_EXTRAORDINARIAS || 1,
        tiene_plus_penosidad: true,
        epi_obligatorio: true
      }
    };
  }
}