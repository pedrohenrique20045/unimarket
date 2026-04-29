require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const { pool, initDatabase } = require('./database');

const authRoutes     = require('./routes/auth');
const anunciosRoutes = require('./routes/anuncios');
const usuariosRoutes = require('./routes/usuarios');
const favoritosRoutes = require('./routes/favoritos');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.redirect('/login.html');
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', mensagem: 'UniMarket API rodando', timestamp: new Date().toISOString() });
});

app.get('/api/categorias', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categorias ORDER BY nome');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar categorias:', err.message);
    res.status(500).json({ erro: 'Erro ao buscar categorias' });
  }
});

app.use('/api/auth',      authRoutes);
app.use('/api/anuncios',  anunciosRoutes);
app.use('/api/usuarios',  usuariosRoutes);
app.use('/api/favoritos', favoritosRoutes);

// Tratamento global de erros (multer, validações, etc.)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ erro: `Erro de upload: ${err.message}` });
  }
  if (err && err.message) {
    return res.status(400).json({ erro: err.message });
  }
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

async function start() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`UniMarket backend rodando em http://localhost:${PORT}`);
    console.log(`Rota de teste: GET http://localhost:${PORT}/api/status`);
  });
}

start().catch(err => {
  console.error('Falha ao iniciar o servidor:', err.message);
  process.exit(1);
});
