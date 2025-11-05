import NominaCalculator from './backend/NominaCalculator.js';
import FormularioTrabajador from './frontend/components/FormularioTrabajador.js';
import ResultadosNomina from './frontend/components/ResultadosNomina.js';
import ValidacionesPanel from './frontend/components/ValidacionesPanel.js';
import ExpolioMeter from './frontend/components/ExpolioMeter.js';
import { LIMITES } from './shared/constants.js';
import SectorManager from './core/SectorManager.js';
import RegionManager from './core/RegionManager.js';
import PreferenceManager from './shared/PreferenceManager.js';
import registerHosteleria from './sectors/hosteleria/HosteleriaPlugin.js';
import registerLimpieza from './sectors/limpieza/LimpiezaPlugin.js';
import registerInitialRegions from './regions/bootstrapRegions.js';
import RegionCoherenceValidator from './backend/validators/RegionCoherenceValidator.js';

// Registrar sectores y regiones
registerHosteleria();
registerLimpieza();
registerInitialRegions();

// Cargar fixtures oficiales para validación vs fuentes
async function cargarFixturesOficiales() {
  const regionIds = ['madrid', 'cataluna', 'pais_vasco', 'navarra', 'valencia', 'andalucia', 'galicia', 'castilla_y_leon', 'aragon', 'murcia', 'castilla_la_mancha', 'extremadura', 'la_rioja', 'asturias', 'cantabria', 'baleares', 'canarias', 'ceuta', 'melilla'];
  const fixtures = {};
  
  for (const regionId of regionIds) {
    try {
      const response = await fetch(`./data/irpf/oficial/${regionId}.json`);
      if (response.ok) {
        fixtures[regionId] = await response.json();
      }
    } catch (err) {
      console.warn(`No se pudo cargar fixture para ${regionId}:`, err.message);
    }
  }
  
  return fixtures;
}

// Validación de coherencia regional vs fixtures oficiales (sin CI): log + aviso UI
(async () => {
  try {
    // Validación básica
    const { okGlobal, resultados } = RegionCoherenceValidator.validarTodas(RegionManager);
    
    // Validación vs fixtures oficiales
    const fixtures = await cargarFixturesOficiales();
    const { okGlobal: okFixtures, resultados: resultadosFixtures } = await RegionCoherenceValidator.validarTodasVsFixtures(RegionManager, fixtures);
    
    const errores = resultados.filter(r => !r.ok).flatMap(r => r.errores.map(e => `[${r.regionId}] ${e}`));
    const erroresFixtures = resultadosFixtures.filter(r => !r.ok).flatMap(r => r.errores.map(e => `[${r.regionId}] ${e}`));
    const warningsFixtures = resultadosFixtures.flatMap(r => r.warnings.map(w => `[${r.regionId}] ${w}`));
    
    const todoOk = okGlobal && okFixtures;
    const numFixturesValidadas = Object.keys(fixtures).length;
    
    if (!todoOk) {
      const todosErrores = [...errores, ...erroresFixtures];
      console.error('❌ Incoherencias detectadas:', todosErrores);
      
      // Banner rojo (errores críticos)
      const banner = document.createElement('div');
      banner.setAttribute('role', 'alert');
      banner.style.cssText = 'background: rgba(192,21,47,0.1); color: var(--color-error); padding: 8px 12px; border:1px solid rgba(192,21,47,0.25); border-radius:8px; margin: 12px 0; font-weight: 500;';
      banner.textContent = `⚠️ Errores críticos: ${todosErrores.length} incoherencias vs fuentes oficiales. Ver consola.`;
      
      document.addEventListener('DOMContentLoaded', () => {
        const root = document.getElementById('form_root');
        if (root && root.parentElement) root.parentElement.insertBefore(banner, root);
      });
    } else if (warningsFixtures.length > 0) {
      console.warn('🟡 Advertencias menores:', warningsFixtures);
      
      // Banner ámbar (solo warnings)
      const banner = document.createElement('div');
      banner.setAttribute('role', 'alert');
      banner.style.cssText = 'background: rgba(168,75,47,0.1); color: var(--color-warning); padding: 8px 12px; border:1px solid rgba(168,75,47,0.25); border-radius:8px; margin: 12px 0;';
      banner.textContent = `🟡 ${warningsFixtures.length} advertencias menores vs fuentes oficiales. Ver consola.`;
      
      document.addEventListener('DOMContentLoaded', () => {
        const root = document.getElementById('form_root');
        if (root && root.parentElement) root.parentElement.insertBefore(banner, root);
      });
    } else {
      console.info(`✅ Coherencia verificada: ${numFixturesValidadas}/19 fixtures oficiales validadas correctamente`);
    }
  } catch (err) {
    console.error('Error al validar coherencia regional:', err);
  }
})();

