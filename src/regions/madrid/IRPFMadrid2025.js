// IRPFMadrid2025.js - Escala autonómica de la Comunidad de Madrid (corregida)
export class IRPFMadrid2025 {
  static TRAMOS_AUTONOMICOS = [
    { hasta: 13362, tipo: 8.5 },
    { hasta: 18004, tipo: 10.7 },
    { hasta: 20200, tipo: 12.8 },
    { hasta: 35425, tipo: 15.8 }, // corregido: antes 12.8
    { hasta: 57320, tipo: 17.4 },
    { infinito: true, tipo: 20.5 }
  ];
}

export default IRPFMadrid2025;