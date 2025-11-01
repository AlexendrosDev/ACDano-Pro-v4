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
        console.log('📈 ResultadosNomina inicializado');
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
        this.contenedor.classList.add('resultados-nomina');
    }

    /**
     * Muestra los resultados completos del cálculo CON DESGLOSE DETALLADO
     * @param {Object} resultados - Resultados del cálculo (estructura enriquecida)
     * @param {Object} validacion - Validación del cálculo
     */
    mostrarResultados(resultados, validacion = null) {
        if (!this.contenedor) return;

        this.contenedor.innerHTML = `
            <!-- === RESUMEN PRINCIPAL === -->
            <div class="resumen-principal" style="text-align: center; padding: var(--space-16); background: var(--color-bg-1); border-radius: var(--radius-base); margin-bottom: var(--space-16);">
                <h4 style="color: var(--color-primary); margin-bottom: var(--space-8);">💰 Salario Líquido</h4>
                <div style="font-size: var(--font-size-3xl); font-weight: var(--font-weight-bold); color: var(--color-success);">
                    ${this.formatearEuro(resultados.salario_liquido)}
                </div>
            </div>

            <!-- === INGRESOS DETALLADOS === -->
            <div class="seccion-ingresos" style="margin-bottom: var(--space-20);">
                <h5 style="color: var(--color-success); margin-bottom: var(--space-12); display: flex; align-items: center; gap: var(--space-8);"><span>💸</span> Ingresos</h5>
                
                <div class="result-item">
                    <span class="result-label">Salario Base</span>
                    <span class="result-value">${this.formatearEuro(resultados.conceptos_salariales.salario_base)}</span>
                </div>
                
                <div class="result-item">
                    <span class="result-label">Prorrata Pagas Extra</span>
                    <span class="result-value">${this.formatearEuro(resultados.conceptos_salariales.prorrata_pagas)}</span>
                </div>
                
                ${this._renderizarComplementosSalariales(resultados.conceptos_salariales)}
                ${this._renderizarConceptosNoSalariales(resultados.conceptos_no_salariales)}
                
                <div class="result-item" style="border-top: 1px solid var(--color-border); padding-top: var(--space-8); font-weight: var(--font-weight-semibold);">
                    <span class="result-label">Total Bruto</span>
                    <span class="result-value">${this.formatearEuro(resultados.salario_bruto_total)}</span>
                </div>
            </div>

            <!-- === DEDUCCIONES DETALLADAS === -->
            <div class="seccion-deducciones" style="margin-bottom: var(--space-20);">
                <h5 style="color: var(--color-error); margin-bottom: var(--space-12); display: flex; align-items: center; gap: var(--space-8);"><span>📉</span> Deducciones del Trabajador</h5>
                
                <!-- Seguridad Social Trabajador -->
                <div class="subseccion-ss" style="background: var(--color-bg-4); padding: var(--space-12); border-radius: var(--radius-sm); margin-bottom: var(--space-12);">
                    <h6 style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-8);">Seguridad Social Trabajador (6,48%)</h6>
                    <div class="result-item">
                        <span class="result-label">Contingencias Comunes (4,70%)</span>
                        <span class="result-value negative">-${this.formatearEuro(resultados.cotizaciones_trabajador.cc)}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Desempleo (1,55%)</span>
                        <span class="result-value negative">-${this.formatearEuro(resultados.cotizaciones_trabajador.desempleo)}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Formación Profesional (0,10%)</span>
                        <span class="result-value negative">-${this.formatearEuro(resultados.cotizaciones_trabajador.fp)}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">M.E.I. (0,13%)</span>
                        <span class="result-value negative">-${this.formatearEuro(resultados.cotizaciones_trabajador.mei)}</span>
                    </div>
                    <div class="result-item" style="border-top: 1px solid var(--color-border); padding-top: var(--space-4); font-weight: var(--font-weight-medium);">
                        <span class="result-label">Total SS Trabajador</span>
                        <span class="result-value negative">-${this.formatearEuro(resultados.cotizaciones_trabajador.total)}</span>
                    </div>
                </div>

                <!-- IRPF -->
                <div class="subseccion-irpf" style="background: var(--color-bg-2); padding: var(--space-12); border-radius: var(--radius-sm); margin-bottom: var(--space-12);">
                    <h6 style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-8);">IRPF Valencia (Tipo medio: ${resultados.irpf.tipo_medio.toFixed(2)}%)</h6>
                    <div class="result-item">
                        <span class="result-label">Base IRPF Anual</span>
                        <span class="result-value">${this.formatearEuro(resultados.base_irpf_anual)}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Cuota Anual</span>
                        <span class="result-value negative">-${this.formatearEuro(resultados.irpf.cuota_anual)}</span>
                    </div>
                    <div class="result-item" style="border-top: 1px solid var(--color-border); padding-top: var(--space-4); font-weight: var(--font-weight-medium);">
                        <span class="result-label">Retención Mensual</span>
                        <span class="result-value negative">-${this.formatearEuro(resultados.irpf.retencion_mensual)}</span>
                    </div>
                </div>

                <div class="result-item" style="border-top: 2px solid var(--color-error); padding-top: var(--space-8); font-weight: var(--font-weight-semibold);">
                    <span class="result-label">Total Deducciones</span>
                    <span class="result-value negative">-${this.formatearEuro(resultados.total_deducciones)}</span>
                </div>
            </div>

            <!-- === COSTE EMPRESA DETALLADO === -->
            <div class="seccion-empresa" style="margin-bottom: var(--space-20);">
                <h5 style="color: var(--color-warning); margin-bottom: var(--space-12); display: flex; align-items: center; gap: var(--space-8);"><span>🏢</span> Coste para la Empresa</h5>
                
                <div class="subseccion-ss-empresa" style="background: var(--color-bg-6); padding: var(--space-12); border-radius: var(--radius-sm); margin-bottom: var(--space-12);">
                    <h6 style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-8);">Seguridad Social Empresa (32,32%)</h6>
                    <div class="result-item">
                        <span class="result-label">Contingencias Comunes (23,60%)</span>
                        <span class="result-value negative">-${this.formatearEuro(resultados.cotizaciones_empresa.cc)}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">AT/EP (1,25%)</span>
                        <span class="result-value negative">-${this.formatearEuro(resultados.cotizaciones_empresa.atep)}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Desempleo (5,50%)</span>
                        <span class="result-value negative">-${this.formatearEuro(resultados.cotizaciones_empresa.desempleo)}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">FOGASA (0,20%)</span>
                        <span class="result-value negative">-${this.formatearEuro(resultados.cotizaciones_empresa.fogasa)}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Formación Profesional (0,60%)</span>
                        <span class="result-value negative">-${this.formatearEuro(resultados.cotizaciones_empresa.fp)}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">M.E.I. (0,67%)</span>
                        <span class="result-value negative">-${this.formatearEuro(resultados.cotizaciones_empresa.mei)}</span>
                    </div>
                    <div class="result-item" style="border-top: 1px solid var(--color-border); padding-top: var(--space-4); font-weight: var(--font-weight-medium);">
                        <span class="result-label">Total SS Empresa</span>
                        <span class="result-value negative">-${this.formatearEuro(resultados.cotizaciones_empresa.total)}</span>
                    </div>
                </div>

                <div class="result-item" style="border-top: 2px solid var(--color-warning); padding-top: var(--space-8); font-weight: var(--font-weight-bold);">
                    <span class="result-label">Coste Total Empresa</span>
                    <span class="result-value">${this.formatearEuro(resultados.coste_total_empresa)}</span>
                </div>
            </div>

            <!-- === EXPOLIO FISCAL TOTAL === -->
            <div class="seccion-expolio" style="background: var(--color-bg-4); padding: var(--space-16); border-radius: var(--radius-base); border: 1px solid var(--color-error);">
                <h5 style="color: var(--color-error); margin-bottom: var(--space-12); display: flex; align-items: center; gap: var(--space-8);"><span>⚠️</span> Expolio Fiscal Total</h5>
                
                <div class="result-item">
                    <span class="result-label">SS Trabajador (tu bolsillo)</span>
                    <span class="result-value negative">-${this.formatearEuro(resultados.cotizaciones_trabajador.total)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">SS Empresa (tu coste real)</span>
                    <span class="result-value negative">-${this.formatearEuro(resultados.cotizaciones_empresa.total)}</span>
                </div>
                
                <div class="result-item" style="border-top: 2px solid var(--color-error); padding-top: var(--space-8); font-weight: var(--font-weight-bold);">
                    <span class="result-label">Total que se queda el Estado</span>
                    <span class="result-value negative" style="font-size: var(--font-size-lg);">-${this.formatearEuro(resultados.expolio_total)}</span>
                </div>
                
                <div class="result-item" style="margin-top: var(--space-8);">
                    <span class="result-label">Porcentaje del Coste Total</span>
                    <span class="result-value ${this._getClaseExpolio(resultados.porcentaje_expolio)}" style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold);">
                        ${resultados.porcentaje_expolio.toFixed(1)}%
                    </span>
                </div>
            </div>
        `;

        this._mostrarSeccionResultados();
    }

    /**
     * Renderiza complementos salariales si existen
     * @private
     */
    _renderizarComplementosSalariales(conceptosSalariales) {
        let html = '';
        
        if (conceptosSalariales.plus_formacion > 0) {
            html += `
                <div class="result-item">
                    <span class="result-label">Plus Formación</span>
                    <span class="result-value">${this.formatearEuro(conceptosSalariales.plus_formacion)}</span>
                </div>
            `;
        }
        
        if (conceptosSalariales.manutencion > 0) {
            html += `
                <div class="result-item">
                    <span class="result-label">Manutención</span>
                    <span class="result-value">${this.formatearEuro(conceptosSalariales.manutencion)}</span>
                </div>
            `;
        }
        
        return html;
    }

    /**
     * Renderiza conceptos no salariales si existen
     * @private
     */
    _renderizarConceptosNoSalariales(conceptosNoSalariales) {
        let html = '';
        
        if (conceptosNoSalariales.plus_transporte > 0) {
            html += `
                <div class="result-item">
                    <span class="result-label">Plus Transporte (no cotiza)</span>
                    <span class="result-value">${this.formatearEuro(conceptosNoSalariales.plus_transporte)}</span>
                </div>
            `;
        }
        
        if (conceptosNoSalariales.vestuario > 0) {
            html += `
                <div class="result-item">
                    <span class="result-label">Vestuario (no cotiza)</span>
                    <span class="result-value">${this.formatearEuro(conceptosNoSalariales.vestuario)}</span>
                </div>
            `;
        }
        
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
            'info': '📈',
            'error': '❌',
            'loading': '⏳',
            'success': '✅'
        };

        this.contenedor.innerHTML = `
            <div class="estado-mensaje ${tipo}" style="text-align: center; padding: var(--space-16);">
                <span class="icono">${claseIcono[tipo] || '📈'}</span>
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
     * Obtiene clase CSS según nivel de expolio
     * @param {number} porcentaje - Porcentaje de expolio
     * @returns {string} Clase CSS
     * @private
     */
    _getClaseExpolio(porcentaje) {
        if (porcentaje < 25) return 'positive'; // Verde
        if (porcentaje < 35) return 'result-value'; // Neutro
        return 'negative'; // Rojo
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
     * Exporta los resultados a texto
     * @param {Object} resultados - Resultados a exportar
     * @returns {string} Texto con los resultados
     */
    exportarATexto(resultados) {
        return `
ACDáo PRO v4.0 - Resultados del Cálculo
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

    formatearPorcentaje(porcentaje) {
        return porcentaje.toFixed(1) + '%';
    }
}

export default ResultadosNomina;