/*
 * CatalogoVista.js  (VISTA del catálogo)
 *
 * Todo lo que tiene que ver con el HTML del catálogo: dibujar tarjetas,
 * botones de categoría, contador, mensajes. No sabe de dónde vienen los
 * datos ni cómo se filtran; solo recibe listas y las pinta.
 *
 * Para avisar que el usuario hizo algo (escribió, eligió categoría...) la
 * vista no decide nada: llama a la función que le pasa el controlador.
 *
 * IDs que necesita dentro de <section id="catalogo">:
 *   #buscador-residuos      input de búsqueda (dentro de un <form>)
 *   #filtro-categorias      contenedor donde se generan los botones de categoría
 *   #limpiar-filtros        botón para quitar búsqueda y filtro
 *   #catalogo-contador      texto "Mostrando X de Y"
 *   #catalogo-aviso         aviso cuando se usan datos locales
 *   #catalogo-resultados    donde van las tarjetas
 */

class CatalogoVista {
  constructor(seccion) {
    this.seccion = seccion;
    this.formulario = seccion.querySelector('form');
    this.buscador = seccion.querySelector('#buscador-residuos');
    this.filtros = seccion.querySelector('#filtro-categorias');
    this.botonLimpiar = seccion.querySelector('#limpiar-filtros');
    this.contador = seccion.querySelector('#catalogo-contador');
    this.aviso = seccion.querySelector('#catalogo-aviso');
    this.resultados = seccion.querySelector('#catalogo-resultados');

    // El buscador va dentro de un form para que en el celular salga el botón "Buscar"
    // en el teclado, pero no queremos que recargue la página al dar Enter.
    this.formulario?.addEventListener('submit', (e) => e.preventDefault());
  }

  /* ---------- eventos (el controlador pasa qué hacer) ---------- */

  alEscribir(funcion) {
    this.buscador.addEventListener('input', () => funcion(this.buscador.value));
  }

  alElegirCategoria(funcion) {
    // Un solo listener en el contenedor en lugar de uno por botón (delegación de eventos)
    this.filtros.addEventListener('click', (evento) => {
      const boton = evento.target.closest('button[data-categoria]');
      if (boton) funcion(boton.dataset.categoria);
    });
  }

  alLimpiar(funcion) {
    this.botonLimpiar?.addEventListener('click', funcion);
  }

  /* ---------- dibujar ---------- */

  mostrarCargando() {
    this.resultados.setAttribute('aria-busy', 'true');
    this.resultados.replaceChildren(crearElemento('p', 'catalogo__cargando', 'Cargando catálogo...'));
  }

  // categorias: [{ nombre, cantidad }]
  pintarCategorias(categorias, total) {
    const botones = [this.crearBotonCategoria('', `Todas (${total})`)];
    categorias.forEach(({ nombre, cantidad }) => {
      botones.push(this.crearBotonCategoria(nombre, `${nombre} (${cantidad})`));
    });
    this.filtros.replaceChildren(...botones);
  }

  crearBotonCategoria(valor, texto) {
    const boton = crearElemento('button', 'filtro-categoria', texto);
    boton.type = 'button';
    boton.dataset.categoria = valor;
    if (valor) boton.classList.add(`cat-${aSlug(valor)}`);
    boton.setAttribute('aria-pressed', 'false');
    return boton;
  }

  marcarCategoria(categoriaActiva) {
    this.filtros.querySelectorAll('button[data-categoria]').forEach((boton) => {
      const activo = boton.dataset.categoria === categoriaActiva;
      boton.setAttribute('aria-pressed', String(activo));
      boton.classList.toggle('filtro-categoria--activo', activo);
    });
  }

  ponerTextoBusqueda(texto) {
    this.buscador.value = texto;
  }

  pintarResiduos(lista, textoBuscado) {
    const tarjetas = lista.map((residuo) => this.crearTarjeta(residuo, textoBuscado));
    this.resultados.replaceChildren(...tarjetas);
    this.resultados.setAttribute('aria-busy', 'false');
  }

