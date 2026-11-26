/*
 * residuosLocales.js
 * Copia local del catálogo. Se usa como respaldo cuando la API
 * (GET /api/residuos) no responde, o cuando abrimos el HTML directo
 * desde la carpeta para hacer pruebas sin levantar el servidor.
 *
 * Los nombres de los campos son los mismos que las columnas de la tabla
 * `residuos` del script SQL, para que el front trate igual los datos
 * que vienen del servidor y los de aquí.
 *
 * Los registros 1 a 5 son los mismos que inserta el script SQL.
 * Del 6 en adelante son de ejemplo: el equipo de información tiene que
 * confirmar la fuente antes de la entrega (por eso dicen "por verificar").
 */

// Mismo orden que el ENUM `categoria` de la tabla residuos
const CATEGORIAS_RESIDUOS = [
  'Plásticos',
  'Papel y Cartón',
  'Vidrio',
  'Metales',
  'Electrónicos (RAEE)',
  'Orgánicos',
  'Manejo Especial',
];

const RESIDUOS_LOCALES = [
  {
    id_residuo: 1,
    nombre: 'Botellas PET (Tipo 1)',
    categoria: 'Plásticos',
    instrucciones: 'Retirar tapa y etiqueta si es posible; compactar para ahorrar espacio.',
    preparacion: 'Enjuagado, seco y aplastado',
    tratamiento_especial: null,
    componentes_quimicos: 'Tereftalato de polietileno',
    fuente_info: 'SEMARNAT / Guía de Separación León',
  },
  {
    id_residuo: 2,
    nombre: 'Cartón Corrugado',
    categoria: 'Papel y Cartón',
    instrucciones: 'Desarmar cajas y mantener libres de grasa o humedad.',
    preparacion: 'Seco, limpio y atado',
    tratamiento_especial: null,
    componentes_quimicos: 'Celulosa',
    fuente_info: 'SIAP León',
  },
  {
    id_residuo: 3,
    nombre: 'Latas de Aluminio',
    categoria: 'Metales',
    instrucciones: 'Vaciar líquidos y aplastar.',
    preparacion: 'Limpio y compactado',
    tratamiento_especial: null,
    componentes_quimicos: 'Aluminio',
    fuente_info: 'ECOCE',
  },
  {
    id_residuo: 4,
    nombre: 'Teléfonos Celulares y Cables',
    categoria: 'Electrónicos (RAEE)',
    instrucciones: 'Borrar datos personales antes de entregar. No mezclar con basura común.',
    preparacion: 'Sin humedad, batería integrada',
    tratamiento_especial: 'Desensamble especializado y recuperación de metales',
    componentes_quimicos: 'Litio, Cobalto, Plomo, Cobre',
    fuente_info: 'Programa Recicla Electrónicos Guanajuato',
  },
  {
    id_residuo: 5,
    nombre: 'Pilas Alcalinas y de Litio',
    categoria: 'Manejo Especial',
    instrucciones: 'Cubrir los polos con cinta adhesiva para evitar cortocircuitos.',
    preparacion: 'Aisladas en botella plástica seca',
    tratamiento_especial: 'Confinamiento controlado',
    componentes_quimicos: 'Mercurio, Cadmio, Litio, Zinc',
    fuente_info: 'Dirección de Medio Ambiente León',
  },
  {
    id_residuo: 6,
    nombre: 'Botellas y frascos de vidrio',
    categoria: 'Vidrio',
    instrucciones: 'Vaciar y enjuagar. Quitar tapas de metal o plástico. No mezclar con vidrio de ventanas, espejos ni focos.',
    preparacion: 'Enjuagado, sin tapa y sin romper',
    tratamiento_especial: null,
    componentes_quimicos: 'Sílice, carbonato de sodio',
    fuente_info: 'Dato de ejemplo (fuente por verificar)',
  },
  {
    id_residuo: 7,
    nombre: 'Restos de frutas y verduras',
    categoria: 'Orgánicos',
    instrucciones: 'Separarlos de plásticos, servilletas con grasa y huesos. Se pueden aprovechar para hacer composta en casa.',
    preparacion: 'Sin bolsas ni empaques',
    tratamiento_especial: 'Compostaje',
    componentes_quimicos: null,
    fuente_info: 'Dato de ejemplo (fuente por verificar)',
  },
  {
    id_residuo: 8,
    nombre: 'Papel de oficina y periódico',
    categoria: 'Papel y Cartón',
    instrucciones: 'Mejor sin arrugar; quitar grapas y clips si se puede. El papel encerado, sanitario o con grasa no se recicla.',
    preparacion: 'Seco y limpio',
    tratamiento_especial: null,
    componentes_quimicos: 'Celulosa',
    fuente_info: 'Dato de ejemplo (fuente por verificar)',
  },
  {
    id_residuo: 9,
    nombre: 'Envases de cartón para bebidas (multicapa)',
    categoria: 'Papel y Cartón',
    instrucciones: 'Enjuagar, abrir las esquinas y aplastar. Se entregan aparte del cartón normal porque llevan capas de plástico y aluminio.',
    preparacion: 'Enjuagado, seco y aplastado',
    tratamiento_especial: 'Separación de capas en planta',
    componentes_quimicos: 'Cartón, polietileno, aluminio',
    fuente_info: 'Dato de ejemplo (fuente por verificar)',
  },
  {
    id_residuo: 10,
    nombre: 'Bolsas y película plástica (PEBD tipo 4)',
    categoria: 'Plásticos',
    instrucciones: 'Juntarlas limpias y secas dentro de otra bolsa. No todos los centros las reciben, confirma antes de llevarlas.',
    preparacion: 'Limpias, secas y compactadas',
    tratamiento_especial: null,
    componentes_quimicos: 'Polietileno de baja densidad',
    fuente_info: 'Dato de ejemplo (fuente por verificar)',
  },
  {
    id_residuo: 11,
    nombre: 'Latas de acero (alimentos)',
    categoria: 'Metales',
    instrucciones: 'Enjuagar y, si se puede, meter la tapa dentro de la lata para no cortarse.',
    preparacion: 'Limpia y sin restos de comida',
    tratamiento_especial: null,
    componentes_quimicos: 'Acero con recubrimiento de estaño',
    fuente_info: 'Dato de ejemplo (fuente por verificar)',
  },
  {
    id_residuo: 12,
    nombre: 'Aceite de cocina usado',
    categoria: 'Manejo Especial',
    instrucciones: 'Dejar enfriar, colar y guardar en una botella cerrada. Nunca tirarlo al fregadero ni al drenaje.',
    preparacion: 'Frío, colado y en botella cerrada',
    tratamiento_especial: 'Puede transformarse en biodiésel o jabón',
    componentes_quimicos: 'Grasas y aceites vegetales',
    fuente_info: 'Dato de ejemplo (fuente por verificar)',
  },
  {
    id_residuo: 13,
    nombre: 'Computadoras y periféricos',
    categoria: 'Electrónicos (RAEE)',
    instrucciones: 'Respaldar y borrar la información. Entregar los equipos completos; no abrir monitores ni baterías.',
    preparacion: 'Completo, sin humedad',
    tratamiento_especial: 'Desensamble especializado',
    componentes_quimicos: 'Plomo, cobre, oro, plásticos con retardantes de flama',
    fuente_info: 'Dato de ejemplo (fuente por verificar)',
  },
  {
    id_residuo: 14,
    nombre: 'Focos ahorradores y lámparas fluorescentes',
    categoria: 'Manejo Especial',
    instrucciones: 'Entregarlos sin romper, de preferencia en su caja. Si se rompe uno, ventilar el cuarto y no usar aspiradora.',
    preparacion: 'Entero y protegido',
    tratamiento_especial: 'Recuperación de mercurio',
    componentes_quimicos: 'Mercurio, vidrio, metales',
    fuente_info: 'Dato de ejemplo (fuente por verificar)',
  },
];
