document.addEventListener('DOMContentLoaded', async () => {
  const ok = await exigirAdmin();
  if (!ok) return;

  renderNavbar('admin');

  try {
    const data = await apiCall('/admin/dashboard');

    document.getElementById('stat-usuarios').textContent  = data.total_usuarios;
    document.getElementById('stat-ativos').textContent    = data.total_anuncios_ativos;
    document.getElementById('stat-vendidos').textContent  = data.total_anuncios_vendidos;
    document.getElementById('stat-banidos').textContent   = data.total_usuarios_banidos;

    document.getElementById('stat-usuarios-recentes').textContent  = `+${data.usuarios_ultimos_7_dias} nos últimos 7 dias`;
    document.getElementById('stat-anuncios-recentes').textContent  = `+${data.anuncios_ultimos_7_dias} nos últimos 7 dias`;
    document.getElementById('stat-total-anuncios').textContent     = `${data.total_anuncios} no total`;
    document.getElementById('stat-favoritos').textContent          = `${data.total_favoritos} favoritos`;

    renderCategorias(data.categorias_populares);

    document.getElementById('loading').classList.add('d-none');
    document.getElementById('dashboard-content').classList.remove('d-none');
  } catch (err) {
    document.getElementById('loading').classList.add('d-none');
    mostrarAlerta('alert-container', err.message);
  }
});

function renderCategorias(categorias) {
  const container = document.getElementById('categorias-container');

  if (!categorias || categorias.length === 0) {
    container.innerHTML = '<p class="text-muted small">Nenhuma categoria com anúncios ativos.</p>';
    return;
  }

  const max = Number(categorias[0].total);
  const cores = ['var(--um-primary)', 'var(--um-secondary)', '#059669', '#7c3aed', '#d97706'];

  container.innerHTML = categorias.map((cat, i) => {
    const pct   = max > 0 ? Math.round((Number(cat.total) / max) * 100) : 0;
    const total = Number(cat.total);
    return `
      <div class="mb-3">
        <div class="d-flex justify-content-between mb-1">
          <span class="fw-semibold small">${i + 1}. ${cat.categoria || 'Sem categoria'}</span>
          <span class="text-muted small">${total} anúncio${total !== 1 ? 's' : ''}</span>
        </div>
        <div class="progress" style="height:8px;border-radius:4px">
          <div class="progress-bar" role="progressbar"
               style="width:${pct}%;background-color:${cores[i]};border-radius:4px"
               aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
      </div>`;
  }).join('');
}
