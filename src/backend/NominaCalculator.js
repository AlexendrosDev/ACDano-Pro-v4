import BaseCalculator from './calculators/BaseCalculator.js';
import CotizacionCalculator from './calculators/CotizacionCalculator.js';
import IRPFCalculator from './calculators/IRPFCalculator.js';
import LogicValidator from './validators/LogicValidator.js';
import SectorValidator from './validators/SectorValidator.js';
import SectorCoherenceValidator from './validators/SectorCoherenceValidator.js';
import IRPFTramosAuditor from './validators/IRPFTramosAuditor.js';
import CalculationAuditor from './validators/CalculationAuditor.js';
import AuditLogger from '../shared/AuditLogger.js';
import ConvenioValencia from './models/ConvenioValencia.js';
import SeguridadSocial2025 from './models/SeguridadSocial2025.js';
import IRPFValencia2025 from './models/IRPFValencia2025.js';
import { round2 } from '../shared/utils.js';

const STRICT_MODE = false; // Cambiar a true en entornos de producción estrictos

export class NominaCalculator {
  constructor() {
    this.baseCalculator = new BaseCalculator();
    this.cotizacionCalculator = new CotizacionCalculator();
    this.irpfCalculator = new IRPFCalculator();
    this.logicValidator = new LogicValidator();
    this._integridadVerificada = false;
  }

  async _asegurarIntegridadNormativa() {
    if (this._integridadVerificada) return;
    await Promise.all([
      ConvenioValencia.validarIntegridad?.(),
      SeguridadSocial2025.validarIntegridad?.(),
      IRPFValencia2025.validarIntegridad?.()
    ]);
    this._integridadVerificada = true;
  }

