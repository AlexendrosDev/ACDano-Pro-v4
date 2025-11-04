// bootstrapRegions.js - Registro centralizado de regiones iniciales
import RegionManager from '../core/RegionManager.js';
import IRPFValencia2025 from '../regions/valencia/IRPFValencia2025.js';
import IRPFMadrid2025 from '../regions/madrid/IRPFMadrid2025.js';
import IRPFCataluna2025 from '../regions/cataluna/IRPFCataluna2025.js';
import IRPFAndalucia2025 from '../regions/andalucia/IRPFAndalucia2025.js';
import IRPFPaisVasco2025 from '../regions/pais_vasco/IRPFPaisVasco2025.js';

export function registerInitialRegions() {
  RegionManager.registerRegion('valencia', { name: 'Comunitat Valenciana', irpf: IRPFValencia2025 });
  RegionManager.registerRegion('madrid', { name: 'Comunidad de Madrid', irpf: IRPFMadrid2025 });
  RegionManager.registerRegion('cataluna', { name: 'Cataluña', irpf: IRPFCataluna2025 });
  RegionManager.registerRegion('andalucia', { name: 'Andalucía', irpf: IRPFAndalucia2025 });
  RegionManager.registerRegion('pais_vasco', { name: 'País Vasco (foral)', irpf: IRPFPaisVasco2025 });
}

export default registerInitialRegions;