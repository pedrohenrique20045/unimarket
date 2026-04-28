document.addEventListener('DOMContentLoaded', async () => {
  if (!redirectIfNotAuthenticated()) return;
  renderNavbar('');

  const id = new URLSearchParams(location.search).get('id');
  if (!id) { location.href = '/home.html'; return; }

  const container = document.getElementById('perfil-container');

  try {
    const perfil   = await apiCall(`/usuarios/${id}`);
    const anuncios = perfil.anuncios || [];

    const mesAno = new Date(perfil.data_cadastro).toLocaleDateString('pt-BR', {
      month: 'long', year: 'numeric'
    });

    container.innerHTML = `
      <div class="row g-4">

        <!-- Card do vendedor -->
        <div class="col-lg-4">
          <div class="card-generico p-4 text-center" style="position:sticky;top:80px">
            <img src="${fotoPerfilUrl(perfil.foto_perfil, perfil.nome)}"
                 class="perfil-avatar mb-3" alt="${perfil.nome}">
            <h4 class="fw-bold mb-1">${perfil.nome}</h4>
            <p class="text-muted mb-1">
              <i class="bi bi-mortarboard me-1"></i>${perfil.curso || '—'}
            </p>
            <p class="text-muted small mb-3">
              <i class="bi bi-calendar3 me-1"></i>Membro desde ${mesAno}
            </p>
            <div class="bg-light rounded-3 py-3 px-4 d-inline-block">
              <div class="fs-2 fw-bold text-primary">${anuncios.length}</div>
              <div class="text-muted small">anúncio${anuncios.length !== 1 ? 's' : ''} ativo${anuncios.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
        </div>

        <!-- Anúncios do vendedor -->
        <div class="col-lg-8">
          <div class="page-header mb-3">
            <h5 class="section-title">
              Anúncios de ${perfil.nome.split(' ')[0]}
            </h5>
          </div>

          ${anuncios.length === 0
            ? `<div class="empty-state">
                 <i class="bi bi-inbox"></i>
                 <h5>Nenhum anúncio ativo</h5>
               </div>`
            : `<div class="row g-3">
                 ${anuncios.map(a => `
                   <div class="col-sm-6">
                     <a href="/anuncio.html?id=${a.id}" class="anuncio-card card h-100">
                       ${a.foto_principal
                         ? `<img src="/uploads/${a.foto_principal}" class="card-img-top" alt="${a.titulo}">`
                         : `<div class="card-img-placeholder"><i class="bi bi-image"></i></div>`}
                       <div class="card-body">
                         <p class="preco mb-1">${formatarPreco(a.preco)}</p>
                         <h6 class="fw-semibold text-truncate mb-2">${a.titulo}</h6>
                         <span class="badge bg-primary bg-opacity-10 text-primary">${a.categoria}</span>
                       </div>
                     </a>
                   </div>`).join('')}
               </div>`}
        </div>
      </div>`;
  } catch (err) {
    container.innerHTML = `
      <div class="alert alert-danger d-flex align-items-center gap-2">
        <i class="bi bi-x-circle-fill"></i>${err.message}
      </div>`;
  }
});