function crearSelectorRegion() {
  const regiones = RegionManager.listRegions();
  const options = regiones.map(r => `<option value=\"${r.id}\">${r.name}</option>`).join('');
  return `
    <div class=\"form-group\">
      <label class=\"form-label\" for=\"region\">Región / Comunidad Autónoma</label>
      <select id=\"region\" class=\"form-control\">
        ${options}
      </select>
    </div>
  `;
}

function crearSelectorSector() {
  const sectores = SectorManager.listSectors();
  const options = sectores.map(s => `<option value=\"${s.id}\">${s.name}</option>`).join('');
  return `
    <div class=\"form-group\">
      <label class=\"form-label\" for=\"sector\">Sector</label>
      <select id=\"sector\" class=\"form-control\">
        ${options}
      </select>
    </div>
  `;
}

function crearFormularioHTML() {
  return `
    ${crearSelectorRegion()}
    ${crearSelectorSector()}

    <div class=\"form-group\">
      <label class=\"form-label\" for=\"categoria\">Categoría Profesional</label>
      <select id=\"categoria\" class=\"form-control\">
        <option value=\"\">Seleccionar categoría...</option>
      </select>
    </div>

    <div class=\"form-group\">
      <label class=\"form-label\" for=\"tipo_establecimiento\">Tipo de Establecimiento</label>
      <select id=\"tipo_establecimiento\" class=\"form-control\">
        <option value=\"restaurante\">Restaurante/Bar/Cafetería (Tabla I)</option>
        <option value=\"hotel\">Hotel 4*/5* (Tabla II)</option>
      </select>
    </div>

    <div class=\"form-group\">
      <label class=\"form-label\" for=\"tipo_jornada\">Tipo de Jornada</label>
      <select id=\"tipo_jornada\" class=\"form-control\">
        <option value=\"continuada\">Jornada Continuada</option>
        <option value=\"partida\">Jornada Partida</option>
      </select>
    </div>

    <div class=\"form-group\">
      <label class=\"form-label\">Complementos Aplicables</label>
      <div class=\"checkbox-group\" id=\"complementos_container\"></div>
    </div>

    <div class=\"form-group\">
      <label class=\"form-label\" for=\"num_hijos\">Número de Hijos (para IRPF)</label>
      <input type=\"number\" id=\"num_hijos\" class=\"form-control\" min=\"${LIMITES.HIJOS_MIN}\" max=\"${LIMITES.HIJOS_MAX}\" value=\"0\" />
    </div>

    <details class=\"form-group\">
      <summary class=\"form-label\" style=\"cursor: pointer; color: var(--color-primary);\">Opciones Avanzadas (Opcional)</summary>
      <div style=\"margin-top: var(--space-12); padding: var(--space-12); border: 1px solid var(--color-border); border-radius: var(--radius-base);\">
        <div class=\"form-group\">
          <label class=\"form-label\" for=\"horas_extra\">Horas Extra Mes (opcional)</label>
          <input type=\"number\" id=\"horas_extra\" class=\"form-control\" min=\"0\" max=\"200\" value=\"0\" placeholder=\"0\" />
        </div>
        <div class=\"form-group\">
          <label class=\"form-label\" for=\"horas_nocturnas\">Horas Nocturnas Mes (opcional)</label>
          <input type=\"number\" id=\"horas_nocturnas\" class=\"form-control\" min=\"0\" max=\"200\" value=\"0\" placeholder=\"0\" />
        </div>
        <div class=\"form-group\">
          <label class=\"form-label\" for=\"festivos_trabajados\">Festivos Trabajados Mes (opcional)</label>
          <input type=\"number\" id=\"festivos_trabajados\" class=\"form-control\" min=\"0\" max=\"10\" value=\"0\" placeholder=\"0\" />
        </div>
      </div>
    </details>

    <button id=\"calcular_btn\" class=\"btn btn-primary btn-full-width\">🚀 Calcular Nómina</button>
  `;
}

class App {
  constructor() {
    this.nominaCalculator = new NominaCalculator();
    this.formulario = new FormularioTrabajador();
    this.resultados = new ResultadosNomina();
    this.validaciones = new ValidacionesPanel();
    this.meter = new ExpolioMeter();
    this.sectorActual = null;
    this.regionActual = null;
  }

