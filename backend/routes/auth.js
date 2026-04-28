const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');

const router = express.Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { nome, email, senha, curso, telefone } = req.body;

  if (!nome || !email || !senha || !curso || !telefone) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
  }

  if (senha.length < 6) {
    return res.status(400).json({ erro: 'Senha deve ter no mínimo 6 caracteres' });
  }

  const usuarioExistente = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
  if (usuarioExistente) {
    return res.status(409).json({ erro: 'Email já cadastrado' });
  }

  const senha_hash = bcrypt.hashSync(senha, 10);

  const resultado = db.prepare(
    'INSERT INTO usuarios (nome, email, senha_hash, curso, telefone) VALUES (?, ?, ?, ?, ?)'
  ).run(nome, email, senha_hash, curso, telefone);

  return res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso', id: resultado.lastInsertRowid });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
  }

  const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
  if (!usuario) {
    return res.status(401).json({ erro: 'Email ou senha incorretos' });
  }

  const senhaValida = bcrypt.compareSync(senha, usuario.senha_hash);
  if (!senhaValida) {
    return res.status(401).json({ erro: 'Email ou senha incorretos' });
  }

  const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  return res.json({
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      curso: usuario.curso,
      telefone: usuario.telefone,
      foto_perfil: usuario.foto_perfil
    }
  });
});

module.exports = router;
