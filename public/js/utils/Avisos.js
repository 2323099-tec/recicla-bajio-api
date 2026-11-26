/*
 * Avisos.js
 * Mensajes de éxito, error, información y advertencia que se muestran arriba
 * de los formularios y del catálogo. Todos se ven igual en todo el sitio.
 *
 * Tipos: 'exito', 'error', 'info', 'advertencia'
 * La clase CSS queda como .rb-aviso.rb-aviso--exito, .rb-aviso--error, etc.
 */

const Avisos = {
  mostrar(contenedor, tipo, texto, { autocerrar = 0, detalle = null } = {}) {
    if (!contenedor) return;

    const caja = crearElemento('div', `rb-aviso rb-aviso--${tipo}`);
    // 'alert' hace que el lector de pantalla lo lea de inmediato; para lo demás basta 'status'
    caja.setAttribute('role', tipo === 'error' ? 'alert' : 'status');

    caja.append(crearElemento('p', 'rb-aviso__texto', texto));
    if (detalle) caja.append(crearElemento('p', 'rb-aviso__detalle', detalle));

    const cerrar = crearElemento('button', 'rb-aviso__cerrar', '×');
    cerrar.type = 'button';
    cerrar.setAttribute('aria-label', 'Cerrar mensaje');
    cerrar.addEventListener('click', () => caja.remove());
    caja.append(cerrar);

    contenedor.replaceChildren(caja);

    if (autocerrar > 0) {
      setTimeout(() => caja.remove(), autocerrar);
    }
    return caja;
  },

  limpiar(contenedor) {
    if (contenedor) contenedor.replaceChildren();
  },
};
