document.addEventListener('DOMContentLoaded', async () => {
  if (!redirectIfNotAuthenticated()) return;
  renderNavbar('');

  const id = new URLSearchParams(location.search).get('id');
  if (!id) { location.href = '/home.html'; return; }

  const container = document.getElementById('anuncio-container');
  const usuarioLogado = getUsuarioLogado();

  try {
    const [anuncio, favoritos] = await Promise.all([
      apiCall(`/anuncios/${id}`),
      apiCall('/favoritos').catch(() => [])
    ]);

    const isFavoritado = favoritos.some(f => f.id === anuncio.id);
    const ehDono = usuarioLogado?.id === anuncio.usuario_id;
    const fotos = anuncio.fotos || [];

    // Carousel
    const itens = fotos.length
      ? fotos.map((f, i) => `
          <div class="carousel-item ${i === 0 ? 'active' : ''}">
            <img src="/uploads/${f.caminho}" class="d-block w-100" alt="Foto ${i + 1}">
          </div>`).join('')
      : `<div class="carousel-item active">
           <div class="carousel-placeholder"><i class="bi bi-image" style="font-size:5rem;color:#adb5bd"></i></div>
         </div>`;

    const controles = fotos.length > 1 ? `
      <button class="carousel-control-prev" type="button" data-bs-target="#carousel-fotos" data-bs-slide="prev">
        <span class="carousel-control-prev-icon"></span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#carousel-fotos" data-bs-slide="next">
        <span class="carousel-control-next-icon"></span>
      </button>` : '';

    const indicadores = fotos.length > 1
      ? `<div class="carousel-indicators">
           ${fotos.map((_, i) => `<button type="button" data-bs-target="#carousel-fotos" data-bs-slide-to="${i}" ${i === 0 ? 'class="active"' : ''}></button>`).join('')}
         </div>` : '';

    // WhatsApp
    const tel = (anuncio.vendedor_telefone || '').replace(/\D/g, '');
    const msg = encodeURIComponent(`Olá! Vi seu anúncio "${anuncio.titulo}" no UniMarket e tenho interesse. Podemos conversar?`);
    const linkWpp = `https://wa.me/55${tel}?text=${msg}`;

    // Status badge
    const statusBadge = anuncio.status === 'ativo'
      ? `<span class="badge bg-success">Disponível</span>`
      : `<span class="badge bg-secondary">Vendido</span>`;

    container.innerHTML = `
      <div class="row g-4">

        <!-- Coluna principal -->
        <div class="col-lg-8">
          <div id="carousel-fotos" class="carousel slide mb-4" data-bs-ride="false">
            ${indicadores}
            <div class="carousel-inner">${itens}</div>
            ${controles}
          </div>

          <div class="detalhe-card p-4">
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
              <div>
                <h1 class="fs-3 fw-bold mb-2">${anuncio.titulo}</h1>
                ${statusBadge}
              </div>
              <div class="text-preco fs-2">${formatarPreco(anuncio.preco)}</div>
            </div>

            <div class="d-flex flex-wrap gap-2 mb-4">
              <span class="badge bg-primary bg-opacity-10 text-primary fs-6 px-3 py-2">
                <i class="bi bi-tag me-1"></i>${anuncio.categoria}
              </span>
              <span class="badge bg-secondary bg-opacity-10 text-secondary fs-6 px-3 py-2">
                <i class="bi bi-stars me-1"></i>${anuncio.estado_conservacao}
              </span>
              ${anuncio.curso_relacionado
                ? `<span class="badge bg-info bg-opacity-10 text-info fs-6 px-3 py-2">
                     <i class="bi bi-mortarboard me-1"></i>${anuncio.curso_relacionado}
                   </span>` : ''}
            </div>

            <h5 class="fw-semibold mb-2">Descrição</h5>
            <p class="text-secondary lh-lg" style="white-space:pre-wrap">${anuncio.descricao}</p>

            <hr class="mt-4">
            <small class="text-muted">
              <i class="bi bi-clock me-1"></i>Publicado ${tempoRelativo(anuncio.data_publicacao)}
            </small>
          </div>
        </div>

        <!-- Sidebar vendedor -->
        <div class="col-lg-4">
          <div class="vendedor-card p-4">
            <p class="text-uppercase fw-bold text-muted small mb-3">Vendedor</p>
            <a href="/perfil-publico.html?id=${anuncio.usuario_id}"
               class="d-flex align-items-center gap-3 text-decoration-none text-dark mb-4">
              <img src="${fotoPerfilUrl(anuncio.vendedor_foto, anuncio.vendedor_nome)}"
                   class="foto-vendedor" alt="${anuncio.vendedor_nome}">
              <div class="overflow-hidden">
                <div class="fw-semibold text-truncate">${anuncio.vendedor_nome}</div>
                <small class="text-muted">
                  <i class="bi bi-mortarboard me-1"></i>${anuncio.vendedor_curso || '—'}
                </small>
              </div>
            </a>

            ${anuncio.status === 'ativo' && !ehDono ? `
              <a href="${linkWpp}" target="_blank" rel="noopener" class="btn btn-whatsapp w-100 mb-3">
                <i class="bi bi-whatsapp me-2"></i>Falar no WhatsApp
              </a>

              <button id="btn-favoritar"
                      class="btn w-100 btn-favoritar ${isFavoritado ? 'ativo btn-danger' : 'btn-outline-danger'}"
                      onclick="toggleFavorito(${anuncio.id})">
                <i class="bi bi-heart${isFavoritado ? '-fill' : ''} me-2"></i>
                ${isFavoritado ? 'Favoritado' : 'Favoritar'}
              </button>` : ''}

            ${ehDono ? `
              <div class="d-grid gap-2">
                <a href="/editar-anuncio.html?id=${anuncio.id}" class="btn btn-outline-primary">
                  <i class="bi bi-pencil me-2"></i>Editar anúncio
                </a>
                <a href="/meus-anuncios.html" class="btn btn-light">
                  <i class="bi bi-tag me-2"></i>Meus anúncios
                </a>
              </div>` : ''}
          </div>
        </div>
      </div>`;

  } catch (err) {
    container.innerHTML = `
      <div class="alert alert-danger d-flex align-items-center gap-2">
        <i class="bi bi-x-circle-fill"></i>${err.message}
      </div>`;
  }
});

async function toggleFavorito(anuncioId) {
  const btn = document.getElementById('btn-favoritar');
  const favoritado = btn.classList.contains('ativo');
  btn.disabled = true;

  try {
    if (favoritado) {
      await apiCall(`/favoritos/${anuncioId}`, { method: 'DELETE' });
      btn.classList.remove('ativo', 'btn-danger');
      btn.classList.add('btn-outline-danger');
      btn.innerHTML = '<i class="bi bi-heart me-2"></i>Favoritar';
    } else {
      await apiCall(`/favoritos/${anuncioId}`, { method: 'POST' });
      btn.classList.add('ativo', 'btn-danger');
      btn.classList.remove('btn-outline-danger');
      btn.innerHTML = '<i class="bi bi-heart-fill me-2"></i>Favoritado';
    }
  } catch (err) {
    alert(err.message);
  } finally {
    btn.disabled = false;
  }
}
