// RegionManager.js - Registro y consulta de regiones (CCAA)
export class RegionManager {
  static _regions = new Map();

  static registerRegion(id, config) {
    if (!id || typeof id !== 'string') throw new Error('Region id inválido');
    if (!config || typeof config !== 'object') throw new Error('Region config inválida');
    const required = ['name','irpf'];
    for (const k of required) {
      if (!(k in config)) throw new Error(`Falta propiedad requerida en región: ${k}`);
    }
    this._regions.set(id, { id, ...config });
  }

  static getRegion(id) {
    return this._regions.get(id) || null;
  }

  static listRegions() {
    return Array.from(this._regions.values());
  }
}

export default RegionManager;