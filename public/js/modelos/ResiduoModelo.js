/*
 * ResiduoModelo.js  (MODELO del catálogo)
 *
 * Se encarga de los DATOS de los residuos: pedirlos a la API, usar el
 * respaldo local si falla, y filtrarlos. No toca el HTML para nada;
 * eso le toca a la vista.
 *
 * Lo usan dos controladores: el del catálogo (módulo 2) y el del
 * cuestionario (módulo 4, para armar la lista de materiales). Por eso
 * la descarga se hace una sola vez y se guarda la promesa.
 */

class ResiduoModelo {
  constructor(urlApi = '/api') {
    this.urlApi = urlApi;
    this.residuos = [];
    this.origen = null; // 'servidor' o 'local', para avisarle al usuario de dónde salen los datos
    this.errorCarga = null;
    this.promesaCarga = null;
  }

  // Si ya se pidió antes, regresa la misma promesa en lugar de volver a hacer fetch.
  cargar() {
    if (!this.promesaCarga) {
      this.promesaCarga = this.descargar();
    }
    return this.promesaCarga;
  }

  async descargar() {
    try {
      const datos = await pedirJSON(`${this.urlApi}/residuos`);

      // Aceptamos que el servidor mande el arreglo directo [...] o envuelto { data: [...] }
      const lista = Array.isArray(datos) ? datos : datos?.data;
      if (!Array.isArray(lista) || lista.length === 0) {
        throw new Error('La API respondió, pero no mandó una lista de residuos.');
      }

      this.residuos = this.prepararLista(lista);
      this.origen = 'servidor';
    } catch (error) {
      // Plan B: datos locales. La página sigue funcionando aunque el servidor no esté.
      console.warn('[Catálogo] Se usan datos locales:', error.message);
      this.errorCarga = error.message;
      this.residuos = this.prepararLista(RESIDUOS_LOCALES);
      this.origen = 'local';
    }
    return this.residuos;
  }

  // Deja todos los registros con la misma forma (por si el servidor manda
  // `id` en vez de `id_residuo`, o campos vacíos) y los ordena por nombre.
  prepararLista(lista) {
    return lista
      .map((r) => ({
        id_residuo: Number(r.id_residuo ?? r.id),
        nombre: String(r.nombre ?? '').trim(),
        categoria: r.categoria || 'Sin categoría',
        instrucciones: r.instrucciones || '',
        preparacion: r.preparacion || '',
        tratamiento_especial: r.tratamiento_especial || null,
        componentes_quimicos: r.componentes_quimicos || null,
        fuente_info: r.fuente_info || 'Sin fuente registrada',
      }))
      .filter((r) => r.nombre !== '' && !Number.isNaN(r.id_residuo))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }

  total() {
    return this.residuos.length;
  }

  buscarPorId(id) {
    return this.residuos.find((r) => r.id_residuo === Number(id)) || null;
  }

  // Categorías que sí tienen al menos un residuo, en el orden del ENUM.
  // Si el servidor manda una categoría nueva que no conocemos, va al final.
  categorias() {
    const presentes = new Set(this.residuos.map((r) => r.categoria));
    const conocidas = CATEGORIAS_RESIDUOS.filter((c) => presentes.has(c));
    const nuevas = [...presentes].filter((c) => !CATEGORIAS_RESIDUOS.includes(c));
    return [...conocidas, ...nuevas];
  }

  contarPorCategoria(categoria) {
    return this.residuos.filter((r) => r.categoria === categoria).length;
  }

  /*
   * Filtra por texto y por categoría al mismo tiempo.
   * La búsqueda no distingue mayúsculas ni acentos, y busca cada palabra
   * por separado: "lata aluminio" encuentra "Latas de Aluminio".
   * Se busca en nombre, categoría y componentes, así "mercurio" encuentra
   * pilas y focos aunque no esté en el nombre. (Probamos buscando también
   * en las instrucciones, pero salían resultados que no tenían que ver.)
   *
   * Los que coinciden en el nombre salen primero.
   */
  filtrar({ texto = '', categoria = '' } = {}) {
    const palabras = normalizarTexto(texto).split(/\s+/).filter(Boolean);
    const coincide = (campo) => palabras.every((p) => normalizarTexto(campo).includes(p));

    const encontrados = this.residuos.filter((residuo) => {
      if (categoria && residuo.categoria !== categoria) return false;
      if (palabras.length === 0) return true;
      return coincide([residuo.nombre, residuo.categoria, residuo.componentes_quimicos].join(' '));
    });

    if (palabras.length === 0) return encontrados;

    // sort() en JS es estable: los que empatan conservan el orden alfabético
    return encontrados.sort((a, b) => Number(coincide(b.nombre)) - Number(coincide(a.nombre)));
  }
}