  init() {
    const formRoot = document.getElementById('form_root');
    formRoot.innerHTML = crearFormularioHTML();

    this.formulario.elementos.horasExtra = document.getElementById('horas_extra');
    this.formulario.elementos.horasNocturnas = document.getElementById('horas_nocturnas');
    this.formulario.elementos.festivosTrabajados = document.getElementById('festivos_trabajados');

    const regionSelect = document.getElementById('region');
    const sectorSelect = document.getElementById('sector');

    // Cargar preferencias guardadas
    this._cargarPreferencias();

    regionSelect.addEventListener('change', () => {
      this.regionActual = regionSelect.value;
      this._mostrarInfoRegion(this.regionActual);
      this._guardarPreferencias();
    });

    sectorSelect.addEventListener('change', () => {
      this.sectorActual = sectorSelect.value;
      this._cargarCategoriasParaSector(sectorSelect.value);
      this._cargarComplementosParaSector(sectorSelect.value);
      this._guardarPreferencias();
    });

    // Valores por defecto si no hay preferencias guardadas
    if (!this.regionActual && regionSelect.options.length > 0) {
      this.regionActual = regionSelect.value = regionSelect.options[0].value;
      this._mostrarInfoRegion(this.regionActual);
    }
    if (!this.sectorActual && sectorSelect.options.length > 0) {
      this.sectorActual = sectorSelect.value = sectorSelect.options[0].value;
      this._cargarCategoriasParaSector(this.sectorActual);
      this._cargarComplementosParaSector(this.sectorActual);
    }

    // Listener para eventos de preferencias
    window.addEventListener('preferencesSaved', (event) => {
      console.log('✅ Preferencias guardadas automáticamente:', event.detail);
    });

    this.resultados.inicializar?.();
    this.validaciones.inicializar?.();
    this.meter.inicializar?.();

    document.getElementById('calcular_btn').addEventListener('click', () => this.calcular());
    Object.values(this.formulario.elementos).forEach(el => el && el.addEventListener('change', () => {
      if (this.formulario.elementos.categoria?.value) this.calcular();
    }));
  }

  /**
   * Carga las preferencias guardadas y las aplica a los selectores
   */
  _cargarPreferencias() {
    if (!PreferenceManager.isAvailable()) {
      console.warn('⚠️ LocalStorage no disponible, modo sin persistencia');
      return;
    }

    const preferences = PreferenceManager.load();
    const regionSelect = document.getElementById('region');
    const sectorSelect = document.getElementById('sector');

    // Aplicar región guardada si existe y es válida
    if (preferences.region) {
      const regionOption = Array.from(regionSelect.options).find(opt => opt.value === preferences.region);
      if (regionOption) {
        regionSelect.value = preferences.region;
        this.regionActual = preferences.region;
        this._mostrarInfoRegion(this.regionActual);
        console.log('📍 Región restaurada desde preferencias:', preferences.region);
      }
    }

    // Aplicar sector guardado si existe y es válido
    if (preferences.sector) {
      const sectorOption = Array.from(sectorSelect.options).find(opt => opt.value === preferences.sector);
      if (sectorOption) {
        sectorSelect.value = preferences.sector;
        this.sectorActual = preferences.sector;
        this._cargarCategoriasParaSector(this.sectorActual);
        this._cargarComplementosParaSector(this.sectorActual);
        console.log('🏭 Sector restaurado desde preferencias:', preferences.sector);
      }
    }
  }

  /**
   * Guarda las preferencias actuales
   */
  _guardarPreferencias() {
    if (!PreferenceManager.isAvailable()) return;

    if (this.regionActual && this.sectorActual) {
      PreferenceManager.save({
        region: this.regionActual,
        sector: this.sectorActual
      });
    }
  }

  _mostrarInfoRegion(regionId) {
    const region = RegionManager.getRegion(regionId);
    if (region) {
      console.log(`🗺️ Región seleccionada: ${region.name}`);
    }
  }

  _cargarCategoriasParaSector(sectorId) {
    const sector = SectorManager.getSector(sectorId);
    const sel = document.getElementById('categoria');
    if (!sector || !sel) return;

    sel.innerHTML = '<option value=\"\">Seleccionar categoría...</option>' +
      sector.categories.map(c => `<option value=\"${c}\">${c.replaceAll('_',' ').toUpperCase()}</option>`).join('');
  }

