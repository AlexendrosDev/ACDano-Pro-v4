/**
 * NominaCalculator.js
 * Motor principal de cálculo de nóminas - Orquestador de todos los calculadores
 * 
 * Responsabilidades:
 * - Integrar todos los calculadores especializados
 * - Ejecutar el flujo completo de cálculo
 * - Validar coherencia matemática
 * - Generar resultados completos
 */

import BaseCalculator from './calculators/BaseCalculator.js';
import CotizacionCalculator from './calculators/CotizacionCalculator.js';
import IRPFCalculator from './calculators/IRPFCalculator.js';
import LogicValidator from './validators/LogicValidator.js';

export class NominaCalculator {
    constructor() {
        // Inicializar calculadores especializados
        this.baseCalculator = new BaseCalculator();
        this.cotizacionCalculator = new CotizacionCalculator();
        this.irpfCalculator = new IRPFCalculator();
        this.logicValidator = new LogicValidator();
    }

    /**
     * Calcula una nómina completa siguiendo el flujo del pseudocódigo v4.0
     * @param {Object} datosTrabajador - Datos del trabajador
     * @param {Object} datosFamiliares - Datos familiares para IRPF
     * @returns {Object} Resultados completos y validación
     */
    calcularNominaCompleta(datosTrabajador, datosFamiliares) {
        try {
            // PASO 0: Validar datos de entrada
            const validacionDatos = this.baseCalculator.validarDatosTrabajador(datosTrabajador);
            if (!validacionDatos.valido) {
                throw new Error(`Datos inválidos: ${validacionDatos.errores.join(', ')}`);
            }

            // PASO 1: Calcular conceptos salariales (COTIZAN)
            const conceptosSalariales = this.baseCalculator.calcularConceptosSalariales(datosTrabajador);

            // PASO 2: Calcular conceptos no salariales (NO COTIZAN, SÍ TRIBUTAN)
            const conceptosNoSalariales = this.baseCalculator.calcularConceptosNoSalariales(datosTrabajador);

            // PASO 3: Calcular SALARIO BRUTO TOTAL (todos los conceptos)
            const salarioBrutoTotal = this.baseCalculator.calcularSalarioBrutoTotal(
                conceptosSalariales, 
                conceptosNoSalariales
            );

            // PASO 4: Calcular BASE COTIZACIÓN (solo salariales con topes)
            const baseCotizacion = this.baseCalculator.calcularBaseCotizacion(conceptosSalariales);

            // PASO 5: Calcular BASE IRPF (todo tributa)
            const baseIRPFAnual = this.baseCalculator.calcularBaseIRPF(salarioBrutoTotal);

            // PASO 6: Calcular cotizaciones Seguridad Social
            const cotizacionesTrabajador = this.cotizacionCalculator.calcularCotizacionesTrabajador(baseCotizacion);
            const cotizacionesEmpresa = this.cotizacionCalculator.calcularCotizacionesEmpresa(baseCotizacion);

            // PASO 7: Calcular IRPF Valencia completo
            const irpf = this.irpfCalculator.calcularIRPFValenciaCompleto(baseIRPFAnual, datosFamiliares);

            // PASO 8: Calcular totales finales
            const totalDeducciones = cotizacionesTrabajador.total + irpf.retencion_mensual;
            const salarioLiquido = salarioBrutoTotal - totalDeducciones;
            const costeTotalEmpresa = this.cotizacionCalculator.calcularCosteTotalEmpresa(
                salarioBrutoTotal, 
                cotizacionesEmpresa
            );
            const expolioTotal = this.cotizacionCalculator.calcularExpolioTotal(
                cotizacionesTrabajador, 
                cotizacionesEmpresa
            );
            const porcentajeExpolio = this.cotizacionCalculator.calcularPorcentajeExpolio(
                expolioTotal, 
                costeTotalEmpresa
            );

            // PASO 9: Construir resultado completo
            const resultados = {
                // Conceptos detallados
                conceptos_salariales: conceptosSalariales,
                conceptos_no_salariales: conceptosNoSalariales,
                
                // Bases de cálculo
                salario_bruto_total: salarioBrutoTotal,
                base_cotizacion: baseCotizacion,
                base_irpf_anual: baseIRPFAnual,
                
                // Cotizaciones
                cotizaciones_trabajador: cotizacionesTrabajador,
                cotizaciones_empresa: cotizacionesEmpresa,
                
                // IRPF
                irpf: irpf,
                
                // Totales finales
                total_deducciones: totalDeducciones,
                salario_liquido: salarioLiquido,
                coste_total_empresa: costeTotalEmpresa,
                expolio_total: expolioTotal,
                porcentaje_expolio: porcentajeExpolio,
                
                // Metadatos
                fecha_calculo: new Date().toISOString(),
                datos_trabajador: datosTrabajador,
                datos_familiares: datosFamiliares
            };

            // PASO 10: Validar coherencia matemática
            const validacion = this.logicValidator.validarCoherenciaMatematica(resultados);

            if (!validacion.es_valido) {
                // Si hay errores críticos, lanzar excepción
                const erroresCriticos = validacion.errores.filter(e => e.tipo === "CRÍTICO");
                if (erroresCriticos.length > 0) {
                    throw new Error(`❌ CÁLCULO INVÁLIDO: ${erroresCriticos[0].mensaje}`);
                }
            }

            return {
                resultados: resultados,
                validacion: validacion,
                debug: {
                    version: "4.0.0",
                    motor: "NominaCalculator",
                    timestamp: new Date().toISOString()
                }
            };

        } catch (error) {
            // Capturar y relanzar errores con contexto
            throw new Error(`Error en cálculo de nómina: ${error.message}`);
        }
    }

