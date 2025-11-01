/**
 * ValidacionesPanel.js
 * Componente para mostrar validaciones matemáticas en tiempo real
 * 
 * Responsabilidades:
 * - Mostrar estado de validaciones críticas
 * - Indicar coherencia matemática
 * - Alertar sobre errores de cálculo
 * - Proporcionar feedback visual inmediato
 */

export class ValidacionesPanel {
    constructor() {
        this.elementos = {
            baseCotizacion: document.getElementById('test_base_cotizacion'),
            baseIrpf: document.getElementById('test_base_irpf'),
            salarioLiquido: document.getElementById('test_salario_liquido'),
            atep: document.getElementById('test_atep')
        };
    }

    /**
     * Inicializa el componente
     */
    inicializar() {
        this._configurarEstadoInicial();
        console.log('✅ ValidacionesPanel inicializado');
    }

    /**
     * Configura el estado inicial de las validaciones
     * @private
     */
    _configurarEstadoInicial() {
        Object.values(this.elementos).forEach(elemento => {
            if (elemento) {
                elemento.classList.add('test-item');
                elemento.innerHTML = '⏳ Esperando datos...';
            }
        });
    }

    /**
     * Muestra las validaciones basadas en los resultados
     * @param {Object} resultados - Resultados del cálculo
     * @param {Object} validacion - Resultado de la validación
     */
    mostrarValidaciones(resultados, validacion) {
        // Test 1: Base Cotización ≤ Salario Bruto
        this._mostrarTest(
            'baseCotizacion',
            resultados.base_cotizacion <= resultados.salario_bruto_total,
            'Base Cotización ≤ Salario Bruto',
            'BASE > BRUTO - ERROR CRÍTICO',
            `Base: ${this._formatearEuro(resultados.base_cotizacion)} | Bruto: ${this._formatearEuro(resultados.salario_bruto_total)}`
        );

        // Test 2: Base IRPF ≥ Base Cotización
        this._mostrarTest(
            'baseIrpf',
            resultados.base_irpf_anual / 12 >= resultados.base_cotizacion,
            'Base IRPF incluye no salariales',
            'Base IRPF incompleta',
            `IRPF mensual: ${this._formatearEuro(resultados.base_irpf_anual / 12)}`
        );

        // Test 3: Salario Líquido < Salario Bruto
        this._mostrarTest(
            'salarioLiquido',
            resultados.salario_liquido < resultados.salario_bruto_total,
            'Salario líquido coherente',
            'Salario líquido ≥ bruto',
            `Líquido: ${this._formatearEuro(resultados.salario_liquido)}`
        );

        // Test 4: AT/EP ≠ 0%
        this._mostrarTest(
            'atep',
            resultados.cotizaciones_empresa.atep > 0,
            `AT/EP 1,25% aplicado (${this._formatearEuro(resultados.cotizaciones_empresa.atep)})`,
            'AT/EP = 0% - Incumple normativa',
            'RD 2064/1995: AT/EP obligatorio'
        );

        // Mostrar resumen general si existe
        if (validacion) {
            this._mostrarResumenValidacion(validacion);
        }
    }

    /**
     * Muestra un test individual
     * @param {string} elemento - ID del elemento
     * @param {boolean} exito - Si el test ha pasado
     * @param {string} mensajeExito - Mensaje cuando pasa
     * @param {string} mensajeError - Mensaje cuando falla
     * @param {string} detalle - Detalle adicional
     * @private
     */
    _mostrarTest(elemento, exito, mensajeExito, mensajeError, detalle = '') {
        const el = this.elementos[elemento];
        if (!el) return;

        // Limpiar clases anteriores
        el.classList.remove('test-success', 'test-error', 'test-warning');
        
        if (exito) {
            el.classList.add('test-success');
            el.innerHTML = `
                <div class="test-content">
                    <span class="test-icon">✅</span>
                    <span class="test-mensaje">${mensajeExito}</span>
                    ${detalle ? `<span class="test-detalle">${detalle}</span>` : ''}
                </div>
            `;
        } else {
            el.classList.add('test-error');
            el.innerHTML = `
                <div class="test-content">
                    <span class="test-icon">❌</span>
                    <span class="test-mensaje">${mensajeError}</span>
                    ${detalle ? `<span class="test-detalle">${detalle}</span>` : ''}
                </div>
            `;
        }
    }

    /**
     * Muestra el resumen general de validación
     * @param {Object} validacion - Resultado de validación completa
     * @private
     */
    _mostrarResumenValidacion(validacion) {
        // Buscar contenedor de resumen o crearlo
        let resumen = document.getElementById('validacion_resumen');
        if (!resumen) {
            resumen = document.createElement('div');
            resumen.id = 'validacion_resumen';
            resumen.className = 'validacion-resumen';
            
            // Insertar después del último test
            const panel = document.querySelector('.validation-panel');
            if (panel) {
                panel.appendChild(resumen);
            }
        }

        let claseEstado = 'exito';
        let iconoEstado = '✅';
        let mensajeEstado = 'Todos los tests pasados';

        if (!validacion.es_valido) {
            claseEstado = 'error';
            iconoEstado = '❌';
            mensajeEstado = `${validacion.resumen.errores_criticos} errores críticos detectados`;
        } else if (validacion.warnings.length > 0) {
            claseEstado = 'warning';
            iconoEstado = '⚠️';
            mensajeEstado = `${validacion.warnings.length} avisos - revisa configuración`;
        }

        resumen.className = `validacion-resumen ${claseEstado}`;
        resumen.innerHTML = `
            <div class="resumen-content">
                <span class="resumen-icono">${iconoEstado}</span>
                <span class="resumen-mensaje">${mensajeEstado}</span>
                <span class="resumen-timestamp">${new Date().toLocaleTimeString('es-ES')}</span>
            </div>
        `;
    }

