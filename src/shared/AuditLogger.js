// AuditLogger.js - Trazabilidad de cálculo
export class AuditLogger {
  static log(event, payload = {}) {
    const entry = {
      ts: new Date().toISOString(),
      event,
      ...payload,
    };
    // Consola como backend neutral; fácil de redirigir en el futuro
    console.log('AUDIT_LOG', entry);
    return entry;
  }
}
export default AuditLogger;