  crearTarjeta(residuo, textoBuscado) {
    const tarjeta = crearElemento('article', `tarjeta-residuo cat-${aSlug(residuo.categoria)}`);
    tarjeta.dataset.id = residuo.id_residuo;

    const encabezado = crearElemento('header', 'tarjeta-residuo__encabezado');
    encabezado.append(crearElemento('span', 'tarjeta-residuo__categoria', residuo.categoria));
    const titulo = crearElemento('h3', 'tarjeta-residuo__nombre');
    titulo.append(this.resaltar(residuo.nombre, textoBuscado));
    encabezado.append(titulo);

    const preparacion = crearElemento('p', 'tarjeta-residuo__preparacion');
    preparacion.append(crearElemento('strong', null, 'Cómo entregarlo: '), residuo.preparacion);

    const instrucciones = crearElemento('p', 'tarjeta-residuo__instrucciones', residuo.instrucciones);

    tarjeta.append(encabezado, preparacion, instrucciones, this.crearDetalle(residuo));
    return tarjeta;
  }

  // <details> se abre y cierra solo, sin JS, y funciona con teclado.
  crearDetalle(residuo) {
    const detalle = crearElemento('details', 'tarjeta-residuo__detalle');
    detalle.append(crearElemento('summary', null, 'Más información'));

    const lista = crearElemento('dl');
    const agregar = (termino, valor) => {
      if (!valor) return;
      lista.append(crearElemento('dt', null, termino), crearElemento('dd', null, valor));
    };
    agregar('Tratamiento especial', residuo.tratamiento_especial);
    agregar('Componentes', residuo.componentes_quimicos);
    agregar('Fuente', residuo.fuente_info);

    detalle.append(lista);
    return detalle;
  }

  /*
   * Regresa el texto con las palabras buscadas dentro de <mark>.
   * Se arma con nodos de texto (no innerHTML) para no abrir la puerta a XSS.
   * Comparamos sin acentos, pero recortamos del texto original para que
   * se sigan viendo los acentos. Funciona porque al quitar el acento cada
   * letra sigue ocupando una sola posición.
   */
  resaltar(texto, textoBuscado) {
    const fragmento = document.createDocumentFragment();
    const original = texto.normalize('NFC');
    const palabras = normalizarTexto(textoBuscado).split(/\s+/).filter(Boolean);

    if (palabras.length === 0) {
      fragmento.append(original);
      return fragmento;
    }

    // Marcamos qué posiciones del texto coinciden con alguna palabra
    const comparable = normalizarTexto(original);
    const marcado = new Array(original.length).fill(false);
    palabras.forEach((palabra) => {
      let desde = comparable.indexOf(palabra);
      while (desde !== -1) {
        for (let i = desde; i < desde + palabra.length; i++) marcado[i] = true;
        desde = comparable.indexOf(palabra, desde + palabra.length);
      }
    });

    // Juntamos los tramos seguidos (marcados o no) para no crear un <mark> por letra
    let inicio = 0;
    for (let i = 1; i <= original.length; i++) {
      if (i === original.length || marcado[i] !== marcado[inicio]) {
        const pedazo = original.slice(inicio, i);
        fragmento.append(marcado[inicio] ? crearElemento('mark', null, pedazo) : pedazo);
        inicio = i;
      }
    }
    return fragmento;
  }

  mostrarSinResultados({ texto, categoria }, alVerTodo) {
    const caja = crearElemento('div', 'catalogo__vacio');
    caja.setAttribute('role', 'status');

    let mensaje = 'No encontramos residuos';
    if (texto) mensaje += ` que coincidan con "${texto.trim()}"`;
    if (categoria) mensaje += ` en la categoría ${categoria}`;
    caja.append(crearElemento('p', 'catalogo__vacio-titulo', `${mensaje}.`));
    caja.append(crearElemento('p', null, 'Revisa cómo está escrito o prueba con otra palabra, por ejemplo "botella", "pilas" o "cartón".'));

    const boton = crearElemento('button', 'boton boton--secundario', 'Ver todo el catálogo');
    boton.type = 'button';
    boton.addEventListener('click', alVerTodo);
    caja.append(boton);

    this.resultados.replaceChildren(caja);
    this.resultados.setAttribute('aria-busy', 'false');
  }

  actualizarContador(mostrados, total) {
    if (!this.contador) return;
    this.contador.textContent = mostrados === total
      ? `${total} residuos en el catálogo`
      : `Mostrando ${mostrados} de ${total} residuos`;
  }

  mostrarOrigen(origen) {
    if (origen === 'local') {
      Avisos.mostrar(
        this.aviso,
        'advertencia',
        'No pudimos conectar con el servidor, así que mostramos una copia local del catálogo.',
        { detalle: 'La información puede no estar actualizada. Intenta recargar la página más tarde.' },
      );
    } else {
      Avisos.limpiar(this.aviso);
    }
  }

  enfocarBuscador() {
    this.buscador.focus();
  }
}
