/* Capa Modelo (MVC) responsable de obtener, almacenar y filtrar los centros de acopio */

import { centrosAcopioLocales } from "../datos/acopioLocal.js";

export class AcopioModelo {
  constructor() {
    // Almacena en memoria la lista activa de centros cargados
    this.centros = [];
  }

  /* Consulta la API REST de acopio; si falla la red o el servidor, carga los datos locales */
  async cargarCentros() {
    try {
      const respuesta = await fetch("/api/acopio");
      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
      this.centros = await respuesta.json();
      return { datos: this.centros, origen: "api" };
    } catch {
      this.centros = centrosAcopioLocales;
      return { datos: this.centros, origen: "local" };
    }
  }

  /* Filtra los centros almacenados segun el material seleccionado y la zona de Leon */
  filtrar({ material = "todos", zona = "todas" }) {
    return this.centros.filter((centro) => {
      const coincideMaterial = material === "todos" || centro.materiales.includes(material);
      const coincideZona = zona === "todas" || centro.zona === zona;
      return coincideMaterial && coincideZona;
    });
  }
}