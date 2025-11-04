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
   * Valida un modelo vs su fixture oficial
   * @param {object} model - Modelo IRPF con TRAMOS_AUTONOMICOS
   * @param {object} fixture - Fixture con { tramos, source, foral?, ... }
   * @param {object} opts - { tolerancia: number }
   * @returns {{ok:boolean, errores:string[], warnings:string[]}}
   */
  static validarVsFixture(model, fixture, opts = { tolerancia: 0.01 }) {
    const errores = [];
    const warnings = [];
    const { tolerancia } = opts;

    const tramosModel = model?.TRAMOS_AUTONOMICOS || [];
    const tramosFixture = fixture?.tramos || [];

    if (!tramosFixture.length) {
      warnings.push('W_FIXTURE_VACIO: Fixture sin tramos de referencia');
      return { ok: true, errores, warnings };
    }

    // Número de tramos
    if (tramosModel.length !== tramosFixture.length) {
      errores.push(`E_NUM_TRAMOS: Modelo ${tramosModel.length} vs Fixture ${tramosFixture.length}`);
    }

    // Comparar tramo a tramo
    const maxComp = Math.min(tramosModel.length, tramosFixture.length);
    for (let i = 0; i < maxComp; i++) {
      const tm = tramosModel[i];
      const tf = tramosFixture[i];

      // Límites
      if (tm.infinito !== tf.infinito) {
        errores.push(`E_INFINITO_DIFIERE: Tramo ${i + 1} - Modelo:${tm.infinito} vs Fixture:${tf.infinito}`);
      }
      if (!tm.infinito && !tf.infinito && Math.abs(tm.hasta - tf.hasta) > 1) {
        errores.push(`E_LIMITE_DIFIERE: Tramo ${i + 1} - Modelo:${tm.hasta} vs Fixture:${tf.hasta}`);
      }

      // Tipos (con tolerancia)
      if (Math.abs(tm.tipo - tf.tipo) > tolerancia) {
        errores.push(`E_TIPO_DIFIERE: Tramo ${i + 1} - Modelo:${tm.tipo}% vs Fixture:${tf.tipo}%`);
      }
    }

    // Fuente disponible
    if (!fixture.source || fixture.source.trim() === '') {
      warnings.push('W_FUENTE_AUSENTE: Fixture sin fuente oficial documentada');
    }

    // Foral sin detalles (solo informativo)
    if (fixture.foral && tramosModel.length < 6) {
      warnings.push('W_FORAL_SIMPLIFICADO: Modelo simplificado para territorio foral');
    }

    return { ok: errores.length === 0, errores, warnings };
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

  /**
   * Valida todas las regiones vs sus fixtures oficiales
   * @param {import('../core/RegionManager.js').default} RegionManager
   * @param {object} fixturesMap - Mapa { regionId: fixture }
   * @returns {{okGlobal:boolean, resultados:Array}}
   */
  static async validarTodasVsFixtures(RegionManager, fixturesMap = {}) {
    const regiones = RegionManager.listRegions();
    const resultados = [];

    for (const region of regiones) {
      const fixture = fixturesMap[region.id];
      if (!fixture) {
        resultados.push({
          regionId: region.id,
          ok: true,
          errores: [],
          warnings: ['W_SIN_FIXTURE: No hay fixture oficial para validación']
        });
        continue;
      }

      const res = this.validarVsFixture(region.irpf, fixture);
      resultados.push({ regionId: region.id, ...res });
    }

    const okGlobal = resultados.every(r => r.ok);
    return { okGlobal, resultados };
  }
}

export default RegionCoherenceValidator;