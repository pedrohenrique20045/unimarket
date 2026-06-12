let fotosNovas = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (!redirectIfNotAuthenticated()) return;
  renderNavbar('');

  const id = new URLSearchParams(location.search).get('id');
  if (!id) { location.href = '/meus-anuncios.html'; return; }

  const alertEl    = document.getElementById('alert-container');
  const container  = document.getElementById('form-container');
  const usuarioLogado = getUsuarioLogado();

  // Carrega categorias e anúncio em paralelo
  let cats = [], anuncio;
  try {
    [cats, anuncio] = await Promise.all([
      apiCall('/categorias'),
      apiCall(`/anuncios/${id}`)
    ]);
  } catch (err) {
    mostrarAlerta(alertEl, err.message);
    return;
  }

  if (anuncio.usuario_id !== usuarioLogado?.id) {
    mostrarAlerta(alertEl, 'Você não tem permissão para editar este anúncio.');
    setTimeout(() => { location.href = '/meus-anuncios.html'; }, 2000);
    return;
  }

  // Opções de categoria
  const opsCats = cats.map(c =>
    `<option value="${c.nome}" ${c.nome === anuncio.categoria ? 'selected' : ''}>${c.nome}</option>`
  ).join('');

  container.innerHTML = `
    <form id="form-editar" novalidate>

      <div class="mb-3">
        <label for="titulo" class="form-label fw-semibold">Título <span class="text-danger">*</span></label>
        <input type="text" id="titulo" class="form-control" required maxlength="120"
               value="${anuncio.titulo}">
      </div>

      <div class="mb-3">
        <label for="descricao" class="form-label fw-semibold">Descrição <span class="text-danger">*</span></label>
        <textarea id="descricao" class="form-control" rows="4" required>${anuncio.descricao}</textarea>
      </div>

      <div class="row g-3 mb-3">
        <div class="col-sm-6">
          <label for="preco" class="form-label fw-semibold">Preço (R$) <span class="text-danger">*</span></label>
          <div class="input-group">
            <span class="input-group-text">R$</span>
            <input type="number" id="preco" class="form-control" required min="0" step="0.01"
                   value="${anuncio.preco}">
          </div>
        </div>
        <div class="col-sm-6">
          <label for="estado_conservacao" class="form-label fw-semibold">Estado <span class="text-danger">*</span></label>
          <select id="estado_conservacao" class="form-select" required>
            ${['Novo','Seminovo','Usado'].map(v =>
              `<option value="${v}" ${v === anuncio.estado_conservacao ? 'selected' : ''}>${v}</option>`
            ).join('')}
          </select>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-sm-6">
          <label for="categoria" class="form-label fw-semibold">Categoria <span class="text-danger">*</span></label>
          <select id="categoria" class="form-select" required>${opsCats}</select>
        </div>
        <div class="col-sm-6">
          <label for="curso_relacionado" class="form-label fw-semibold">Curso relacionado</label>
          <input type="text" id="curso_relacionado" class="form-control"
                 value="${anuncio.curso_relacionado || ''}">
        </div>
      </div>

      <!-- Fotos existentes -->
      <div class="mb-3">
        <label class="form-label fw-semibold">Fotos atuais</label>
        <div class="d-flex flex-wrap gap-2" id="fotos-existentes">
          ${(anuncio.fotos || []).map(f => `
            <div class="foto-preview-item">
              <img src="${fotoAnuncioUrl(f.caminho)}" alt="Foto atual">
            </div>`).join('') || '<p class="text-muted small">Nenhuma foto.</p>'}
        </div>
      </div>

      <!-- Novas fotos -->
      <div class="mb-4">
        <label class="form-label fw-semibold">Substituir fotos
          <span class="text-muted fw-normal">— envie novas fotos para substituir todas as atuais</span>
        </label>
        <div class="upload-area" id="upload-area">
          <i class="bi bi-cloud-arrow-up"></i>
          <p class="mb-1 fw-semibold">Clique para selecionar novas fotos</p>
          <small class="text-muted">JPG, PNG ou WEBP • até 5 fotos • máx 5 MB cada</small>
        </div>
        <input type="file" id="fotos-input" accept=".jpg,.jpeg,.png,.webp" multiple hidden>
        <div class="d-flex align-items-center gap-3 mt-2">
          <div class="foto-preview-container" id="fotos-preview"></div>
          <small class="text-muted" id="fotos-contador"></small>
        </div>
      </div>

      <div class="d-flex gap-3">
        <button type="submit" id="btn-submit" class="btn btn-primary fw-bold px-5">
          <i class="bi bi-check-lg me-2"></i>Salvar alterações
        </button>
        <a href="/anuncio.html?id=${id}" class="btn btn-light px-4">Cancelar</a>
      </div>
    </form>`;

  initUploadEditar();

  document.getElementById('form-editar').addEventListener('submit', async e => {
    e.preventDefault();

    const fd = new FormData();
    fd.append('titulo',             document.getElementById('titulo').value.trim());
    fd.append('descricao',          document.getElementById('descricao').value.trim());
    fd.append('preco',              document.getElementById('preco').value);
    fd.append('categoria',          document.getElementById('categoria').value);
    fd.append('curso_relacionado',  document.getElementById('curso_relacionado').value.trim());
    fd.append('estado_conservacao', document.getElementById('estado_conservacao').value);
    fotosNovas.forEach(f => fd.append('fotos', f));

    const btn = document.getElementById('btn-submit');
    mostrarSpinner(btn, 'Salvando...');
    alertEl.innerHTML = '';

    try {
      await apiCall(`/anuncios/${id}`, { method: 'PUT', body: fd });
      mostrarAlerta(alertEl, 'Anúncio atualizado com sucesso! Redirecionando...', 'success');
      setTimeout(() => { location.href = `/anuncio.html?id=${id}`; }, 1400);
    } catch (err) {
      mostrarAlerta(alertEl, err.message);
    } finally {
      ocultarSpinner(btn);
    }
  });
});

