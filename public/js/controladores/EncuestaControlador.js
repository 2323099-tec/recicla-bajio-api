/*
 * EncuestaControlador.js  (CONTROLADOR del cuestionario, módulo 4)
 *
 * - Genera la lista de materiales a partir del catálogo (ResiduoModelo).
 * - Valida cada campo cuando el usuario sale de él, y todo junto al enviar.
 * - Manda la respuesta con EncuestaModelo y muestra el mensaje que toque.
 * - Al final enseña un resumen de lo que contestó con algunas sugerencias.
 *
 * La participación es voluntaria: no se pide nombre ni correo, y para
 * enviar hay que marcar la casilla de consentimiento.
 */

class EncuestaControlador {
  constructor(modelo, residuoModelo, vista) {
    this.modelo = modelo;
    this.residuoModelo = residuoModelo;
    this.vista = vista;
    this.enviando = false;

    // Una regla por campo. Cada una recibe todos los datos del formulario
    // (algunas reglas dependen de otro campo) y regresa el error o ''.
    this.reglas = {
      colonia_zona: (d) =>
        Validador.requerido(d.colonia_zona, 'Escribe tu colonia o zona. Solo la usamos para ver resultados por zona.')
        || Validador.longitud(d.colonia_zona, 3, 100)
        || Validador.textoSimple(d.colonia_zona),

      separa_residuos: (d) =>
        Validador.opcion(d.separa_residuos, OPCIONES_ENCUESTA.habito, 'Elige qué tan seguido separas tus residuos.'),

      reutiliza: (d) =>
        Validador.opcion(d.reutiliza, OPCIONES_ENCUESTA.habito, 'Elige qué tan seguido reutilizas envases o bolsas.'),

      conoce_acopios: (d) =>
        Validador.opcion(d.conoce_acopios, OPCIONES_ENCUESTA.siNo, 'Indica si conoces algún centro de acopio.'),

      frecuencia_entrega: (d) =>
        Validador.opcion(d.frecuencia_entrega, OPCIONES_ENCUESTA.frecuencia, 'Elige cada cuánto llevas residuos a reciclar.'),

      materiales: (d) => this.validarMateriales(d),

      consentimiento: (d) =>
        (d.consentimiento ? '' : 'Para enviar tus respuestas necesitamos que aceptes participar.'),
    };
  }

  async iniciar() {
    this.conectarEventos();

    await this.residuoModelo.cargar();
    this.vista.pintarMateriales(this.agruparPorCategoria());

    // Si ya contestó en esta sesión, le enseñamos su resumen
    const ultima = this.modelo.obtenerUltima();
    if (ultima) {
      this.vista.mostrarFormulario(false);
      this.vista.mostrarResumen(this.armarResumen(ultima.registro, new Date(ultima.fecha)), () => this.contestarOtraVez());
    }

    // Si quedaron respuestas guardadas de una vez que no hubo servidor, se mandan ahora
    const enviadas = await this.modelo.reintentarPendientes();
    if (enviadas > 0) {
      this.vista.mostrarAviso('info', `Se enviaron ${enviadas} respuesta(s) que estaban guardadas en este navegador.`);
    }
  }

  conectarEventos() {
    this.vista.alEnviar(() => this.enviar());
    this.vista.alSalirDeCampo((campo) => this.validarCampo(campo));
    this.vista.alCambiar((campo) => this.validarCampo(campo));

    // Mientras escribe solo revalidamos si ya tenía error, para que el mensaje
    // desaparezca en cuanto lo corrija (y no regañarlo antes de terminar).
    this.vista.alEscribir((campo) => {
      if (this.vista.tieneError(campo)) this.validarCampo(campo);
    });

    // Al borrar el formulario también se quitan los mensajes rojos de cada campo
    this.vista.alBorrar(() => this.vista.limpiarErrores());
  }

  agruparPorCategoria() {
    return this.residuoModelo.categorias().map((categoria) => ({
      categoria,
      residuos: this.residuoModelo.filtrar({ categoria }),
    }));
  }

  /* ---------- validación ---------- */

  validarMateriales(datos) {
    // Si dice que sí entrega residuos, tiene sentido que marque al menos uno
    if (datos.frecuencia_entrega && datos.frecuencia_entrega !== 'Nunca' && datos.materiales.length === 0) {
      return 'Dijiste que llevas residuos a reciclar: marca al menos un material.';
    }
    // Los kilos son opcionales, pero si los escribe tienen que ser un número razonable
    for (const material of datos.materiales) {
      if (material.kg === '') continue;
      const error = Validador.numero(material.kg, 0.1, 100);
      if (error) {
        const nombre = this.residuoModelo.buscarPorId(material.id_residuo)?.nombre || 'un material';
        return `Revisa los kilos de ${nombre}: ${error.charAt(0).toLowerCase()}${error.slice(1)}`;
      }
    }
    return '';
  }

  // Valida un campo y muestra u oculta su mensaje. Regresa true si está bien.
  validarCampo(campo, datos = this.vista.leerDatos()) {
    const regla = this.reglas[campo];
    if (!regla) return true;

    const error = regla(datos);
    if (error) this.vista.mostrarError(campo, error);
    else this.vista.limpiarError(campo);

    // La regla de materiales depende de la frecuencia: si cambia la frecuencia
    // y materiales tenía error, lo revisamos otra vez.
    if (campo === 'frecuencia_entrega' && this.vista.tieneError('materiales')) {
      this.validarCampo('materiales', datos);
    }
    return !error;
  }

