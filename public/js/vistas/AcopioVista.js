/* Capa Vista (MVC) encargada de renderizar dinamicamente las tarjetas de centros de acopio en el DOM */

export class AcopioVista {
  constructor() {
    // Referencias al contenedor de tarjetas y al aviso de resultados vacios
    this.contenedor = document.getElementById("lista-acopio");
    this.mensajeVacio = document.getElementById("acopio-sin-resultados");
  }

  /* Limpia el contenedor actual y dibuja las tarjetas correspondientes a la lista recibida */
  renderizar(centros) {
    if (!this.contenedor) return;
    this.contenedor.innerHTML = "";

    // Muestra el mensaje de estado vacio cuando no hay coincidencias
    if (centros.length === 0) {
      this.mensajeVacio?.classList.remove("oculto");
      return;
    }

    this.mensajeVacio?.classList.add("oculto");

    // Construye un elemento article por cada centro y lo inserta en el contenedor
    centros.forEach((c) => {
      const articulo = document.createElement("article");
      articulo.className = "tarjeta";
      articulo.innerHTML = `
        <span class="badge badge--verde">Zona ${c.zona}</span>
        <h3>${c.nombre}</h3>
        <p><strong>Ubicacion:</strong> ${c.direccion}</p>
        <p><strong>Materiales:</strong> ${c.materiales.join(", ")}</p>
        <p><strong>Condiciones:</strong> ${c.condiciones}</p>
        <p><strong>Contacto:</strong> ${c.contacto}</p>
        <p class="nota-aclaratoria">
          Fuente: ${c.fuente} · Verificado: ${c.fechaVerificacion}
        </p>
      `;
      this.contenedor.appendChild(articulo);
    });
  }
}