function initUploadEditar() {
  const input   = document.getElementById('fotos-input');
  const area    = document.getElementById('upload-area');
  const preview = document.getElementById('fotos-preview');
  const counter = document.getElementById('fotos-contador');

  area.addEventListener('click', () => input.click());
  input.addEventListener('change', () => {
    for (const f of input.files) {
      if (fotosNovas.length >= 5) break;
      if (!/^image\/(jpeg|jpg|png|webp)$/.test(f.type)) { alert(`${f.name}: formato não suportado.`); continue; }
      if (f.size > 5 * 1024 * 1024) { alert(`${f.name}: arquivo maior que 5 MB.`); continue; }
      fotosNovas.push(f);
    }
    renderNovasFotos();
    input.value = '';
  });

  function renderNovasFotos() {
    preview.innerHTML = '';
    fotosNovas.forEach((f, i) => {
      const r = new FileReader();
      r.onload = ev => {
        const div = document.createElement('div');
        div.className = 'foto-preview-item border-primary';
        div.innerHTML = `
          <img src="${ev.target.result}" alt="nova">
          <button type="button" class="btn-remover" onclick="removerNovaFoto(${i})"><i class="bi bi-x"></i></button>`;
        preview.appendChild(div);
      };
      r.readAsDataURL(f);
    });
    counter.textContent = fotosNovas.length
      ? `${fotosNovas.length} nova(s) foto(s) — substituirá as atuais ao salvar`
      : '';
  }
}

function removerNovaFoto(idx) {
  fotosNovas.splice(idx, 1);
  const preview = document.getElementById('fotos-preview');
  const counter = document.getElementById('fotos-contador');
  preview.innerHTML = '';
  fotosNovas.forEach((f, i) => {
    const r = new FileReader();
    r.onload = ev => {
      const div = document.createElement('div');
      div.className = 'foto-preview-item border-primary';
      div.innerHTML = `
        <img src="${ev.target.result}" alt="nova">
        <button type="button" class="btn-remover" onclick="removerNovaFoto(${i})"><i class="bi bi-x"></i></button>`;
      preview.appendChild(div);
    };
    r.readAsDataURL(f);
  });
  counter.textContent = fotosNovas.length
    ? `${fotosNovas.length} nova(s) foto(s)`
    : '';
}
