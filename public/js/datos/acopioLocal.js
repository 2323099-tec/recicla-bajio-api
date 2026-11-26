/* Arreglo de centros de acopio utilizado como respaldo local cuando la API /api/acopio no esta disponible */

export const centrosAcopioLocales = [
  {
    id: 1,
    nombre: "Centro de Acopio Institucional (Referencia SIAP)",
    zona: "centro",
    direccion: "Consultar puntos moviles y permanentes vigentes en Leon, Gto.",
    materiales: ["papel", "pet", "metal", "electronicos"],
    condiciones: "Materiales limpios, secos y separados por tipo. Confirmar campana activa.",
    contacto: "SIAP Leon / Direccion General de Medio Ambiente",
    fuente: "Referencia institucional SIAP (Dato de ejemplo para demostracion)",
    fechaVerificacion: "2026-11-01"
  },
  {
    id: 2,
    nombre: "Punto Verde Comunitario Norte (Ejemplo)",
    zona: "norte",
    direccion: "Zona Norte, Leon, Guanajuato",
    materiales: ["papel", "pet", "vidrio", "metal"],
    condiciones: "Botellas PET aplastadas y sin liquidos; carton seco y doblado.",
    contacto: "Tel. de verificacion local (confirmar horario antes de acudir)",
    fuente: "Registro de prueba - Directorio local",
    fechaVerificacion: "2026-11-10"
  },
  {
    id: 3,
    nombre: "Acopio Especializado de Electronicos (Ejemplo)",
    zona: "sur",
    direccion: "Zona Sur, Leon, Guanajuato",
    materiales: ["electronicos"],
    condiciones: "Equipos completos sin desarmar baterias. No se reciben pantallas rotas.",
    contacto: "Campanas de recoleccion electronica municipal",
    fuente: "Registro de prueba - NOM-161-SEMARNAT-2011",
    fechaVerificacion: "2026-11-15"
  }
];