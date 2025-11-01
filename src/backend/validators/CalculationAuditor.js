// CalculationAuditor.js - Doble verificación de cálculos críticos
import { round2 } from '../../shared/utils.js';

export class CalculationAuditor {
  static TOL = 0.02; // 2 céntimos

  static audit(resultados) {
    const warnings = [];

    // Recalcular coste empresa, expolio y porcentaje con fórmula alternativa
    const costeEmpresa2 = round2(resultados.salario_bruto_total + resultados.cotizaciones_empresa.total);
    const expolio2 = round2(resultados.cotizaciones_trabajador.total + resultados.cotizaciones_empresa.total);
    const pct2 = costeEmpresa2 === 0 ? 0 : (expolio2 / costeEmpresa2) * 100;

    if (Math.abs(costeEmpresa2 - round2(resultados.coste_total_empresa)) > this.TOL) {
      warnings.push({ codigo: 'AUDIT_COSTE_EMPRESA', mensaje: 'Diferencia en coste empresa (método alternativo)' });
    }
    if (Math.abs(expolio2 - round2(resultados.expolio_total)) > this.TOL) {
      warnings.push({ codigo: 'AUDIT_EXPOLIO', mensaje: 'Diferencia en expolio total (método alternativo)' });
    }
    if (Math.abs(pct2 - resultados.porcentaje_expolio) > 0.1) {
      warnings.push({ codigo: 'AUDIT_PORCENTAJE', mensaje: 'Diferencia en porcentaje de expolio (método alternativo)' });
    }

    return { warnings, recalculo: { costeEmpresa2, expolio2, pct2 } };
  }
}

export default CalculationAuditor;
