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
            // Elementos de uniforme individuales
            chaquetillaCocina: document.getElementById('chaquetilla_cocina'),
            gorroCocina: document.getElementById('gorro_cocina'),
            pantalonCocina: document.getElementById('pantalon_cocina'),
            zapatosCocina: document.getElementById('zapatos_cocina'),
            chaquetaCamarero: document.getElementById('chaqueta_camarero'),
            pantalonCamarero: document.getElementById('pantalon_camarero'),
            camisaCamarero: document.getElementById('camisa_camarero'),
            corbata: document.getElementById('corbata'),
            zapatosCamarero: document.getElementById('zapatos_camarero'),
            delantal: document.getElementById('delantal'),
            mandil: document.getElementById('mandil'),
            gorraServicio: document.getElementById('gorra_servicio'),
            numHijos: document.getElementById('num_hijos')
        };

        this.callbacks = {
            onChange: null,
            onSubmit: null
        };
    }

    /**
     * Recoge los datos del trabajador desde el formulario
     * @returns {Object|null} Datos del trabajador o null si inválidos
     */
    recogerDatosTrabajador() {
        const categoria = this.elementos.categoria.value;
        if (!categoria) return null;

        // Extraer categoria y nivel del value (ej: "cocinero_III" -> ["cocinero", "III"])
        const partes = categoria.split('_');
        const puesto = partes[0];
        const nivelRomano = partes[1];
        
        const esHotel = this.elementos.tipoEstablecimiento.value === 'hotel';
        const tabla = esHotel ? 'TABLA_II' : 'TABLA_I';

        return {
            categoria: puesto,
            tabla: tabla,
            nivel: `NIVEL_${nivelRomano}`,
            tipo_jornada: this.elementos.tipoJornada.value,
            es_hotel: esHotel,
            aplica_plus_formacion: this.elementos.plusFormacion.checked,
            aplica_plus_transporte: this.elementos.plusTransporte.checked,
            aplica_manutencion: this.elementos.manutencion.checked,
            elementos_uniforme: this.recogerElementosUniforme()
        };
    }

    /**
     * Recoge elementos de uniforme seleccionados
     * @returns {Array} Lista de elementos de uniforme seleccionados
     */
    recogerElementosUniforme() {
        const elementos = [];
        const checkboxes = {
            'chaquetilla_cocina': this.elementos.chaquetillaCocina,
            'gorro_cocina': this.elementos.gorroCocina,
            'pantalon_cocina': this.elementos.pantalonCocina,
            'zapatos_cocina': this.elementos.zapatosCocina,
            'chaqueta_camarero': this.elementos.chaquetaCamarero,
            'pantalon_camarero': this.elementos.pantalonCamarero,
            'camisa_camarero': this.elementos.camisaCamarero,
            'corbata': this.elementos.corbata,
            'zapatos_camarero': this.elementos.zapatosCamarero,
            'delantal': this.elementos.delantal,
            'mandil': this.elementos.mandil,
            'gorra_servicio': this.elementos.gorraServicio
        };
        
        for (const [elemento, checkbox] of Object.entries(checkboxes)) {
            if (checkbox && checkbox.checked) {
                elementos.push(elemento);
            }
        }
        
        return elementos;
    }

    /**
     * Recoge los datos familiares desde el formulario
     * @returns {Object} Datos familiares
     */
    recogerDatosFamiliares() {
        return {
            num_hijos: parseInt(this.elementos.numHijos.value) || 0
        };
    }

    /**
     * Convierte número a romano
     * @param {number} numero - Número a convertir
     * @returns {string} Número romano
     * @private
     */
    convertirARomano(numero) {
        const conversion = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };
        return conversion[numero] || 'I';
    }
}

export default FormularioTrabajador;