    /**
     * Muestra estado de carga
     */
    mostrarCargando() {
        Object.entries(this.elementos).forEach(([key, elemento]) => {
            if (elemento) {
                elemento.classList.remove('test-success', 'test-error', 'test-warning');
                elemento.classList.add('test-loading');
                elemento.innerHTML = '⏳ Validando...';
            }
        });
    }

    /**
     * Muestra error en las validaciones
     * @param {string} mensaje - Mensaje de error
     */
    mostrarError(mensaje) {
        Object.values(this.elementos).forEach(elemento => {
            if (elemento) {
                elemento.classList.remove('test-success', 'test-loading', 'test-warning');
                elemento.classList.add('test-error');
                elemento.innerHTML = `❌ Error: ${mensaje}`;
            }
        });
    }

    /**
     * Reinicia el panel a estado inicial
     */
    reiniciar() {
        this._configurarEstadoInicial();
        
        // Limpiar resumen si existe
        const resumen = document.getElementById('validacion_resumen');
        if (resumen) {
            resumen.remove();
        }
    }

    /**
     * Ejecuta una validación específica y muestra el resultado
     * @param {string} tipo - Tipo de validación
     * @param {boolean} resultado - Resultado de la validación
     * @param {string} mensaje - Mensaje explicativo
     */
    mostrarValidacionEspecifica(tipo, resultado, mensaje) {
        const elemento = this.elementos[tipo];
        if (!elemento) return;

        elemento.classList.remove('test-success', 'test-error', 'test-warning', 'test-loading');
        
        if (resultado) {
            elemento.classList.add('test-success');
            elemento.innerHTML = `✅ ${mensaje}`;
        } else {
            elemento.classList.add('test-error');
            elemento.innerHTML = `❌ ${mensaje}`;
        }
    }

    /**
     * Añade una validación personalizada
     * @param {string} id - ID del elemento
     * @param {string} nombre - Nombre de la validación
     * @param {Function} funcion - Función de validación
     */
    anadirValidacionPersonalizada(id, nombre, funcion) {
        // Crear elemento si no existe
        let elemento = document.getElementById(id);
        if (!elemento) {
            elemento = document.createElement('div');
            elemento.id = id;
            elemento.className = 'test-item';
            
            const panel = document.querySelector('.validation-panel');
            if (panel) {
                panel.appendChild(elemento);
            }
            
            this.elementos[id] = elemento;
        }

        // Ejecutar validación personalizada
        try {
            const resultado = funcion();
            this.mostrarValidacionEspecifica(id, resultado.exito, resultado.mensaje);
        } catch (error) {
            this.mostrarValidacionEspecifica(id, false, `Error en ${nombre}: ${error.message}`);
        }
    }

    /**
     * Obtiene el estado actual de todas las validaciones
     * @returns {Object} Estado de validaciones
     */
    obtenerEstado() {
        const estado = {};
        
        Object.entries(this.elementos).forEach(([key, elemento]) => {
            if (elemento) {
                const clases = elemento.classList;
                estado[key] = {
                    exito: clases.contains('test-success'),
                    error: clases.contains('test-error'),
                    warning: clases.contains('test-warning'),
                    cargando: clases.contains('test-loading'),
                    mensaje: elemento.textContent
                };
            }
        });
        
        return {
            tests: estado,
            timestamp: new Date().toISOString(),
            resumen: this._generarResumenEstado(estado)
        };
    }

    /**
     * Genera resumen del estado actual
     * @param {Object} estado - Estado de validaciones
     * @returns {Object} Resumen del estado
     * @private
     */
    _generarResumenEstado(estado) {
        const tests = Object.values(estado);
        const exitosos = tests.filter(t => t.exito).length;
        const errores = tests.filter(t => t.error).length;
        const warnings = tests.filter(t => t.warning).length;
        const total = tests.length;

        return {
            total: total,
            exitosos: exitosos,
            errores: errores,
            warnings: warnings,
            porcentaje_exito: total > 0 ? (exitosos / total) * 100 : 0,
            estado_general: errores > 0 ? 'ERROR' : warnings > 0 ? 'WARNING' : 'EXITO'
        };
    }

    /**
     * Formatea cantidad en euros
     * @param {number} cantidad - Cantidad a formatear
     * @returns {string} Cantidad formateada
     * @private
     */
    _formatearEuro(cantidad) {
        return cantidad.toFixed(2) + '€';
    }
}

export default ValidacionesPanel;