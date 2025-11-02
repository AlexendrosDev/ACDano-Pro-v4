/** Carga de datos normativos desde JSON versionados + verificación de integridad */
import convenio from '../../data/convenio_valencia_2025.json' assert { type: 'json' };
import DataIntegrityValidator from '../validators/DataIntegrityValidator.js';

export class ConvenioValencia {
  static NUM_PAGAS_EXTRAORDINARIAS = convenio.num_pagas_extra;
  static TABLAS_SALARIALES = convenio.tablas;
  static COMPLEMENTOS = {
    ...convenio.complementos,
    // VESTUARIO EXTENDIDO: elementos individuales de uniforme
    VESTUARIO: {
      ...convenio.complementos.VESTUARIO,
      ELEMENTOS: {
        // Cocina
        chaquetilla_cocina: { precio: 4.23 },
        gorro_cocina: { precio: 1.14 },
        pantalon_cocina: { precio: 5.10 },
        zapatos_cocina: { precio: 6.84 },
        // Sala
        chaqueta_camarero: { precio: 9.62 },
        pantalon_camarero: { precio: 7.37 },
        camisa_camarero: { precio: 5.10 },
        corbata: { precio: 0.72 },
        zapatos_camarero: { precio: 6.84 },
        // General
        delantal: { precio: 3.50 },
        mandil: { precio: 2.80 },
        gorra_servicio: { precio: 1.95 }
      }
    }
  };

  static async validarIntegridad() {
    await DataIntegrityValidator.validateJsonIntegrity('convenio_valencia_2025.json', convenio);
  }

  static obtenerSalarioBase(tabla, nivel) {
    if (!this.TABLAS_SALARIALES[tabla] || !this.TABLAS_SALARIALES[tabla][nivel]) {
      throw new Error(`Combinación tabla/nivel inválida: ${tabla}/${nivel}`);
    }
    return this.TABLAS_SALARIALES[tabla][nivel].salario;
  }

  static obtenerDatosCompletos(tabla, nivel) {
    if (!this.TABLAS_SALARIALES[tabla] || !this.TABLAS_SALARIALES[tabla][nivel]) {
      throw new Error(`Combinación tabla/nivel inválida: ${tabla}/${nivel}`);
    }
    return this.TABLAS_SALARIALES[tabla][nivel];
  }

  static esTablaValida(tabla) { return Object.keys(this.TABLAS_SALARIALES).includes(tabla); }
  static esNivelValido(nivel) { return Object.keys(this.TABLAS_SALARIALES.TABLA_I).includes(nivel); }
}

export default ConvenioValencia;