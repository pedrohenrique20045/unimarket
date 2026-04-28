const express = require('express');
const multer  = require('multer');
const path    = require('path');
const { pool } = require('../database');
const autenticar = require('../middleware/autenticar');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `perfil-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) cb(null, true);
    else cb(new Error('Formato inválido. Use JPG, PNG ou WEBP'));
  }
});

// GET /api/usuarios/me — deve vir antes de /:id
router.get('/me', autenticar, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nome, email, curso, telefone, foto_perfil, data_cadastro FROM usuarios WHERE id = $1',
      [req.usuarioId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao buscar perfil:', err.message);
    return res.status(500).json({ erro: 'Erro ao buscar perfil' });
  }
});

// PUT /api/usuarios/me
router.put('/me', autenticar, upload.single('foto_perfil'), async (req, res) => {
  try {
    const atual = await pool.query('SELECT * FROM usuarios WHERE id = $1', [req.usuarioId]);
    if (atual.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    const usuario = atual.rows[0];
    const { nome, curso, telefone } = req.body;
    const foto_perfil = req.file ? req.file.filename : usuario.foto_perfil;

    await pool.query(
      'UPDATE usuarios SET nome = $1, curso = $2, telefone = $3, foto_perfil = $4 WHERE id = $5',
      [
        nome     || usuario.nome,
        curso    || usuario.curso,
        telefone || usuario.telefone,
        foto_perfil,
        req.usuarioId
      ]
    );

    return res.json({ mensagem: 'Perfil atualizado com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err.message);
    return res.status(500).json({ erro: 'Erro ao atualizar perfil' });
  }
});

// GET /api/usuarios/:id — perfil público
router.get('/:id', autenticar, async (req, res) => {
  try {
    const uResult = await pool.query(
      'SELECT id, nome, curso, foto_perfil, data_cadastro FROM usuarios WHERE id = $1',
      [req.params.id]
    );

    if (uResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    const usuario = uResult.rows[0];

    const aResult = await pool.query(`
      SELECT a.*,
             (SELECT caminho FROM fotos_anuncio WHERE anuncio_id = a.id ORDER BY ordem LIMIT 1) AS foto_principal
      FROM anuncios a
      WHERE a.usuario_id = $1 AND a.status = 'ativo'
      ORDER BY a.data_publicacao DESC
    `, [req.params.id]);

    return res.json({ ...usuario, anuncios: aResult.rows });
  } catch (err) {
    console.error('Erro ao buscar perfil público:', err.message);
    return res.status(500).json({ erro: 'Erro ao buscar perfil' });
  }
});

module.exports = router;
