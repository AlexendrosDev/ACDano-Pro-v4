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
     * @param {Object} convenio - Convenio a aplicar (opcional, fallback ConvenioValencia)
     * @returns {Object} Conceptos salariales detallados
     */
    calcularConceptosSalariales(datosTrabajador, convenio = ConvenioValencia) {
        const conceptosSalariales = {
            salario_base: 0,
            prorrata_pagas: 0,
            plus_formacion: 0,
            manutencion: 0,
            total: 0
        };

        // PASO 1: Salario base según convenio
        conceptosSalariales.salario_base = convenio.obtenerSalarioBase(
            datosTrabajador.tabla, 
            datosTrabajador.nivel
        );

        // PASO 2: Prorrata pagas extraordinarias
        const numPagas = convenio.NUM_PAGAS_EXTRAORDINARIAS || ConvenioValencia.NUM_PAGAS_EXTRAORDINARIAS;
        conceptosSalariales.prorrata_pagas = conceptosSalariales.salario_base * numPagas / 12;

        // PASO 3: Plus formación (SALARIAL - cotiza)
        if (datosTrabajador.aplica_plus_formacion) {
            conceptosSalariales.plus_formacion = convenio.COMPLEMENTOS?.PLUS_FORMACION || ConvenioValencia.COMPLEMENTOS.PLUS_FORMACION;
        }

        // PASO 4: Manutención (SALARIAL - cotiza)
        if (datosTrabajador.aplica_manutencion) {
            if (convenio.COMPLEMENTOS?.MANUTENCION) {
                // Sector Limpieza u otros con manutención simple
                conceptosSalariales.manutencion = convenio.COMPLEMENTOS.MANUTENCION;
            } else {
                // Sector Hostelería con anexos
                const anexo = datosTrabajador.es_hotel ? 
                    ConvenioValencia.COMPLEMENTOS.ANEXO_IV_2 : 
                    ConvenioValencia.COMPLEMENTOS.ANEXO_IV_1;
                conceptosSalariales.manutencion = anexo.manutencion;
            }
        }

        // PASO 5: Calcular total
        conceptosSalariales.total = this._sumarTodos(conceptosSalariales);

        return conceptosSalariales;
    }

    /**
     * Calcula conceptos no salariales (que NO COTIZAN pero SÍ TRIBUTAN)
     * @param {Object} datosTrabajador - Datos del trabajador
     * @param {Object} convenio - Convenio a aplicar (opcional, fallback ConvenioValencia)
     * @returns {Object} Conceptos no salariales detallados
     */
    calcularConceptosNoSalariales(datosTrabajador, convenio = ConvenioValencia) {
        const conceptosNoSalariales = {
            plus_transporte: 0,
            vestuario: 0,
            otros: 0,
            total: 0
        };

        // PASO 1: Plus transporte (NO SALARIAL - no cotiza, sí tributa IRPF)
        if (datosTrabajador.aplica_plus_transporte) {
            if (convenio.COMPLEMENTOS?.PLUS_TRANSPORTE) {
                // Sector con plus transporte simple o urbano/interurbano
                const plusTransporte = convenio.COMPLEMENTOS.PLUS_TRANSPORTE;
                if (typeof plusTransporte === 'object' && plusTransporte.URBANO) {
                    conceptosNoSalariales.plus_transporte = datosTrabajador.transporte_urbano ? 
                        plusTransporte.URBANO : plusTransporte.INTERURBANO;
                } else {
                    conceptosNoSalariales.plus_transporte = plusTransporte;
                }
            } else {
                // Fallback hostelería Valencia con anexos
                const anexo = datosTrabajador.es_hotel ? 
                    ConvenioValencia.COMPLEMENTOS.ANEXO_IV_2 : 
                    ConvenioValencia.COMPLEMENTOS.ANEXO_IV_1;
                
                conceptosNoSalariales.plus_transporte = datosTrabajador.tipo_jornada === "partida" ?
                    anexo.plus_transporte_partida : anexo.plus_transporte_continuada;
            }
        }

        // PASO 2: Vestuario/EPI (NO SALARIAL)
        if (datosTrabajador.aplica_vestuario || datosTrabajador.elementos_uniforme) {
            if (convenio.COMPLEMENTOS?.EPI?.ELEMENTOS) {
                // Sector Limpieza con EPI por elementos
                const elementos = datosTrabajador.elementos_epi || datosTrabajador.elementos_uniforme || [];
                conceptosNoSalariales.vestuario = elementos.reduce((sum, elemento) => {
                    return sum + (convenio.COMPLEMENTOS.EPI.ELEMENTOS[elemento]?.precio || 0);
                }, 0);
            } else if (convenio.COMPLEMENTOS?.VESTUARIO?.ELEMENTOS) {
                // Sector Hostelería con vestuario por elementos
                const elementos = datosTrabajador.elementos_uniforme || [];
                conceptosNoSalariales.vestuario = elementos.reduce((sum, elemento) => {
                    return sum + (convenio.COMPLEMENTOS.VESTUARIO.ELEMENTOS[elemento]?.precio || 0);
                }, 0);
            } else {
                // Fallback hostelería Valencia por categoría
                const categoria = datosTrabajador.categoria.includes('cocinero') ? 'cocineros' : 'camareros';
                conceptosNoSalariales.vestuario = ConvenioValencia.COMPLEMENTOS.VESTUARIO[categoria].total;
            }
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
     * @param {Object} convenio - Convenio a usar para validación (opcional)
     * @returns {Object} Resultado de validación
     */
    validarDatosTrabajador(datosTrabajador, convenio = ConvenioValencia) {
        const errores = [];

        // Validar tabla y nivel
        if (!convenio.esTablaValida(datosTrabajador.tabla)) {
            errores.push(`Tabla inválida: ${datosTrabajador.tabla}`);
        }
        if (!convenio.esNivelValido(datosTrabajador.nivel)) {
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