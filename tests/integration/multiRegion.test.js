/**
 * 🧪 IMP-002: Test Suite Regional Completa - Multi-Región
 * 
 * Valida cálculos de nóminas para las 19 regiones españolas con casos salariales diversos.
 * Cada región se prueba con 4 casos: salario mínimo, medio, alto y casos edge.
 * 
 * @author AlexendrosDev
 * @date 2025-11-04
 * @version 4.0.0
 */

import { CalculadorNomina } from '../../src/core/CalculadorNomina.js';
import { RegionManager } from '../../src/core/RegionManager.js';
import { regionTestCases } from '../data/regionTestCases.js';

describe('🌍 IMP-002: Test Suite Regional Completa', () => {
  let calculador;
  let regionManager;

  beforeEach(() => {
    calculador = new CalculadorNomina();
    regionManager = new RegionManager();
  });

  describe('🗺️ Validación Estructural por Región', () => {
    const regiones = [
      // Región de Madrid
      { codigo: 'madrid', nombre: 'Madrid', irpfAutonomico: 0.005 },
      { codigo: 'cataluna', nombre: 'Cataluña', irpfAutonomico: 0.025 },
      { codigo: 'valencia', nombre: 'Valencia', irpfAutonomico: 0.018 },
      { codigo: 'andalucia', nombre: 'Andalucía', irpfAutonomico: 0.0175 },
      { codigo: 'pais_vasco', nombre: 'País Vasco', irpfAutonomico: 0.031 },
      { codigo: 'galicia', nombre: 'Galicia', irpfAutonomico: 0.0155 },
      { codigo: 'castilla_leon', nombre: 'Castilla y León', irpfAutonomico: 0.015 },
      { codigo: 'canarias', nombre: 'Canarias', irpfAutonomico: 0.0135 },
      { codigo: 'castilla_mancha', nombre: 'Castilla-La Mancha', irpfAutonomico: 0.01 },
      { codigo: 'murcia', nombre: 'Murcia', irpfAutonomico: 0.012 },
      { codigo: 'aragon', nombre: 'Aragón', irpfAutonomico: 0.018 },
      { codigo: 'extremadura', nombre: 'Extremadura', irpfAutonomico: 0.015 },
      { codigo: 'asturias', nombre: 'Asturias', irpfAutonomico: 0.016 },
      { codigo: 'baleares', nombre: 'Baleares', irpfAutonomico: 0.0205 },
      { codigo: 'navarra', nombre: 'Navarra', irpfAutonomico: 0.028 },
      { codigo: 'cantabria', nombre: 'Cantabria', irpfAutonomico: 0.0145 },
      { codigo: 'rioja', nombre: 'La Rioja', irpfAutonomico: 0.0135 },
      { codigo: 'ceuta', nombre: 'Ceuta', irpfAutonomico: 0.005 },
      { codigo: 'melilla', nombre: 'Melilla', irpfAutonomico: 0.005 }
    ];

    regiones.forEach(region => {
      describe(`📍 ${region.nombre} (${region.codigo})`, () => {
        
        it('debe calcular correctamente salario mínimo (760€)', async () => {
          const datos = {
            salarioBase: 760,
            complementos: 0,
            horasExtra: 0,
            region: region.codigo,
            tipoContrato: 'indefinido',
            antiguedad: 0
          };

          const resultado = await calculador.calcular(datos);

          expect(resultado.validacion.esValido).toBe(true);
          expect(resultado.resultados.ingresos.totalBruto).toBe(760);
          expect(resultado.resultados.resumen.liquido).toBeGreaterThan(600);
          expect(resultado.resultados.resumen.liquido).toBeLessThan(680);
          
          // Validar estructura completa
          expect(resultado.resultados.deducciones.seguridadSocial).toBeDefined();
          expect(resultado.resultados.deducciones.irpf).toBeDefined();
          expect(resultado.resultados.empresa.costeTotal).toBeGreaterThan(800);
          expect(resultado.resultados.expolio.porcentajeSobreCoste).toBeGreaterThan(0.35);
        });

        it('debe calcular correctamente salario medio (1.400€)', async () => {
          const datos = {
            salarioBase: 1400,
            complementos: 150,
            horasExtra: 2,
            region: region.codigo,
            tipoContrato: 'indefinido',
            antiguedad: 3
          };

          const resultado = await calculador.calcular(datos);

          expect(resultado.validacion.esValido).toBe(true);
          expect(resultado.resultados.ingresos.totalBruto).toBeGreaterThan(1500);
          expect(resultado.resultados.resumen.liquido).toBeGreaterThan(1100);
          expect(resultado.resultados.resumen.liquido).toBeLessThan(1300);
          
          // IRPF debe aplicarse correctamente
          expect(resultado.resultados.deducciones.irpf.retencion).toBeGreaterThan(50);
          expect(resultado.auditIRPF.tipoMedio).toBeGreaterThan(0.05);
        });

        it('debe calcular correctamente salario alto (2.500€)', async () => {
          const datos = {
            salarioBase: 2500,
            complementos: 300,
            horasExtra: 5,
            region: region.codigo,
            tipoContrato: 'indefinido',
            antiguedad: 8
          };

          const resultado = await calculador.calcular(datos);

          expect(resultado.validacion.esValido).toBe(true);
          expect(resultado.resultados.ingresos.totalBruto).toBeGreaterThan(2700);
          expect(resultado.resultados.resumen.liquido).toBeGreaterThan(1900);
          expect(resultado.resultados.resumen.liquido).toBeLessThan(2200);
          
          // Validar tramos IRPF altos
          expect(resultado.resultados.deducciones.irpf.retencion).toBeGreaterThan(200);
          expect(resultado.auditIRPF.tipoMedio).toBeGreaterThan(0.12);
          expect(resultado.resultados.expolio.porcentajeSobreCoste).toBeGreaterThan(0.40);
        });

        it('debe manejar correctamente casos edge (bonus + antigQedad)', async () => {
          const datos = {
            salarioBase: 1800,
            complementos: 500, // Bonus alto
            horasExtra: 8, // Máximo permitido
            region: region.codigo,
            tipoContrato: 'indefinido',
            antiguedad: 15, // Antigüedad alta
            bonus: 200
          };

          const resultado = await calculador.calcular(datos);

          expect(resultado.validacion.esValido).toBe(true);
          
          // Casos edge no deben generar errores
          expect(resultado.validacion.errores).toHaveLength(0);
          
          // Warnings son aceptables en casos edge
          const warningsRelevantes = resultado.validacion.warnings.filter(
            w => !w.includes('SECTOR_') && !w.includes('BONUS_')
          );
          expect(warningsRelevantes.length).toBeLessThanOrEqual(2);
          
          // Validar coherencia de cálculos complejos
          const totalIngresos = datos.salarioBase + datos.complementos + (datos.bonus || 0);
          expect(resultado.resultados.ingresos.totalBruto).toBeGreaterThan(totalIngresos * 1.05);
          expect(resultado.resultados.empresa.costeTotal).toBeGreaterThan(totalIngresos * 1.35);
        });

        it('debe validar coherencia fiscal por región', () => {
          // Validar que el IRPF autonómico esté en rango esperado
          expect(region.irpfAutonomico).toBeGreaterThanOrEqual(0.005);
          expect(region.irpfAutonomico).toBeLessThanOrEqual(0.035);
          
          // Validar que la región esté registrada en RegionManager
          const regionData = regionManager.getRegion(region.codigo);
          expect(regionData).toBeDefined();
          expect(regionData.nombre).toBe(region.nombre);
        });
      });
    });
  });

  describe('🔍 Validación de Casos Edge Multi-Región', () => {
    
    it('debe manejar transiciones entre tramos IRPF en todas las regiones', async () => {
      const salariosTramos = [12450, 20199, 35199, 59999]; // Límites tramos IRPF
      const regionesClave = ['madrid', 'cataluna', 'pais_vasco', 'andalucia'];
      
      for (const salario of salariosTramos) {
        for (const region of regionesClave) {
          const datos = {
            salarioBase: salario,
            complementos: 0,
            horasExtra: 0,
            region,
            tipoContrato: 'indefinido',
            antiguedad: 2
          };

          const resultado = await calculador.calcular(datos);
          
          expect(resultado.validacion.esValido).toBe(true);
          expect(resultado.auditIRPF.cuotasPorTramo).toBeDefined();
          
          // En límites de tramos, no debe haber errores de auditoría
          const erroresIRPF = resultado.validacion.errores.filter(e => e.includes('IRPF'));
          expect(erroresIRPF).toHaveLength(0);
        }
      }
    });

    it('debe calcular correctamente el expolio fiscal en regiones extremas', async () => {
      const regionesExtremas = [
        { codigo: 'pais_vasco', esperadoMin: 0.38, esperadoMax: 0.45 }, // Foral, menos expolio
        { codigo: 'andalucia', esperadoMin: 0.42, esperadoMax: 0.48 },   // Régimen general
        { codigo: 'ceuta', esperadoMin: 0.35, esperadoMax: 0.42 }        // Beneficios fiscales
      ];
      
      for (const region of regionesExtremas) {
        const datos = {
          salarioBase: 2000,
          complementos: 200,
          horasExtra: 3,
          region: region.codigo,
          tipoContrato: 'indefinido',
          antiguedad: 5
        };

        const resultado = await calculador.calcular(datos);
        
        expect(resultado.validacion.esValido).toBe(true);
        
        const expolioPorcentaje = resultado.resultados.expolio.porcentajeSobreCoste;
        expect(expolioPorcentaje).toBeGreaterThanOrEqual(region.esperadoMin);
        expect(expolioPorcentaje).toBeLessThanOrEqual(region.esperadoMax);
      }
    });

    it('debe validar integridad de datos en cálculos masivos', async () => {
      const regionesAleatorias = ['valencia', 'madrid', 'cataluna', 'galicia', 'murcia'];
      const salarios = [900, 1200, 1600, 2200, 3000];
      
      const resultados = [];
      
      for (const region of regionesAleatorias) {
        for (const salario of salarios) {
          const datos = {
            salarioBase: salario,
            complementos: Math.floor(salario * 0.1),
            horasExtra: Math.floor(Math.random() * 6),
            region,
            tipoContrato: 'indefinido',
            antiguedad: Math.floor(Math.random() * 10)
          };

          const resultado = await calculador.calcular(datos);
          resultados.push({ region, salario, resultado });
          
          // Todos los cálculos deben ser válidos
          expect(resultado.validacion.esValido).toBe(true);
          
          // Validaciones de coherencia básica
          expect(resultado.resultados.resumen.liquido).toBeGreaterThan(0);
          expect(resultado.resultados.empresa.costeTotal).toBeGreaterThan(resultado.resultados.ingresos.totalBruto);
          expect(resultado.resultados.expolio.totalEstado).toBeGreaterThan(0);
        }
      }
      
      // Validar que no hay outliers extremos
      const liquidos = resultados.map(r => r.resultado.resultados.resumen.liquido);
      const costes = resultados.map(r => r.resultado.resultados.empresa.costeTotal);
      
      expect(Math.max(...liquidos) / Math.min(...liquidos)).toBeLessThan(5); // Ratio razonable
      expect(Math.max(...costes) / Math.min(...costes)).toBeLessThan(4);
    });
  });

  describe('🚨 Validación de Performance Multi-Región', () => {
    
    it('debe calcular todas las regiones en menos de 10 segundos', async () => {
      const inicio = Date.now();
      const promesas = [];
      
      const regiones = ['madrid', 'cataluna', 'valencia', 'andalucia', 'pais_vasco', 
                      'galicia', 'castilla_leon', 'canarias', 'murcia', 'aragon',
                      'extremadura', 'asturias', 'baleares', 'navarra', 'cantabria',
                      'rioja', 'castilla_mancha', 'ceuta', 'melilla'];
      
      regiones.forEach(region => {
        const datos = {
          salarioBase: 1500,
          complementos: 100,
          horasExtra: 2,
          region,
          tipoContrato: 'indefinido',
          antiguedad: 3
        };
        
        promesas.push(calculador.calcular(datos));
      });
      
      const resultados = await Promise.all(promesas);
      const tiempoTotal = Date.now() - inicio;
      
      // Todos deben ser válidos
      resultados.forEach(resultado => {
        expect(resultado.validacion.esValido).toBe(true);
      });
      
      // Performance: menos de 10 segundos para 19 regiones
      expect(tiempoTotal).toBeLessThan(10000);
      
      // Performance individual: menos de 500ms promedio
      const tiempoPromedio = tiempoTotal / regiones.length;
      expect(tiempoPromedio).toBeLessThan(500);
    });
  });
});

/**
 * 📈 Estadísticas del Test Suite:
 * 
 * - 19 regiones españolas cubiertas
 * - 4 casos salariales por región (76 tests base)
 * - 3 bloques de validación adicionales (edge cases)
 * - 1 bloque de performance
 * - Total: ~100+ assertions
 * 
 * Cobertura:
 * - Salarios: 760€ a 3.000€ + casos edge
 * - IRPF: Todos los tramos y transiciones
 * - Expolio fiscal: Validación por región
 * - Performance: <500ms por cálculo
 * - Integridad: 0 errores en cálculos masivos
 */