    /**
     * Calcula una estimación rápida (sin validaciones exhaustivas)
     * @param {Object} datosTrabajador - Datos del trabajador
     * @param {number} numHijos - Número de hijos (opcional)
     * @returns {Object} Estimación rápida
     */
    calcularEstimacionRapida(datosTrabajador, numHijos = 0) {
        const datosFamiliares = { num_hijos: numHijos };
        
        try {
            const calculo = this.calcularNominaCompleta(datosTrabajador, datosFamiliares);
            
            return {
                salario_bruto: calculo.resultados.salario_bruto_total,
                salario_liquido: calculo.resultados.salario_liquido,
                porcentaje_expolio: calculo.resultados.porcentaje_expolio,
                irpf_retencion: calculo.resultados.irpf.retencion_mensual,
                ss_trabajador: calculo.resultados.cotizaciones_trabajador.total,
                valido: calculo.validacion.es_valido
            };
        } catch (error) {
            return {
                error: error.message,
                valido: false
            };
        }
    }

    /**
     * Compara dos escenarios de nómina
     * @param {Object} escenario1 - Primer escenario
     * @param {Object} escenario2 - Segundo escenario
     * @returns {Object} Comparación detallada
     */
    compararEscenarios(escenario1, escenario2) {
        try {
            const calculo1 = this.calcularNominaCompleta(escenario1.datos_trabajador, escenario1.datos_familiares);
            const calculo2 = this.calcularNominaCompleta(escenario2.datos_trabajador, escenario2.datos_familiares);

            const r1 = calculo1.resultados;
            const r2 = calculo2.resultados;

            return {
                escenario_1: {
                    nombre: escenario1.nombre || "Escenario 1",
                    salario_liquido: r1.salario_liquido,
                    porcentaje_expolio: r1.porcentaje_expolio
                },
                escenario_2: {
                    nombre: escenario2.nombre || "Escenario 2",
                    salario_liquido: r2.salario_liquido,
                    porcentaje_expolio: r2.porcentaje_expolio
                },
                diferencias: {
                    salario_liquido: r2.salario_liquido - r1.salario_liquido,
                    porcentaje_expolio: r2.porcentaje_expolio - r1.porcentaje_expolio,
                    irpf: r2.irpf.retencion_mensual - r1.irpf.retencion_mensual
                },
                recomendacion: r2.salario_liquido > r1.salario_liquido ? "escenario_2" : "escenario_1"
            };
        } catch (error) {
            return {
                error: `Error en comparación: ${error.message}`
            };
        }
    }

    /**
     * Genera un informe completo de validación
     * @param {Object} datosTrabajador - Datos del trabajador
     * @param {Object} datosFamiliares - Datos familiares
     * @returns {Object} Informe completo
     */
    generarInformeValidacion(datosTrabajador, datosFamiliares) {
        try {
            const calculo = this.calcularNominaCompleta(datosTrabajador, datosFamiliares);
            return this.logicValidator.generarInformeCompleto(calculo.resultados);
        } catch (error) {
            return {
                error: error.message,
                timestamp: new Date().toISOString(),
                estado: "ERROR"
            };
        }
    }

    /**
     * Obtiene información de debugging del motor
     * @returns {Object} Información de debugging
     */
    getDebugInfo() {
        return {
            version: "4.0.0",
            motor: "NominaCalculator",
            calculadores: {
                base: this.baseCalculator.constructor.name,
                cotizacion: this.cotizacionCalculator.constructor.name,
                irpf: this.irpfCalculator.constructor.name,
                validador: this.logicValidator.constructor.name
            },
            timestamp: new Date().toISOString(),
            memoria_uso: process?.memoryUsage?.() || "No disponible"
        };
    }
}

export default NominaCalculator;