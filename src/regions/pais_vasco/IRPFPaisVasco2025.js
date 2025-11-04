// IRPFPaisVasco2025.js - Modelo foral (indicativo). Cada Diputación foral define su escala.
export class IRPFPaisVasco2025 {
  // Modelo genérico; en producción, usar Normas Forales de Álava, Bizkaia y Gipuzkoa
  static TRAMOS_ESTATALES = [
    { hasta: 12450, tipo: 9.5 },
    { hasta: 20200, tipo: 12 },
    { hasta: 35200, tipo: 15 },
    { hasta: 60000, tipo: 18.5 },
    { infinito: true, tipo: 22.5 }
  ];

  static TRAMOS_AUTONOMICOS = [
    { hasta: 12450, tipo: 9 },
    { hasta: 20200, tipo: 11.5 },
    { hasta: 35200, tipo: 14 },
    { hasta: 60000, tipo: 18 },
    { infinito: true, tipo: 22 }
  ];
}

export default IRPFPaisVasco2025;