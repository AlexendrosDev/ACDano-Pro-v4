# Arquitectura Técnica ACDaño PRO v4.0

## Visión General

Arquitectura modular, escalable y testeable compuesta por tres capas:
- backend/: modelos, calculadores y validadores (ESM puros)
- frontend/: componentes UI desacoplados
- shared/: utilidades y constantes comunes

## Módulos

- src/backend/models/
  - ConvenioValencia.js: tablas salariales y complementos
  - SeguridadSocial2025.js: bases y tipos de cotización (con AT/EP 1,25%)
  - IRPFValencia2025.js: tramos estatales y autonómicos, mínimos personales/familiares

- src/backend/calculators/
  - BaseCalculator.js: conceptos salariales/no salariales, bases
  - CotizacionCalculator.js: SS trabajador/empresa, expolio y coste empresa
  - IRPFCalculator.js: cálculo por tramos y retención mensual

- src/backend/validators/
  - LogicValidator.js: coherencia matemática y sectorial
  - SectorValidator.js: horas extra, nocturnidad, festivos, tope aplicado
  - SectorCoherenceValidator.js: coherencia por categoría/nivel
  - CalculationAuditor.js: doble verificación coste/expolio/porcentaje
  - IRPFTramosAuditor.js: auditoría independiente por tramos (estatal + autonómico)
  - DataIntegrityValidator.js: verificación SHA-256 de normativa JSON

- src/frontend/components/
  - FormularioTrabajador.js, ResultadosNomina.js, ValidacionesPanel.js, ExpolioMeter.js

- src/shared/
  - utils.js, constants.js, AuditLogger.js

## Flujo de Cálculo

1. BaseCalculator → conceptos y bases
2. CotizacionCalculator → SS trabajador/empresa
3. IRPFCalculator → retención mensual
4. Agregación → líquido, coste empresa, expolio
5. Validaciones → LogicValidator, SectorValidator, SectorCoherenceValidator
6. Auditorías → CalculationAuditor, IRPFTramosAuditor
7. Integridad (previo) → DataIntegrityValidator, cacheado por NominaCalculator

## Integridad y Auditoría

- DataIntegrityValidator (SHA-256)
  - Verifica integridad de: convenio_valencia_2025.json, seguridad_social_2025.json, irpf_valencia_2025.json.
  - Se ejecuta automáticamente antes del primer cálculo (NominaCalculator) y se cachea.
- CalculationAuditor (doble verificación)
  - Recalcula coste empresa, expolio total y porcentaje con fórmulas alternativas.
  - Emite warnings si hay diferencias > 0,02€ (o 0,1 p.p. en porcentaje).
- IRPFTramosAuditor
  - Recalcula cuota por tramos estatal/autonómico y compara cuota total y retención mensual con el motor.
  - Si hay diferencias > 0,02€, emite warning AUDIT_IRPF_TRAMOS.
- AuditLogger
  - Traza de entrada/salida del cálculo (AUDIT_LOG) con timestamp, inputs, resultados y validación.

## STRICT_MODE

- Flag interno que convierte ciertos warnings en errores bloqueantes:
  - AUDIT_IRPF_TRAMOS, AUDIT_COSTE_EMPRESA, AUDIT_EXPOLIO, SECTOR_EXPOLIO_FUERA_RANGO
- Recomendado para entornos de producción o lotes masivos.

## Interpretación del Informe

- resultados: ingresos, deducciones, empresa, expolio y resumen (además de estructura retrocompatible).
- validacion: es_valido, errores (críticos/errores), warnings (sectoriales, auditoría, coherencia sectorial).
- auditIRPF: base liquidable auditada, cuotas por tramo, tipo medio y retención estimada.

## Calidad

- ES Modules, TypeScript opcional (tsc --noEmit)
- Jest + Playwright para tests
- ESLint + Prettier + Husky + lint-staged