  _cargarComplementosParaSector(sectorId) {
    const container = document.getElementById('complementos_container');
    if (!container) return;

    if (sectorId === 'hosteleria_valencia') {
      container.innerHTML = `
        <div class=\"checkbox-item\">
          <input type=\"checkbox\" id=\"plus_formacion\" />
          <label for=\"plus_formacion\">Plus Formación (20€)</label>
        </div>
        <div class=\"checkbox-item\">
          <input type=\"checkbox\" id=\"plus_transporte\" />
          <label for=\"plus_transporte\">Plus Transporte</label>
        </div>
        <div class=\"checkbox-item\">
          <input type=\"checkbox\" id=\"manutencion\" />
          <label for=\"manutencion\">Manutención</label>
        </div>
        <div class=\"checkbox-item\">
          <input type=\"checkbox\" id=\"vestuario\" />
          <label for=\"vestuario\">Vestuario</label>
        </div>
      `;
    } else if (sectorId === 'limpieza_nacional') {
      container.innerHTML = `
        <div class=\"checkbox-item\">
          <input type=\"checkbox\" id=\"plus_formacion\" />
          <label for=\"plus_formacion\">Plus Formación (25€)</label>
        </div>
        <div class=\"checkbox-item\">
          <input type=\"checkbox\" id=\"plus_nocturnidad\" />
          <label for=\"plus_nocturnidad\">Plus Nocturnidad (95,50€)</label>
        </div>
        <div class=\"checkbox-item\">
          <input type=\"checkbox\" id=\"plus_penosidad\" />
          <label for=\"plus_penosidad\">Plus Penosidad (87,30€)</label>
        </div>
        <div class=\"checkbox-item\">
          <input type=\"checkbox\" id=\"plus_transporte\" />
          <label for=\"plus_transporte\">Plus Transporte</label>
        </div>
        <div class=\"checkbox-item\">
          <input type=\"checkbox\" id=\"manutencion\" />
          <label for=\"manutencion\">Manutención (35,20€)</label>
        </div>
        <div class=\"checkbox-item\">
          <input type=\"checkbox\" id=\"epi\" />
          <label for=\"epi\">EPI no proporcionado</label>
        </div>
      `;
    }

    this._reasignarElementosFormulario();
  }

  _reasignarElementosFormulario() {
    this.formulario.elementos.plusFormacion = document.getElementById('plus_formacion');
    this.formulario.elementos.plusTransporte = document.getElementById('plus_transporte');
    this.formulario.elementos.manutencion = document.getElementById('manutencion');
    this.formulario.elementos.vestuario = document.getElementById('vestuario');
    this.formulario.elementos.plusNocturnidad = document.getElementById('plus_nocturnidad');
    this.formulario.elementos.plusPenosidad = document.getElementById('plus_penosidad');
    this.formulario.elementos.epi = document.getElementById('epi');
  }

  calcular() {
    try {
      const datosTrabajador = this.formulario.recogerDatosTrabajador();
      const datosFamiliares = this.formulario.recogerDatosFamiliares();
      const opcionesSector = this.recogerOpcionesSector();
      
      if (!datosTrabajador) return;

      const { resultados, validacion } = this.nominaCalculator.calcularNominaCompleta(
        datosTrabajador, 
        datosFamiliares, 
        opcionesSector, 
        this.regionActual
      );

      this.resultados.mostrarResultados(resultados, validacion);
      this.validaciones.mostrarValidaciones(resultados, validacion);
      this.meter.actualizar(resultados.porcentaje_expolio);

      document.getElementById('expolio_section').classList.add('visible');
      document.getElementById('validaciones_section').classList.add('visible');
      
      console.log(`⚙️ Calculado con: ${resultados.region_aplicada} + ${resultados.convenio_aplicado}`);
    } catch (e) {
      document.getElementById('resultados_content').innerHTML = `<div style=\"color: var(--color-error); text-align:center; padding: 12px;\">${e.message}</div>`;
      document.getElementById('expolio_section').classList.remove('visible');
      document.getElementById('validaciones_section').classList.remove('visible');
    }
  }

  recogerOpcionesSector() {
    return {
      horasExtra: parseInt(document.getElementById('horas_extra')?.value) || 0,
      horasNocturnas: parseInt(document.getElementById('horas_nocturnas')?.value) || 0,
      festivosTrabajados: parseInt(document.getElementById('festivos_trabajados')?.value) || 0
    };
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});