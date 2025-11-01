/**
 * ExpolioMeter.js
 * Componente para visualizar el medidor de expolio fiscal con animaciones
 * 
 * Responsabilidades:
 * - Mostrar porcentaje de expolio fiscal de forma visual
 * - Animar cambios en el porcentaje
 * - Clasificar niveles de expolio (bajo, medio, alto)
 * - Proporcionar feedback visual inmediato
 */

export class ExpolioMeter {
    constructor() {
        this.circulo = document.getElementById('meter_circle');
        this.porcentaje = document.getElementById('expolio_percentage');
        this.mensaje = document.getElementById('expolio_message');
        this.valorActual = 0;
        this.animacionActiva = false;
    }

    /**
     * Inicializa el componente
     */
    inicializar() {
        this._configurarEstadoInicial();
        console.log('📈 ExpolioMeter inicializado');
    }

    /**
     * Configura el estado inicial del medidor
     * @private
     */
    _configurarEstadoInicial() {
        if (this.circulo) {
            this.circulo.classList.add('meter-circle');
        }
        if (this.porcentaje) {
            this.porcentaje.textContent = '0%';
        }
        if (this.mensaje) {
            this.mensaje.textContent = 'Porcentaje real que se queda el Estado del coste total de tu trabajo';
        }
    }

    /**
     * Actualiza el medidor con un nuevo porcentaje de expolio
     * @param {number} porcentajeExpolio - Porcentaje de expolio (0-100)
     * @param {boolean} animar - Si animar el cambio (por defecto true)
     */
    actualizar(porcentajeExpolio, animar = true) {
        if (!this.circulo || !this.porcentaje || !this.mensaje) return;

        // Validar rango
        const porcentaje = Math.max(0, Math.min(100, porcentajeExpolio));

        if (animar && !this.animacionActiva) {
            this._animarPorcentaje(porcentaje);
        } else {
            this._establecerPorcentaje(porcentaje);
        }

        // Actualizar clasificación y mensaje
        this._actualizarClasificacion(porcentaje);
    }

    /**
     * Anima el cambio de porcentaje
     * @param {number} valorFinal - Valor final del porcentaje
     * @private
     */
    _animarPorcentaje(valorFinal) {
        if (this.animacionActiva) return;

        this.animacionActiva = true;
        const valorInicial = this.valorActual;
        const diferencia = valorFinal - valorInicial;
        const duracion = 1500; // 1.5 segundos
        const frames = 60; // 60 FPS
        const incrementoPorFrame = diferencia / frames;
        const intervaloPorFrame = duracion / frames;

        let frameActual = 0;
        let valorActual = valorInicial;

        const animacion = setInterval(() => {
            frameActual++;
            valorActual += incrementoPorFrame;

            // Aplicar easing (ease-out)
            const progreso = frameActual / frames;
            const factorEasing = 1 - Math.pow(1 - progreso, 3);
            const valorConEasing = valorInicial + (diferencia * factorEasing);

            this._establecerPorcentaje(valorConEasing);

            if (frameActual >= frames) {
                clearInterval(animacion);
                this._establecerPorcentaje(valorFinal); // Asegurar valor final exacto
                this.animacionActiva = false;
            }
        }, intervaloPorFrame);
    }

    /**
     * Establece el porcentaje sin animación
     * @param {number} porcentaje - Porcentaje a establecer
     * @private
     */
    _establecerPorcentaje(porcentaje) {
        this.valorActual = porcentaje;
        if (this.porcentaje) {
            this.porcentaje.textContent = porcentaje.toFixed(1) + '%';
        }

        // Actualizar borde circular proporcional
        this._actualizarBordeCircular(porcentaje);
    }

    /**
     * Actualiza el borde circular para reflejar el porcentaje
     * @param {number} porcentaje - Porcentaje actual
     * @private
     */
    _actualizarBordeCircular(porcentaje) {
        if (!this.circulo) return;

        // Calcular el progreso del borde (stroke-dasharray)
        const circunferencia = 2 * Math.PI * 56; // Radio aproximado del círculo
        const progreso = (porcentaje / 100) * circunferencia;
        
        // Aplicar como estilo CSS personalizado si es necesario
        this.circulo.style.setProperty('--progreso-expolio', `${porcentaje}%`);
    }