  async calcularNominaCompleta(datosTrabajador, datosFamiliares, opcionesSector = {}) {
    await this._asegurarIntegridadNormativa();

    AuditLogger.log('calculo:start', { datosTrabajador, datosFamiliares });

    const conceptosSalariales = this.baseCalculator.calcularConceptosSalariales(datosTrabajador);
    const conceptosNoSalariales = this.baseCalculator.calcularConceptosNoSalariales(datosTrabajador);
    const salarioBrutoTotal = this.baseCalculator.calcularSalarioBrutoTotal(conceptosSalariales, conceptosNoSalariales);
    const baseCotizacion = this.baseCalculator.calcularBaseCotizacion(conceptosSalariales);
    const baseIRPFAnual = this.baseCalculator.calcularBaseIRPF(salarioBrutoTotal);
    const cotizacionesTrabajador = this.cotizacionCalculator.calcularCotizacionesTrabajador(baseCotizacion);
    const cotizacionesEmpresa = this.cotizacionCalculator.calcularCotizacionesEmpresa(baseCotizacion);
    const irpf = this.irpfCalculator.calcularIRPFValenciaCompleto(baseIRPFAnual, datosFamiliares);

    const totalDeducciones = cotizacionesTrabajador.total + irpf.retencion_mensual;
    const salarioLiquido = salarioBrutoTotal - totalDeducciones;
    const costeTotalEmpresa = this.cotizacionCalculator.calcularCosteTotalEmpresa(salarioBrutoTotal, cotizacionesEmpresa);
    const expolioTotal = this.cotizacionCalculator.calcularExpolioTotal(cotizacionesTrabajador, cotizacionesEmpresa);
    const porcentajeExpolio = this.cotizacionCalculator.calcularPorcentajeExpolio(expolioTotal, costeTotalEmpresa);

    const resultados = {
      ingresos: {
        salario_base: round2(conceptosSalariales.salario_base),
        prorrata_pagas_extra: round2(conceptosSalariales.prorrata_pagas),
        complementos_salariales: {
          plus_formacion: round2(conceptosSalariales.plus_formacion),
          manutencion: round2(conceptosSalariales.manutencion),
          subtotal: round2(conceptosSalariales.plus_formacion + conceptosSalariales.manutencion)
        },
        conceptos_no_salariales: {
          plus_transporte: round2(conceptosNoSalariales.plus_transporte),
          vestuario: round2(conceptosNoSalariales.vestuario),
          otros: round2(conceptosNoSalariales.otros),
          subtotal: round2(conceptosNoSalariales.total)
        },
        total_bruto: round2(salarioBrutoTotal)
      },
      deducciones: {
        seguridad_social_trabajador: {
          contingencias_comunes: round2(cotizacionesTrabajador.cc),
          desempleo: round2(cotizacionesTrabajador.desempleo),
          formacion_profesional: round2(cotizacionesTrabajador.fp),
          mei: round2(cotizacionesTrabajador.mei),
          subtotal: round2(cotizacionesTrabajador.total)
        },
        irpf: {
          base_anual: round2(baseIRPFAnual),
          base_liquidable: round2(irpf.base_liquidable || 0),
          cuota_anual: round2(irpf.cuota_anual),
          tipo_medio_efectivo: round2(irpf.tipo_medio),
          retencion_mensual: round2(irpf.retencion_mensual)
        },
        total_deducciones: round2(totalDeducciones)
      },
      empresa: {
        seguridad_social_empresa: {
          contingencias_comunes: round2(cotizacionesEmpresa.cc),
          accidentes_trabajo: round2(cotizacionesEmpresa.atep),
          desempleo: round2(cotizacionesEmpresa.desempleo),
          fogasa: round2(cotizacionesEmpresa.fogasa),
          formacion_profesional: round2(cotizacionesEmpresa.fp),
          mei: round2(cotizacionesEmpresa.mei),
          subtotal: round2(cotizacionesEmpresa.total)
        },
        coste_total: round2(costeTotalEmpresa)
      },
      expolio: {
        ss_trabajador: round2(cotizacionesTrabajador.total),
        ss_empresa: round2(cotizacionesEmpresa.total),
        total_estado: round2(expolioTotal),
        porcentaje_sobre_coste: round2(porcentajeExpolio)
      },
      resumen: {
        salario_liquido: round2(salarioLiquido),
        total_deducciones_trabajador: round2(totalDeducciones),
        coste_total_empresa: round2(costeTotalEmpresa),
        expolio_total_estado: round2(expolioTotal),
        porcentaje_expolio: round2(porcentajeExpolio)
      },
      conceptos_salariales: conceptosSalariales,
      conceptos_no_salariales: conceptosNoSalariales,
      salario_bruto_total: salarioBrutoTotal,
      base_cotizacion: baseCotizacion,
      base_irpf_anual: baseIRPFAnual,
      cotizaciones_trabajador: cotizacionesTrabajador,
      cotizaciones_empresa: cotizacionesEmpresa,
      irpf,
      total_deducciones: totalDeducciones,
      salario_liquido: salarioLiquido,
      coste_total_empresa: costeTotalEmpresa,
      expolio_total: expolioTotal,
      porcentaje_expolio: porcentajeExpolio,
      fecha_calculo: new Date().toISOString(),
      datos_trabajador: datosTrabajador,
      datos_familiares: datosFamiliares,
    };

    // Validación matemática
    const validacion = this.logicValidator.validarCoherenciaMatematica(resultados);

    // Validaciones sectoriales (input)
    const valSector = SectorValidator.validar(resultados, opcionesSector);
    validacion.warnings = [...validacion.warnings, ...valSector.warnings];

    // Coherencia sectorial por categoría/nivel (estadística/esperado)
    const valCoh = SectorCoherenceValidator.validar(resultados);
    validacion.warnings = [...validacion.warnings, ...valCoh.warnings];
    validacion.sectorial = { ...valSector, ...valCoh };

    // Auditoría general (coste/expolio/porcentaje)
    const auditoria = CalculationAuditor.audit(resultados);
    if (auditoria.warnings.length) {
      validacion.warnings = [...validacion.warnings, ...auditoria.warnings];
    }

    // Auditoría IRPF por tramos (independiente)
    const auditIRPF = IRPFTramosAuditor.auditar(baseIRPFAnual, datosFamiliares);
    const difCuota = Math.abs((auditIRPF.cuotas.total || 0) - (irpf.cuota_anual || 0));
    const difMensual = Math.abs((auditIRPF.retencionMensual || 0) - (irpf.retencion_mensual || 0));
    if (difCuota > 0.02 || difMensual > 0.02) {
      validacion.warnings.push({ codigo: 'AUDIT_IRPF_TRAMOS', mensaje: 'Diferencias en auditoría de tramos IRPF' });
    }

    AuditLogger.log('calculo:end', { resultados, validacion, auditoria, auditIRPF });

    // STRICT MODE: convierte ciertos warnings en error bloqueante
    if (STRICT_MODE) {
      const codigosCriticos = new Set(['AUDIT_IRPF_TRAMOS', 'AUDIT_COSTE_EMPRESA', 'AUDIT_EXPOLIO', 'SECTOR_EXPOLIO_FUERA_RANGO']);
      const tieneCritico = validacion.warnings.some(w => codigosCriticos.has(w.codigo));
      if (tieneCritico || !validacion.es_valido) {
        const msg = 'STRICT_MODE: divergencias detectadas — cálculo bloqueado';
        throw new Error(msg);
      }
    } else if (!validacion.es_valido) {
      const crit = validacion.errores.find(e => e.tipo === 'CRÍTICO');
      if (crit) throw new Error(crit.mensaje);
    }

    return { resultados, validacion };
  }
}

export default NominaCalculator;
