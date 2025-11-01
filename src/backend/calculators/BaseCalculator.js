/**
 * BaseCalculator.js
 * Calculador base para conceptos salariales, no salariales y bases de cálculo
 * 
 * Responsabilidades:
 * - Cálculo de conceptos salariales (que cotizan)
 * - Cálculo de conceptos no salariales (que no cotizan pero sí tributan)
 * - Determinación de bases de cotización e IRPF
 */

import ConvenioValencia from '../models/ConvenioValencia.js';
import SeguridadSocial2025 from '../models/SeguridadSocial2025.js';

export class BaseCalculator {
    /**
     * Calcula conceptos salariales (que COTIZAN a la Seguridad Social)
     * @param {Object} datosTrabajador - Datos del trabajador
     * @returns {Object} Conceptos salariales detallados
     */
    calcularConceptosSalariales(datosTrabajador) {
        const conceptosSalariales = {
            salario_base: 0,
            prorrata_pagas: 0,
            plus_formacion: 0,
            manutencion: 0,
            total: 0
        };

        // PASO 1: Salario base según convenio
        conceptosSalariales.salario_base = ConvenioValencia.obtenerSalarioBase(
            datosTrabajador.tabla, 
            datosTrabajador.nivel
        );

        // PASO 2: Prorrata pagas extraordinarias (3 pagas anuales / 12 meses)
        conceptosSalariales.prorrata_pagas = 
            conceptosSalariales.salario_base * ConvenioValencia.NUM_PAGAS_EXTRAORDINARIAS / 12;

        // PASO 3: Plus formación (SALARIAL - cotiza)
        if (datosTrabajador.aplica_plus_formacion) {
            conceptosSalariales.plus_formacion = ConvenioValencia.COMPLEMENTOS.PLUS_FORMACION;
        }

        // PASO 4: Manutención (SALARIAL - cotiza)
        if (datosTrabajador.aplica_manutencion) {
            if (datosTrabajador.es_hotel) {
                conceptosSalariales.manutencion = ConvenioValencia.COMPLEMENTOS.ANEXO_IV_2.manutencion;
            } else {
                conceptosSalariales.manutencion = ConvenioValencia.COMPLEMENTOS.ANEXO_IV_1.manutencion;
            }
        }

        // PASO 5: Calcular total
        conceptosSalariales.total = this._sumarTodos(conceptosSalariales);

        return conceptosSalariales;
    }

    /**
     * Calcula conceptos no salariales (que NO COTIZAN pero SÍ TRIBUTAN)
     * @param {Object} datosTrabajador - Datos del trabajador
     * @returns {Object} Conceptos no salariales detallados
     */
    calcularConceptosNoSalariales(datosTrabajador) {
        const conceptosNoSalariales = {
            plus_transporte: 0,
            vestuario: 0,
            otros: 0,
            total: 0
        };

        // PASO 1: Plus transporte (NO SALARIAL - no cotiza, sí tributa IRPF)
        if (datosTrabajador.aplica_plus_transporte) {
            const anexo = datosTrabajador.es_hotel ? 
                ConvenioValencia.COMPLEMENTOS.ANEXO_IV_2 : 
                ConvenioValencia.COMPLEMENTOS.ANEXO_IV_1;
            
            if (datosTrabajador.tipo_jornada === "partida") {
                conceptosNoSalariales.plus_transporte = anexo.plus_transporte_partida;
            } else {
                conceptosNoSalariales.plus_transporte = anexo.plus_transporte_continuada;
            }
        }

        // PASO 2: Vestuario (NO SALARIAL)
        if (datosTrabajador.aplica_vestuario) {
            const categoria = datosTrabajador.categoria.includes('cocinero') ? 'cocineros' : 'camareros';
            conceptosNoSalariales.vestuario = ConvenioValencia.COMPLEMENTOS.VESTUARIO[categoria].total;
        }

        // PASO 3: Calcular total
        conceptosNoSalariales.total = this._sumarTodos(conceptosNoSalariales);

        return conceptosNoSalariales;
    }

    /**
     * Calcula el salario bruto total (todos los conceptos positivos)
     * @param {Object} conceptosSalariales - Conceptos salariales
     * @param {Object} conceptosNoSalariales - Conceptos no salariales
     * @returns {number} Salario bruto total
     */
    calcularSalarioBrutoTotal(conceptosSalariales, conceptosNoSalariales) {
        return conceptosSalariales.total + conceptosNoSalariales.total;
    }

    /**
     * Calcula la base de cotización (solo conceptos salariales con topes)
     * @param {Object} conceptosSalariales - Conceptos salariales
     * @returns {number} Base de cotización con topes aplicados
     */
    calcularBaseCotizacion(conceptosSalariales) {
        const baseCotizacion = conceptosSalariales.total;
        return SeguridadSocial2025.aplicarTopes(baseCotizacion);
    }

    /**
     * Calcula la base IRPF anual (todo el salario bruto - todo tributa)
     * @param {number} salarioBrutoTotal - Salario bruto mensual total
     * @returns {number} Base IRPF anual
     */
    calcularBaseIRPF(salarioBrutoTotal) {
        return salarioBrutoTotal * 12;
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
     * Valida que los datos del trabajador sean coherentes
     * @param {Object} datosTrabajador - Datos a validar
     * @returns {Object} Resultado de validación
     */
    validarDatosTrabajador(datosTrabajador) {
        const errores = [];

        // Validar tabla y nivel
        if (!ConvenioValencia.esTablaValida(datosTrabajador.tabla)) {
            errores.push(`Tabla inválida: ${datosTrabajador.tabla}`);
        }
        if (!ConvenioValencia.esNivelValido(datosTrabajador.nivel)) {
            errores.push(`Nivel inválido: ${datosTrabajador.nivel}`);
        }

        // Validar tipo de jornada
        if (!['partida', 'continuada'].includes(datosTrabajador.tipo_jornada)) {
            errores.push(`Tipo jornada inválido: ${datosTrabajador.tipo_jornada}`);
        }

        return {
            valido: errores.length === 0,
            errores: errores
        };
    }
}

export default BaseCalculator;