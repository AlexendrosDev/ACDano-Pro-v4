import NominaCalculator from './backend/NominaCalculator.js';
import FormularioTrabajador from './frontend/components/FormularioTrabajador.js';
import ResultadosNomina from './frontend/components/ResultadosNomina.js';
import ValidacionesPanel from './frontend/components/ValidacionesPanel.js';
import ExpolioMeter from './frontend/components/ExpolioMeter.js';
import { LIMITES } from './shared/constants.js';

function crearFormularioHTML() {
  return `
    <div class="form-group">
      <label class="form-label" for="categoria">Categoría Profesional</label>
      <select id="categoria" class="form-control">
        <option value="">Seleccionar categoría...</option>
        <option value="cocinero_1">Cocinero Nivel I</option>
        <option value="cocinero_2">Cocinero Nivel II</option>
        <option value="cocinero_3">Cocinero Nivel III</option>
        <option value="cocinero_4">Cocinero Nivel IV</option>
        <option value="cocinero_5">Cocinero Nivel V</option>
        <option value="camarero_1">Camarero Nivel I</option>
        <option value="camarero_2">Camarero Nivel II</option>
        <option value="camarero_3">Camarero Nivel III</option>
        <option value="camarero_4">Camarero Nivel IV</option>
        <option value="camarero_5">Camarero Nivel V</option>
      </select>
    </div>

    <div class="form-group">
      <label class="form-label" for="tipo_establecimiento">Tipo de Establecimiento</label>
      <select id="tipo_establecimiento" class="form-control">
        <option value="restaurante">Restaurante/Bar/Cafetería (Tabla I)</option>
        <option value="hotel">Hotel 4*/5* (Tabla II)</option>
      </select>
    </div>

    <div class="form-group">
      <label class="form-label" for="tipo_jornada">Tipo de Jornada</label>
      <select id="tipo_jornada" class="form-control">
        <option value="continuada">Jornada Continuada</option>
        <option value="partida">Jornada Partida</option>
      </select>
    </div>

    <div class="form-group">
      <label class="form-label">Complementos Aplicables</label>
      <div class="checkbox-group">
        <div class="checkbox-item">
          <input type="checkbox" id="plus_formacion" />
          <label for="plus_formacion">Plus Formación (20€)</label>
        </div>
        <div class="checkbox-item">
          <input type="checkbox" id="plus_transporte" />
          <label for="plus_transporte">Plus Transporte</label>
        </div>
        <div class="checkbox-item">
          <input type="checkbox" id="manutencion" />
          <label for="manutencion">Manutención</label>
        </div>
        <div class="checkbox-item">
          <input type="checkbox" id="vestuario" />
          <label for="vestuario">Vestuario</label>
        </div>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label" for="num_hijos">Número de Hijos (para IRPF)</label>
      <input type="number" id="num_hijos" class="form-control" min="${LIMITES.HIJOS_MIN}" max="${LIMITES.HIJOS_MAX}" value="0" />
    </div>

    <!-- Sección avanzada colapsible -->
    <details class="form-group">
      <summary class="form-label" style="cursor: pointer; color: var(--color-primary);">Opciones Avanzadas (Opcional)</summary>
      <div style="margin-top: var(--space-12); padding: var(--space-12); border: 1px solid var(--color-border); border-radius: var(--radius-base);">
        <div class="form-group">
          <label class="form-label" for="horas_extra">Horas Extra Mes (opcional)</label>
          <input type="number" id="horas_extra" class="form-control" min="0" max="200" value="0" placeholder="0" />
          <small style="color: var(--color-text-secondary); font-size: var(--font-size-xs);">Para validaciones sectoriales</small>
        </div>
        <div class="form-group">
          <label class="form-label" for="horas_nocturnas">Horas Nocturnas Mes (opcional)</label>
          <input type="number" id="horas_nocturnas" class="form-control" min="0" max="200" value="0" placeholder="0" />
          <small style="color: var(--color-text-secondary); font-size: var(--font-size-xs);">22:00 - 06:00</small>
        </div>
        <div class="form-group">
          <label class="form-label" for="festivos_trabajados">Festivos Trabajados Mes (opcional)</label>
          <input type="number" id="festivos_trabajados" class="form-control" min="0" max="10" value="0" placeholder="0" />
          <small style="color: var(--color-text-secondary); font-size: var(--font-size-xs);">Domingos y festivos oficiales</small>
        </div>
      </div>
    </details>

    <button id="calcular_btn" class="btn btn-primary btn-full-width">🚀 Calcular Nómina</button>
  `;
}

class App {
  constructor() {
    this.nominaCalculator = new NominaCalculator();
    this.formulario = new FormularioTrabajador();
    this.resultados = new ResultadosNomina();
    this.validaciones = new ValidacionesPanel();
    this.meter = new ExpolioMeter();
  }

  init() {
    // Montar el formulario
    const formRoot = document.getElementById('form_root');
    formRoot.innerHTML = crearFormularioHTML();

    // Re-inicializar referencias del formulario (incluir nuevos campos)
    this.formulario.elementos.horasExtra = document.getElementById('horas_extra');
    this.formulario.elementos.horasNocturnas = document.getElementById('horas_nocturnas');
    this.formulario.elementos.festivosTrabajados = document.getElementById('festivos_trabajados');
    
    this.resultados.inicializar?.();
    this.validaciones.inicializar?.();
    this.meter.inicializar?.();

    // Eventos
    document.getElementById('calcular_btn').addEventListener('click', () => this.calcular());
    Object.values(this.formulario.elementos).forEach(el => el && el.addEventListener('change', () => {
      if (this.formulario.elementos.categoria.value) this.calcular();
    }));
  }

  calcular() {
    try {
      const datosTrabajador = this.formulario.recogerDatosTrabajador();
      const datosFamiliares = this.formulario.recogerDatosFamiliares();
      const opcionesSector = this.recogerOpcionesSector();
      
      if (!datosTrabajador) return;

      const { resultados, validacion } = this.nominaCalculator.calcularNominaCompleta(datosTrabajador, datosFamiliares, opcionesSector);

      this.resultados.mostrarResultados(resultados, validacion);
      this.validaciones.mostrarValidaciones(resultados, validacion);
      this.meter.actualizar(resultados.porcentaje_expolio);

      document.getElementById('expolio_section').classList.add('visible');
      document.getElementById('validaciones_section').classList.add('visible');
    } catch (e) {
      document.getElementById('resultados_content').innerHTML = `<div style="color: var(--color-error); text-align:center; padding: 12px;">${e.message}</div>`;
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