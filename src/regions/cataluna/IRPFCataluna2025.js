// IRPFCataluna2025.js - Escala autonómica de Cataluña (progresiva alta)
export class IRPFCataluna2025 {
  static TRAMOS_AUTONOMICOS = [
    { hasta: 12450, tipo: 9.5 },
    { hasta: 20200, tipo: 12 },
    { hasta: 35200, tipo: 15 },
    { hasta: 60000, tipo: 18.5 },
    { hasta: 90000, tipo: 23 },
    { hasta: 300000, tipo: 25 },
    { infinito: true, tipo: 25.5 }
  ];
}

export default IRPFCataluna2025;