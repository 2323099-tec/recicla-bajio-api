class AuthControlador {
  constructor(urlApi = '/api') {
    this.urlApi = urlApi;
    this.modoRegistro = false;
    this.form = document.getElementById('form-auth');
    this.avisos = document.getElementById('auth-avisos');
  }

  iniciar() {
    document.getElementById('btn-abrir-auth')?.addEventListener('click', () => {
      document.getElementById('seccion-auth').hidden = false;
    });

    document.getElementById('btn-cerrar-auth')?.addEventListener('click', () => {
      document.getElementById('seccion-auth').hidden = true;
    });

    document.getElementById('btn-cambiar-modo')?.addEventListener('click', () => {
      this.modoRegistro = !this.modoRegistro;
      document.getElementById('campo-nombre-usuario').hidden = !this.modoRegistro;
      document.getElementById('auth-titulo').textContent = this.modoRegistro ? 'Crear cuenta' : 'Iniciar sesión';
      document.getElementById('btn-submit-auth').textContent = this.modoRegistro ? 'Registrarme' : 'Entrar';
      document.getElementById('btn-cambiar-modo').textContent = this.modoRegistro
        ? '¿Ya tienes cuenta? Inicia sesión'
        : '¿No tienes cuenta? Regístrate';
    });

    this.form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.autenticar();
    });

    document.getElementById('btn-cerrar-sesion')?.addEventListener('click', () => this.cerrarSesion());
    this.aplicarPermisosPorRol();
  }

  async autenticar() {
    const datos = Object.fromEntries(new FormData(this.form));
    const endpoint = this.modoRegistro ? '/auth/register' : '/auth/login';

    try {
      const resp = await fetch(`${this.urlApi}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(datos),
      });
      const json = await resp.json();

      if (!resp.ok) {
        this.avisos.textContent = json.message || 'No se pudo iniciar sesión.';
        return;
      }

      localStorage.setItem('rb_token', json.token);
      localStorage.setItem('rb_usuario', JSON.stringify(json.usuario));
      document.getElementById('seccion-auth').hidden = true;
      this.form.reset();
      this.avisos.textContent = '';
      this.aplicarPermisosPorRol();
    } catch {
      this.avisos.textContent = 'Error de conexión con el servidor.';
    }
  }

  async cerrarSesion() {
    const token = localStorage.getItem('rb_token');
    if (token) {
      await fetch(`${this.urlApi}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
    }
    localStorage.removeItem('rb_token');
    localStorage.removeItem('rb_usuario');
    this.aplicarPermisosPorRol();
  }

  aplicarPermisosPorRol() {
    const usuario = JSON.parse(localStorage.getItem('rb_usuario') || 'null');
    const rol = usuario?.rol || 'visitante';

    // 1. Barra superior
    document.getElementById('btn-abrir-auth').hidden = !!usuario;
    document.getElementById('btn-cerrar-sesion').hidden = !usuario;
    const badge = document.getElementById('usuario-activo-badge');
    badge.hidden = !usuario;
    if (usuario) badge.textContent = `${usuario.nombre_usuario} (${rol})`;

    // 2. Elementos visibles para Participante, Colaborador y Admin
    document.querySelectorAll('[data-rol-autenticado]').forEach((el) => {
      el.hidden = rol === 'visitante';
    });

    // 3. Elementos visibles solo para Colaborador y Admin (agregar/editar residuos)
    document.querySelectorAll('[data-rol-colaborador]').forEach((el) => {
      el.hidden = !['colaborador', 'admin'].includes(rol);
    });

    // 4. Elementos visibles solo para Admin (panel de gestión de usuarios)
    document.querySelectorAll('[data-rol-admin]').forEach((el) => {
      el.hidden = rol !== 'admin';
    });
  }
}