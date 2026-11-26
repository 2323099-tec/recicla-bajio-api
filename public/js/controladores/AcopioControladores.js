/* Capa Controlador (MVC) que conecta los eventos del usuario con AcopioModelo y AcopioVista */

import { AcopioModelo } from "../modelos/AcopioModelo.js";
import { AcopioVista } from "../vistas/AcopioVista.js";

class AcopioControlador {
  constructor() {
    // Instancias del modelo y la vista del modulo de acopio
    this.modelo = new AcopioModelo();
    this.vista = new AcopioVista();

    // Referencias a los controles de filtrado del formulario
    this.selectMaterial = document.getElementById("filtro-material-acopio");
    this.selectZona = document.getElementById("filtro-zona-acopio");

    this.iniciar();
  }

  /* Carga los datos iniciales, renderiza la vista y enlaza los eventos de cambio */
  async iniciar() {
    const { datos } = await this.modelo.cargarCentros();
    this.vista.renderizar(datos);

    // Recalcula y renderiza la lista filtrada ante cualquier cambio en los selectores
    const actualizar = () => {
      const filtrados = this.modelo.filtrar({
        material: this.selectMaterial?.value || "todos",
        zona: this.selectZona?.value || "todas"
      });
      this.vista.renderizar(filtrados);
    };

    this.selectMaterial?.addEventListener("change", actualizar);
    this.selectZona?.addEventListener("change", actualizar);
  }
}

// Inicializa el controlador una vez que el documento HTML ha terminado de cargarse
document.addEventListener("DOMContentLoaded", () => new AcopioControlador());