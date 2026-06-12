document.addEventListener('DOMContentLoaded', async () => {
  if (!redirectIfNotAuthenticated()) return;
  renderNavbar('favoritos');
  await carregar();
});

async function carregar() {
  const container = document.getElementById('favoritos-container');
  const alertEl   = document.getElementById('alert-container');

  container.innerHTML = `<div class="col-12 text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>`;

  try {
    const lista = await apiCall('/favoritos');

    if (lista.length === 0) {
      container.innerHTML = `
        <div class="col-12">
          <div class="empty-state">
            <i class="bi bi-heart"></i>
            <h5>Nenhum favorito ainda</h5>
            <p>Favorite anúncios que te interessam para encontrá-los aqui rapidamente.</p>
            <a href="/home.html" class="btn btn-primary mt-2">
              <i class="bi bi-search me-2"></i>Explorar anúncios
            </a>
          </div>
        </div>`;
      return;
    }

    container.innerHTML = lista.map(a => `
      <div class="col-sm-6 col-lg-4 col-xl-3" id="fav-${a.id}">
        <div class="card h-100" style="border:none;border-radius:14px;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
          <a href="/anuncio.html?id=${a.id}" class="text-decoration-none text-dark">
            ${fotoAnuncioUrl(a.foto_principal)
              ? `<img src="${fotoAnuncioUrl(a.foto_principal)}" class="card-img-top"
                      style="height:185px;object-fit:cover;border-radius:14px 14px 0 0" alt="${a.titulo}">`
              : `<div class="img-placeholder" style="height:185px;border-radius:14px 14px 0 0">
                   <i class="bi bi-image" style="font-size:3rem"></i>
                 </div>`}
            <div class="card-body pb-1">
              <p class="text-preco mb-1">${formatarPreco(a.preco)}</p>
              <h6 class="fw-semibold text-truncate mb-2">${a.titulo}</h6>
              <div class="d-flex flex-wrap gap-1">
                <span class="badge bg-primary bg-opacity-10 text-primary">${a.categoria}</span>
                ${a.vendedor_nome ? `<small class="text-muted d-block w-100 mt-1"><i class="bi bi-person me-1"></i>${a.vendedor_nome}</small>` : ''}
              </div>
            </div>
          </a>
          <div class="card-footer bg-transparent border-0 d-flex justify-content-between align-items-center pt-0">
            <small class="text-muted">${tempoRelativo(a.data_publicacao)}</small>
            <button class="btn btn-sm btn-outline-danger" onclick="removerFavorito(${a.id})">
              <i class="bi bi-heart-fill me-1"></i>Remover
            </button>
          </div>
        </div>
      </div>`).join('');
  } catch (err) {
    container.innerHTML = `<div class="col-12"><div class="alert alert-danger">${err.message}</div></div>`;
  }
}

async function removerFavorito(anuncioId) {
  const alertEl = document.getElementById('alert-container');
  try {
    await apiCall(`/favoritos/${anuncioId}`, { method: 'DELETE' });
    const card = document.getElementById(`fav-${anuncioId}`);
    if (card) {
      card.style.transition = 'opacity 0.25s';
      card.style.opacity = '0';
      setTimeout(() => {
        card.remove();
        // Se ficou vazio, recarrega para mostrar estado vazio
        if (!document.querySelector('#favoritos-container .col-sm-6')) carregar();
      }, 250);
    }
  } catch (err) {
    mostrarAlerta(alertEl, err.message);
  }
}
