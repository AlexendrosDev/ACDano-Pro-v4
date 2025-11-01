/**
 * CotizacionCalculator.js
 * Calculador especializado para cotizaciones de Seguridad Social
 * 
 * Responsabilidades:
 * - Cálculo cotizaciones trabajador (6,48%)
 * - Cálculo cotizaciones empresa (32,32%)
 * - Validación AT/EP obligatorio 1,25%
 */

import SeguridadSocial2025 from '../models/SeguridadSocial2025.js';

export class CotizacionCalculator {
    /**
     * Calcula las cotizaciones del trabajador
     * @param {number} baseCotizacion - Base de cotización (con topes aplicados)
     * @returns {Object} Cotizaciones detalladas del trabajador
     */
    calcularCotizacionesTrabajador(baseCotizacion) {
        const cotizacionesTrabajador = {
            cc: 0,          // Contingencias Comunes
            desempleo: 0,   // Desempleo
            fp: 0,          // Formación Profesional
            mei: 0,         // Mecanismo Equidad Intergeneracional
            total: 0
        };

        // Calcular cada concepto
        cotizacionesTrabajador.cc = 
            baseCotizacion * SeguridadSocial2025.TIPOS_TRABAJADOR.CC / 100;
        
        cotizacionesTrabajador.desempleo = 
            baseCotizacion * SeguridadSocial2025.TIPOS_TRABAJADOR.DESEMPLEO / 100;
        
        cotizacionesTrabajador.fp = 
            baseCotizacion * SeguridadSocial2025.TIPOS_TRABAJADOR.FP / 100;
        
        cotizacionesTrabajador.mei = 
            baseCotizacion * SeguridadSocial2025.TIPOS_TRABAJADOR.MEI / 100;

        // Calcular total
        cotizacionesTrabajador.total = this._sumarTodos(cotizacionesTrabajador);

        return cotizacionesTrabajador;
    }

    /**
     * Calcula las cotizaciones de la empresa
     * @param {number} baseCotizacion - Base de cotización (con topes aplicados)
     * @returns {Object} Cotizaciones detalladas de la empresa
     */
    calcularCotizacionesEmpresa(baseCotizacion) {
        const cotizacionesEmpresa = {
            cc: 0,          // Contingencias Comunes
            atep: 0,        // AT/EP - ⚠️ CRÍTICO: Nunca 0%
            desempleo: 0,   // Desempleo
            fogasa: 0,      // FOGASA
            fp: 0,          // Formación Profesional
            mei: 0,         // Mecanismo Equidad Intergeneracional
            total: 0
        };

        // Calcular cada concepto
        cotizacionesEmpresa.cc = 
            baseCotizacion * SeguridadSocial2025.TIPOS_EMPRESA.CC / 100;
        
        // ⚠️ VALIDACIÓN CRÍTICA: AT/EP NUNCA 0%
        cotizacionesEmpresa.atep = 
            baseCotizacion * SeguridadSocial2025.TIPOS_EMPRESA.ATEP / 100;
        
        cotizacionesEmpresa.desempleo = 
            baseCotizacion * SeguridadSocial2025.TIPOS_EMPRESA.DESEMPLEO / 100;
        
        cotizacionesEmpresa.fogasa = 
            baseCotizacion * SeguridadSocial2025.TIPOS_EMPRESA.FOGASA / 100;
        
        cotizacionesEmpresa.fp = 
            baseCotizacion * SeguridadSocial2025.TIPOS_EMPRESA.FP / 100;
        
        cotizacionesEmpresa.mei = 
            baseCotizacion * SeguridadSocial2025.TIPOS_EMPRESA.MEI / 100;

        // Calcular total
        cotizacionesEmpresa.total = this._sumarTodos(cotizacionesEmpresa);

        return cotizacionesEmpresa;
    }

    /**
     * Calcula el coste total para la empresa (salario + cotizaciones empresa)
     * @param {number} salarioBrutoTotal - Salario bruto total
     * @param {Object} cotizacionesEmpresa - Cotizaciones de la empresa
     * @returns {number} Coste total empresa
     */
    calcularCosteTotalEmpresa(salarioBrutoTotal, cotizacionesEmpresa) {
        return salarioBrutoTotal + cotizacionesEmpresa.total;
    }

