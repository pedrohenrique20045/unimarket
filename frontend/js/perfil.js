document.addEventListener('DOMContentLoaded', async () => {
  if (!redirectIfNotAuthenticated()) return;
  renderNavbar('');

  const alertEl   = document.getElementById('alert-container');
  const fotoEl    = document.getElementById('foto-perfil');
  const inputFoto = document.getElementById('input-foto');

  // Carrega dados do usuário
  try {
    const u = await apiCall('/usuarios/me');
    document.getElementById('campo-nome').value      = u.nome;
    document.getElementById('campo-curso').value     = u.curso;
    document.getElementById('campo-telefone').value  = u.telefone;
    document.getElementById('campo-email').textContent = u.email;
    fotoEl.src = fotoPerfilUrl(u.foto_perfil, u.nome);
  } catch (err) {
    mostrarAlerta(alertEl, err.message);
    return;
  }

  // Preview ao selecionar nova foto
  inputFoto.addEventListener('change', () => {
    const f = inputFoto.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { alert('Foto maior que 5 MB.'); inputFoto.value = ''; return; }
    const r = new FileReader();
    r.onload = ev => { fotoEl.src = ev.target.result; };
    r.readAsDataURL(f);
  });

  // Salvar
  document.getElementById('form-perfil').addEventListener('submit', async e => {
    e.preventDefault();

    const btn = document.getElementById('btn-salvar');
    const fd  = new FormData();
    fd.append('nome',     document.getElementById('campo-nome').value.trim());
    fd.append('curso',    document.getElementById('campo-curso').value.trim());
    fd.append('telefone', document.getElementById('campo-telefone').value.trim().replace(/\D/g, ''));
    if (inputFoto.files[0]) fd.append('foto_perfil', inputFoto.files[0]);

    mostrarSpinner(btn, 'Salvando...');
    alertEl.innerHTML = '';

    try {
      await apiCall('/usuarios/me', { method: 'PUT', body: fd });

      // Atualiza cache local
      const atualizado = await apiCall('/usuarios/me');
      const anterior   = getUsuarioLogado();
      localStorage.setItem('usuario', JSON.stringify({ ...anterior, ...atualizado }));

      // Atualiza foto na navbar
      renderNavbar('');

      mostrarAlerta(alertEl, 'Perfil atualizado com sucesso!', 'success');
    } catch (err) {
      mostrarAlerta(alertEl, err.message);
    } finally {
      ocultarSpinner(btn);
    }
  });
});
