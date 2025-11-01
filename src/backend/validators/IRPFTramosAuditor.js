// IRPFTramosAuditor.js - Verificación independiente tramo a tramo (estatal + autonómico)
import { round2 } from '../../shared/utils.js';
import IRPFValencia2025 from '../models/IRPFValencia2025.js';

export class IRPFTramosAuditor {
  static auditar(baseIRPFAnual, datosFamiliares) {
    // Recalcular base liquidable igual que el motor
    const ssAnualAprox = baseIRPFAnual * 0.0648; // misma hipótesis del motor
    const baseLiquidable = baseIRPFAnual
      - ssAnualAprox
      - IRPFValencia2025.MINIMOS.GASTOS_DEDUCIBLES
      - IRPFValencia2025.MINIMOS.PERSONAL_SOLTERO
      - IRPFValencia2025.calcularMinimoFamiliar(datosFamiliares?.num_hijos || 0);

    if (baseLiquidable <= 0) {
      return { baseLiquidable: 0, cuotas: { estatal: 0, autonomica: 0, total: 0 }, tipoMedio: 0, retencionMensual: 0, tramos: [] };
    }

    const calcTramos = (base, tramos) => {
      let cuota = 0; let baseAcum = 0; const detalle = [];
      for (const tramo of tramos) {
        if (base > baseAcum) {
          const max = tramo.infinito ? base : Math.min(base, tramo.hasta);
          const baseTramo = Math.max(0, max - baseAcum);
          const cuotaTramo = round2(baseTramo * (tramo.tipo / 100));
          detalle.push({ desde: baseAcum, hasta: tramo.infinito ? '∞' : tramo.hasta, tipo: tramo.tipo, baseTramo: round2(baseTramo), cuotaTramo });
          cuota += cuotaTramo;
          if (!tramo.infinito) baseAcum = tramo.hasta; else break;
        }
      }
      return { cuota: round2(cuota), detalle };
    };

    const estatal = calcTramos(baseLiquidable, IRPFValencia2025.TRAMOS_ESTATALES);
    const autonomica = calcTramos(baseLiquidable, IRPFValencia2025.TRAMOS_AUTONOMICOS_VALENCIA);

    const total = round2(estatal.cuota + autonomica.cuota);
    const tipoMedio = baseIRPFAnual === 0 ? 0 : round2((total / baseIRPFAnual) * 100);
    const retencionMensual = round2(total / 12);

    return {
      baseLiquidable: round2(baseLiquidable),
      cuotas: { estatal: estatal.cuota, autonomica: autonomica.cuota, total },
      tipoMedio,
      retencionMensual,
      tramos: { estatal: estatal.detalle, autonomica: autonomica.detalle }
    };
  }
}

export default IRPFTramosAuditor;
