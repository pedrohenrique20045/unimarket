document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('token')) {
    window.location.href = '/home.html';
    return;
  }

  const form = document.getElementById('form-login');
  const alertContainer = document.getElementById('alert-container');
  const btnSubmit = document.getElementById('btn-submit');
  const btnToggle = document.getElementById('toggle-senha');
  const inputSenha = document.getElementById('senha');

  btnToggle.addEventListener('click', () => {
    const visivel = inputSenha.type === 'text';
    inputSenha.type = visivel ? 'password' : 'text';
    btnToggle.innerHTML = `<i class="bi bi-eye${visivel ? '' : '-slash'}"></i>`;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const senha = inputSenha.value;

    if (!email || !senha) {
      mostrarAlerta(alertContainer, 'Preencha email e senha');
      return;
    }

    mostrarSpinner(btnSubmit, 'Entrando...');
    alertContainer.innerHTML = '';

    try {
      await login(email, senha);
      window.location.href = '/home.html';
    } catch (err) {
      mostrarAlerta(alertContainer, err.message);
    } finally {
      ocultarSpinner(btnSubmit);
    }
  });
});
