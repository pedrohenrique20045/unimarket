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
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
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

// GET /api/anuncios — lista com filtros opcionais
router.get('/', autenticar, async (req, res) => {
  const { categoria, curso, precoMin, precoMax, q } = req.query;

  // Helper: adiciona valor ao array e retorna o placeholder $N correspondente
  const params = [];
  const p = val => { params.push(val); return `$${params.length}`; };

  let query = `
    SELECT a.*, u.nome AS vendedor_nome, u.curso AS vendedor_curso, u.foto_perfil AS vendedor_foto,
           (SELECT caminho FROM fotos_anuncio WHERE anuncio_id = a.id ORDER BY ordem LIMIT 1) AS foto_principal
    FROM anuncios a
    JOIN usuarios u ON a.usuario_id = u.id
    WHERE a.status = 'ativo'
  `;

  if (categoria) query += ` AND a.categoria = ${p(categoria)}`;
  if (curso)     query += ` AND a.curso_relacionado = ${p(curso)}`;
  if (precoMin)  query += ` AND a.preco >= ${p(Number(precoMin))}`;
  if (precoMax)  query += ` AND a.preco <= ${p(Number(precoMax))}`;
  if (q)         query += ` AND (a.titulo ILIKE ${p(`%${q}%`)} OR a.descricao ILIKE ${p(`%${q}%`)})`;

  query += ' ORDER BY a.data_publicacao DESC';

  try {
    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (err) {
    console.error('Erro ao listar anúncios:', err.message);
    return res.status(500).json({ erro: 'Erro ao buscar anúncios' });
  }
});

// GET /api/anuncios/meus — deve vir ANTES de /:id
router.get('/meus', autenticar, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*,
             (SELECT caminho FROM fotos_anuncio WHERE anuncio_id = a.id ORDER BY ordem LIMIT 1) AS foto_principal
      FROM anuncios a
      WHERE a.usuario_id = $1
      ORDER BY a.data_publicacao DESC
    `, [req.usuarioId]);

    return res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar meus anúncios:', err.message);
    return res.status(500).json({ erro: 'Erro ao buscar seus anúncios' });
  }
});

// GET /api/anuncios/:id — detalhe completo
router.get('/:id', autenticar, async (req, res) => {
  try {
    const aResult = await pool.query(`
      SELECT a.*, u.nome AS vendedor_nome, u.curso AS vendedor_curso,
             u.foto_perfil AS vendedor_foto, u.telefone AS vendedor_telefone
      FROM anuncios a
      JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.id = $1
    `, [req.params.id]);

    if (aResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Anúncio não encontrado' });
    }

    const anuncio = aResult.rows[0];

    const fResult = await pool.query(
      'SELECT * FROM fotos_anuncio WHERE anuncio_id = $1 ORDER BY ordem',
      [anuncio.id]
    );

    return res.json({ ...anuncio, fotos: fResult.rows });
  } catch (err) {
    console.error('Erro ao buscar anúncio:', err.message);
    return res.status(500).json({ erro: 'Erro ao buscar anúncio' });
  }
});

// POST /api/anuncios — criar anúncio
router.post('/', autenticar, upload.array('fotos', 5), async (req, res) => {
  const { titulo, descricao, preco, categoria, curso_relacionado, estado_conservacao } = req.body;

  if (!titulo || !descricao || !preco || !categoria || !estado_conservacao) {
    return res.status(400).json({ erro: 'Campos obrigatórios não preenchidos' });
  }
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ erro: 'Pelo menos uma foto é obrigatória' });
  }

  try {
    const aResult = await pool.query(`
      INSERT INTO anuncios (usuario_id, titulo, descricao, preco, categoria, curso_relacionado, estado_conservacao)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, [
      req.usuarioId,
      titulo,
      descricao,
      Number(preco),
      categoria,
      curso_relacionado || null,
      estado_conservacao
    ]);

    const anuncioId = aResult.rows[0].id;

    for (let i = 0; i < req.files.length; i++) {
      await pool.query(
        'INSERT INTO fotos_anuncio (anuncio_id, caminho, ordem) VALUES ($1, $2, $3)',
        [anuncioId, req.files[i].filename, i]
      );
    }

    return res.status(201).json({ mensagem: 'Anúncio criado com sucesso', id: anuncioId });
  } catch (err) {
    console.error('Erro ao criar anúncio:', err.message);
    return res.status(500).json({ erro: 'Erro ao criar anúncio' });
  }
});

// PUT /api/anuncios/:id/vendido — marcar como vendido (antes de /:id genérico)
router.put('/:id/vendido', autenticar, async (req, res) => {
  try {
    const check = await pool.query('SELECT usuario_id FROM anuncios WHERE id = $1', [req.params.id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ erro: 'Anúncio não encontrado' });
    }
    if (check.rows[0].usuario_id !== req.usuarioId) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    await pool.query("UPDATE anuncios SET status = 'vendido' WHERE id = $1", [req.params.id]);

    return res.json({ mensagem: 'Anúncio marcado como vendido' });
  } catch (err) {
    console.error('Erro ao marcar como vendido:', err.message);
    return res.status(500).json({ erro: 'Erro ao atualizar status' });
  }
});

// PUT /api/anuncios/:id — editar anúncio próprio
router.put('/:id', autenticar, upload.array('fotos', 5), async (req, res) => {
  try {
    const check = await pool.query('SELECT * FROM anuncios WHERE id = $1', [req.params.id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ erro: 'Anúncio não encontrado' });
    }

    const anuncio = check.rows[0];
    if (anuncio.usuario_id !== req.usuarioId) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    const { titulo, descricao, preco, categoria, curso_relacionado, estado_conservacao } = req.body;

    await pool.query(`
      UPDATE anuncios
      SET titulo = $1, descricao = $2, preco = $3, categoria = $4,
          curso_relacionado = $5, estado_conservacao = $6
      WHERE id = $7
    `, [
      titulo              || anuncio.titulo,
      descricao           || anuncio.descricao,
      preco !== undefined  ? Number(preco) : anuncio.preco,
      categoria           || anuncio.categoria,
      curso_relacionado !== undefined ? (curso_relacionado || null) : anuncio.curso_relacionado,
      estado_conservacao  || anuncio.estado_conservacao,
      anuncio.id
    ]);

    if (req.files && req.files.length > 0) {
      await pool.query('DELETE FROM fotos_anuncio WHERE anuncio_id = $1', [anuncio.id]);
      for (let i = 0; i < req.files.length; i++) {
        await pool.query(
          'INSERT INTO fotos_anuncio (anuncio_id, caminho, ordem) VALUES ($1, $2, $3)',
          [anuncio.id, req.files[i].filename, i]
        );
      }
    }

    return res.json({ mensagem: 'Anúncio atualizado com sucesso' });
  } catch (err) {
    console.error('Erro ao editar anúncio:', err.message);
    return res.status(500).json({ erro: 'Erro ao atualizar anúncio' });
  }
});

// DELETE /api/anuncios/:id — excluir anúncio próprio
router.delete('/:id', autenticar, async (req, res) => {
  try {
    const check = await pool.query('SELECT usuario_id FROM anuncios WHERE id = $1', [req.params.id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ erro: 'Anúncio não encontrado' });
    }
    if (check.rows[0].usuario_id !== req.usuarioId) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    await pool.query('DELETE FROM anuncios WHERE id = $1', [req.params.id]);

    return res.json({ mensagem: 'Anúncio excluído com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir anúncio:', err.message);
    return res.status(500).json({ erro: 'Erro ao excluir anúncio' });
  }
});

module.exports = router;
