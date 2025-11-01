# ACDaño PRO v4.0

## Scripts
- `npm run dev`: desarrollo con Vite
- `npm run build`: build de producción
- `npm run lint`: ESLint + Prettier
- `npm run test`: Jest (unit)

## Integridad y Auditoría

Este proyecto valida los datos normativos y audita los cálculos para garantizar solidez:

- Integridad (DataIntegrityValidator)
  - Verifica SHA-256 de `src/data/*.json` (convenio, seguridad social, IRPF)
  - Se ejecuta automáticamente antes del primer cálculo (cacheado)
- Auditorías
  - CalculationAuditor: doble verificación de coste empresa, expolio y porcentaje
  - IRPFTramosAuditor: recálculo por tramos (estatal+autonómico) y comparación de cuota/retención
  - AuditLogger: traza estructurada de cada cálculo (AUDIT_LOG)
- STRICT_MODE
  - Cuando está activado, ciertos avisos se tratan como errores bloqueantes (AUDIT_IRPF_TRAMOS, AUDIT_COSTE_EMPRESA, AUDIT_EXPOLIO, SECTOR_EXPOLIO_FUERA_RANGO)

### Cómo interpretar el informe

- `resultados`
  - `ingresos`: base, prorrata, complementos, no salariales, total bruto
  - `deducciones`: SS trabajador (detalle), IRPF (base/cupo/tipo/retención), total
  - `empresa`: SS empresa (detalle) y coste total
  - `expolio`: SS trabajador + empresa, total estado, % sobre coste
  - `resumen`: líquido, deducciones, coste, expolio, %
- `validacion`
  - `es_valido`: true/false
  - `errores`: lista de fallos críticos o errores
  - `warnings`: avisos de sector, coherencia y auditorías
- `auditIRPF`
  - `baseLiquidable`, `cuotas` por tramo, `tipoMedio`, `retencionMensual`

## Desglose en UI

El componente `ResultadosNomina` muestra secciones con el desglose completo para facilitar la comprensión del cálculo.

## Notas

- Las GitHub Actions están temporalmente suspendidas (workflow comentado). Reactívalas cuando quieras CI en push/PR.
