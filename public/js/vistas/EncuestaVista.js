/*
 * EncuestaVista.js  (VISTA del cuestionario, módulo 4)
 *
 * Maneja el HTML del cuestionario: leer lo que escribió el usuario,
 * mostrar errores en cada campo, generar la lista de materiales y
 * mostrar el resumen al final. No valida ni envía nada por su cuenta.
 *
 * Lo que necesita dentro de <section id="encuesta">:
 *   #form-encuesta          el formulario (con novalidate)
 *   #encuesta-materiales    aquí se generan las casillas de materiales
 *   #encuesta-avisos        mensajes generales (éxito / error)
 *   #encuesta-resumen       resumen que se muestra al terminar
 * Cada campo va dentro de un contenedor con data-campo="nombre_del_campo"
 * (ver demo.html), ahí es donde se pone el mensaje de error.
 */

class EncuestaVista {
  constructor(seccion) {
    this.seccion = seccion;
    this.formulario = seccion.querySelector('#form-encuesta');
    this.contenedorMateriales = seccion.querySelector('#encuesta-materiales');
    this.avisos = seccion.querySelector('#encuesta-avisos');
    this.resumen = seccion.querySelector('#encuesta-resumen');
    this.botonEnviar = this.formulario.querySelector('button[type="submit"]');
    this.textoBotonEnviar = this.botonEnviar?.textContent;
  }

  /* ---------- lista de materiales (sale del mismo catálogo) ---------- */

  // grupos: [{ categoria, residuos: [...] }]
  pintarMateriales(grupos) {
    const bloques = grupos.map(({ categoria, residuos }) => {
      const bloque = crearElemento('div', `materiales__grupo cat-${aSlug(categoria)}`);
      bloque.append(crearElemento('p', 'materiales__categoria', categoria));
      residuos.forEach((r) => bloque.append(this.crearOpcionMaterial(r)));
      return bloque;
    });
    this.contenedorMateriales.replaceChildren(...bloques);
  }

  crearOpcionMaterial(residuo) {
    const id = `material-${residuo.id_residuo}`;
    const fila = crearElemento('div', 'material');

    const casilla = crearElemento('input');
    casilla.type = 'checkbox';
    casilla.id = id;
    casilla.name = 'materiales';
    casilla.value = residuo.id_residuo;

    const etiqueta = crearElemento('label', 'material__nombre', residuo.nombre);
    etiqueta.htmlFor = id;

    // Los kilos son opcionales y solo se activan si marcan el material
    const kilos = crearElemento('input', 'material__kg');
    kilos.type = 'number';
    kilos.name = `kg-${residuo.id_residuo}`;
    kilos.min = '0.1';
    kilos.max = '100';
    kilos.step = '0.1';
    kilos.inputMode = 'decimal';
    kilos.placeholder = 'kg/mes';
    kilos.disabled = true;
    kilos.setAttribute('aria-label', `Kilos aproximados al mes de ${residuo.nombre} (opcional)`);

    fila.append(casilla, etiqueta, kilos);
    return fila;
  }

  activarKilos(casilla) {
    const kilos = casilla.closest('.material')?.querySelector('.material__kg');
    if (!kilos) return;
    kilos.disabled = !casilla.checked;
    if (!casilla.checked) kilos.value = '';
  }

  /* ---------- leer el formulario ---------- */

  leerDatos() {
    const datos = new FormData(this.formulario);
    const materiales = datos.getAll('materiales').map((id) => ({
      id_residuo: id,
      kg: String(datos.get(`kg-${id}`) ?? '').trim(),
    }));

    return {
      colonia_zona: String(datos.get('colonia_zona') ?? ''),
      separa_residuos: datos.get('separa_residuos') || '',
      reutiliza: datos.get('reutiliza') || '',
      conoce_acopios: datos.get('conoce_acopios') || '',
      frecuencia_entrega: datos.get('frecuencia_entrega') || '',
      materiales,
      consentimiento: datos.get('consentimiento') === 'si',
    };
  }

  /* ---------- eventos ---------- */

  alEnviar(funcion) {
    this.formulario.addEventListener('submit', (evento) => {
      evento.preventDefault();
      funcion();
    });
  }

  // Cuando el usuario sale de un campo (o de un grupo de opciones)
  alSalirDeCampo(funcion) {
    this.formulario.addEventListener('focusout', (evento) => {
      const contenedor = evento.target.closest('[data-campo]');
      // Si solo se movió entre opciones del mismo grupo, todavía no validamos
      if (!contenedor || contenedor.contains(evento.relatedTarget)) return;
      funcion(contenedor.dataset.campo);
    });
  }

