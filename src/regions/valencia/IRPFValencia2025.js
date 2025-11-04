/** Carga IRPF Valencia 2025 desde JSON + verificación de integridad */
import irpf from '../../data/irpf_valencia_2025.json' assert { type: 'json' };
import DataIntegrityValidator from '../../backend/validators/DataIntegrityValidator.js';

export class IRPFValencia2025 {
  static TRAMOS_ESTATALES = irpf.tramos_estatales;
  static TRAMOS_AUTONOMICOS = irpf.tramos_autonomicos_valencia;
  static TRAMOS_AUTONOMICOS_VALENCIA = irpf.tramos_autonomicos_valencia; // Compatibilidad
  static MINIMOS = irpf.minimos;

  static async validarIntegridad() {
    await DataIntegrityValidator.validateJsonIntegrity('irpf_valencia_2025.json', irpf);
  }

  static calcularMinimoFamiliar(numHijos) {
    let minimo = 0;
    if (numHijos >= 1) minimo += this.MINIMOS.PRIMER_HIJO;
    if (numHijos >= 2) minimo += this.MINIMOS.SEGUNDO_HIJO;
    if (numHijos >= 3) minimo += this.MINIMOS.TERCER_HIJO;
    if (numHijos >= 4) minimo += (numHijos - 3) * this.MINIMOS.CUARTO_Y_SIGUIENTES;
    return minimo;
  }

  static getTipoMarginalEstatal(base) {
    for (const tramo of this.TRAMOS_ESTATALES) { if (tramo.infinito || base <= tramo.hasta) return tramo.tipo; }
    return this.TRAMOS_ESTATALES.at(-1).tipo;
  }
  static getTipoMarginalAutonomico(base) {
    for (const tramo of this.TRAMOS_AUTONOMICOS) { if (tramo.infinito || base <= tramo.hasta) return tramo.tipo; }
    return this.TRAMOS_AUTONOMICOS.at(-1).tipo;
  }
  static getTipoMarginalTotal(base) { return this.getTipoMarginalEstatal(base) + this.getTipoMarginalAutonomico(base); }
}

export default IRPFValencia2025;