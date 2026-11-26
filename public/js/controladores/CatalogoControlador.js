/*
 * CatalogoControlador.js  (CONTROLADOR del catálogo, módulo 2)
 *
 * Une el modelo con la vista:
 *   1. Pide al modelo los residuos (de la API o del respaldo local).
 *   2. Le dice a la vista qué dibujar.
 *   3. Escucha lo que hace el usuario (buscar, filtrar, limpiar),
 *      le pide al modelo la lista filtrada y la manda a la vista.
 *
 * También guarda la búsqueda en la URL (?buscar=...&categoria=...).
 * Así desde la página de inicio se puede enlazar directo, por ejemplo
 * catalogo.html?categoria=Vidrio, y si recargas no pierdes el filtro.
 */

class CatalogoControlador {
  constructor(modelo, vista) {
    this.modelo = modelo;
    this.vista = vista;
    this.estado = { texto: '', categoria: '' };
  }

  async iniciar() {
    this.vista.mostrarCargando();
    await this.modelo.cargar();

    this.vista.mostrarOrigen(this.modelo.origen);

    const categorias = this.modelo.categorias().map((nombre) => ({
      nombre,
      cantidad: this.modelo.contarPorCategoria(nombre),
    }));
    this.vista.pintarCategorias(categorias, this.modelo.total());

    this.leerParametrosURL();
    this.conectarEventos();
    this.actualizar();
  }

  conectarEventos() {
    // retrasar(): espera 250 ms después de la última tecla para filtrar
    this.vista.alEscribir(retrasar((texto) => {
      this.estado.texto = texto;
      this.actualizar();
    }, 250));

    this.vista.alElegirCategoria((categoria) => {
      this.estado.categoria = categoria;
      this.actualizar();
    });

    this.vista.alLimpiar(() => this.limpiarFiltros());
  }

  actualizar() {
    const encontrados = this.modelo.filtrar(this.estado);

    if (encontrados.length === 0) {
      this.vista.mostrarSinResultados(this.estado, () => this.limpiarFiltros());
    } else {
      this.vista.pintarResiduos(encontrados, this.estado.texto);
    }

    this.vista.marcarCategoria(this.estado.categoria);
    this.vista.actualizarContador(encontrados.length, this.modelo.total());
    this.guardarEnURL();
  }

  limpiarFiltros() {
    this.estado = { texto: '', categoria: '' };
    this.vista.ponerTextoBusqueda('');
    this.actualizar();
    this.vista.enfocarBuscador();
  }

  leerParametrosURL() {
    const parametros = new URLSearchParams(window.location.search);
    const texto = parametros.get('buscar') || '';
    const categoria = parametros.get('categoria') || '';

    this.estado.texto = texto.slice(0, 60);
    // Solo aceptamos la categoría si de verdad existe; si alguien escribe
    // cualquier cosa en la URL simplemente se ignora.
    this.estado.categoria = this.modelo.categorias().includes(categoria) ? categoria : '';
    this.vista.ponerTextoBusqueda(this.estado.texto);
  }

  guardarEnURL() {
    const parametros = new URLSearchParams(window.location.search);
    const fijar = (clave, valor) => (valor ? parametros.set(clave, valor) : parametros.delete(clave));
    fijar('buscar', this.estado.texto.trim());
    fijar('categoria', this.estado.categoria);

    const consulta = parametros.toString();
    const nuevaURL = `${window.location.pathname}${consulta ? `?${consulta}` : ''}${window.location.hash}`;
    // replaceState cambia la URL sin recargar y sin llenar el historial del navegador
    try {
      window.history.replaceState(null, '', nuevaURL);
    } catch (error) {
      /* en file:// algunos navegadores no lo permiten; no es grave */
    }
  }
}
