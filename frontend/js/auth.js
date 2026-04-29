function redirectIfNotAuthenticated() {
  if (!localStorage.getItem('token')) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

function getUsuarioLogado() {
  try {
    return JSON.parse(localStorage.getItem('usuario'));
  } catch {
    return null;
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = '/login.html';
}

async function login(email, senha) {
  const data = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha })
  });
  localStorage.setItem('token', data.token);
  localStorage.setItem('usuario', JSON.stringify(data.usuario));
  return data;
}

function fotoPerfilUrl(caminho, nome) {
  if (!caminho) {
    const inicial = encodeURIComponent((nome || 'U').charAt(0).toUpperCase());
    return `https://ui-avatars.com/api/?background=0d6efd&color=fff&bold=true&name=${inicial}`;
  }
  return `/uploads/${caminho}`;
}

function renderNavbar(paginaAtiva) {
  const el = document.getElementById('navbar-container');
  if (!el) return;

  const u = getUsuarioLogado();
  const nome = u?.nome?.split(' ')[0] || 'Usuário';
  const foto = fotoPerfilUrl(u?.foto_perfil, u?.nome);

  el.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top shadow-sm">
      <div class="container-xl">
        <a class="navbar-brand d-flex align-items-center gap-2" href="/home.html">
          <img src="/img/logo-unifan.png" class="navbar-logo" alt="UNIFAN">
          <span class="fw-bold fs-5 brand-text">UniMarket</span>
        </a>
        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMain">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarMain">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0 gap-1">
            <li class="nav-item">
              <a class="nav-link px-3 rounded ${paginaAtiva === 'home' ? 'active bg-white bg-opacity-10 fw-semibold' : ''}" href="/home.html">
                <i class="bi bi-house me-1"></i>Home
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link px-3 rounded ${paginaAtiva === 'meus-anuncios' ? 'active bg-white bg-opacity-10 fw-semibold' : ''}" href="/meus-anuncios.html">
                <i class="bi bi-tag me-1"></i>Meus Anúncios
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link px-3 rounded ${paginaAtiva === 'favoritos' ? 'active bg-white bg-opacity-10 fw-semibold' : ''}" href="/favoritos.html">
                <i class="bi bi-heart me-1"></i>Favoritos
              </a>
            </li>
          </ul>
          <div class="d-flex align-items-center gap-3 mt-2 mt-lg-0">
            <a href="/criar-anuncio.html" class="btn btn-warning fw-bold px-3 shadow-sm">
              <i class="bi bi-plus-circle-fill me-1"></i>Anunciar
            </a>
            <div class="dropdown">
              <button class="btn btn-outline-light d-flex align-items-center gap-2 py-1 px-2 rounded-pill"
                      type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <img src="${foto}" class="rounded-circle border border-2 border-light"
                     width="32" height="32" style="object-fit:cover" alt="Foto">
                <span class="d-none d-md-inline fw-semibold">${nome}</span>
                <i class="bi bi-chevron-down small opacity-75"></i>
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-1">
                <li class="px-3 py-2">
                  <div class="fw-semibold">${u?.nome || ''}</div>
                  <small class="text-muted">${u?.email || ''}</small>
                </li>
                <li><hr class="dropdown-divider my-1"></li>
                <li>
                  <a class="dropdown-item py-2" href="/perfil.html">
                    <i class="bi bi-person-circle me-2 text-primary"></i>Meu Perfil
                  </a>
                </li>
                <li><hr class="dropdown-divider my-1"></li>
                <li>
                  <button class="dropdown-item py-2 text-danger" onclick="logout()">
                    <i class="bi bi-box-arrow-right me-2"></i>Sair
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>`;
}

function mostrarAlerta(alvo, mensagem, tipo) {
  tipo = tipo || 'danger';
  const icone = tipo === 'success' ? 'check-circle-fill' : tipo === 'warning' ? 'exclamation-triangle-fill' : 'x-circle-fill';
  const html = `
    <div class="alert alert-${tipo} alert-dismissible fade show d-flex align-items-center gap-2" role="alert">
      <i class="bi bi-${icone} flex-shrink-0"></i>
      <span>${mensagem}</span>
      <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
    </div>`;
  const el = typeof alvo === 'string' ? document.getElementById(alvo) : alvo;
  if (el) el.innerHTML = html;
}

function mostrarSpinner(btn, texto) {
  btn.disabled = true;
  btn.dataset.orig = btn.innerHTML;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span>${texto || 'Aguarde...'}`;
}

function ocultarSpinner(btn) {
  btn.disabled = false;
  btn.innerHTML = btn.dataset.orig || 'Enviar';
}

function formatarPreco(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

function tempoRelativo(dataStr) {
  const diff = Math.floor((Date.now() - new Date(dataStr)) / 1000);
  if (diff < 60) return 'agora mesmo';
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`;
  if (diff < 2592000) return `há ${Math.floor(diff / 86400)} dias`;
  return new Date(dataStr).toLocaleDateString('pt-BR');
}
