/* Controla la apertura y cierre accesible del menu de navegacion en pantallas pequenas */

// Referencias a los elementos del DOM del encabezado
const btnMenu = document.getElementById("btn-menu");
const navPrincipal = document.getElementById("nav-principal");

// Verifica que ambos elementos existan antes de registrar eventos
if (btnMenu && navPrincipal) {
  // Alterna la visibilidad del menu y actualiza el atributo aria-expanded
  btnMenu.addEventListener("click", () => {
    const abierto = navPrincipal.classList.toggle("nav--abierto");
    btnMenu.setAttribute("aria-expanded", String(abierto));
  });

  // Cierra automaticamente el menu movil cuando el usuario selecciona una seccion
  navPrincipal.querySelectorAll("a").forEach((enlace) => {
    enlace.addEventListener("click", () => {
      navPrincipal.classList.remove("nav--abierto");
      btnMenu.setAttribute("aria-expanded", "false");
    });
  });
}