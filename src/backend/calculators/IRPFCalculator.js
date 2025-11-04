/**
 * IRPFCalculator.js
 * Calculador especializado para IRPF (estatal + autonómico)
 * 
 * Responsabilidades:
 * - Cálculo IRPF por tramos (estatal + regional)
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
        return this.calcularIRPFRegional(baseIRPFAnual, datosFamiliares, IRPFValencia2025);
    }

    /**
     * Calcula el IRPF de cualquier región (estatal + autonómico)
     * @param {number} baseIRPFAnual - Base IRPF anual en euros
     * @param {Object} datosFamiliares - Datos familiares
     * @param {Object} IRPFRegionModel - Modelo IRPF de la región
     * @returns {Object} Cálculo IRPF completo
     */
    calcularIRPFRegional(baseIRPFAnual, datosFamiliares, IRPFRegionModel) {
        // PASO 1: Calcular deducciones del IRPF
        const cotizacionSSAnual = baseIRPFAnual * 0.0648; // 6,48% anual
        const gastosDeducibles = IRPFRegionModel.MINIMOS?.GASTOS_DEDUCIBLES || IRPFValencia2025.MINIMOS.GASTOS_DEDUCIBLES;
        const minimoPersonal = IRPFRegionModel.MINIMOS?.PERSONAL_SOLTERO || IRPFValencia2025.MINIMOS.PERSONAL_SOLTERO;
        const minimoFamiliar = IRPFRegionModel.calcularMinimoFamiliar?.(datosFamiliares.num_hijos) || IRPFValencia2025.calcularMinimoFamiliar(datosFamiliares.num_hijos);

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
        const tramosEstatales = IRPFRegionModel.TRAMOS_ESTATALES || IRPFValencia2025.TRAMOS_ESTATALES;
        const tramosAutonomicos = IRPFRegionModel.TRAMOS_AUTONOMICOS || IRPFRegionModel.TRAMOS_AUTONOMICOS_VALENCIA || IRPFValencia2025.TRAMOS_AUTONOMICOS_VALENCIA;
        
        const cuotaEstatal = this.calcularPorTramos(baseLiquidable, tramosEstatales);
        const cuotaAutonomica = this.calcularPorTramos(baseLiquidable, tramosAutonomicos);

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

    calcularIRPFSimplificado(baseIRPFAnual, numHijos = 0) {
        const datosFamiliares = { num_hijos: numHijos };
        return this.calcularIRPFValenciaCompleto(baseIRPFAnual, datosFamiliares);
    }

    estimarTipoMarginal(baseIRPFAnual, numHijos = 0) {
        const calculo = this.calcularIRPFSimplificado(baseIRPFAnual, numHijos);
        
        if (calculo.base_liquidable <= 0) {
            return 0;
        }
        
        return IRPFValencia2025.getTipoMarginalTotal(calculo.base_liquidable);
    }

    validarCalculoIRPF(calculoIRPF) {
        const errores = [];
        const warnings = [];

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

        if (calculoIRPF.tipo_medio > 30) {
            warnings.push({
                tipo: "WARNING",
                codigo: "TIPO_MEDIO_ALTO",
                mensaje: `Tipo medio muy alto: ${calculoIRPF.tipo_medio.toFixed(2)}%`,
                solucion: "Verificar mínimos familiares y deducciones"
            });
        }

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

    obtenerDesglose(calculoIRPF) {
        return {
            base_irpf_anual: calculoIRPF.base_irpf_anual,
            base_irpf_mensual: calculoIRPF.base_irpf_anual / 12,
            deducciones: {
                cotizacion_ss: calculoIRPF.cotizacion_ss_anual,
                gastos_deducibles: calculoIRPF.gastos_deducibles,
                minimo_personal: calculoIRPF.minimo_personal,
                minimo_familiar: calculoIRPF.minimo_familiar,
                total: calculoIRPF.cotizacion_ss_anual + calculoIRPF.gastos_deducibles + 
                       calculoIRPF.minimo_personal + calculoIRPF.minimo_familiar
            },
            base_liquidable: calculoIRPF.base_liquidable,
            cuotas: {
                estatal: calculoIRPF.cuota_estatal,
                autonomica: calculoIRPF.cuota_autonomica,
                total: calculoIRPF.cuota_anual
            },
            resultado: {
                retencion_mensual: calculoIRPF.retencion_mensual,
                tipo_medio: calculoIRPF.tipo_medio,
                tipo_marginal: this.estimarTipoMarginal(calculoIRPF.base_irpf_anual)
            }
        };
    }
}

export default IRPFCalculator;