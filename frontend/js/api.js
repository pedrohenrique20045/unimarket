const API_BASE = '/api';

async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...(options.headers || {}) };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  } catch {
    throw new Error('Sem conexão com o servidor. Verifique se o backend está rodando.');
  }

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login.html';
    return;
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Resposta inválida do servidor');
  }

  if (!response.ok) {
    throw new Error(data.erro || `Erro ${response.status}`);
  }

  return data;
}
