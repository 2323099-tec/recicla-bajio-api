/*
 * app.js
 * Punto de arranque del JavaScript del sitio.
 *
 * Revisa qué secciones existen en la página que se abrió y solo arranca
 * esas. Así el mismo app.js sirve para todas las páginas: si en
 * index.html no hay catálogo, simplemente no se inicia.
 *
 * La dirección de la API se puede cambiar sin tocar este archivo,
 * poniendo antes de cargar los scripts:
 *   <script>window.RECICLA_CONFIG = { urlApi: 'https://servidor.com/api' };</script>
 */

document.addEventListener('DOMContentLoaded', () => {
  const configuracion = { urlApi: '/api', ...(window.RECICLA_CONFIG || {}) };

  // Un solo modelo de residuos para toda la página: el catálogo y el
  // cuestionario lo comparten y la API se consulta una sola vez.
  const residuos = new ResiduoModelo(configuracion.urlApi);

  const seccionCatalogo = document.querySelector('#catalogo');
  if (seccionCatalogo) {
    new CatalogoControlador(residuos, new CatalogoVista(seccionCatalogo)).iniciar();
  }

  const seccionEncuesta = document.querySelector('#encuesta');
  if (seccionEncuesta) {
    new EncuestaControlador(
      new EncuestaModelo(configuracion.urlApi),
      residuos,
      new EncuestaVista(seccionEncuesta),
    ).iniciar();
  }

  const seccionContacto = document.querySelector('#contacto');
  if (seccionContacto) {
    new ContactoControlador(seccionContacto, configuracion.urlApi).iniciar();
  }
});
