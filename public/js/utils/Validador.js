/*
 * Validador.js
 * Reglas de validación para el cuestionario y el formulario de contacto.
 *
 * Cada regla regresa el texto del error, o '' (cadena vacía) si el valor está bien.
 * Así podemos encadenarlas con ||, por ejemplo:
 *     Validador.requerido(x) || Validador.longitud(x, 3, 100)
 * y se queda con el primer error que encuentre.
 *
 * Importante: esto es para ayudar al usuario a llenar bien el formulario.
 * El servidor TIENE que volver a validar todo, porque desde el navegador
 * cualquiera puede desactivar el JavaScript o mandar la petición a mano.
 */

const Validador = {
  requerido(valor, mensaje = 'Este campo es obligatorio.') {
    return String(valor ?? '').trim() === '' ? mensaje : '';
  },

  longitud(valor, minimo, maximo) {
    const largo = String(valor ?? '').trim().length;
    if (largo < minimo) return `Escribe al menos ${minimo} caracteres.`;
    if (largo > maximo) return `Máximo ${maximo} caracteres (llevas ${largo}).`;
    return '';
  },

  correo(valor) {
    // No es la expresión "perfecta" de correo, pero detecta los errores comunes
    // (sin @, sin dominio, con espacios). La validación real la hace el servidor.
    const patron = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return patron.test(String(valor ?? '').trim()) ? '' : 'Escribe un correo válido, por ejemplo nombre@correo.com';
  },

  // Letras (con acentos y ñ), números, espacios y algunos signos comunes en direcciones.
  // Evita que nos manden cosas como <script> o caracteres raros.
  textoSimple(valor) {
    const patron = /^[\p{L}\p{N}\s.,#'()-]*$/u;
    return patron.test(String(valor ?? '')) ? '' : 'Usa solo letras, números y signos básicos (. , # - ).';
  },

  // Revisa que el valor sea una de las opciones permitidas (igual que los ENUM de la BD).
  opcion(valor, opcionesValidas, mensaje = 'Elige una opción.') {
    return opcionesValidas.includes(valor) ? '' : mensaje;
  },

  numero(valor, minimo, maximo) {
    const numero = Number(valor);
    if (String(valor).trim() === '' || Number.isNaN(numero)) return 'Escribe un número.';
    if (numero < minimo || numero > maximo) return `El valor debe estar entre ${minimo} y ${maximo}.`;
    return '';
  },
};

/*
 * MarcadorErrores
 * Pone y quita el mensaje rojo debajo de cada campo.
 * Recibe el contenedor del campo (el div o fieldset con data-campo="...").
 * Además marca aria-invalid y aria-describedby para que el lector de pantalla
 * anuncie el error cuando el usuario regresa al campo.
 */
const MarcadorErrores = {
  mostrar(contenedor, mensaje) {
    if (!contenedor) return;
    const idError = `error-${contenedor.dataset.campo}`;
    let parrafo = contenedor.querySelector(`#${idError}`);

    if (!parrafo) {
      parrafo = crearElemento('p', 'rb-error-campo');
      parrafo.id = idError;
      contenedor.append(parrafo);
    }
    parrafo.textContent = mensaje;
    contenedor.classList.add('campo--con-error');

    contenedor.querySelectorAll('input, select, textarea').forEach((control) => {
      control.setAttribute('aria-invalid', 'true');
      control.setAttribute('aria-describedby', idError);
    });
  },

  limpiar(contenedor) {
    if (!contenedor) return;
    contenedor.querySelector('.rb-error-campo')?.remove();
    contenedor.classList.remove('campo--con-error');
    contenedor.querySelectorAll('[aria-invalid]').forEach((control) => {
      control.removeAttribute('aria-invalid');
      control.removeAttribute('aria-describedby');
    });
  },

  limpiarTodo(formulario) {
    formulario.querySelectorAll('[data-campo]').forEach((c) => this.limpiar(c));
  },
};
