/**
 * ConvenioValencia.js
 * Modelo de datos para el Convenio de Hostelería de Valencia 2022-2025
 * 
 * Referencia legal: BOP Valencia nº 26, 07/02/2023
 * Implementa las tablas salariales oficiales y complementos del convenio
 */

export class ConvenioValencia {
    // Constantes del convenio
    static NUM_PAGAS_EXTRAORDINARIAS = 3; // Marzo, junio, diciembre

    // Tablas salariales oficiales (euros/mes)
    static TABLAS_SALARIALES = {
        // Tabla I: Restaurantes, bares, cafeterías
        TABLA_I: {
            NIVEL_I: { salario: 1337.87, hora_extra: 15.70, festivo: 116.16 },
            NIVEL_II: { salario: 1288.69, hora_extra: 15.15, festivo: 111.90 },
            NIVEL_III: { salario: 1214.84, hora_extra: 14.21, festivo: 105.27 },
            NIVEL_IV: { salario: 1165.60, hora_extra: 13.69, festivo: 101.16 },
            NIVEL_V: { salario: 1100.46, hora_extra: 12.91, festivo: 95.40 }
        },
        // Tabla II: Hoteles 4* y 5*
        TABLA_II: {
            NIVEL_I: { salario: 1415.47, hora_extra: 16.77, festivo: 124.08 },
            NIVEL_II: { salario: 1363.05, hora_extra: 16.15, festivo: 119.49 },
            NIVEL_III: { salario: 1284.43, hora_extra: 15.20, festivo: 112.47 },
            NIVEL_IV: { salario: 1231.95, hora_extra: 14.64, festivo: 108.05 },
            NIVEL_V: { salario: 1162.48, hora_extra: 13.78, festivo: 101.88 }
        }
    };

    // Complementos según anexos del convenio
    static COMPLEMENTOS = {
        // Plus formación (SALARIAL - cotiza)
        PLUS_FORMACION: 20.00,
        
        // Anexo IV-1: Restaurantes/bares general
        ANEXO_IV_1: {
            plus_transporte_partida: 66.96,     // NO SALARIAL
            plus_transporte_continuada: 46.80,  // NO SALARIAL
            manutencion: 41.32,                  // SALARIAL - cotiza
            utiles_herramientas: 8.59           // SALARIAL - cotiza
        },
        
        // Anexo IV-2: Hoteles
        ANEXO_IV_2: {
            plus_transporte_partida: 55.81,     // NO SALARIAL
            plus_transporte_continuada: 36.01,  // NO SALARIAL
            manutencion: 44.13,                  // SALARIAL - cotiza
            utiles_herramientas: 9.18           // SALARIAL - cotiza
        },
        
        // Vestuario (NO SALARIAL)
        VESTUARIO: {
            cocineros: {
                chaquetillas: 4.23,
                gorros: 1.14,
                pantalones: 5.10,
                zapatos: 6.84,
                total: 17.31
            },
            camareros: {
                chaquetas: 9.62,
                pantalones: 7.37,
                camisas: 5.10,
                corbata: 0.72,
                zapatos: 6.84,
                total: 29.65
            }
        }
    };

    /**
     * Obtiene el salario base según tabla y nivel
     * @param {string} tabla - TABLA_I o TABLA_II
     * @param {string} nivel - NIVEL_I a NIVEL_V
     * @returns {number} Salario base en euros
     */
    static obtenerSalarioBase(tabla, nivel) {
        if (!this.TABLAS_SALARIALES[tabla] || !this.TABLAS_SALARIALES[tabla][nivel]) {
            throw new Error(`Combinación tabla/nivel inválida: ${tabla}/${nivel}`);
        }
        return this.TABLAS_SALARIALES[tabla][nivel].salario;
    }

    /**
     * Obtiene todos los datos de una categoría (salario + extras)
     * @param {string} tabla - TABLA_I o TABLA_II
     * @param {string} nivel - NIVEL_I a NIVEL_V
     * @returns {Object} Datos completos de la categoría
     */
    static obtenerDatosCompletos(tabla, nivel) {
        if (!this.TABLAS_SALARIALES[tabla] || !this.TABLAS_SALARIALES[tabla][nivel]) {
            throw new Error(`Combinación tabla/nivel inválida: ${tabla}/${nivel}`);
        }
        return this.TABLAS_SALARIALES[tabla][nivel];
    }

    /**
     * Valida si una tabla es válida
     * @param {string} tabla - Tabla a validar
     * @returns {boolean} True si es válida
     */
    static esTablaValida(tabla) {
        return Object.keys(this.TABLAS_SALARIALES).includes(tabla);
    }

    /**
     * Valida si un nivel es válido
     * @param {string} nivel - Nivel a validar
     * @returns {boolean} True si es válido
     */
    static esNivelValido(nivel) {
        return Object.keys(this.TABLAS_SALARIALES.TABLA_I).includes(nivel);
    }
}

export default ConvenioValencia;