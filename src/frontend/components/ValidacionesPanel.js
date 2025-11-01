/**
 * ValidacionesPanel.js
 * Componente para mostrar validaciones matemáticas en tiempo real
 * 
 * Responsabilidades:
 * - Mostrar estado de validaciones críticas
 * - Indicar coherencia matemática
 * - Alertar sobre errores de cálculo
 * - Proporcionar feedback visual inmediato
 * - Mostrar avisos sectoriales (horas extra, nocturnidad, festivos)
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
    mostrarValidaciones(resultados, validacion = null) {
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
            this._mostrarAvisosSectoriales(validacion);
        }
    }

    /**
     * Muestra avisos sectoriales si existen
     * @param {Object} validacion - Resultado de validación completa
     * @private
     */
    _mostrarAvisosSectoriales(validacion) {
        // Buscar o crear contenedor de avisos sectoriales
        let avisosSector = document.getElementById('avisos_sectoriales');
        
        if (!avisosSector) {
            avisosSector = document.createElement('div');
            avisosSector.id = 'avisos_sectoriales';
            avisosSector.className = 'avisos-sectoriales';
            
            const panel = document.querySelector('.validation-panel');
            if (panel) {
                panel.appendChild(avisosSector);
            }
        }

        // Filtrar solo warnings sectoriales (de SectorValidator)
        const warningsSectoriales = validacion.warnings.filter(w => 
            ['TOPE_APLICADO', 'HORAS_EXTRA_ALTAS', 'NOCTURNIDAD_ALTA', 'FESTIVOS_ELEVADOS'].includes(w.codigo)
        );

        if (warningsSectoriales.length > 0) {
            let html = '<h4 style="margin-top: var(--space-16); color: var(--color-warning);">⚠️ Avisos Sectoriales</h4>';
            
            warningsSectoriales.forEach(warning => {
                html += `<div class="test-item test-warning">
                    <span class="test-icon">⚠️</span>
                    <span class="test-mensaje">${warning.mensaje}</span>
                </div>`;
            });
            
            avisosSector.innerHTML = html;
            avisosSector.style.display = 'block';
        } else {
            avisosSector.style.display = 'none';
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
        
        // Limpiar avisos sectoriales si existen
        const avisos = document.getElementById('avisos_sectoriales');
        if (avisos) {
            avisos.remove();
        }
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