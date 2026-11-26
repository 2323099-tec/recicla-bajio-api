/*
 * ContactoControlador.js
 * Validación del formulario de contacto / retroalimentación del lado del cliente.
 * (El módulo 7 le toca a Servidor; esto es solo la parte de JavaScript:
 * validar, contar caracteres y mostrar los mensajes. La ruta POST /api/contacto
 * la hace el compañero del servidor.)
 *
 * Como aquí es poco código, lectura y pintado van en la misma clase,
 * reutilizando Validador, MarcadorErrores y Avisos.
 *
 * Lo que necesita dentro de <section id="contacto">:
 *   #form-contacto, #contacto-avisos, #contador-mensaje
 *   campos: nombre (opcional), correo, tipo_mensaje, mensaje
 *   y un campo escondido "sitio_web" que sirve de trampa para bots
 */

class ContactoControlador {
  static MAX_MENSAJE = 500;

  constructor(seccion, urlApi = '/api') {
    this.formulario = seccion.querySelector('#form-contacto');
    this.avisos = seccion.querySelector('#contacto-avisos');
    this.contador = seccion.querySelector('#contador-mensaje');
    this.botonEnviar = this.formulario.querySelector('button[type="submit"]');
    this.urlApi = urlApi;
    this.enviando = false;

    this.reglas = {
      nombre: (d) => (d.nombre.trim() === '' ? '' : Validador.longitud(d.nombre, 2, 60) || Validador.textoSimple(d.nombre)),
      correo: (d) => Validador.requerido(d.correo, 'Escribe tu correo para poder responderte.') || Validador.correo(d.correo),
      tipo_mensaje: (d) => Validador.opcion(d.tipo_mensaje, ['comentario', 'sugerencia', 'error_datos', 'otro'], 'Elige el tipo de mensaje.'),
      mensaje: (d) => Validador.requerido(d.mensaje, 'Escribe tu mensaje.') || Validador.longitud(d.mensaje, 10, ContactoControlador.MAX_MENSAJE),
    };
  }

  iniciar() {
    this.formulario.addEventListener('submit', (e) => {
      e.preventDefault();
      this.enviar();
    });

    this.formulario.addEventListener('focusout', (e) => {
      const campo = e.target.name;
      if (this.reglas[campo]) this.validarCampo(campo);
    });

    this.formulario.addEventListener('input', (e) => {
      if (e.target.name === 'mensaje') this.actualizarContador();
      const contenedor = this.contenedorDe(e.target.name);
      if (contenedor?.classList.contains('campo--con-error')) this.validarCampo(e.target.name);
    });

    this.formulario.addEventListener('reset', () => setTimeout(() => {
      MarcadorErrores.limpiarTodo(this.formulario);
      this.actualizarContador();
    }));

    this.actualizarContador();
  }

  leerDatos() {
    const datos = new FormData(this.formulario);
    const texto = (nombre) => String(datos.get(nombre) ?? '');
    return {
      nombre: texto('nombre'),
      correo: texto('correo'),
      tipo_mensaje: texto('tipo_mensaje'),
      mensaje: texto('mensaje'),
      sitio_web: texto('sitio_web'),
    };
  }

  contenedorDe(campo) {
    return this.formulario.querySelector(`[data-campo="${campo}"]`);
  }

  validarCampo(campo, datos = this.leerDatos()) {
    const error = this.reglas[campo](datos);
    if (error) MarcadorErrores.mostrar(this.contenedorDe(campo), error);
    else MarcadorErrores.limpiar(this.contenedorDe(campo));
    return !error;
  }

  actualizarContador() {
    if (!this.contador) return;
    const largo = this.formulario.elements.mensaje.value.length;
    const restantes = ContactoControlador.MAX_MENSAJE - largo;
    this.contador.textContent = `${largo} / ${ContactoControlador.MAX_MENSAJE} caracteres`;
    this.contador.classList.toggle('contador--limite', restantes < 50);
  }

  async enviar() {
    if (this.enviando) return;
    Avisos.limpiar(this.avisos);

    const datos = this.leerDatos();
    const conError = Object.keys(this.reglas).filter((campo) => !this.validarCampo(campo, datos));
    if (conError.length) {
      Avisos.mostrar(this.avisos, 'error', 'Revisa los campos marcados antes de enviar.');
      this.contenedorDe(conError[0])?.querySelector('input, select, textarea')?.focus();
      return;
    }

    // Trampa para bots: el campo sitio_web está escondido, una persona no lo llena.
    // Si viene con algo, fingimos que se envió y no mandamos nada.
    if (datos.sitio_web) {
      this.confirmar();
      return;
    }

    this.enviando = true;
    this.botonEnviar.disabled = true;
    try {
      await pedirJSON(`${this.urlApi}/contacto`, {
        method: 'POST',
        body: JSON.stringify({
          nombre: datos.nombre.trim() || null,
          correo: datos.correo.trim(),
          tipo_mensaje: datos.tipo_mensaje,
          mensaje: datos.mensaje.trim(),
        }),
      });
      this.confirmar();
    } catch (error) {
      // Aquí NO guardamos nada en el navegador porque el mensaje trae un correo (dato personal)
      const detalle = error instanceof ErrorPeticion && error.esDeConexion
        ? 'El servicio de mensajes no está disponible en este momento. Tu mensaje no se envió; intenta más tarde.'
        : error.message;
      Avisos.mostrar(this.avisos, 'error', 'No se pudo enviar tu mensaje.', { detalle });
    } finally {
      this.enviando = false;
      this.botonEnviar.disabled = false;
    }
  }

  // La confirmación no repite el nombre ni el correo que escribió (no exponer datos personales)
  confirmar() {
    this.formulario.reset();
    Avisos.mostrar(this.avisos, 'exito', 'Gracias, recibimos tu mensaje.', {
      detalle: 'Recicla Bajío es un proyecto escolar: los comentarios los revisa el equipo y no se turnan a ninguna institución.',
    });
  }
}
