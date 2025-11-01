/**
 * ResultadosNomina.js
 * Componente para visualización de resultados de cálculo de nómina
 * 
 * Responsabilidades:
 * - Mostrar resultados detallados del cálculo
 * - Formatear valores monetarios
 * - Gestionar animaciones de actualización
 * - Proporcionar desglose completo
 */

export class ResultadosNomina {
    constructor() {
        this.contenedor = document.getElementById('resultados_content');
        this.animacionesActivas = false;
    }

    /**
     * Inicializa el componente
     */
    inicializar() {
        this._configurarContenedorPrincipal();
        console.log('📊 ResultadosNomina inicializado');
    }

    /**
     * Configura el contenedor principal
     * @private
     */
    _configurarContenedorPrincipal() {
        if (!this.contenedor) {
            console.error('Contenedor de resultados no encontrado');
            return;
        }
        
        // Añadir clase para estilos
        this.contenedor.classList.add('resultados-nomina');
    }

    /**
     * Muestra los resultados completos del cálculo
     * @param {Object} resultados - Resultados del cálculo
     * @param {Object} validacion - Validación del cálculo
     */
    mostrarResultados(resultados, validacion = null) {
        if (!this.contenedor) return;

        // Animar entrada si está habilitado
        if (this.animacionesActivas) {
            this.contenedor.style.opacity = '0';
        }

        // Generar HTML completo
        this.contenedor.innerHTML = this._generarHTMLResultados(resultados, validacion);

        // Animar entrada
        if (this.animacionesActivas) {
            setTimeout(() => {
                this.contenedor.style.transition = 'opacity 0.3s ease';
                this.contenedor.style.opacity = '1';
            }, 50);
        }

        // Mostrar sección de resultados
        this._mostrarSeccionResultados();
    }

