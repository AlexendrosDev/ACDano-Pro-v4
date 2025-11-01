# 🚀 ACDaño PRO v4.0 - La Turbocomputación de Nóminas

[![ES](https://img.shields.io/badge/Lang-Espa%C3%B1ol-red.svg)](README.md)
[![License](https://img.shields.io/badge/License-Educational-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-4.0-green.svg)](CHANGELOG.md)
[![Valencia](https://img.shields.io/badge/Made%20in-Valencia-orange.svg)](https://www.valencia.es/)

## 🇦🇪 **"Con nuestro dinero harás lo que DEBES, no lo que quieres"**

### 📝 **¿Qué es ACDaño PRO?**

ACDaño PRO v4.0 es **más que una calculadora de nóminas** - es un **movimiento de transparencia fiscal** que revela la realidad del expolio que sufren los trabajadores de hostelería en España.

### 🔥 **Filosofía Revolucionaria**

- *"Lo injusto no es aportar, es que lo cojan sin permiso ni respeto"*
- *"Sales de casa, te dejas la piel, sufres ansiedad... y el Estado se queda con el 38,8%"*
- *"🇦🇪 Riqueza propia, ESPAÑOLA - Desde las estrellas hasta el corazón del mundo"*

---

## 🎯 **Objetivos del Proyecto**

1. **🔍 Transparencia absoluta** del cálculo de nóminas
2. **⚡ Concienciación** sobre el expolio fiscal real (38,8% promedio)
3. **⚖️ Precisión legal** según normativa vigente 2025
4. **🎓 Herramienta educativa** sobre derechos laborales
5. **🚀 Base tecnológica** para un movimiento de transformación social

---

## 📊 **Características Principales**

### ⚖️ **Cumplimiento Normativo 2025**
- **Convenio Hostelería Valencia 2022-2025** (BOP nº 26, 07/02/2023)
- **Bases Seguridad Social 2025** (Orden PJC/178/2025)
- **IRPF Estado + Valencia** (Ley 35/2006 + Ley 13/1997) 
- **AT/EP obligatorio 1,25%** (RD 2064/1995)
- **Validaciones matemáticas** automáticas de coherencia

### 💻 **Arquitectura Técnica**
- **🧩 Modular**: Clases especializadas por responsabilidad
- **🔍 Escalable**: Fácil añadir nuevas funcionalidades  
- **⚙️ Testeable**: Suite completa de tests unitarios
- **📱 Responsiva**: Diseño adaptable a todos los dispositivos
- **🎨 Accesible**: Cumple estándares WCAG 2.1

### 📈 **Funcionalidades Avanzadas**
- **Medidor de Expolio Fiscal** con animaciones
- **Panel de Validaciones** en tiempo real
- **Cálculos precisos** según tablas oficiales
- **Desglose completo** de cotizaciones y retenciones
- **Modo oscuro** automático

---

## 📚 **Estructura del Proyecto**

```
ACDano-Pro-v4/
├── 🏠 src/
│   ├── 📋 backend/
│   │   ├── models/
│   │   │   ├── ConvenioValencia.js      # Tablas salariales oficiales
│   │   │   ├── SeguridadSocial2025.js   # Bases y tipos SS 2025
│   │   │   └── IRPFValencia2025.js      # Tramos IRPF completos
│   │   ├── calculators/
│   │   │   ├── BaseCalculator.js        # Cálculos base y conceptos
│   │   │   ├── CotizacionCalculator.js  # Cotizaciones SS
│   │   │   └── IRPFCalculator.js        # Cálculos IRPF Valencia
│   │   └── validators/
│   │       └── LogicValidator.js        # Validaciones coherencia
│   ├── 🎨 frontend/
│   │   ├── components/
│   │   │   ├── FormularioTrabajador.js # Recogida datos
│   │   │   ├── ResultadosNomina.js     # Visualización resultados
│   │   │   ├── ValidacionesPanel.js   # Panel validaciones
│   │   │   └── ExpolioMeter.js        # Medidor expolio fiscal
│   │   └── styles/
│   │       ├── tokens.css              # Design System
│   │       ├── components.css          # Estilos componentes
│   │       └── layout.css              # Estructura y responsive
│   └── 🔧 shared/
│       ├── utils.js                 # Utilidades comunes
│       └── constants.js             # Constantes globales
├── 🧪 tests/
│   ├── unit/                    # Tests unitarios
│   ├── integration/             # Tests integración
│   └── e2e/                     # Tests end-to-end
├── 📝 docs/
│   ├── pseudocodigo.md          # Pseudocódigo completo
│   ├── arquitectura.md          # Documentación técnica
│   ├── normativa.md             # Referencias legales
│   └── casos-uso.md             # Ejemplos prácticos
├── 📎 dist/                   # Build producción
├── 🔧 config/                 # Configuración
└── 📦 package.json            # Dependencias y scripts
```

---

## 🚀 **Instalación y Uso**

### 1️⃣ **Clonar el Repositorio**
```bash
git clone https://github.com/AlexendrosDev/ACDano-Pro-v4.git
cd ACDano-Pro-v4
```

### 2️⃣ **Instalar Dependencias**
```bash
npm install
# o
yarn install
```

### 3️⃣ **Ejecutar en Desarrollo**
```bash
npm run dev
# La aplicación estará disponible en http://localhost:3000
```

### 4️⃣ **Ejecutar Tests**
```bash
npm test              # Tests unitarios
npm run test:coverage # Cobertura de tests
npm run test:e2e      # Tests end-to-end
```

### 5️⃣ **Build para Producción**
```bash
npm run build
npm run serve:prod
```

---

## 📋 **Casos de Uso Principales**

### 👨‍🍳 **Cocinero Nivel III - Jornada Continuada**
- **Salario Base**: 1.214,84€
- **Plus Formación**: 20,00€ (opcional)
- **Plus Transporte**: 46,80€ (jornada continuada)
- **Expolio Fiscal Esperado**: ~38,5%

### 👨‍🔭 **Camarero Nivel II - Hotel 4* - Jornada Partida**
- **Salario Base**: 1.363,05€ (Tabla II)
- **Plus Transporte**: 55,81€ (jornada partida)
- **Manutención**: 44,13€
- **Expolio Fiscal Esperado**: ~39,2%

---

## ⚖️ **Normativa Implementada**

| **Referencia** | **Descripción** | **Estado** |
|---|---|---|
| BOP Valencia nº 26 (07/02/2023) | Convenio Hostelería Valencia 2022-2025 | ✅ Implementado |
| Orden PJC/178/2025 | Bases y tipos cotización SS 2025 | ✅ Implementado |
| RD 2064/1995 | AT/EP obligatorio 1,25% | ✅ Implementado |
| Ley 35/2006 | Ley del IRPF estatal | ✅ Implementado |
| Ley 13/1997 | IRPF Comunidad Valenciana | ✅ Implementado |
| RD Legislativo 8/2015 | Ley General Seguridad Social | ✅ Implementado |

---

## 🧪 **Testing y Calidad**

### 🔍 **Validaciones Automáticas**
- ✅ **Base Cotización ≤ Salario Bruto** (coherencia matemática)
- ✅ **Base IRPF ≥ Base Cotización** (incluye no salariales)
- ✅ **Salario Líquido < Salario Bruto** (lógica deducciones)
- ✅ **AT/EP ≠ 0%** (cumplimiento RD 2064/1995)
- ✅ **Rangos IRPF coherentes** (30-45% típico)

### 📈 **Cobertura de Tests**
- **Modelos de datos**: 100%
- **Calculadores**: 95%+
- **Validadores**: 100%
- **Componentes UI**: 85%+
- **Integración**: 90%+

---

## 📊 **Medidor de Expolio Fiscal**

### 🟢 **Nivel Bajo (< 25%)**
- **Color**: Verde
- **Mensaje**: "Nivel de expolio relativamente bajo"
- **Típico**: Salarios muy bajos con mínimos familiares

### 🟡 **Nivel Moderado (25-35%)**
- **Color**: Amarillo
- **Mensaje**: "Nivel de expolio moderado - típico en España"
- **Típico**: Salarios medios del sector

### 🔴 **Nivel Crítico (> 35%)**
- **Color**: Rojo
- **Mensaje**: "😨 EXPOLIO CRÍTICO - El Estado se queda con más del 35%"
- **Típico**: Salarios altos o situaciones especiales

---

## 🤝 **Contribuir al Proyecto**

### 🐛 **Reportar Bugs**
1. Verificar que no existe el issue
2. Crear nuevo issue con plantilla
3. Incluir pasos para reproducir
4. Añadir capturas si es posible

### ✨ **Proponer Mejoras**
1. Fork del repositorio
2. Crear rama feature/nueva-funcionalidad
3. Implementar con tests
4. Pull Request con descripción detallada

### ⚖️ **Actualizaciones Normativas**
- Convenios colectivos de otras provincias
- Cambios en bases de cotización
- Actualizaciones tramos IRPF
- Nuevas deducciones autonómicas

---

## 📜 **Licencia y Uso**

```
ACDaño PRO v4.0 - Sistema de Cálculo de Nóminas
Copyright © 2025 - Creado en España 🇦🇪

Este software es de código libre para uso educativo y de concienciación.
Prohibido su uso comercial sin autorización expresa.

"Con nuestro dinero harás lo que DEBES, no lo que quieres"
```

---

## 📩 **Contacto y Soporte**

- **👨‍💻 Desarrollador**: AlexendrosDev
- **🌍 GitHub**: [github.com/AlexendrosDev](https://github.com/AlexendrosDev)
- **📍 Ubicación**: Valencia, España 🇦🇪
- **🔗 Repositorio**: [ACDano-Pro-v4](https://github.com/AlexendrosDev/ACDano-Pro-v4)

---

### 🇦🇪 **"Riqueza propia, ESPAÑOLA - Desde las estrellas hasta el corazón del mundo"**

---

*Si este proyecto te parece útil para la transparencia fiscal y la concienciación social, ¡dale una ⭐ estrella en GitHub!*