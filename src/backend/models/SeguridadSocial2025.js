/**
 * SeguridadSocial2025.js
 * Modelo de datos para las bases y tipos de cotización de la Seguridad Social 2025
 * 
 * Referencia legal: Orden PJC/178/2025 - BOE 26/02/2025
 * Implementa bases mínimas/máximas y tipos de cotización oficiales
 */

export class SeguridadSocial2025 {
    // Bases de cotización 2025 (euros/mes)
    static BASES = {
        BASE_MINIMA_GRUPO_5_7: 1381.20,  // Hostelería (Grupo 5-7)
        BASE_MAXIMA: 4909.50             // Base máxima general
    };

    // Tipos de cotización trabajador (%) - Total: 6,48%
    static TIPOS_TRABAJADOR = {
        CC: 4.70,        // Contingencias Comunes
        DESEMPLEO: 1.55, // Desempleo
        FP: 0.10,        // Formación Profesional
        MEI: 0.13        // Mecanismo Equidad Intergeneracional
    };

    // Tipos de cotización empresa (%) - Total: 32,32%
    static TIPOS_EMPRESA = {
        CC: 23.60,       // Contingencias Comunes
        ATEP: 1.25,      // ⚠️ CORREGIDO: Antes era 0% - Obligatorio según RD 2064/1995
        DESEMPLEO: 5.50, // Desempleo
        FOGASA: 0.20,    // Fondo Garantía Salarial
        FP: 0.60,        // Formación Profesional
        MEI: 0.67        // Mecanismo Equidad Intergeneracional
    };

    /**
     * Aplica topes mínimos y máximos a la base de cotización
     * @param {number} baseCotizacion - Base sin topar
     * @returns {number} Base con topes aplicados
     */
    static aplicarTopes(baseCotizacion) {
        let baseTopada = baseCotizacion;
        
        // Aplicar tope mínimo
        if (baseTopada < this.BASES.BASE_MINIMA_GRUPO_5_7) {
            baseTopada = this.BASES.BASE_MINIMA_GRUPO_5_7;
        }
        
        // Aplicar tope máximo
        if (baseTopada > this.BASES.BASE_MAXIMA) {
            baseTopada = this.BASES.BASE_MAXIMA;
        }
        
        return baseTopada;
    }

    /**
     * Calcula el total de tipos de cotización del trabajador
     * @returns {number} Porcentaje total trabajador
     */
    static getTotalTrabajador() {
        return Object.values(this.TIPOS_TRABAJADOR).reduce((sum, tipo) => sum + tipo, 0);
    }

    /**
     * Calcula el total de tipos de cotización de la empresa
     * @returns {number} Porcentaje total empresa
     */
    static getTotalEmpresa() {
        return Object.values(this.TIPOS_EMPRESA).reduce((sum, tipo) => sum + tipo, 0);
    }

    /**
     * Verifica que AT/EP no sea 0% (validación crítica)
     * @returns {boolean} True si AT/EP es correcto
     */
    static validarATEP() {
        return this.TIPOS_EMPRESA.ATEP > 0;
    }

    /**
     * Obtiene información completa de bases para debugging
     * @returns {Object} Información completa
     */
    static getInfo() {
        return {
            bases: this.BASES,
            tipos_trabajador: this.TIPOS_TRABAJADOR,
            tipos_empresa: this.TIPOS_EMPRESA,
            total_trabajador: this.getTotalTrabajador(),
            total_empresa: this.getTotalEmpresa(),
            atep_valido: this.validarATEP()
        };
    }
}

export default SeguridadSocial2025;