    /**
     * Genera el HTML completo de los resultados
     * @param {Object} resultados - Resultados del cálculo
     * @param {Object} validacion - Validación del cálculo
     * @returns {string} HTML generado
     * @private
     */
    _generarHTMLResultados(resultados, validacion) {
        return `
            <!-- Resumen Principal -->
            <div class="resumen-principal">
                <div class="result-item destacado">
                    <span class="result-label">Salario Líquido</span>
                    <span class="result-value positive grande">${this.formatearEuro(resultados.salario_liquido)}</span>
                </div>
            </div>

            <!-- Desglose Detallado -->
            <div class="desglose-detallado">
                <h4>Desglose Completo</h4>
                
                <!-- Ingresos -->
                <div class="seccion-ingresos">
                    <h5>💰 Ingresos</h5>
                    <div class="result-item">
                        <span class="result-label">Salario Base</span>
                        <span class="result-value">${this.formatearEuro(resultados.conceptos_salariales.salario_base)}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Prorrata Pagas Extra</span>
                        <span class="result-value">${this.formatearEuro(resultados.conceptos_salariales.prorrata_pagas)}</span>
                    </div>
                    ${resultados.conceptos_salariales.plus_formacion > 0 ? `
                    <div class="result-item">
                        <span class="result-label">Plus Formación</span>
                        <span class="result-value">${this.formatearEuro(resultados.conceptos_salariales.plus_formacion)}</span>
                    </div>
                    ` : ''}
                    ${resultados.conceptos_salariales.manutencion > 0 ? `
                    <div class="result-item">
                        <span class="result-label">Manutención</span>
                        <span class="result-value">${this.formatearEuro(resultados.conceptos_salariales.manutencion)}</span>
                    </div>
                    ` : ''}
                    ${resultados.conceptos_no_salariales.plus_transporte > 0 ? `
                    <div class="result-item">
                        <span class="result-label">Plus Transporte</span>
                        <span class="result-value">${this.formatearEuro(resultados.conceptos_no_salariales.plus_transporte)}</span>
                    </div>
                    ` : ''}
                    ${resultados.conceptos_no_salariales.vestuario > 0 ? `
                    <div class="result-item">
                        <span class="result-label">Vestuario</span>
                        <span class="result-value">${this.formatearEuro(resultados.conceptos_no_salariales.vestuario)}</span>
                    </div>
                    ` : ''}
                    <div class="result-item total">
                        <span class="result-label">Salario Bruto Total</span>
                        <span class="result-value">${this.formatearEuro(resultados.salario_bruto_total)}</span>
                    </div>
                </div>

                <!-- Deducciones -->
                <div class="seccion-deducciones">
                    <h5>📉 Deducciones</h5>
                    
                    <!-- Seguridad Social Trabajador -->
                    <div class="subseccion">
                        <h6>Seguridad Social Trabajador (6,48%)</h6>
                        <div class="result-item">
                            <span class="result-label">Contingencias Comunes</span>
                            <span class="result-value negative">-${this.formatearEuro(resultados.cotizaciones_trabajador.cc)}</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Desempleo</span>
                            <span class="result-value negative">-${this.formatearEuro(resultados.cotizaciones_trabajador.desempleo)}</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Formación Profesional</span>
                            <span class="result-value negative">-${this.formatearEuro(resultados.cotizaciones_trabajador.fp)}</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">M.E.I.</span>
                            <span class="result-value negative">-${this.formatearEuro(resultados.cotizaciones_trabajador.mei)}</span>
                        </div>
                        <div class="result-item subtotal">
                            <span class="result-label">Total SS Trabajador</span>
                            <span class="result-value negative">-${this.formatearEuro(resultados.cotizaciones_trabajador.total)}</span>
                        </div>
                    </div>

                    <!-- IRPF -->
                    <div class="subseccion">
                        <h6>IRPF Valencia (${resultados.irpf.tipo_medio.toFixed(2)}%)</h6>
                        <div class="result-item">
                            <span class="result-label">Retención IRPF</span>
                            <span class="result-value negative">-${this.formatearEuro(resultados.irpf.retencion_mensual)}</span>
                        </div>
                    </div>

                    <div class="result-item total">
                        <span class="result-label">Total Deducciones</span>
                        <span class="result-value negative">-${this.formatearEuro(resultados.total_deducciones)}</span>
                    </div>
                </div>
            </div>

            <!-- Información Empresa -->
            <div class="info-empresa">
                <h4>🏢 Coste para la Empresa</h4>
                <div class="result-item">
                    <span class="result-label">Salario Bruto</span>
                    <span class="result-value">${this.formatearEuro(resultados.salario_bruto_total)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Cotizaciones Empresa (32,32%)</span>
                    <span class="result-value negative">-${this.formatearEuro(resultados.cotizaciones_empresa.total)}</span>
                </div>
                <div class="result-item total destacado">
                    <span class="result-label">Coste Total Empresa</span>
                    <span class="result-value">${this.formatearEuro(resultados.coste_total_empresa)}</span>
                </div>
            </div>

            <!-- Expolio Fiscal -->
            <div class="expolio-fiscal">
                <h4>⚠️ Expolio Fiscal Total</h4>
                <div class="result-item">
                    <span class="result-label">SS Trabajador + Empresa</span>
                    <span class="result-value negative">-${this.formatearEuro(resultados.expolio_total)}</span>
                </div>
                <div class="result-item destacado">
                    <span class="result-label">Porcentaje del Coste Total</span>
                    <span class="result-value ${this._getClaseExpolio(resultados.porcentaje_expolio)}">
                        ${resultados.porcentaje_expolio.toFixed(1)}%
                    </span>
                </div>
            </div>

            ${validacion ? this._generarHTMLValidacion(validacion) : ''}
        `;
    }

    /**
     * Genera HTML para la sección de validación
     * @param {Object} validacion - Resultado de validación
     * @returns {string} HTML de validación
     * @private
     */
    _generarHTMLValidacion(validacion) {
        if (validacion.es_valido && validacion.warnings.length === 0) {
            return `
                <div class="validacion-estado exito">
                    <h4>✅ Validación</h4>
                    <p>Cálculos correctos - Resultados fiables</p>
                </div>
            `;
        }

        let html = '<div class="validacion-estado">';
        
        if (!validacion.es_valido) {
            html += '<h4>❌ Errores Detectados</h4>';
            validacion.errores.forEach(error => {
                html += `<div class="error">${error.tipo}: ${error.mensaje}</div>`;
            });
        }

        if (validacion.warnings.length > 0) {
            html += '<h4>⚠️ Avisos</h4>';
            validacion.warnings.forEach(warning => {
                html += `<div class="warning">${warning.mensaje}</div>`;
            });
        }

        html += '</div>';
        return html;
    }

