// utils.js - Utilidades comunes para ACDaño PRO v4.0

/** Redondea a 2 decimales de forma segura */
export function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

/** Formatea euros con dos decimales */
export function euro(n) {
  return `${round2(n).toFixed(2)}€`;
}

/** Asegura un número dentro de un rango [min, max] */
export function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

/** Valida que un objeto tenga propiedades obligatorias */
export function requireProps(obj, props) {
  const missing = props.filter(p => !(p in obj));
  if (missing.length) {
    throw new Error(`Faltan propiedades obligatorias: ${missing.join(', ')}`);
  }
  return true;
}

/** Crea un ID simple único (no criptográfico) */
export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Devuelve timestamp ISO corto */
export function ts() {
  return new Date().toISOString();
}
