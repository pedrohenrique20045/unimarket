let todosUsuarios = [];

document.addEventListener('DOMContentLoaded', async () => {
  const ok = await exigirAdmin();
  if (!ok) return;

  renderNavbar('admin-usuarios');

  document.getElementById('busca-usuario').addEventListener('input', e => {
    filtrarUsuarios(e.target.value.trim().toLowerCase());
  });

  await carregarUsuarios();
});

async function carregarUsuarios() {
  try {
    todosUsuarios = await apiCall('/admin/usuarios');
    renderTabela(todosUsuarios);

    document.getElementById('loading').classList.add('d-none');
    document.getElementById('tabela-container').classList.remove('d-none');
    document.getElementById('usuario-count').textContent =
      `${todosUsuarios.length} usuário${todosUsuarios.length !== 1 ? 's' : ''}`;

    const termo = document.getElementById('busca-usuario').value.trim().toLowerCase();
    if (termo) filtrarUsuarios(termo);
  } catch (err) {
    document.getElementById('loading').classList.add('d-none');
    mostrarAlerta('alert-container', err.message);
  }
}

function filtrarUsuarios(termo) {
  const filtrados = todosUsuarios.filter(u =>
    u.nome.toLowerCase().includes(termo) ||
    u.email.toLowerCase().includes(termo)
  );
  renderTabela(filtrados);
}

function renderTabela(usuarios) {
  const tbody  = document.getElementById('tabela-body');
  const empty  = document.getElementById('empty-state');

  if (usuarios.length === 0) {
    tbody.innerHTML = '';
    empty.classList.remove('d-none');
    return;
  }

  empty.classList.add('d-none');

  tbody.innerHTML = usuarios.map(u => {
    const foto  = fotoPerfilUrl(u.foto_perfil, u.nome);
    const data  = new Date(u.data_cadastro).toLocaleDateString('pt-BR');
    const nome  = escapeHtml(u.nome);
    const email = escapeHtml(u.email);
    const curso = escapeHtml(u.curso || '—');

    let badge;
    if (u.is_admin)   badge = '<span class="badge badge-admin">Admin</span>';
    else if (u.banido) badge = '<span class="badge badge-banido">Banido</span>';
    else               badge = '<span class="badge badge-ativo-admin">Ativo</span>';

    let acoes;
    if (u.is_admin) {
      acoes = '<span class="text-muted">—</span>';
    } else if (u.banido) {
      acoes = `<button class="btn btn-sm btn-success" onclick="desbanirUsuario(${u.id}, '${escapeSingleQuote(u.nome)}')">
                 <i class="bi bi-check-circle me-1"></i>Desbanir
               </button>`;
    } else {
      acoes = `<button class="btn btn-sm btn-danger" onclick="banirUsuario(${u.id}, '${escapeSingleQuote(u.nome)}')">
                 <i class="bi bi-slash-circle me-1"></i>Banir
               </button>`;
    }

    return `
      <tr>
        <td class="px-3 text-muted small align-middle">${u.id}</td>
        <td class="align-middle">
          <img src="${foto}" width="36" height="36" class="rounded-circle" style="object-fit:cover" alt="">
        </td>
        <td class="fw-semibold align-middle">${nome}</td>
        <td class="text-muted align-middle small">${email}</td>
        <td class="align-middle small d-none d-md-table-cell">${curso}</td>
        <td class="align-middle small text-nowrap d-none d-lg-table-cell">${data}</td>
        <td class="align-middle">${badge}</td>
        <td class="align-middle text-center admin-table-actions">${acoes}</td>
      </tr>`;
  }).join('');
}

async function banirUsuario(id, nome) {
  if (!confirm(`Tem certeza que deseja banir o usuário "${nome}"?`)) return;
  try {
    await apiCall(`/admin/usuarios/${id}/banir`, { method: 'PATCH' });
    mostrarAlerta('alert-container', `Usuário "${nome}" foi banido com sucesso.`, 'success');
    await carregarUsuarios();
  } catch (err) {
    mostrarAlerta('alert-container', err.message);
  }
}

async function desbanirUsuario(id, nome) {
  if (!confirm(`Tem certeza que deseja desbanir o usuário "${nome}"?`)) return;
  try {
    await apiCall(`/admin/usuarios/${id}/desbanir`, { method: 'PATCH' });
    mostrarAlerta('alert-container', `Usuário "${nome}" foi desbanido com sucesso.`, 'success');
    await carregarUsuarios();
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
