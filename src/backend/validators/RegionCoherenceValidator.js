// RegionCoherenceValidator.js
// Valida coherencia de modelos IRPF regionales respecto a reglas mínimas y fuentes esperadas

export class RegionCoherenceValidator {
  /**
   * Valida coherencia de tramos: orden, progresividad y tramo infinito
   * @param {Array<{hasta?:number,infinito?:boolean,tipo:number}>} tramos
   * @returns {{ok:boolean, errores:string[], warnings:string[]}}
   */
  static validarTramos(tramos = []) {
    const errores = [];
    const warnings = [];

    if (!Array.isArray(tramos) || !tramos.length) {
      errores.push('E_TRAMOS_VACIO: No hay tramos definidos');
      return { ok: false, errores, warnings };
    }

    // Orden y límites
    for (let i = 0; i < tramos.length - 1; i++) {
      const cur = tramos[i];
      const nxt = tramos[i + 1];

      if (!nxt.infinito && (cur.hasta == null || nxt.hasta == null)) {
        errores.push(`E_LIMITE_NULO: Tramo ${i + 1} o ${i + 2} sin límite 'hasta'`);
      }
      if (!nxt.infinito && cur.hasta >= nxt.hasta) {
        errores.push(`E_DESORDEN_LIMITE: ${cur.hasta} ≥ ${nxt.hasta} (tramo ${i + 1}→${i + 2})`);
      }
      if (!nxt.infinito && cur.tipo > nxt.tipo) {
        warnings.push(`W_REGRESIVIDAD: ${cur.tipo}% → ${nxt.tipo}% (tramo ${i + 1}→${i + 2})`);
      }
    }

    // Tramo infinito final
    const last = tramos[tramos.length - 1];
    if (!last.infinito) {
      errores.push('E_SIN_INFINITO: Falta tramo infinito final');
    }

    // Rango razonable de tipos
    const tipos = tramos.map(t => t.tipo).filter(v => typeof v === 'number');
    const min = Math.min(...tipos);
    const max = Math.max(...tipos);
    if (min < 5) warnings.push(`W_TIPO_MIN_BAJO: ${min}% (<5%)`);
    if (max > 30) warnings.push(`W_TIPO_MAX_ALTO: ${max}% (>30%)`);

    return { ok: errores.length === 0, errores, warnings };
  }

  /**
   * Valida coherencia de un modelo IRPF región (objeto estático con TRAMOS_AUTONOMICOS)
   * @param {object} model - Clase o objeto con propiedad estática o campo TRAMOS_AUTONOMICOS
   * @param {string} regionId - Identificador de región para etiquetar mensajes
   */
  static validarModelo(model, regionId = 'desconocida') {
    const tramos = model?.TRAMOS_AUTONOMICOS || model?.TRAMOS_AUTONOMICOS_VALENCIA || [];
    const res = this.validarTramos(tramos);
    return { regionId, ...res };
  }

  /**
   * Ejecuta validación de todas las regiones registradas en RegionManager
   * @param {import('../core/RegionManager.js').default} RegionManager
   * @returns {{okGlobal:boolean, resultados:Array}}
   */
  static validarTodas(RegionManager) {
    const regiones = RegionManager.listRegions();
    const resultados = regiones.map(r => this.validarModelo(r.irpf, r.id));
    const okGlobal = resultados.every(r => r.ok);
    return { okGlobal, resultados };
  }
}

export default RegionCoherenceValidator;