    /**
     * Muestra mensaje de estado (calculando, error, etc.)
     * @param {string} mensaje - Mensaje a mostrar
     * @param {string} tipo - Tipo de mensaje (info, error, loading)
     */
    mostrarEstado(mensaje, tipo = 'info') {
        if (!this.contenedor) return;

        const claseIcono = {
            'info': '📊',
            'error': '❌',
            'loading': '⏳',
            'success': '✅'
        };

        this.contenedor.innerHTML = `
            <div class="estado-mensaje ${tipo}">
                <span class="icono">${claseIcono[tipo] || '📊'}</span>
                <span class="mensaje">${mensaje}</span>
            </div>
        `;
    }

    /**
     * Muestra mensaje de error
     * @param {string} mensaje - Mensaje de error
     */
    mostrarError(mensaje) {
        this.mostrarEstado(mensaje, 'error');
        this._ocultarSeccionResultados();
    }

    /**
     * Muestra estado de carga
     */
    mostrarCargando() {
        this.mostrarEstado('Calculando nómina...', 'loading');
    }

    /**
     * Limpia los resultados
     */
    limpiar() {
        if (this.contenedor) {
            this.contenedor.innerHTML = `
                <div class="estado-inicial">
                    <p class="text-center" style="color: var(--color-text-secondary); font-style: italic;">
                        Completa los datos y presiona "Calcular Nómina" para ver los resultados
                    </p>
                </div>
            `;
        }
        this._ocultarSeccionResultados();
    }

    /**
     * Formatea cantidad en euros
     * @param {number} cantidad - Cantidad a formatear
     * @returns {string} Cantidad formateada
     */
    formatearEuro(cantidad) {
        return cantidad.toFixed(2) + '€';
    }

    /**
     * Formatea porcentaje
     * @param {number} porcentaje - Porcentaje a formatear
     * @returns {string} Porcentaje formateado
     */
    formatearPorcentaje(porcentaje) {
        return porcentaje.toFixed(1) + '%';
    }

    /**
     * Obtiene clase CSS según nivel de expolio
     * @param {number} porcentaje - Porcentaje de expolio
     * @returns {string} Clase CSS
     * @private
     */
    _getClaseExpolio(porcentaje) {
        if (porcentaje < 25) return 'expolio-bajo';
        if (porcentaje < 35) return 'expolio-medio';
        return 'expolio-alto';
    }

    /**
     * Muestra la sección de resultados
     * @private
     */
    _mostrarSeccionResultados() {
        const secciones = ['expolio_section', 'validaciones_section'];
        secciones.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.classList.add('visible');
            }
        });
    }

    /**
     * Oculta la sección de resultados
     * @private
     */
    _ocultarSeccionResultados() {
        const secciones = ['expolio_section', 'validaciones_section'];
        secciones.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.classList.remove('visible');
            }
        });
    }

    /**
     * Habilita/deshabilita animaciones
     * @param {boolean} habilitar - Si habilitar animaciones
     */
    setAnimaciones(habilitar) {
        this.animacionesActivas = habilitar;
    }

    /**
     * Exporta los resultados a texto
     * @param {Object} resultados - Resultados a exportar
     * @returns {string} Texto con los resultados
     */
    exportarATexto(resultados) {
        return `
ACDaño PRO v4.0 - Resultados del Cálculo
==========================================

SALARIO LÍQUIDO: ${this.formatearEuro(resultados.salario_liquido)}

DESGLOSE:
- Salario Bruto Total: ${this.formatearEuro(resultados.salario_bruto_total)}
- Cotizaciones SS Trabajador: -${this.formatearEuro(resultados.cotizaciones_trabajador.total)}
- Retención IRPF: -${this.formatearEuro(resultados.irpf.retencion_mensual)}

COSTE EMPRESA:
- Coste Total: ${this.formatearEuro(resultados.coste_total_empresa)}
- Expolio Fiscal: ${this.formatearPorcentaje(resultados.porcentaje_expolio)}

Fecha: ${new Date().toLocaleString('es-ES')}
        `;
    }
}

export default ResultadosNomina;