    /**
     * Actualiza la clasificación del nivel de expolio
     * @param {number} porcentaje - Porcentaje de expolio
     * @private
     */
    _actualizarClasificacion(porcentaje) {
        if (!this.circulo || !this.mensaje) return;

        // Limpiar clases anteriores
        this.circulo.classList.remove('low-expolio', 'medium-expolio', 'high-expolio');

        let clase, mensaje, descripcion;

        if (porcentaje < 25) {
            clase = 'low-expolio';
            mensaje = 'Nivel de expolio relativamente bajo';
            descripcion = '🟢 Situación favorable - Expolio menor al 25%';
        } else if (porcentaje < 35) {
            clase = 'medium-expolio';
            mensaje = 'Nivel de expolio moderado - típico en España';
            descripcion = '🟡 Rango normal del sector (25-35%)';
        } else {
            clase = 'high-expolio';
            mensaje = '😨 EXPOLIO CRÍTICO - El Estado se queda con más del 35%';
            descripcion = '🔴 Nivel crítico - Revisar configuración fiscal';
        }

        // Aplicar nueva clase
        this.circulo.classList.add(clase);
        this.mensaje.innerHTML = `
            <div class="mensaje-principal">${mensaje}</div>
            <div class="mensaje-descripcion">${descripcion}</div>
        `;

        // Disparar evento personalizado para otros componentes
        this._dispararEventoClasificacion(porcentaje, clase);
    }

    /**
     * Dispara evento personalizado cuando cambia la clasificación
     * @param {number} porcentaje - Porcentaje actual
     * @param {string} clase - Clase de clasificación
     * @private
     */
    _dispararEventoClasificacion(porcentaje, clase) {
        const evento = new CustomEvent('expolio-clasificacion-changed', {
            detail: {
                porcentaje: porcentaje,
                clasificacion: clase,
                timestamp: new Date().toISOString()
            }
        });
        document.dispatchEvent(evento);
    }

    /**
     * Establece el mensaje personalizado
     * @param {string} mensaje - Mensaje a mostrar
     */
    setMensaje(mensaje) {
        if (this.mensaje) {
            this.mensaje.textContent = mensaje;
        }
    }

    /**
     * Reinicia el medidor a estado inicial
     */
    reiniciar() {
        this.actualizar(0, false);
        if (this.mensaje) {
            this.mensaje.textContent = 'Porcentaje real que se queda el Estado del coste total de tu trabajo';
        }
    }

    /**
     * Muestra estado de carga
     */
    mostrarCargando() {
        if (this.porcentaje) {
            this.porcentaje.textContent = '...';
        }
        if (this.mensaje) {
            this.mensaje.textContent = 'Calculando nivel de expolio fiscal...';
        }
        if (this.circulo) {
            this.circulo.classList.add('cargando');
        }
    }

    /**
     * Oculta estado de carga
     */
    ocultarCargando() {
        if (this.circulo) {
            this.circulo.classList.remove('cargando');
        }
    }

    /**
     * Obtiene la clasificación actual
     * @returns {Object} Información de clasificación
     */
    obtenerClasificacion() {
        const porcentaje = this.valorActual;
        
        let nivel, color, descripcion;
        
        if (porcentaje < 25) {
            nivel = 'bajo';
            color = 'verde';
            descripcion = 'Nivel de expolio relativamente bajo';
        } else if (porcentaje < 35) {
            nivel = 'medio';
            color = 'amarillo';
            descripcion = 'Nivel de expolio moderado - típico en España';
        } else {
            nivel = 'alto';
            color = 'rojo';
            descripcion = 'EXPOLIO CRÍTICO - El Estado se queda con más del 35%';
        }

        return {
            porcentaje: porcentaje,
            nivel: nivel,
            color: color,
            descripcion: descripcion,
            timestamp: new Date().toISOString(),
            recomendacion: this._obtenerRecomendacion(porcentaje)
        };
    }

    /**
     * Obtiene recomendación según el nivel de expolio
     * @param {number} porcentaje - Porcentaje de expolio
     * @returns {string} Recomendación
     * @private
     */
    _obtenerRecomendacion(porcentaje) {
        if (porcentaje < 25) {
            return 'Situación favorable. Considera optimizar otros aspectos de la nómina.';
        } else if (porcentaje < 35) {
            return 'Rango típico para el sector. Explora deducciones familiares si aplican.';
        } else {
            return 'Nivel crítico. Considera revisar estructura salarial y deducciones disponibles.';
        }
    }

    /**
     * Configura callback para cambios de clasificación
     * @param {Function} callback - Función a ejecutar en cambios
     */
    onClasificacionChanged(callback) {
        document.addEventListener('expolio-clasificacion-changed', callback);
    }

    /**
     * Obtiene el valor actual del medidor
     * @returns {number} Porcentaje actual
     */
    getValorActual() {
        return this.valorActual;
    }

    /**
     * Verifica si hay una animación en curso
     * @returns {boolean} True si hay animación activa
     */
    isAnimando() {
        return this.animacionActiva;
    }
}

export default ExpolioMeter;