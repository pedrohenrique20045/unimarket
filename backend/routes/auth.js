const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { pool } = require('../database');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { nome, email, senha, curso, telefone } = req.body;

  if (!nome || !email || !senha || !curso || !telefone) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
  }
  if (senha.length < 6) {
    return res.status(400).json({ erro: 'Senha deve ter no mínimo 6 caracteres' });
  }

  try {
    const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }

    const senha_hash = bcrypt.hashSync(senha, 10);

    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash, curso, telefone) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [nome, email, senha_hash, curso, telefone]
    );

    return res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso', id: result.rows[0].id });
  } catch (err) {
    console.error('Erro no register:', err.message);
    return res.status(500).json({ erro: 'Erro ao cadastrar usuário' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
  }

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const usuario = result.rows[0];

    if (!usuario) {
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }

    const senhaValida = bcrypt.compareSync(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }

    if (usuario.banido) {
      return res.status(403).json({ erro: 'Sua conta foi suspensa. Entre em contato com o administrador.' });
    }

    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      token,
      usuario: {
        id:          usuario.id,
        nome:        usuario.nome,
        email:       usuario.email,
        curso:       usuario.curso,
        telefone:    usuario.telefone,
        foto_perfil: usuario.foto_perfil
      }
    });
  } catch (err) {
    console.error('Erro no login:', err.message);
    return res.status(500).json({ erro: 'Erro ao fazer login' });
  }
});

module.exports = router;
