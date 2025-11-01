/**
 * IRPFCalculator.js
 * Calculador especializado para IRPF Valencia (estatal + autonómico)
 * 
 * Responsabilidades:
 * - Cálculo IRPF por tramos (estatal + Valencia)
 * - Aplicación de mínimos personales y familiares
 * - Cálculo de retención mensual y tipo medio
 */

import IRPFValencia2025 from '../models/IRPFValencia2025.js';

export class IRPFCalculator {
    /**
     * Calcula el IRPF completo de Valencia (estatal + autonómico)
     * @param {number} baseIRPFAnual - Base IRPF anual en euros
     * @param {Object} datosFamiliares - Datos familiares (número hijos, etc.)
     * @returns {Object} Cálculo IRPF completo
     */
    calcularIRPFValenciaCompleto(baseIRPFAnual, datosFamiliares) {
        // PASO 1: Calcular deducciones del IRPF
        const cotizacionSSAnual = baseIRPFAnual * 0.0648; // 6,48% anual
        const gastosDeducibles = IRPFValencia2025.MINIMOS.GASTOS_DEDUCIBLES;
        const minimoPersonal = IRPFValencia2025.MINIMOS.PERSONAL_SOLTERO;
        const minimoFamiliar = IRPFValencia2025.calcularMinimoFamiliar(datosFamiliares.num_hijos);

        // PASO 2: Calcular base liquidable
        const baseLiquidable = baseIRPFAnual - cotizacionSSAnual - gastosDeducibles - minimoPersonal - minimoFamiliar;

        // PASO 3: Si base liquidable ≤ 0, no hay IRPF
        if (baseLiquidable <= 0) {
            return {
                base_irpf_anual: baseIRPFAnual,
                cotizacion_ss_anual: cotizacionSSAnual,
                gastos_deducibles: gastosDeducibles,
                minimo_personal: minimoPersonal,
                minimo_familiar: minimoFamiliar,
                base_liquidable: baseLiquidable,
                cuota_estatal: 0,
                cuota_autonomica: 0,
                cuota_anual: 0,
                retencion_mensual: 0,
                tipo_medio: 0
            };
        }

        // PASO 4: Calcular cuota por tramos (estatal + autonómico)
        const cuotaEstatal = this.calcularPorTramos(baseLiquidable, IRPFValencia2025.TRAMOS_ESTATALES);
        const cuotaAutonomica = this.calcularPorTramos(baseLiquidable, IRPFValencia2025.TRAMOS_AUTONOMICOS_VALENCIA);

        // PASO 5: Calcular totales
        const cuotaTotal = cuotaEstatal + cuotaAutonomica;
        const tipoMedio = (cuotaTotal / baseIRPFAnual) * 100;
        const retencionMensual = cuotaTotal / 12;

        return {
            base_irpf_anual: baseIRPFAnual,
            cotizacion_ss_anual: cotizacionSSAnual,
            gastos_deducibles: gastosDeducibles,
            minimo_personal: minimoPersonal,
            minimo_familiar: minimoFamiliar,
            base_liquidable: baseLiquidable,
            cuota_estatal: cuotaEstatal,
            cuota_autonomica: cuotaAutonomica,
            cuota_anual: cuotaTotal,
            retencion_mensual: retencionMensual,
            tipo_medio: tipoMedio
        };
    }

    /**
     * Calcula la cuota por tramos progresivos
     * @param {number} baseLiquidable - Base liquidable
     * @param {Array} tramos - Array de tramos (estatales o autonómicos)
     * @returns {number} Cuota calculada
     */
    calcularPorTramos(baseLiquidable, tramos) {
        let cuota = 0;
        let baseAcumulada = 0;

        for (const tramo of tramos) {
            if (baseLiquidable > baseAcumulada) {
                let baseTramo;
                
                if (tramo.infinito) {
                    // Último tramo: toda la base restante
                    baseTramo = baseLiquidable - baseAcumulada;
                } else {
                    // Tramo intermedio: mínimo entre base restante y límite del tramo
                    baseTramo = Math.min(baseLiquidable - baseAcumulada, tramo.hasta - baseAcumulada);
                }

                // Calcular cuota del tramo
                const cuotaTramo = baseTramo * tramo.tipo / 100;
                cuota += cuotaTramo;

                // Actualizar base acumulada
                if (!tramo.infinito) {
                    baseAcumulada = tramo.hasta;
                } else {
                    // Último tramo: salir del bucle
                    break;
                }
            }
        }

        return cuota;
    }

