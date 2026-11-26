/*
 * http.js
 * Envoltura de fetch para no repetir lo mismo en cada modelo.
 *  - Corta la petición si el servidor tarda demasiado.
 *  - Revisa el código de estado (fetch NO marca error con un 404 o 500, hay que revisarlo a mano).
 *  - Convierte la respuesta a JSON.
 *  - Si el servidor puso un token CSRF en <meta name="csrf-token">, lo manda en el encabezado.
 */

class ErrorPeticion extends Error {
  constructor(mensaje, estado = 0, datos = null) {
    super(mensaje);
    this.name = 'ErrorPeticion';
    this.estado = estado; // 0 = no hubo respuesta (sin internet, servidor apagado o tiempo agotado)
    this.datos = datos; // lo que haya mandado el servidor junto con el error, si mandó algo
  }

  // Errores en los que tiene sentido usar el respaldo local o reintentar después.
  // 404 lo metemos aquí porque mientras desarrollamos puede que la ruta todavía no exista.
  get esDeConexion() {
    return this.estado === 0 || this.estado === 404 || this.estado >= 500;
  }
}

async function pedirJSON(url, opciones = {}, tiempoMaximo = 6000) {
  const { headers: encabezadosExtra, ...resto } = opciones;
  const encabezados = { Accept: 'application/json', ...encabezadosExtra };

  if (resto.body) encabezados['Content-Type'] = 'application/json';

  const metaCsrf = document.querySelector('meta[name="csrf-token"]');
  if (metaCsrf && resto.method && resto.method !== 'GET') {
    encabezados['X-CSRF-Token'] = metaCsrf.content;
  }

  const control = new AbortController();
  const reloj = setTimeout(() => control.abort(), tiempoMaximo);

  let respuesta;
  try {
    respuesta = await fetch(url, {
      credentials: 'same-origin', // para que viaje la cookie de sesión
      ...resto,
      headers: encabezados,
      signal: control.signal,
    });
  } catch (error) {
    const motivo = error.name === 'AbortError'
      ? 'El servidor tardó demasiado en responder.'
      : 'No se pudo conectar con el servidor.';
    throw new ErrorPeticion(motivo, 0);
  } finally {
    clearTimeout(reloj);
  }

  // Solo intentamos leer JSON si el servidor dice que eso mandó.
  let datos = null;
  const tipoContenido = respuesta.headers.get('content-type') || '';
  if (tipoContenido.includes('application/json')) {
    try {
      datos = await respuesta.json();
    } catch (error) {
      datos = null;
    }
  }

  if (!respuesta.ok) {
    const mensaje = (datos && (datos.mensaje || datos.message || datos.error))
      || `El servidor respondió con el código ${respuesta.status}.`;
    throw new ErrorPeticion(mensaje, respuesta.status, datos);
  }

  return datos;
}
