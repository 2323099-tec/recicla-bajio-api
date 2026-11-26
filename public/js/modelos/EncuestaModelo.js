/*
 * EncuestaModelo.js  (MODELO del cuestionario, módulo 4)
 *
 * Arma el registro que se manda al servidor y se encarga de enviarlo.
 * La forma del registro sigue las tablas `encuestas_habitos` y
 * `detalle_materiales_separados` del script SQL.
 *
 * Si el servidor no está disponible, la respuesta se guarda en el
 * navegador (localStorage) y se intenta mandar otra vez la próxima vez
 * que se abra la página. Solo guardamos la colonia y los hábitos, nada
 * que identifique a la persona.
 *
 * El id_usuario NO lo manda el navegador: el servidor lo toma de la
 * sesión si la persona inició sesión, o lo deja en NULL si es anónima.
 * Si lo mandáramos desde aquí, cualquiera podría contestar a nombre de otro.
 */

// Mismos valores que los ENUM de la base de datos
const OPCIONES_ENCUESTA = {
  habito: ['Siempre', 'A veces', 'Nunca'],
  frecuencia: ['Semanal', 'Quincenal', 'Mensual', 'Nunca'],
  siNo: ['1', '0'],
};

class EncuestaModelo {
  static CLAVE_PENDIENTES = 'rb_encuestas_pendientes';
  static CLAVE_ULTIMA = 'rb_ultima_encuesta';

  constructor(urlApi = '/api') {
    this.urlApi = urlApi;
  }

  // Convierte lo que llegó del formulario al formato que espera la API
  armarRegistro(datos) {
    return {
      colonia_zona: datos.colonia_zona.trim().replace(/\s+/g, ' '),
      separa_residuos: datos.separa_residuos,
      reutiliza: datos.reutiliza,
      conoce_acopios: Number(datos.conoce_acopios), // la BD lo guarda como TINYINT 1/0
      frecuencia_entrega: datos.frecuencia_entrega,
      materiales: datos.materiales.map((m) => ({
        id_residuo: Number(m.id_residuo),
        // si no escribió kilos mandamos null y el servidor usa el DEFAULT de la tabla
        cantidad_estimada_kg: m.kg === '' ? null : Math.round(Number(m.kg) * 100) / 100,
      })),
    };
  }

  /*
   * Regresa un objeto con el resultado:
   *   { estado: 'enviado' }                       se guardó en el servidor
   *   { estado: 'local' }                         no hubo servidor, quedó guardado en el navegador
   *   { estado: 'rechazado', mensaje, errores }   el servidor dijo que algo está mal (400, 422...)
   */
  async enviar(registro) {
    try {
      const respuesta = await pedirJSON(`${this.urlApi}/encuestas`, {
        method: 'POST',
        body: JSON.stringify(registro),
      });
      this.guardarUltima(registro, 'servidor');
      return { estado: 'enviado', id: respuesta?.id_encuesta ?? null };
    } catch (error) {
      if (error instanceof ErrorPeticion && error.esDeConexion) {
        const seGuardo = this.agregarPendiente(registro);
        this.guardarUltima(registro, 'local');
        return { estado: seGuardo ? 'local' : 'sin-guardar', mensaje: error.message };
      }
      return {
        estado: 'rechazado',
        mensaje: error.message,
        errores: error.datos?.errores || null, // ej. { colonia_zona: 'muy corta' }
      };
    }
  }

  agregarPendiente(registro) {
    const pendientes = Almacen.leer(EncuestaModelo.CLAVE_PENDIENTES) || [];
    pendientes.push({ ...registro, guardado_en: new Date().toISOString() });
    // Tope para no llenar el almacenamiento si alguien envía muchas veces sin servidor
    return Almacen.guardar(EncuestaModelo.CLAVE_PENDIENTES, pendientes.slice(-20));
  }

  // Intenta subir las respuestas que se quedaron guardadas. Se llama al abrir la página.
  async reintentarPendientes() {
    const pendientes = Almacen.leer(EncuestaModelo.CLAVE_PENDIENTES) || [];
    if (pendientes.length === 0) return 0;

    const quedan = [];
    let enviadas = 0;
    for (const { guardado_en, ...registro } of pendientes) {
      try {
        await pedirJSON(`${this.urlApi}/encuestas`, { method: 'POST', body: JSON.stringify(registro) });
        enviadas++;
      } catch (error) {
        // si el servidor la rechaza por datos inválidos ya no tiene caso guardarla
        if (error instanceof ErrorPeticion && error.esDeConexion) quedan.push({ ...registro, guardado_en });
      }
    }

    if (quedan.length) Almacen.guardar(EncuestaModelo.CLAVE_PENDIENTES, quedan);
    else Almacen.borrar(EncuestaModelo.CLAVE_PENDIENTES);
    return enviadas;
  }

  // El resumen se guarda en sessionStorage: dura mientras la pestaña esté abierta.
  // Es lo que pide el rol "Participante": ver su resumen mientras dure la sesión.
  guardarUltima(registro, origen) {
    Almacen.guardar(EncuestaModelo.CLAVE_ULTIMA, { registro, origen, fecha: new Date().toISOString() }, true);
  }

  obtenerUltima() {
    return Almacen.leer(EncuestaModelo.CLAVE_ULTIMA, true);
  }

  borrarUltima() {
    Almacen.borrar(EncuestaModelo.CLAVE_ULTIMA, true);
  }
}
