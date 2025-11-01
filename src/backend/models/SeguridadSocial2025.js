/** Carga de datos normativos SS desde JSON */
import ss from '../../data/seguridad_social_2025.json' assert { type: 'json' };

export class SeguridadSocial2025 {
  static BASES = ss.bases;
  static TIPOS_TRABAJADOR = ss.tipos_trabajador;
  static TIPOS_EMPRESA = ss.tipos_empresa;

  static aplicarTopes(baseCotizacion) {
    let baseTopada = baseCotizacion;
    if (baseTopada < this.BASES.BASE_MINIMA_GRUPO_5_7) baseTopada = this.BASES.BASE_MINIMA_GRUPO_5_7;
    if (baseTopada > this.BASES.BASE_MAXIMA) baseTopada = this.BASES.BASE_MAXIMA;
    return baseTopada;
  }
  static getTotalTrabajador() { return Object.values(this.TIPOS_TRABAJADOR).reduce((a,b)=>a+b,0); }
  static getTotalEmpresa() { return Object.values(this.TIPOS_EMPRESA).reduce((a,b)=>a+b,0); }
  static validarATEP() { return this.TIPOS_EMPRESA.ATEP > 0; }
}

export default SeguridadSocial2025;
