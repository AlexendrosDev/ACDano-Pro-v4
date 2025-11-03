// BaseTypes.js - Tipos base documentados con JSDoc

/**
 * @typedef {Object} SectorConfig
 * @property {string} id
 * @property {string} name
 * @property {*} convenio
 * @property {*} calculator
 * @property {*} validator
 * @property {Array<string>} categories
 */

/**
 * @typedef {Object} ValidatorResult
 * @property {boolean} es_valido
 * @property {Array<{tipo:string,mensaje:string}>} errores
 * @property {Array<{codigo:string,mensaje:string}>} warnings
 */

/**
 * @typedef {Object} CalculationResult
 * @property {Object} ingresos
 * @property {Object} deducciones
 * @property {Object} empresa
 * @property {Object} expolio
 * @property {ValidatorResult} validacion
 */

export {};