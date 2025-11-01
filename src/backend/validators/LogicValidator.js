/**
 * LogicValidator.js
 * Validador lógico para coherencia matemática de los cálculos de nómina
 * 
 * Responsabilidades:
 * - Validaciones críticas de coherencia matemática
 * - Verificación de cumplimiento normativo
 * - Detección de errores en cálculos
 * - Generación de avisos y recomendaciones
 */

export class LogicValidator {
    /**
     * Valida la coherencia matemática completa de los resultados
     * @param {Object} resultados - Resultados completos del cálculo
     * @returns {Object} Resultado de la validación
     */
    validarCoherenciaMatematica(resultados) {
        const errores = [];
        const warnings = [];

        // VALIDACIÓN CRÍTICA 1: Base Cotización ≤ Salario Bruto
        if (resultados.base_cotizacion > resultados.salario_bruto_total) {
            errores.push({
                tipo: "CRÍTICO",
                codigo: "BASE_MAYOR_BRUTO",
                mensaje: `Base Cotización (${resultados.base_cotizacion.toFixed(2)}€) > Salario Bruto (${resultados.salario_bruto_total.toFixed(2)}€)`,
                solucion: "Revisar cálculo conceptos no salariales - matemáticamente imposible"
            });
        }

        // VALIDACIÓN CRÍTICA 2: Base IRPF ≥ Base Cotización
        if (resultados.base_irpf_anual / 12 < resultados.base_cotizacion) {
            errores.push({
                tipo: "CRÍTICO",
                codigo: "IRPF_MENOR_COTIZACION",
                mensaje: "Base IRPF mensual < Base Cotización",
                solucion: "Base IRPF debe incluir conceptos no salariales"
            });
        }

        // VALIDACIÓN 3: Salario Líquido < Salario Bruto
        if (resultados.salario_liquido >= resultados.salario_bruto_total) {
            errores.push({
                tipo: "ERROR",
                codigo: "LIQUIDO_MAYOR_BRUTO",
                mensaje: "Salario líquido ≥ salario bruto",
                solucion: "Revisar cálculo deducciones"
            });
        }

        // VALIDACIÓN 4: AT/EP nunca 0%
        if (resultados.cotizaciones_empresa.atep === 0) {
            errores.push({
                tipo: "CRÍTICO",
                codigo: "ATEP_ZERO",
                mensaje: "AT/EP = 0% incumple RD 2064/1995",
                solucion: "Aplicar AT/EP 1,25% obligatorio"
            });
        }

        // VALIDACIÓN 5: Coste Empresa > Salario Bruto
        if (resultados.coste_total_empresa <= resultados.salario_bruto_total) {
            warnings.push({
                tipo: "WARNING",
                codigo: "COSTE_EMPRESA_BAJO",
                mensaje: "Coste empresa ≤ salario bruto",
                solucion: "Revisar cotizaciones empresa"
            });
        }

        // VALIDACIÓN 6: Tipo IRPF razonable
        if (resultados.irpf.tipo_medio > 30) {
            warnings.push({
                tipo: "WARNING",
                codigo: "IRPF_ALTO",
                mensaje: `Tipo IRPF > 30% (${resultados.irpf.tipo_medio.toFixed(2)}%) - verificar cálculo`,
                solucion: "Comprobar mínimos familiares y deducciones"
            });
        }

        // VALIDACIÓN 7: Porcentaje expolio coherente
        if (resultados.porcentaje_expolio < 20 || resultados.porcentaje_expolio > 50) {
            warnings.push({
                tipo: "WARNING",
                codigo: "EXPOLIO_ATIPICO",
                mensaje: `Porcentaje expolio atípico: ${resultados.porcentaje_expolio.toFixed(2)}%`,
                solucion: "Revisar cálculos - rango típico 25-45%"
            });
        }

        // VALIDACIÓN 8: Suma cotizaciones trabajador coherente
        const sumaEsperadaTrabajador = 
            resultados.cotizaciones_trabajador.cc + 
            resultados.cotizaciones_trabajador.desempleo + 
            resultados.cotizaciones_trabajador.fp + 
            resultados.cotizaciones_trabajador.mei;
        
        if (Math.abs(resultados.cotizaciones_trabajador.total - sumaEsperadaTrabajador) > 0.01) {
            errores.push({
                tipo: "ERROR",
                codigo: "SUMA_COTIZACIONES_TRABAJADOR",
                mensaje: "Error en suma cotizaciones trabajador",
                solucion: "Revisar cálculo individual de cada concepto"
            });
        }

        // VALIDACIÓN 9: Suma cotizaciones empresa coherente
        const sumaEsperadaEmpresa = 
            resultados.cotizaciones_empresa.cc + 
            resultados.cotizaciones_empresa.atep + 
            resultados.cotizaciones_empresa.desempleo + 
            resultados.cotizaciones_empresa.fogasa + 
            resultados.cotizaciones_empresa.fp + 
            resultados.cotizaciones_empresa.mei;
        
        if (Math.abs(resultados.cotizaciones_empresa.total - sumaEsperadaEmpresa) > 0.01) {
            errores.push({
                tipo: "ERROR",
                codigo: "SUMA_COTIZACIONES_EMPRESA",
                mensaje: "Error en suma cotizaciones empresa",
                solucion: "Revisar cálculo individual de cada concepto"
            });
        }

        return {
            es_valido: errores.length === 0,
            errores: errores,
            warnings: warnings,
            resumen: {
                total_errores: errores.length,
                total_warnings: warnings.length,
                errores_criticos: errores.filter(e => e.tipo === "CRÍTICO").length
            }
        };
    }