    /**
     * Calcula el IRPF simplificado (solo para estimaciones rápidas)
     * @param {number} baseIRPFAnual - Base IRPF anual
     * @param {number} numHijos - Número de hijos
     * @returns {Object} Cálculo simplificado
     */
    calcularIRPFSimplificado(baseIRPFAnual, numHijos = 0) {
        const datosFamiliares = { num_hijos: numHijos };
        return this.calcularIRPFValenciaCompleto(baseIRPFAnual, datosFamiliares);
    }

    /**
     * Estima el tipo marginal para una base dada
     * @param {number} baseIRPFAnual - Base IRPF anual
     * @param {number} numHijos - Número de hijos
     * @returns {number} Tipo marginal estimado (%)
     */
    estimarTipoMarginal(baseIRPFAnual, numHijos = 0) {
        const calculo = this.calcularIRPFSimplificado(baseIRPFAnual, numHijos);
        
        if (calculo.base_liquidable <= 0) {
            return 0;
        }
        
        // Tipo marginal = tipo estatal + tipo autonómico del último tramo aplicable
        return IRPFValencia2025.getTipoMarginalTotal(calculo.base_liquidable);
    }

    /**
     * Valida el cálculo de IRPF
     * @param {Object} calculoIRPF - Resultado del cálculo IRPF
     * @returns {Object} Validación del cálculo
     */
    validarCalculoIRPF(calculoIRPF) {
        const errores = [];
        const warnings = [];

        // Validar coherencia matemática
        if (calculoIRPF.cuota_anual < 0) {
            errores.push({
                tipo: "ERROR",
                codigo: "CUOTA_NEGATIVA",
                mensaje: "La cuota IRPF no puede ser negativa"
            });
        }

        if (calculoIRPF.base_liquidable < 0 && calculoIRPF.cuota_anual > 0) {
            errores.push({
                tipo: "ERROR",
                codigo: "BASE_NEGATIVA_CUOTA_POSITIVA",
                mensaje: "Base liquidable negativa pero cuota positiva"
            });
        }

        // Warnings por tipos muy altos
        if (calculoIRPF.tipo_medio > 30) {
            warnings.push({
                tipo: "WARNING",
                codigo: "TIPO_MEDIO_ALTO",
                mensaje: `Tipo medio muy alto: ${calculoIRPF.tipo_medio.toFixed(2)}%`,
                solucion: "Verificar mínimos familiares y deducciones"
            });
        }

        // Warning si la retención es muy alta respecto al salario
        const porcentajeRetencion = (calculoIRPF.retencion_mensual * 12 / calculoIRPF.base_irpf_anual) * 100;
        if (porcentajeRetencion > 25) {
            warnings.push({
                tipo: "WARNING",
                codigo: "RETENCION_ALTA",
                mensaje: `Retención muy alta: ${porcentajeRetencion.toFixed(2)}% del salario bruto`
            });
        }

        return {
            valido: errores.length === 0,
            errores: errores,
            warnings: warnings
        };
    }

    /**
     * Obtiene un desglose detallado del cálculo IRPF
     * @param {Object} calculoIRPF - Resultado del cálculo IRPF
     * @returns {Object} Desglose detallado
     */
    obtenerDesglose(calculoIRPF) {
        return {
            // Bases
            base_irpf_anual: calculoIRPF.base_irpf_anual,
            base_irpf_mensual: calculoIRPF.base_irpf_anual / 12,
            
            // Deducciones
            deducciones: {
                cotizacion_ss: calculoIRPF.cotizacion_ss_anual,
                gastos_deducibles: calculoIRPF.gastos_deducibles,
                minimo_personal: calculoIRPF.minimo_personal,
                minimo_familiar: calculoIRPF.minimo_familiar,
                total: calculoIRPF.cotizacion_ss_anual + calculoIRPF.gastos_deducibles + 
                       calculoIRPF.minimo_personal + calculoIRPF.minimo_familiar
            },
            
            // Base liquidable
            base_liquidable: calculoIRPF.base_liquidable,
            
            // Cuotas
            cuotas: {
                estatal: calculoIRPF.cuota_estatal,
                autonomica: calculoIRPF.cuota_autonomica,
                total: calculoIRPF.cuota_anual
            },
            
            // Retención y tipos
            resultado: {
                retencion_mensual: calculoIRPF.retencion_mensual,
                tipo_medio: calculoIRPF.tipo_medio,
                tipo_marginal: this.estimarTipoMarginal(calculoIRPF.base_irpf_anual)
            }
        };
    }
}

export default IRPFCalculator;