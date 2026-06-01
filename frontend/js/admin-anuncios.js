let statusAtual = 'todos';

document.addEventListener('DOMContentLoaded', async () => {
  const ok = await exigirAdmin();
  if (!ok) return;

  renderNavbar('admin-anuncios');

  document.querySelectorAll('[data-status]').forEach(btn => {
    btn.addEventListener('click', () => {
      statusAtual = btn.dataset.status;
      document.querySelectorAll('[data-status]').forEach(b => {
        b.classList.remove('active', 'btn-primary');
        b.classList.add('btn-outline-primary');
      });
      btn.classList.add('active', 'btn-primary');
      btn.classList.remove('btn-outline-primary');
      carregarAnuncios();
    });
  });

  await carregarAnuncios();
});

async function carregarAnuncios() {
  document.getElementById('loading').classList.remove('d-none');
  document.getElementById('tabela-container').classList.add('d-none');

  try {
    const params   = statusAtual !== 'todos' ? `?status=${statusAtual}` : '';
    const anuncios = await apiCall(`/admin/anuncios${params}`);

    renderTabela(anuncios);

    document.getElementById('loading').classList.add('d-none');
    document.getElementById('tabela-container').classList.remove('d-none');
    document.getElementById('anuncio-count').textContent =
      `${anuncios.length} anúncio${anuncios.length !== 1 ? 's' : ''}`;
  } catch (err) {
    document.getElementById('loading').classList.add('d-none');
    mostrarAlerta('alert-container', err.message);
  }
}

function renderTabela(anuncios) {
  const tbody = document.getElementById('tabela-body');

  if (anuncios.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9">
          <div class="empty-state py-5">
            <i class="bi bi-collection"></i>
            <h5>Nenhum anúncio encontrado</h5>
            <p class="text-muted small">Tente mudar o filtro de status.</p>
          </div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = anuncios.map(a => {
    const preco  = formatarPreco(a.preco);
    const data   = new Date(a.data_publicacao).toLocaleDateString('pt-BR');
    const titulo = escapeHtml(a.titulo);
    const badge  = a.status === 'ativo'
      ? '<span class="badge badge-ativo-admin">Ativo</span>'
      : '<span class="badge badge-vendido">Vendido</span>';

    return `
      <tr>
        <td class="px-3 text-muted small align-middle">${a.id}</td>
        <td class="align-middle">
          <div class="img-placeholder rounded d-flex align-items-center justify-content-center"
               style="width:48px;height:48px;font-size:1.4rem;background:#f0f2f5;color:#adb5bd">
            <i class="bi bi-image"></i>
          </div>
        </td>
        <td class="align-middle fw-semibold" style="max-width:180px">
          <div class="text-truncate" title="${titulo}">${titulo}</div>
        </td>
        <td class="align-middle d-none d-md-table-cell">
          <span class="badge badge-categoria small">${escapeHtml(a.categoria) || '—'}</span>
        </td>
        <td class="align-middle fw-semibold text-preco text-nowrap">${preco}</td>
        <td class="align-middle small d-none d-lg-table-cell">
          <div class="fw-semibold">${escapeHtml(a.nome_vendedor)}</div>
          <div class="text-muted">${escapeHtml(a.email_vendedor)}</div>
        </td>
        <td class="align-middle">${badge}</td>
        <td class="align-middle small text-nowrap d-none d-md-table-cell">${data}</td>
        <td class="align-middle text-center admin-table-actions">
          <a href="/anuncio.html?id=${a.id}" target="_blank"
             class="btn btn-sm btn-outline-primary me-1" title="Ver anúncio">
            <i class="bi bi-eye"></i>
          </a>
          <button class="btn btn-sm btn-danger"
                  onclick="removerAnuncio(${a.id}, '${escapeSingleQuote(a.titulo)}')"
                  title="Remover anúncio">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>`;
  }).join('');
}

async function removerAnuncio(id, titulo) {
  if (!confirm(`Tem certeza? O anúncio "${titulo}" será removido permanentemente.\nEsta ação não pode ser desfeita.`)) return;
  try {
    await apiCall(`/admin/anuncios/${id}`, { method: 'DELETE' });
    mostrarAlerta('alert-container', `Anúncio "${titulo}" removido com sucesso.`, 'success');
    await carregarAnuncios();
  } catch (err) {
    mostrarAlerta('alert-container', err.message);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeSingleQuote(str) {
  return String(str || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
