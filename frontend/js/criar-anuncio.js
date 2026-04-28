let fotosArquivos = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (!redirectIfNotAuthenticated()) return;
  renderNavbar('');

  await carregarCategorias();
  initUpload();

  const form = document.getElementById('form-criar');
  const alertEl = document.getElementById('alert-container');
  const btnSubmit = document.getElementById('btn-submit');

  form.addEventListener('submit', async e => {
    e.preventDefault();

    if (fotosArquivos.length === 0) {
      mostrarAlerta(alertEl, 'Adicione pelo menos uma foto antes de publicar.');
      return;
    }

    const fd = new FormData();
    fd.append('titulo',            document.getElementById('titulo').value.trim());
    fd.append('descricao',         document.getElementById('descricao').value.trim());
    fd.append('preco',             document.getElementById('preco').value);
    fd.append('categoria',         document.getElementById('categoria').value);
    fd.append('curso_relacionado', document.getElementById('curso_relacionado').value.trim());
    fd.append('estado_conservacao',document.getElementById('estado_conservacao').value);
    fotosArquivos.forEach(f => fd.append('fotos', f));

    mostrarSpinner(btnSubmit, 'Publicando...');
    alertEl.innerHTML = '';

    try {
      const res = await apiCall('/anuncios', { method: 'POST', body: fd });
      mostrarAlerta(alertEl, 'Anúncio publicado com sucesso! Redirecionando...', 'success');
      setTimeout(() => { location.href = `/anuncio.html?id=${res.id}`; }, 1400);
    } catch (err) {
      mostrarAlerta(alertEl, err.message);
    } finally {
      ocultarSpinner(btnSubmit);
    }
  });
});

async function carregarCategorias() {
  try {
    const cats = await apiCall('/categorias');
    const sel = document.getElementById('categoria');
    cats.forEach(c => {
      const o = document.createElement('option');
      o.value = c.nome; o.textContent = c.nome;
      sel.appendChild(o);
    });
  } catch { /* silencioso */ }
}

function initUpload() {
  const input   = document.getElementById('fotos-input');
  const area    = document.getElementById('upload-area');
  const preview = document.getElementById('fotos-preview');
  const counter = document.getElementById('fotos-contador');

  area.addEventListener('click', () => input.click());

  area.addEventListener('dragover', e => { e.preventDefault(); area.style.background = '#deeaff'; });
  area.addEventListener('dragleave', () => { area.style.background = ''; });
  area.addEventListener('drop', e => {
    e.preventDefault(); area.style.background = '';
    processarArquivos(e.dataTransfer.files);
  });

  input.addEventListener('change', () => { processarArquivos(input.files); input.value = ''; });

  function processarArquivos(files) {
    for (const f of files) {
      if (fotosArquivos.length >= 5) { alert('Máximo de 5 fotos permitido.'); break; }
      if (!/^image\/(jpeg|jpg|png|webp)$/.test(f.type)) { alert(`${f.name}: formato não suportado.`); continue; }
      if (f.size > 5 * 1024 * 1024) { alert(`${f.name}: arquivo muito grande (máx 5 MB).`); continue; }
      fotosArquivos.push(f);
    }
    renderPreviews();
  }

  function renderPreviews() {
    preview.innerHTML = '';
    fotosArquivos.forEach((f, i) => {
      const reader = new FileReader();
      reader.onload = ev => {
        const div = document.createElement('div');
        div.className = 'foto-preview-item';
        div.innerHTML = `
          <img src="${ev.target.result}" alt="preview">
          <button type="button" class="btn-remover" onclick="removerFoto(${i})" title="Remover">
            <i class="bi bi-x"></i>
          </button>`;
        preview.appendChild(div);
      };
      reader.readAsDataURL(f);
    });
    counter.textContent = `${fotosArquivos.length}/5 fotos`;
  }
}

function removerFoto(idx) {
  fotosArquivos.splice(idx, 1);
  // Re-renderiza chamando initUpload novamente seria destrutivo;
  // re-usa a lógica inline:
  const preview = document.getElementById('fotos-preview');
  const counter = document.getElementById('fotos-contador');
  preview.innerHTML = '';
  fotosArquivos.forEach((f, i) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const div = document.createElement('div');
      div.className = 'foto-preview-item';
      div.innerHTML = `
        <img src="${ev.target.result}" alt="preview">
        <button type="button" class="btn-remover" onclick="removerFoto(${i})" title="Remover">
          <i class="bi bi-x"></i>
        </button>`;
      preview.appendChild(div);
    };
    reader.readAsDataURL(f);
  });
  counter.textContent = `${fotosArquivos.length}/5 fotos`;
}
