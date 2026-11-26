/*
 * herramientas.js
 * Funciones pequeñas que usamos en varias partes del front (catálogo,
 * cuestionario y contacto). Van aquí para no copiarlas en cada archivo.
 */

// Pasa el texto a minúsculas y le quita los acentos.
// Sirve para comparar: "plastico" encuentra "Plásticos" y "CARTON" encuentra "Cartón".
function normalizarTexto(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

// "Papel y Cartón" -> "papel-y-carton". Lo usamos para armar clases CSS por categoría.
function aSlug(texto) {
  return normalizarTexto(texto)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Espera a que el usuario deje de escribir antes de ejecutar la función.
// Sin esto el catálogo se volvería a dibujar con cada tecla.
function retrasar(funcion, milisegundos = 250) {
  let temporizador;
  return (...argumentos) => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => funcion(...argumentos), milisegundos);
  };
}

// Crea un elemento con clase y texto.
// Ojo: siempre usamos textContent y no innerHTML. Si algún dato de la BD
// trajera etiquetas <script>, se mostrarían como texto y no se ejecutarían (XSS).
function crearElemento(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined && texto !== null) elemento.textContent = texto;
  return elemento;
}

// localStorage puede fallar (modo incógnito en algunos navegadores, cuota llena,
// almacenamiento bloqueado), así que lo envolvemos para que un error ahí no tumbe la página.
// soloSesion = true usa sessionStorage (se borra al cerrar la pestaña).
const Almacen = {
  leer(clave, soloSesion = false) {
    try {
      const almacen = soloSesion ? sessionStorage : localStorage;
      const valor = almacen.getItem(clave);
      return valor ? JSON.parse(valor) : null;
    } catch (error) {
      return null;
    }
  },
  guardar(clave, valor, soloSesion = false) {
    try {
      const almacen = soloSesion ? sessionStorage : localStorage;
      almacen.setItem(clave, JSON.stringify(valor));
      return true;
    } catch (error) {
      return false;
    }
  },
  borrar(clave, soloSesion = false) {
    try {
      const almacen = soloSesion ? sessionStorage : localStorage;
      almacen.removeItem(clave);
    } catch (error) {
      /* si no se puede borrar no pasa nada */
    }
  },
};
