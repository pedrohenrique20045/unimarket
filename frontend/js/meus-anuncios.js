document.addEventListener('DOMContentLoaded', async () => {
  if (!redirectIfNotAuthenticated()) return;
  renderNavbar('meus-anuncios');
  await carregar();
});

async function carregar() {
  const listaAtivos   = document.getElementById('lista-ativos');
  const listaVendidos = document.getElementById('lista-vendidos');
  const alertEl       = document.getElementById('alert-container');

  listaAtivos.innerHTML = `<div class="text-center py-4"><div class="spinner-border text-primary" role="status"></div></div>`;

  try {
    const todos    = await apiCall('/anuncios/meus');
    const ativos   = todos.filter(a => a.status === 'ativo');
    const vendidos = todos.filter(a => a.status === 'vendido');

    document.getElementById('count-ativos').textContent   = ativos.length;
    document.getElementById('count-vendidos').textContent = vendidos.length;

    renderLista(listaAtivos,   ativos,   true);
    renderLista(listaVendidos, vendidos, false);
  } catch (err) {
    listaAtivos.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
}

function renderLista(container, lista, mostrarAcoes) {
  if (lista.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-inbox"></i>
        <h5>Nenhum anúncio aqui</h5>
        ${mostrarAcoes ? `<a href="/criar-anuncio.html" class="btn btn-primary mt-2">Criar primeiro anúncio</a>` : ''}
      </div>`;
    return;
  }

  container.innerHTML = lista.map(a => `
    <div class="meu-anuncio-card p-3 mb-3" id="card-${a.id}">
      <div class="d-flex gap-3 align-items-start">
        ${a.foto_principal
          ? `<img src="/uploads/${a.foto_principal}" class="meu-anuncio-foto" alt="${a.titulo}">`
          : `<div class="meu-anuncio-foto img-placeholder rounded"><i class="bi bi-image fs-4"></i></div>`}
        <div class="flex-grow-1 overflow-hidden">
          <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div class="overflow-hidden">
              <h6 class="fw-semibold text-truncate mb-1">${a.titulo}</h6>
              <div class="text-preco mb-1">${formatarPreco(a.preco)}</div>
              <div class="d-flex flex-wrap gap-1">
                <span class="badge bg-primary bg-opacity-10 text-primary">${a.categoria}</span>
                <span class="badge ${a.status === 'ativo' ? 'badge-ativo' : 'badge-vendido'}">${a.status}</span>
              </div>
            </div>
            <div class="d-flex flex-wrap gap-2 flex-shrink-0">
              <a href="/anuncio.html?id=${a.id}" class="btn btn-sm btn-outline-secondary" title="Visualizar">
                <i class="bi bi-eye"></i>
              </a>
              ${mostrarAcoes ? `
                <a href="/editar-anuncio.html?id=${a.id}" class="btn btn-sm btn-outline-primary" title="Editar">
                  <i class="bi bi-pencil"></i>
                </a>
                <button class="btn btn-sm btn-outline-success" title="Marcar como vendido"
                        onclick="marcarVendido(${a.id})">
                  <i class="bi bi-check-circle"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" title="Excluir"
                        onclick="excluirAnuncio(${a.id})">
                  <i class="bi bi-trash"></i>
                </button>` : ''}
            </div>
          </div>
          <small class="text-muted d-block mt-1">
            <i class="bi bi-clock me-1"></i>${tempoRelativo(a.data_publicacao)}
          </small>
        </div>
      </div>
    </div>`).join('');
}

async function marcarVendido(id) {
  if (!confirm('Marcar este anúncio como vendido?')) return;
  try {
    await apiCall(`/anuncios/${id}/vendido`, { method: 'PUT' });
    await carregar();
  } catch (err) {
    mostrarAlerta('alert-container', err.message);
  }
}

async function excluirAnuncio(id) {
  if (!confirm('Excluir este anúncio permanentemente? Esta ação não pode ser desfeita.')) return;
  try {
    await apiCall(`/anuncios/${id}`, { method: 'DELETE' });
    document.getElementById(`card-${id}`)?.remove();
    await carregar();
  } catch (err) {
    mostrarAlerta('alert-container', err.message);
  }
}