    /**
     * Calcula el expolio fiscal total (cotizaciones trabajador + empresa)
     * @param {Object} cotizacionesTrabajador - Cotizaciones trabajador
     * @param {Object} cotizacionesEmpresa - Cotizaciones empresa
     * @returns {number} Expolio total en euros
     */
    calcularExpolioTotal(cotizacionesTrabajador, cotizacionesEmpresa) {
        return cotizacionesTrabajador.total + cotizacionesEmpresa.total;
    }

    /**
     * Calcula el porcentaje de expolio fiscal
     * @param {number} expolioTotal - Expolio total en euros
     * @param {number} costeTotalEmpresa - Coste total para la empresa
     * @returns {number} Porcentaje de expolio
     */
    calcularPorcentajeExpolio(expolioTotal, costeTotalEmpresa) {
        if (costeTotalEmpresa === 0) return 0;
        return (expolioTotal / costeTotalEmpresa) * 100;
    }

    /**
     * Valida que las cotizaciones sean coherentes
     * @param {Object} cotizacionesTrabajador - Cotizaciones trabajador
     * @param {Object} cotizacionesEmpresa - Cotizaciones empresa
     * @returns {Object} Resultado de validación
     */
    validarCotizaciones(cotizacionesTrabajador, cotizacionesEmpresa) {
        const errores = [];
        const warnings = [];

        // VALIDACIÓN CRÍTICA: AT/EP nunca 0%
        if (cotizacionesEmpresa.atep === 0) {
            errores.push({
                tipo: "CRÍTICO",
                codigo: "ATEP_ZERO",
                mensaje: "AT/EP = 0% incumple RD 2064/1995",
                solucion: "Aplicar AT/EP 1,25% obligatorio"
            });
        }

        // Validar rangos razonables
        if (cotizacionesTrabajador.total < 0 || cotizacionesEmpresa.total < 0) {
            errores.push({
                tipo: "ERROR",
                codigo: "COTIZACIONES_NEGATIVAS",
                mensaje: "Las cotizaciones no pueden ser negativas",
                solucion: "Revisar base de cotización"
            });
        }

        // Warning si los porcentajes no coinciden con los esperados
        const totalEsperadoTrabajador = SeguridadSocial2025.getTotalTrabajador();
        const totalEsperadoEmpresa = SeguridadSocial2025.getTotalEmpresa();

        const tolerancia = 0.01; // 0.01% de tolerancia por redondeos
        
        if (Math.abs(cotizacionesTrabajador.total - (cotizacionesTrabajador.cc + cotizacionesTrabajador.desempleo + cotizacionesTrabajador.fp + cotizacionesTrabajador.mei)) > tolerancia) {
            warnings.push({
                tipo: "WARNING",
                codigo: "SUMA_TRABAJADOR_INCORRECTA",
                mensaje: "La suma de cotizaciones trabajador no coincide con el total"
            });
        }

        return {
            valido: errores.length === 0,
            errores: errores,
            warnings: warnings
        };
    }

    /**
     * Suma todos los valores numéricos de un objeto
     * @param {Object} objeto - Objeto con valores numéricos
     * @returns {number} Suma total
     * @private
     */
    _sumarTodos(objeto) {
        let suma = 0;
        for (const clave in objeto) {
            if (typeof objeto[clave] === 'number' && clave !== 'total') {
                suma += objeto[clave];
            }
        }
        return suma;
    }

    /**
     * Obtiene un resumen de cotizaciones para debugging
     * @param {Object} cotizacionesTrabajador - Cotizaciones trabajador
     * @param {Object} cotizacionesEmpresa - Cotizaciones empresa
     * @returns {Object} Resumen detallado
     */
    obtenerResumen(cotizacionesTrabajador, cotizacionesEmpresa) {
        const expolioTotal = this.calcularExpolioTotal(cotizacionesTrabajador, cotizacionesEmpresa);
        
        return {
            trabajador: cotizacionesTrabajador,
            empresa: cotizacionesEmpresa,
            expolio_total: expolioTotal,
            porcentajes: {
                trabajador: SeguridadSocial2025.getTotalTrabajador(),
                empresa: SeguridadSocial2025.getTotalEmpresa(),
                total: SeguridadSocial2025.getTotalTrabajador() + SeguridadSocial2025.getTotalEmpresa()
            }
        };
    }
}

export default CotizacionCalculator;