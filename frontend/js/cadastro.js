document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('token')) {
    window.location.href = '/home.html';
    return;
  }

  const form = document.getElementById('form-cadastro');
  const alertContainer = document.getElementById('alert-container');
  const btnSubmit = document.getElementById('btn-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const confirmaSenha = document.getElementById('confirma-senha').value;
    const curso = document.getElementById('curso').value.trim();
    const telefone = document.getElementById('telefone').value.trim().replace(/\D/g, '');

    if (!nome || !email || !senha || !confirmaSenha || !curso || !telefone) {
      mostrarAlerta(alertContainer, 'Preencha todos os campos obrigatórios');
      return;
    }

    if (senha.length < 6) {
      mostrarAlerta(alertContainer, 'A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (senha !== confirmaSenha) {
      mostrarAlerta(alertContainer, 'As senhas não conferem');
      return;
    }

    mostrarSpinner(btnSubmit, 'Cadastrando...');
    alertContainer.innerHTML = '';

    try {
      await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ nome, email, senha, curso, telefone })
      });

      mostrarAlerta(alertContainer, 'Conta criada com sucesso! Redirecionando para o login...', 'success');
      setTimeout(() => { window.location.href = '/login.html'; }, 2000);
    } catch (err) {
      mostrarAlerta(alertContainer, err.message);
    } finally {
      ocultarSpinner(btnSubmit);
    }
  });
});