  // Radios, select y casillas avisan con 'change'
  alCambiar(funcion) {
    this.formulario.addEventListener('change', (evento) => {
      if (evento.target.name === 'materiales') this.activarKilos(evento.target);
      // Los kilos NO se validan en 'change': ese evento salta justo cuando el usuario da
      // clic en la siguiente casilla, el mensaje de error mueve la página y el clic se pierde.
      // Se revisan al salir de toda la lista de materiales y al enviar.
      if (evento.target.classList.contains('material__kg')) return;
      const contenedor = evento.target.closest('[data-campo]');
      if (contenedor) funcion(contenedor.dataset.campo);
    });
  }

  // Mientras escribe en un campo de texto
  alEscribir(funcion) {
    this.formulario.addEventListener('input', (evento) => {
      const contenedor = evento.target.closest('[data-campo]');
      if (contenedor) funcion(contenedor.dataset.campo);
    });
  }

  alBorrar(funcion) {
    this.formulario.addEventListener('reset', () => {
      // el reset del navegador ocurre después de este evento, por eso el setTimeout
      setTimeout(() => {
        this.contenedorMateriales.querySelectorAll('input[name="materiales"]').forEach((c) => this.activarKilos(c));
        funcion();
      });
    });
  }

  /* ---------- errores ---------- */

  contenedorDe(campo) {
    return this.formulario.querySelector(`[data-campo="${campo}"]`);
  }

  tieneError(campo) {
    return this.contenedorDe(campo)?.classList.contains('campo--con-error') ?? false;
  }

  mostrarError(campo, mensaje) {
    MarcadorErrores.mostrar(this.contenedorDe(campo), mensaje);
  }

  limpiarError(campo) {
    MarcadorErrores.limpiar(this.contenedorDe(campo));
  }

  limpiarErrores() {
    MarcadorErrores.limpiarTodo(this.formulario);
  }

  enfocarCampo(campo) {
    const contenedor = this.contenedorDe(campo);
    const control = contenedor?.querySelector('input:not([disabled]), select, textarea');
    control?.focus();
    contenedor?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ---------- estado del envío y mensajes ---------- */

  ponerEnviando(enviando) {
    if (!this.botonEnviar) return;
    this.botonEnviar.disabled = enviando; // evita que lo manden dos veces por dar doble clic
    this.botonEnviar.textContent = enviando ? 'Enviando...' : this.textoBotonEnviar;
    this.formulario.setAttribute('aria-busy', String(enviando));
  }

  mostrarAviso(tipo, texto, detalle = null) {
    Avisos.mostrar(this.avisos, tipo, texto, { detalle });
    this.avisos.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  limpiarAviso() {
    Avisos.limpiar(this.avisos);
  }

  vaciarFormulario() {
    this.formulario.reset();
  }

  mostrarFormulario(visible) {
    this.formulario.hidden = !visible;
  }

  /* ---------- resumen de respuestas ---------- */

  /*
   * datos = {
   *   filas: [['Colonia', 'Centro'], ...],
   *   materiales: [{ nombre, kg }],
   *   totalKg: número o null,
   *   sugerencias: ['...'],
   *   fecha: Date
   * }
   */
  mostrarResumen(datos, alContestarOtraVez) {
    const titulo = crearElemento('h3', 'resumen__titulo', 'Resumen de tus respuestas');
    titulo.id = 'titulo-resumen-encuesta';
    titulo.tabIndex = -1; // para poder mandarle el foco

    const fecha = crearElemento(
      'p',
      'resumen__fecha',
      `Contestado el ${datos.fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    );

    const lista = crearElemento('dl', 'resumen__datos');
    datos.filas.forEach(([termino, valor]) => {
      lista.append(crearElemento('dt', null, termino), crearElemento('dd', null, valor));
    });

    const materiales = crearElemento('ul', 'resumen__materiales');
    if (datos.materiales.length === 0) {
      materiales.append(crearElemento('li', null, 'No marcaste materiales.'));
    } else {
      datos.materiales.forEach(({ nombre, kg }) => {
        materiales.append(crearElemento('li', null, kg !== null ? `${nombre}: ${kg} kg al mes` : nombre));
      });
    }

    const bloque = [titulo, fecha, lista, crearElemento('h4', null, 'Materiales que separas'), materiales];

    if (datos.totalKg !== null) {
      bloque.push(crearElemento('p', 'resumen__total', `Total aproximado: ${datos.totalKg} kg al mes`));
    }

    if (datos.sugerencias.length) {
      const sugerencias = crearElemento('ul', 'resumen__sugerencias');
      datos.sugerencias.forEach((s) => sugerencias.append(crearElemento('li', null, s)));
      bloque.push(crearElemento('h4', null, 'Algunas ideas para ti'), sugerencias);
    }

    const boton = crearElemento('button', 'boton boton--secundario', 'Contestar otra vez');
    boton.type = 'button';
    boton.addEventListener('click', alContestarOtraVez);
    bloque.push(boton);

    this.resumen.replaceChildren(...bloque);
    this.resumen.hidden = false;
    titulo.focus();
  }

  ocultarResumen() {
    this.resumen.hidden = true;
    this.resumen.replaceChildren();
  }
}
