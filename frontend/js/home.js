document.addEventListener('DOMContentLoaded', async () => {
  if (!redirectIfNotAuthenticated()) return;
  renderNavbar('home');

  const grid = document.getElementById('anuncios-grid');
  const totalEl = document.getElementById('total-anuncios');

  let filtros = { categoria: '', curso: '', precoMin: '', precoMax: '', q: '' };

  // ---- Categorias ----
  try {
    const cats = await apiCall('/categorias');
    const sel = document.getElementById('filtro-categoria');
    cats.forEach(c => {
      const o = document.createElement('option');
      o.value = c.nome;
      o.textContent = c.nome;
      sel.appendChild(o);
    });
  } catch { /* silencioso */ }

  // ---- Renderizar anúncios ----
  async function carregar() {
    grid.innerHTML = `<div class="col-12 text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>`;

    const p = new URLSearchParams();
    if (filtros.categoria) p.set('categoria', filtros.categoria);
    if (filtros.curso)     p.set('curso',     filtros.curso);
    if (filtros.precoMin)  p.set('precoMin',  filtros.precoMin);
    if (filtros.precoMax)  p.set('precoMax',  filtros.precoMax);
    if (filtros.q)         p.set('q',         filtros.q);

    try {
      const lista = await apiCall(`/anuncios?${p}`);
      totalEl.textContent = `${lista.length} anúncio${lista.length !== 1 ? 's' : ''}`;

      if (lista.length === 0) {
        grid.innerHTML = `
          <div class="col-12">
            <div class="empty-state">
              <i class="bi bi-search"></i>
              <h5>Nenhum anúncio encontrado</h5>
              <p class="mb-3">Tente outros filtros ou palavras-chave.</p>
              <button class="btn btn-outline-primary" id="btn-limpar-resultado">Limpar filtros</button>
            </div>
          </div>`;
        document.getElementById('btn-limpar-resultado')?.addEventListener('click', limparFiltros);
        return;
      }

      grid.innerHTML = lista.map(a => `
        <div class="col-sm-6 col-xl-4">
          <a href="/anuncio.html?id=${a.id}" class="anuncio-card card h-100">
            ${a.foto_principal
              ? `<img src="/uploads/${a.foto_principal}" class="card-img-top" alt="${escHtml(a.titulo)}">`
              : `<div class="card-img-placeholder"><i class="bi bi-image"></i></div>`}
            <div class="card-body pb-2">
              <p class="preco mb-1">${formatarPreco(a.preco)}</p>
              <h6 class="fw-semibold text-truncate mb-2" title="${escHtml(a.titulo)}">${escHtml(a.titulo)}</h6>
              <div class="d-flex flex-wrap gap-1">
                <span class="badge bg-primary bg-opacity-10 text-primary">${a.categoria}</span>
                <span class="badge bg-secondary bg-opacity-10 text-secondary">${a.estado_conservacao}</span>
              </div>
            </div>
            <div class="card-footer bg-transparent border-0 pt-0 pb-2 d-flex justify-content-between">
              ${a.curso_relacionado
                ? `<small class="text-muted text-truncate"><i class="bi bi-mortarboard me-1"></i>${escHtml(a.curso_relacionado)}</small>`
                : `<span></span>`}
              <small class="text-muted flex-shrink-0">${tempoRelativo(a.data_publicacao)}</small>
            </div>
          </a>
        </div>`).join('');
    } catch (err) {
      grid.innerHTML = `<div class="col-12"><div class="alert alert-danger">${err.message}</div></div>`;
    }
  }

  function limparFiltros() {
    filtros = { categoria: '', curso: '', precoMin: '', precoMax: '', q: '' };
    document.getElementById('filtro-categoria').value = '';
    document.getElementById('filtro-curso').value = '';
    document.getElementById('preco-min').value = '';
    document.getElementById('preco-max').value = '';
    document.getElementById('busca-input').value = '';
    carregar();
  }

  // ---- Eventos ----
  document.getElementById('form-busca').addEventListener('submit', e => {
    e.preventDefault();
    filtros.q = document.getElementById('busca-input').value.trim();
    carregar();
  });

  document.getElementById('busca-input').addEventListener('input', e => {
    if (e.target.value === '') { filtros.q = ''; carregar(); }
  });

  document.getElementById('filtro-categoria').addEventListener('change', e => {
    filtros.categoria = e.target.value;
    carregar();
  });

  document.getElementById('btn-buscar-curso').addEventListener('click', () => {
    filtros.curso = document.getElementById('filtro-curso').value.trim();
    carregar();
  });

  document.getElementById('filtro-curso').addEventListener('keydown', e => {
    if (e.key === 'Enter') { filtros.curso = e.target.value.trim(); carregar(); }
  });

  document.getElementById('btn-aplicar-preco').addEventListener('click', () => {
    filtros.precoMin = document.getElementById('preco-min').value;
    filtros.precoMax = document.getElementById('preco-max').value;
    carregar();
  });

  document.getElementById('btn-limpar-filtros').addEventListener('click', limparFiltros);

  await carregar();
});

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
