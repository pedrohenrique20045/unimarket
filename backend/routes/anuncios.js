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
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
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

// GET /api/anuncios — lista com filtros opcionais
router.get('/', autenticar, (req, res) => {
  const { categoria, curso, precoMin, precoMax, q } = req.query;

  let query = `
    SELECT a.*, u.nome AS vendedor_nome, u.curso AS vendedor_curso, u.foto_perfil AS vendedor_foto,
           (SELECT caminho FROM fotos_anuncio WHERE anuncio_id = a.id ORDER BY ordem LIMIT 1) AS foto_principal
    FROM anuncios a
    JOIN usuarios u ON a.usuario_id = u.id
    WHERE a.status = 'ativo'
  `;
  const params = [];

  if (categoria) {
    query += ' AND a.categoria = ?';
    params.push(categoria);
  }
  if (curso) {
    query += ' AND a.curso_relacionado = ?';
    params.push(curso);
  }
  if (precoMin) {
    query += ' AND a.preco >= ?';
    params.push(Number(precoMin));
  }
  if (precoMax) {
    query += ' AND a.preco <= ?';
    params.push(Number(precoMax));
  }
  if (q) {
    query += ' AND (a.titulo LIKE ? OR a.descricao LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }

  query += ' ORDER BY a.data_publicacao DESC';

  const anuncios = db.prepare(query).all(...params);
  return res.json(anuncios);
});

// GET /api/anuncios/meus — anúncios do usuário autenticado (ativos + vendidos)
// Deve vir ANTES de /:id para não conflitar
router.get('/meus', autenticar, (req, res) => {
  const anuncios = db.prepare(`
    SELECT a.*,
           (SELECT caminho FROM fotos_anuncio WHERE anuncio_id = a.id ORDER BY ordem LIMIT 1) AS foto_principal
    FROM anuncios a
    WHERE a.usuario_id = ?
    ORDER BY a.data_publicacao DESC
  `).all(req.usuarioId);

  return res.json(anuncios);
});

// GET /api/anuncios/:id — detalhe completo
router.get('/:id', autenticar, (req, res) => {
  const anuncio = db.prepare(`
    SELECT a.*, u.nome AS vendedor_nome, u.curso AS vendedor_curso,
           u.foto_perfil AS vendedor_foto, u.telefone AS vendedor_telefone
    FROM anuncios a
    JOIN usuarios u ON a.usuario_id = u.id
    WHERE a.id = ?
  `).get(req.params.id);

  if (!anuncio) {
    return res.status(404).json({ erro: 'Anúncio não encontrado' });
  }

  const fotos = db.prepare(
    'SELECT * FROM fotos_anuncio WHERE anuncio_id = ? ORDER BY ordem'
  ).all(anuncio.id);

  return res.json({ ...anuncio, fotos });
});

// POST /api/anuncios — criar anúncio
router.post('/', autenticar, upload.array('fotos', 5), (req, res) => {
  const { titulo, descricao, preco, categoria, curso_relacionado, estado_conservacao } = req.body;

  if (!titulo || !descricao || !preco || !categoria || !estado_conservacao) {
    return res.status(400).json({ erro: 'Campos obrigatórios não preenchidos' });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ erro: 'Pelo menos uma foto é obrigatória' });
  }

  const resultado = db.prepare(`
    INSERT INTO anuncios (usuario_id, titulo, descricao, preco, categoria, curso_relacionado, estado_conservacao)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.usuarioId,
    titulo,
    descricao,
    Number(preco),
    categoria,
    curso_relacionado || null,
    estado_conservacao
  );

  const anuncioId = resultado.lastInsertRowid;
  const inserirFoto = db.prepare('INSERT INTO fotos_anuncio (anuncio_id, caminho, ordem) VALUES (?, ?, ?)');
  req.files.forEach((file, index) => {
    inserirFoto.run(anuncioId, file.filename, index);
  });

  return res.status(201).json({ mensagem: 'Anúncio criado com sucesso', id: anuncioId });
});

// PUT /api/anuncios/:id — editar anúncio próprio
router.put('/:id', autenticar, upload.array('fotos', 5), (req, res) => {
  const anuncio = db.prepare('SELECT * FROM anuncios WHERE id = ?').get(req.params.id);

  if (!anuncio) {
    return res.status(404).json({ erro: 'Anúncio não encontrado' });
  }

  if (anuncio.usuario_id !== req.usuarioId) {
    return res.status(403).json({ erro: 'Acesso negado' });
  }

  const { titulo, descricao, preco, categoria, curso_relacionado, estado_conservacao } = req.body;

  db.prepare(`
    UPDATE anuncios
    SET titulo = ?, descricao = ?, preco = ?, categoria = ?, curso_relacionado = ?, estado_conservacao = ?
    WHERE id = ?
  `).run(
    titulo || anuncio.titulo,
    descricao || anuncio.descricao,
    preco !== undefined ? Number(preco) : anuncio.preco,
    categoria || anuncio.categoria,
    curso_relacionado !== undefined ? (curso_relacionado || null) : anuncio.curso_relacionado,
    estado_conservacao || anuncio.estado_conservacao,
    anuncio.id
  );

  if (req.files && req.files.length > 0) {
    db.prepare('DELETE FROM fotos_anuncio WHERE anuncio_id = ?').run(anuncio.id);
    const inserirFoto = db.prepare('INSERT INTO fotos_anuncio (anuncio_id, caminho, ordem) VALUES (?, ?, ?)');
    req.files.forEach((file, index) => {
      inserirFoto.run(anuncio.id, file.filename, index);
    });
  }

  return res.json({ mensagem: 'Anúncio atualizado com sucesso' });
});

// PUT /api/anuncios/:id/vendido — marcar como vendido
router.put('/:id/vendido', autenticar, (req, res) => {
  const anuncio = db.prepare('SELECT * FROM anuncios WHERE id = ?').get(req.params.id);

  if (!anuncio) {
    return res.status(404).json({ erro: 'Anúncio não encontrado' });
  }

  if (anuncio.usuario_id !== req.usuarioId) {
    return res.status(403).json({ erro: 'Acesso negado' });
  }

  db.prepare("UPDATE anuncios SET status = 'vendido' WHERE id = ?").run(anuncio.id);

  return res.json({ mensagem: 'Anúncio marcado como vendido' });
});

// DELETE /api/anuncios/:id — excluir anúncio próprio
router.delete('/:id', autenticar, (req, res) => {
  const anuncio = db.prepare('SELECT * FROM anuncios WHERE id = ?').get(req.params.id);

  if (!anuncio) {
    return res.status(404).json({ erro: 'Anúncio não encontrado' });
  }

  if (anuncio.usuario_id !== req.usuarioId) {
    return res.status(403).json({ erro: 'Acesso negado' });
  }

  db.prepare('DELETE FROM anuncios WHERE id = ?').run(anuncio.id);

  return res.json({ mensagem: 'Anúncio excluído com sucesso' });
});

module.exports = router;
