/**
 * FormularioTrabajador.js
 * Componente para la recogida de datos del trabajador
 * 
 * Responsabilidades:
 * - Recoger datos del formulario HTML
 * - Validar datos del lado cliente
 * - Mapear valores del formulario a estructura de datos
 * - Gestionar eventos de cambio para cálculo automático
 */

export class FormularioTrabajador {
    constructor() {
        this.elementos = {
            categoria: document.getElementById('categoria'),
            tipoEstablecimiento: document.getElementById('tipo_establecimiento'),
            tipoJornada: document.getElementById('tipo_jornada'),
            plusFormacion: document.getElementById('plus_formacion'),
            plusTransporte: document.getElementById('plus_transporte'),
            manutencion: document.getElementById('manutencion'),
            vestuario: document.getElementById('vestuario'),
            numHijos: document.getElementById('num_hijos'),
            sector: document.getElementById('sector'),
            region: document.getElementById('region')
        };

        this.callbacks = {
            onChange: null,
            onSubmit: null
        };
    }

    inicializar() {
        this._configurarEventListeners();
        this._configurarValidacionTiempoReal();
        console.log('📝 FormularioTrabajador inicializado');
    }

    _configurarEventListeners() {
        Object.values(this.elementos).forEach(elemento => {
            if (elemento) {
                elemento.addEventListener('change', () => this._manejarCambio());
                
                if (elemento.type === 'number') {
                    elemento.addEventListener('input', () => this._manejarCambio());
                }
            }
        });

        if (this.elementos.tipoEstablecimiento) {
            this.elementos.tipoEstablecimiento.addEventListener('change', () => {
                this._actualizarComplementosDisponibles();
                this._manejarCambio();
            });
        }

        if (this.elementos.tipoJornada) {
            this.elementos.tipoJornada.addEventListener('change', () => {
                this._actualizarPlusTransporte();
                this._manejarCambio();
            });
        }
    }

    _configurarValidacionTiempoReal() {
        if (this.elementos.numHijos) {
            this.elementos.numHijos.addEventListener('input', (e) => {
                const valor = parseInt(e.target.value);
                if (valor < 0) e.target.value = 0;
                if (valor > 10) e.target.value = 10;
            });
        }
    }

    _manejarCambio() {
        if (this.callbacks.onChange) {
            const datosTrabajador = this.recogerDatosTrabajador();
            const datosFamiliares = this.recogerDatosFamiliares();
            
            if (datosTrabajador) {
                this.callbacks.onChange(datosTrabajador, datosFamiliares);
            }
        }
    }

    _actualizarComplementosDisponibles() {
        const esHotel = this.elementos.tipoEstablecimiento.value === 'hotel';
        
        const labelTransporte = document.querySelector('label[for="plus_transporte"]');
        const labelManutencion = document.querySelector('label[for="manutencion"]');
        
        if (labelTransporte) {
            const tipoJornada = this.elementos.tipoJornada.value;
            let importe = '';
            
            if (tipoJornada === 'partida') {
                importe = esHotel ? '55,81€' : '66,96€';
            } else {
                importe = esHotel ? '36,01€' : '46,80€';
            }
            
            labelTransporte.textContent = `Plus Transporte (${importe})`;
        }
        
        if (labelManutencion) {
            const importe = esHotel ? '44,13€' : '41,32€';
            labelManutencion.textContent = `Manutención (${importe})`;
        }
    }

    _actualizarPlusTransporte() {
        this._actualizarComplementosDisponibles();
    }

