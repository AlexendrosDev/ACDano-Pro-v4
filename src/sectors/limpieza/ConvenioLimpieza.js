// ConvenioLimpieza.js - Convenio de Limpieza de Edificios y Locales 2025
import convenio from '../../data/convenio_limpieza_2025.json' assert { type: 'json' };
import DataIntegrityValidator from '../validators/DataIntegrityValidator.js';

export class ConvenioLimpieza {
  static NUM_PAGAS_EXTRAORDINARIAS = convenio.num_pagas_extra;
  static TABLAS_SALARIALES = convenio.tablas;
  static COMPLEMENTOS = convenio.complementos;

  static async validarIntegridad() {
    await DataIntegrityValidator.validateJsonIntegrity('convenio_limpieza_2025.json', convenio);
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

export default ConvenioLimpieza;