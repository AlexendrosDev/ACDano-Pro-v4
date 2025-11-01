/**
 * IRPFValencia2025.js
 * Modelo de datos para los tramos de IRPF estatales y autonómicos de Valencia 2025
 * 
 * Referencias legales:
 * - Ley 35/2006: Ley del IRPF estatal
 * - Ley 13/1997: IRPF Comunidad Valenciana (autonómico)
 * - RD 142/2024: Reglamento IRPF 2025
 */

export class IRPFValencia2025 {
    // Tramos estatales IRPF 2025 (%)
    static TRAMOS_ESTATALES = [
        { hasta: 12450, tipo: 19.0 },
        { hasta: 20200, tipo: 24.0 },
        { hasta: 35200, tipo: 30.0 },
        { hasta: 60000, tipo: 37.0 },
        { hasta: 300000, tipo: 45.0 },
        { infinito: true, tipo: 47.0 }  // Más de 300.000€
    ];

    // Tramos autonómicos Valencia 2025 (% adicional)
    static TRAMOS_AUTONOMICOS_VALENCIA = [
        { hasta: 12450, tipo: 0.5 },
        { hasta: 20200, tipo: 0.5 },
        { hasta: 35200, tipo: 0.5 },
        { hasta: 60000, tipo: 1.0 },
        { hasta: 300000, tipo: 1.5 },
        { infinito: true, tipo: 2.0 }   // Más de 300.000€
    ];

    // Mínimos personales y familiares 2025 (euros/año)
    static MINIMOS = {
        PERSONAL_SOLTERO: 5550.00,
        GASTOS_DEDUCIBLES: 2000.00,     // Gastos deducibles estándar
        PRIMER_HIJO: 2400.00,
        SEGUNDO_HIJO: 2700.00,
        TERCER_HIJO: 4000.00,
        CUARTO_Y_SIGUIENTES: 4500.00    // Por cada hijo adicional
    };

    /**
     * Calcula el mínimo familiar según número de hijos
     * @param {number} numHijos - Número de hijos
     * @returns {number} Mínimo familiar en euros/año
     */
    static calcularMinimoFamiliar(numHijos) {
        let minimoFamiliar = 0;
        
        if (numHijos >= 1) minimoFamiliar += this.MINIMOS.PRIMER_HIJO;
        if (numHijos >= 2) minimoFamiliar += this.MINIMOS.SEGUNDO_HIJO;
        if (numHijos >= 3) minimoFamiliar += this.MINIMOS.TERCER_HIJO;
        if (numHijos >= 4) {
            // Cada hijo adicional (4º, 5º, etc.)
            minimoFamiliar += (numHijos - 3) * this.MINIMOS.CUARTO_Y_SIGUIENTES;
        }
        
        return minimoFamiliar;
    }

    /**
     * Calcula el tipo marginal estatal para una base liquidable
     * @param {number} baseLiquidable - Base liquidable anual
     * @returns {number} Tipo marginal estatal (%)
     */
    static getTipoMarginalEstatal(baseLiquidable) {
        for (const tramo of this.TRAMOS_ESTATALES) {
            if (tramo.infinito || baseLiquidable <= tramo.hasta) {
                return tramo.tipo;
            }
        }
        return this.TRAMOS_ESTATALES[this.TRAMOS_ESTATALES.length - 1].tipo;
    }

    /**
     * Calcula el tipo marginal autonómico para una base liquidable
     * @param {number} baseLiquidable - Base liquidable anual
     * @returns {number} Tipo marginal autonómico (%)
     */
    static getTipoMarginalAutonomico(baseLiquidable) {
        for (const tramo of this.TRAMOS_AUTONOMICOS_VALENCIA) {
            if (tramo.infinito || baseLiquidable <= tramo.hasta) {
                return tramo.tipo;
            }
        }
        return this.TRAMOS_AUTONOMICOS_VALENCIA[this.TRAMOS_AUTONOMICOS_VALENCIA.length - 1].tipo;
    }

    /**
     * Calcula el tipo marginal total (estatal + autonómico)
     * @param {number} baseLiquidable - Base liquidable anual
     * @returns {number} Tipo marginal total (%)
     */
    static getTipoMarginalTotal(baseLiquidable) {
        return this.getTipoMarginalEstatal(baseLiquidable) + 
               this.getTipoMarginalAutonomico(baseLiquidable);
    }

    /**
     * Valida que los tramos estén bien configurados
     * @returns {boolean} True si la configuración es válida
     */
    static validarTramos() {
        // Verificar que ambos arrays tengan el mismo número de tramos
        if (this.TRAMOS_ESTATALES.length !== this.TRAMOS_AUTONOMICOS_VALENCIA.length) {
            return false;
        }
        
        // Verificar que los límites coincidan
        for (let i = 0; i < this.TRAMOS_ESTATALES.length; i++) {
            const estatal = this.TRAMOS_ESTATALES[i];
            const autonomico = this.TRAMOS_AUTONOMICOS_VALENCIA[i];
            
            if (estatal.hasta !== autonomico.hasta && 
                estatal.infinito !== autonomico.infinito) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Obtiene información completa para debugging
     * @returns {Object} Información completa del modelo
     */
    static getInfo() {
        return {
            tramos_estatales: this.TRAMOS_ESTATALES,
            tramos_autonomicos: this.TRAMOS_AUTONOMICOS_VALENCIA,
            minimos: this.MINIMOS,
            tramos_validos: this.validarTramos()
        };
    }
}

export default IRPFValencia2025;