require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const db = require('./database');

const authRoutes = require('./routes/auth');
const anunciosRoutes = require('./routes/anuncios');
const usuariosRoutes = require('./routes/usuarios');
const favoritosRoutes = require('./routes/favoritos');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', mensagem: 'UniMarket API rodando', timestamp: new Date().toISOString() });
});

app.get('/api/categorias', (req, res) => {
  const categorias = db.prepare('SELECT * FROM categorias ORDER BY nome').all();
  res.json(categorias);
});

app.use('/api/auth', authRoutes);
app.use('/api/anuncios', anunciosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/favoritos', favoritosRoutes);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ erro: `Erro de upload: ${err.message}` });
  }
  if (err && err.message) {
    return res.status(400).json({ erro: err.message });
  }
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`UniMarket backend rodando em http://localhost:${PORT}`);
  console.log(`Banco de dados: ${path.join(__dirname, 'unimarket.db')}`);
  console.log(`Rota de teste: GET http://localhost:${PORT}/api/status`);
});
