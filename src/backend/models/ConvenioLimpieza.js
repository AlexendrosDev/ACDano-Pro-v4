/**
 * 🧹 ConvenioLimpieza - Convenio Colectivo de Limpieza
 * 
 * Implementación piloto completa para el sector limpieza (500K trabajadores)
 * - 2 pagas extra vs 3 en hostelería
 * - Plus nocturnidad y penosidad específicos
 * - EPI (Equipos Protección Individual) detallado
 * - Transporte urbano vs metropolitano
 * 
 * @author ACDaño Team
 * @version 4.0
 * @sector Limpieza
 */

export class ConvenioLimpieza {
  static NUM_PAGAS_EXTRAORDINARIAS = 2; // vs 3 en hostelería

  static TABLAS_SALARIALES = {
    TABLA_I: { // Edificios públicos/oficinas
      NIVEL_I: { salario: 1180.50, hora_extra: 12.85, festivo: 95.20 }, // Encargado
      NIVEL_II: { salario: 1098.75, hora_extra: 11.92, festivo: 88.54 }, // Especialista
      NIVEL_III: { salario: 1015.30, hora_extra: 11.01, festivo: 81.83 } // Limpiador
    },
    TABLA_II: { // Hospitales/centros sanitarios (mayor penosidad)
      NIVEL_I: { salario: 1285.45, hora_extra: 13.95, festivo: 103.65 },
      NIVEL_II: { salario: 1195.20, hora_extra: 12.96, festivo: 96.25 },
      NIVEL_III: { salario: 1105.85, hora_extra: 12.00, festivo: 89.15 }
    }
  };

  static COMPLEMENTOS = {
    PLUS_NOCTURNIDAD: 45.30, // 22:00 - 06:00
    PLUS_PENOSIDAD: 38.50, // Químicos, residuos peligrosos
    PLUS_TRANSPORTE: {
      urbano: 32.15,
      metropolitano: 48.20
    },
    VESTUARIO: {
      ELEMENTOS: {
        // EPI (Equipos de Protección Individual)
        bata_trabajo: { precio: 12.50, obligatorio: true },
        guantes_latex: { precio: 8.30, obligatorio: true },
        mascarilla_ffp2: { precio: 15.60, obligatorio: false },
        calzado_seguridad: { precio: 45.80, obligatorio: true },
        gorro_higiene: { precio: 3.20, obligatorio: false },
        delantal_impermeable: { precio: 18.95, obligatorio: false }
      }
    }
  };

  /**
   * Obtiene salario base según tabla y nivel
   * @param {string} tabla - TABLA_I o TABLA_II
   * @param {string} nivel - NIVEL_I, NIVEL_II, NIVEL_III
   * @returns {number} Salario base en euros
   */
  static obtenerSalarioBase(tabla, nivel) {
    const salarioData = this.TABLAS_SALARIALES[tabla]?.[nivel];
    if (!salarioData) {
      throw new Error(`Combinación inválida: ${tabla} - ${nivel}`);
    }
    return salarioData.salario;
  }

  /**
   * Obtiene precio de horas extra
   * @param {string} tabla - TABLA_I o TABLA_II
   * @param {string} nivel - NIVEL_I, NIVEL_II, NIVEL_III
   * @returns {number} Precio hora extra en euros
   */
  static obtenerHoraExtra(tabla, nivel) {
    const salarioData = this.TABLAS_SALARIALES[tabla]?.[nivel];
    if (!salarioData) {
      throw new Error(`Combinación inválida: ${tabla} - ${nivel}`);
    }
    return salarioData.hora_extra;
  }

  /**
   * Obtiene plus festivo
   * @param {string} tabla - TABLA_I o TABLA_II
   * @param {string} nivel - NIVEL_I, NIVEL_II, NIVEL_III
   * @returns {number} Plus festivo en euros
   */
  static obtenerPlusFestivo(tabla, nivel) {
    const salarioData = this.TABLAS_SALARIALES[tabla]?.[nivel];
    if (!salarioData) {
      throw new Error(`Combinación inválida: ${tabla} - ${nivel}`);
    }
    return salarioData.festivo;
  }

  /**
   * Calcula coste total de EPI seleccionados
   * @param {Array<string>} elementosSeleccionados - Lista de elementos EPI
   * @returns {number} Coste total en euros
   */
  static calcularCosteEPI(elementosSeleccionados) {
    return elementosSeleccionados.reduce((total, elemento) => {
      const epi = this.COMPLEMENTOS.VESTUARIO.ELEMENTOS[elemento];
      return total + (epi ? epi.precio : 0);
    }, 0);
  }

  /**
   * Obtiene elementos EPI obligatorios
   * @returns {Array<string>} Lista de elementos obligatorios
   */
  static obtenerEPIObligatorios() {
    return Object.entries(this.COMPLEMENTOS.VESTUARIO.ELEMENTOS)
      .filter(([_, data]) => data.obligatorio)
      .map(([elemento]) => elemento);
  }
}