  // Regresa la lista de campos con error (vacía si todo está bien)
  validarTodo() {
    const datos = this.vista.leerDatos();
    return Object.keys(this.reglas).filter((campo) => !this.validarCampo(campo, datos));
  }

  /* ---------- envío ---------- */

  async enviar() {
    if (this.enviando) return;
    this.vista.limpiarAviso();

    const conError = this.validarTodo();
    if (conError.length > 0) {
      const texto = conError.length === 1
        ? 'Falta corregir 1 campo.'
        : `Faltan corregir ${conError.length} campos.`;
      this.vista.mostrarAviso('error', texto, 'Los campos con problema están marcados en rojo.');
      this.vista.enfocarCampo(conError[0]);
      return;
    }

    const registro = this.modelo.armarRegistro(this.vista.leerDatos());

    this.enviando = true;
    this.vista.ponerEnviando(true);
    const resultado = await this.modelo.enviar(registro);
    this.enviando = false;
    this.vista.ponerEnviando(false);

    switch (resultado.estado) {
      case 'enviado':
        this.vista.mostrarAviso('exito', '¡Gracias por participar! Tus respuestas se guardaron correctamente.');
        this.terminar(registro);
        break;

      case 'local':
        this.vista.mostrarAviso(
          'advertencia',
          'No pudimos conectar con el servidor, pero tus respuestas quedaron guardadas en este navegador.',
          'Se enviarán solas la próxima vez que abras esta página con conexión.',
        );
        this.terminar(registro);
        break;

      case 'rechazado':
        this.mostrarErroresDelServidor(resultado);
        break;

      default: // 'sin-guardar'
        this.vista.mostrarAviso(
          'error',
          'No pudimos enviar tus respuestas y tampoco guardarlas en el navegador.',
          'Revisa tu conexión e inténtalo otra vez. Lo que escribiste sigue en el formulario.',
        );
    }
  }

  // Si el servidor manda { errores: { campo: 'mensaje' } } los ponemos en cada campo
  mostrarErroresDelServidor({ mensaje, errores }) {
    this.vista.mostrarAviso('error', 'El servidor no aceptó las respuestas.', mensaje);
    if (errores && typeof errores === 'object') {
      Object.entries(errores).forEach(([campo, texto]) => {
        if (this.reglas[campo]) this.vista.mostrarError(campo, String(texto));
      });
    }
  }

  terminar(registro) {
    this.vista.vaciarFormulario();
    this.vista.mostrarFormulario(false);
    this.vista.mostrarResumen(this.armarResumen(registro, new Date()), () => this.contestarOtraVez());
  }

  contestarOtraVez() {
    this.modelo.borrarUltima();
    this.vista.ocultarResumen();
    this.vista.limpiarAviso();
    this.vista.mostrarFormulario(true);
    this.vista.enfocarCampo('colonia_zona');
  }

  /* ---------- resumen ---------- */

  armarResumen(registro, fecha) {
    const materiales = registro.materiales.map((m) => ({
      nombre: this.residuoModelo.buscarPorId(m.id_residuo)?.nombre || `Material #${m.id_residuo}`,
      kg: m.cantidad_estimada_kg,
    }));

    const conKilos = materiales.filter((m) => m.kg !== null);
    const totalKg = conKilos.length
      ? Math.round(conKilos.reduce((suma, m) => suma + m.kg, 0) * 100) / 100
      : null;

    return {
      fecha,
      filas: [
        ['Colonia o zona', registro.colonia_zona],
        ['¿Separas tus residuos?', registro.separa_residuos],
        ['¿Reutilizas envases o bolsas?', registro.reutiliza],
        ['¿Conoces centros de acopio?', registro.conoce_acopios === 1 ? 'Sí' : 'No'],
        ['¿Cada cuánto llevas a reciclar?', registro.frecuencia_entrega],
      ],
      materiales,
      totalKg,
      sugerencias: this.sugerencias(registro),
    };
  }

  // Reglas sencillas según lo que contestó. Máximo tres para no saturar.
  sugerencias(registro) {
    const lista = [];
    const categorias = registro.materiales
      .map((m) => this.residuoModelo.buscarPorId(m.id_residuo)?.categoria)
      .filter(Boolean);

    if (registro.conoce_acopios === 0) {
      lista.push('Date una vuelta por el directorio de centros de acopio para ver cuál te queda más cerca y qué materiales recibe.');
    }
    if (registro.separa_residuos !== 'Siempre') {
      lista.push('Empieza separando solo dos materiales, por ejemplo PET y cartón, y ve agregando más cuando se te haga costumbre.');
    }
    if (registro.reutiliza === 'Nunca') {
      lista.push('Antes de tirar frascos, bolsas o cajas, piensa si les puedes dar otro uso en casa.');
    }
    if (categorias.includes('Electrónicos (RAEE)') || categorias.includes('Manejo Especial')) {
      lista.push('Pilas, focos y electrónicos no van a la basura común. En el catálogo viene cómo entregarlos.');
    }
    if (registro.frecuencia_entrega === 'Nunca' && registro.materiales.length > 0) {
      lista.push('Ya separas algunos materiales; el siguiente paso es llevarlos a un centro de acopio.');
    }
    if (lista.length === 0) {
      lista.push('¡Vas muy bien! Comparte el cuestionario con tu familia o vecinos.');
    }
    return lista.slice(0, 3);
  }
}
