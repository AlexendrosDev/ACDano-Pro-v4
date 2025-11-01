import BaseCalculator from './calculators/BaseCalculator.js';
import CotizacionCalculator from './calculators/CotizacionCalculator.js';
import IRPFCalculator from './calculators/IRPFCalculator.js';
import LogicValidator from './validators/LogicValidator.js';
import SectorValidator from './validators/SectorValidator.js';
import CalculationAuditor from './validators/CalculationAuditor.js';
import AuditLogger from '../shared/AuditLogger.js';

export class NominaCalculator {
  constructor() {
    this.baseCalculator = new BaseCalculator();
    this.cotizacionCalculator = new CotizacionCalculator();
    this.irpfCalculator = new IRPFCalculator();
    this.logicValidator = new LogicValidator();
  }

  calcularNominaCompleta(datosTrabajador, datosFamiliares, opcionesSector = {}) {
    // Log entrada
    AuditLogger.log('calculo:start', { datosTrabajador, datosFamiliares });

    // Flujo principal
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

    // Validaciones
    const validacion = this.logicValidator.validarCoherenciaMatematica(resultados);
    const valSector = SectorValidator.validar(resultados, opcionesSector);
    validacion.warnings = [...validacion.warnings, ...valSector.warnings];
    validacion.sectorial = valSector;

    // Auditoría de cálculos críticos (double-check)
    const auditoria = CalculationAuditor.audit(resultados);
    if (auditoria.warnings.length) {
      validacion.warnings = [...validacion.warnings, ...auditoria.warnings];
    }

    // Log salida
    AuditLogger.log('calculo:end', { resultados, validacion, auditoria });

    if (!validacion.es_valido) {
      const crit = validacion.errores.find(e => e.tipo === 'CRÍTICO');
      if (crit) {
        throw new Error(crit.mensaje);
      }
    }

    return { resultados, validacion };
  }
}

export default NominaCalculator;
