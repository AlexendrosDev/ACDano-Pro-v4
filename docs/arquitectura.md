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

- src/frontend/components/
  - FormularioTrabajador.js, ResultadosNomina.js, ValidacionesPanel.js, ExpolioMeter.js

- src/shared/
  - utils.js, constants.js

## Flujo de Cálculo

1. BaseCalculator → conceptos y bases
2. CotizacionCalculator → SS trabajador/empresa
3. IRPFCalculator → retención mensual
4. Agregación → líquido, coste empresa, expolio
5. LogicValidator → validaciones críticas

## Extensibilidad

- Nuevas provincias: crear modelo ConvenioProvinciaX.js y conectar en BaseCalculator
- Nuevos años: clonar SeguridadSocialYYYY e IRPFComunidadYYYY
- UI: componentes reactivos, sin estado global persistente

## Calidad

- ES Modules, TypeScript opcional (tsc --noEmit)
- Jest + Playwright para tests
- ESLint + Prettier + Husky + lint-staged