    /**
     * Valida rangos específicos según sector hostelería
     * @param {Object} resultados - Resultados del cálculo
     * @returns {Object} Validación sectorial
     */
    validarRangosSectoriales(resultados) {
        const warnings = [];

        // Rangos típicos hostelería Valencia
        const RANGOS_TIPICOS = {
            salario_base_min: 1100,
            salario_base_max: 1500,
            porcentaje_expolio_min: 30,
            porcentaje_expolio_max: 45,
            irpf_tipico_max: 15
        };

        // Validar salario base
        const salarioBase = resultados.conceptos_salariales.salario_base;
        if (salarioBase < RANGOS_TIPICOS.salario_base_min || salarioBase > RANGOS_TIPICOS.salario_base_max) {
            warnings.push({
                tipo: "INFO",
                codigo: "SALARIO_ATIPICO",
                mensaje: `Salario base fuera de rango típico hostelería Valencia (${RANGOS_TIPICOS.salario_base_min}-${RANGOS_TIPICOS.salario_base_max}€)`,
                valor_actual: salarioBase
            });
        }

        // Validar IRPF típico sector
        if (resultados.irpf.tipo_medio > RANGOS_TIPICOS.irpf_tipico_max) {
            warnings.push({
                tipo: "INFO",
                codigo: "IRPF_ALTO_SECTOR",
                mensaje: `IRPF alto para el sector hostelería (>${RANGOS_TIPICOS.irpf_tipico_max}%)`,
                valor_actual: resultados.irpf.tipo_medio
            });
        }

        return {
            warnings: warnings,
            rangos_aplicados: RANGOS_TIPICOS
        };
    }

    /**
     * Genera un informe completo de validación
     * @param {Object} resultados - Resultados del cálculo
     * @returns {Object} Informe completo
     */
    generarInformeCompleto(resultados) {
        const validacionMatematica = this.validarCoherenciaMatematica(resultados);
        const validacionSectorial = this.validarRangosSectoriales(resultados);

        return {
            timestamp: new Date().toISOString(),
            validacion_matematica: validacionMatematica,
            validacion_sectorial: validacionSectorial,
            es_valido_global: validacionMatematica.es_valido,
            resumen_ejecutivo: {
                estado: validacionMatematica.es_valido ? "VÁLIDO" : "INVÁLIDO",
                errores_criticos: validacionMatematica.resumen.errores_criticos,
                total_warnings: validacionMatematica.resumen.total_warnings + validacionSectorial.warnings.length,
                recomendaciones: this._generarRecomendaciones(validacionMatematica, validacionSectorial)
            }
        };
    }

    /**
     * Genera recomendaciones basadas en las validaciones
     * @param {Object} validacionMatematica - Validación matemática
     * @param {Object} validacionSectorial - Validación sectorial
     * @returns {Array} Array de recomendaciones
     * @private
     */
    _generarRecomendaciones(validacionMatematica, validacionSectorial) {
        const recomendaciones = [];

        // Recomendaciones por errores críticos
        if (validacionMatematica.resumen.errores_criticos > 0) {
            recomendaciones.push("URGENTE: Corregir errores críticos antes de usar los resultados");
        }

        // Recomendaciones por warnings
        if (validacionMatematica.resumen.total_warnings > 2) {
            recomendaciones.push("Revisar configuración - múltiples avisos detectados");
        }

        // Recomendaciones sectoriales
        if (validacionSectorial.warnings.length > 0) {
            recomendaciones.push("Verificar datos contra estándares del sector hostelería");
        }

        // Recomendación general si todo está correcto
        if (validacionMatematica.es_valido && validacionMatematica.resumen.total_warnings === 0) {
            recomendaciones.push("✅ Cálculos correctos - Resultados fiables");
        }

        return recomendaciones;
    }

    /**
     * Muestra el estado de validaciones en consola (para debugging)
     * @param {Object} resultadosValidacion - Resultados de validación
     */
    mostrarEstadoValidaciones(resultadosValidacion) {
        console.group("🔍 Estado de Validaciones ACDaño PRO");
        
        if (resultadosValidacion.es_valido) {
            console.log("✅ TODOS LOS TESTS PASADOS - Cálculo correcto");
        } else {
            console.error("❌ ERRORES DETECTADOS:");
            resultadosValidacion.errores.forEach(error => {
                console.error(`  ${error.tipo}: ${error.mensaje}`);
            });
        }

        if (resultadosValidacion.warnings.length > 0) {
            console.warn("⚠️ AVISOS:");
            resultadosValidacion.warnings.forEach(warning => {
                console.warn(`  ${warning.mensaje}`);
            });
        }

        console.groupEnd();
    }
}

export default LogicValidator;