    /**
     * Recoge los datos del trabajador desde el formulario
     * @returns {Object|null} Datos del trabajador o null si inválidos
     */
    recogerDatosTrabajador() {
        const categoria = this.elementos.categoria?.value;
        if (!categoria) return null;

        // Recoger sectorId del selector
        const sectorId = this.elementos.sector?.value || 'hosteleria_valencia';

        // Parsear categoría (ej: "cocinero_3" -> puesto="cocinero", nivel="NIVEL_III")
        const [puesto, nivelNum] = categoria.split('_');
        const nivel = `NIVEL_${this._convertirARomano(parseInt(nivelNum))}`;
        const esHotel = this.elementos.tipoEstablecimiento?.value === 'hotel';
        const tabla = esHotel ? 'TABLA_II' : 'TABLA_I';

        return {
            categoria: puesto,
            tabla: tabla,
            nivel: nivel,
            tipo_jornada: this.elementos.tipoJornada?.value || 'continuada',
            es_hotel: esHotel,
            sectorId: sectorId,
            aplica_plus_formacion: this.elementos.plusFormacion?.checked || false,
            aplica_plus_transporte: this.elementos.plusTransporte?.checked || false,
            aplica_manutencion: this.elementos.manutencion?.checked || false,
            aplica_vestuario: this.elementos.vestuario?.checked || false,
            aplica_plus_nocturnidad: this.elementos.plusNocturnidad?.checked || false,
            aplica_plus_penosidad: this.elementos.plusPenosidad?.checked || false,
            elementos_epi: this.elementos.epi?.checked ? ['guantes_latex', 'mascarilla_ffp2'] : []
        };
    }

    recogerDatosFamiliares() {
        return {
            num_hijos: parseInt(this.elementos.numHijos?.value) || 0
        };
    }

    setOnChange(callback) {
        this.callbacks.onChange = callback;
    }

    setOnSubmit(callback) {
        this.callbacks.onSubmit = callback;
    }

    validarFormulario() {
        const errores = [];
        
        if (!this.elementos.categoria?.value) {
            errores.push('Debe seleccionar una categoría profesional');
        }
        
        const numHijos = parseInt(this.elementos.numHijos?.value);
        if (isNaN(numHijos) || numHijos < 0 || numHijos > 10) {
            errores.push('Número de hijos debe ser entre 0 y 10');
        }
        
        return {
            valido: errores.length === 0,
            errores: errores
        };
    }

    reiniciar() {
        this.elementos.categoria.value = '';
        this.elementos.tipoEstablecimiento.value = 'restaurante';
        this.elementos.tipoJornada.value = 'continuada';
        this.elementos.plusFormacion.checked = false;
        this.elementos.plusTransporte.checked = false;
        this.elementos.manutencion.checked = false;
        this.elementos.vestuario.checked = false;
        this.elementos.numHijos.value = '0';
        
        this._actualizarComplementosDisponibles();
    }

    cargarDatos(datos) {
        if (datos.categoria && datos.nivel) {
            const nivelNum = this._convertirDeRomano(datos.nivel.replace('NIVEL_', ''));
            this.elementos.categoria.value = `${datos.categoria}_${nivelNum}`;
        }
        
        if (datos.es_hotel !== undefined) {
            this.elementos.tipoEstablecimiento.value = datos.es_hotel ? 'hotel' : 'restaurante';
        }
        
        if (datos.tipo_jornada) {
            this.elementos.tipoJornada.value = datos.tipo_jornada;
        }
        
        this.elementos.plusFormacion.checked = datos.aplica_plus_formacion || false;
        this.elementos.plusTransporte.checked = datos.aplica_plus_transporte || false;
        this.elementos.manutencion.checked = datos.aplica_manutencion || false;
        this.elementos.vestuario.checked = datos.aplica_vestuario || false;
        
        this._actualizarComplementosDisponibles();
    }

    _convertirARomano(numero) {
        const conversion = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };
        return conversion[numero] || 'I';
    }

    _convertirDeRomano(romano) {
        const conversion = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5 };
        return conversion[romano] || 1;
    }

    getEstado() {
        return {
            datos_trabajador: this.recogerDatosTrabajador(),
            datos_familiares: this.recogerDatosFamiliares(),
            validacion: this.validarFormulario(),
            timestamp: new Date().toISOString()
        };
    }
}

export default FormularioTrabajador;