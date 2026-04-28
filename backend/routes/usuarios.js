const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../database');
const autenticar = require('../middleware/autenticar');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `perfil-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Formato inválido. Use JPG, PNG ou WEBP'));
    }
  }
});

// GET /api/usuarios/me — deve vir antes de /:id
router.get('/me', autenticar, (req, res) => {
  const usuario = db.prepare(
    'SELECT id, nome, email, curso, telefone, foto_perfil, data_cadastro FROM usuarios WHERE id = ?'
  ).get(req.usuarioId);

  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado' });
  }

  return res.json(usuario);
});

// PUT /api/usuarios/me
router.put('/me', autenticar, upload.single('foto_perfil'), (req, res) => {
  const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.usuarioId);
  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado' });
  }

  const { nome, curso, telefone } = req.body;
  const foto_perfil = req.file ? req.file.filename : usuario.foto_perfil;

  db.prepare(`
    UPDATE usuarios SET nome = ?, curso = ?, telefone = ?, foto_perfil = ? WHERE id = ?
  `).run(
    nome || usuario.nome,
    curso || usuario.curso,
    telefone || usuario.telefone,
    foto_perfil,
    req.usuarioId
  );

  return res.json({ mensagem: 'Perfil atualizado com sucesso' });
});

// GET /api/usuarios/:id — perfil público
router.get('/:id', autenticar, (req, res) => {
  const usuario = db.prepare(
    'SELECT id, nome, curso, foto_perfil, data_cadastro FROM usuarios WHERE id = ?'
  ).get(req.params.id);

  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado' });
  }

  const anuncios = db.prepare(`
    SELECT a.*,
           (SELECT caminho FROM fotos_anuncio WHERE anuncio_id = a.id ORDER BY ordem LIMIT 1) AS foto_principal
    FROM anuncios a
    WHERE a.usuario_id = ? AND a.status = 'ativo'
    ORDER BY a.data_publicacao DESC
  `).all(req.params.id);

  return res.json({ ...usuario, anuncios });
});

module.exports = router;
