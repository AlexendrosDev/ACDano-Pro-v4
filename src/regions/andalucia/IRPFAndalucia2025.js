// IRPFAndalucia2025.js - Escala autonómica de Andalucía
export class IRPFAndalucia2025 {
  static TRAMOS_AUTONOMICOS = [
    { hasta: 13000, tipo: 9.5 },
    { hasta: 21000, tipo: 12 },
    { hasta: 35200, tipo: 15 },
    { hasta: 50000, tipo: 18.5 },
    { infinito: true, tipo: 22.5 }
  ];
}

export default IRPFAndalucia2025;