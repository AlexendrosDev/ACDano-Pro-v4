// SectorManager.js - Registro y gestión de sectores como plugins

export class SectorManager {
  static _sectors = new Map();

  static registerSector(id, config) {
    if (!id || typeof id !== 'string') throw new Error('Sector id inválido');
    if (!config || typeof config !== 'object') throw new Error('Sector config inválida');

    const required = ['name','convenio','calculator','validator'];
    for (const k of required) {
      if (!(k in config)) throw new Error(`Falta propiedad requerida en sector: ${k}`);
    }

    if (this._sectors.has(id)) {
      console.warn(`Sector ${id} ya estaba registrado. Sobrescribiendo.`);
    }
    this._sectors.set(id, { id, ...config });
  }

  static getSector(id) {
    return this._sectors.get(id) || null;
  }

  static listSectors() {
    return Array.from(this._sectors.values());
  }
}

export default SectorManager;