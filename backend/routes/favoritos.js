const express = require('express');
const { pool } = require('../database');
const autenticar = require('../middleware/autenticar');

const router = express.Router();

// GET /api/favoritos
router.get('/', autenticar, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, u.nome AS vendedor_nome, u.curso AS vendedor_curso,
             (SELECT caminho FROM fotos_anuncio WHERE anuncio_id = a.id ORDER BY ordem LIMIT 1) AS foto_principal,
             f.data AS data_favoritado
      FROM favoritos f
      JOIN anuncios a ON f.anuncio_id = a.id
      JOIN usuarios u ON a.usuario_id = u.id
      WHERE f.usuario_id = $1
      ORDER BY f.data DESC
    `, [req.usuarioId]);

    return res.json(result.rows);
  } catch (err) {
    console.error('Erro ao listar favoritos:', err.message);
    return res.status(500).json({ erro: 'Erro ao buscar favoritos' });
  }
});

// POST /api/favoritos/:anuncioId
router.post('/:anuncioId', autenticar, async (req, res) => {
  try {
    const anuncio = await pool.query('SELECT id FROM anuncios WHERE id = $1', [req.params.anuncioId]);
    if (anuncio.rows.length === 0) {
      return res.status(404).json({ erro: 'Anúncio não encontrado' });
    }

    await pool.query(
      'INSERT INTO favoritos (usuario_id, anuncio_id) VALUES ($1, $2)',
      [req.usuarioId, req.params.anuncioId]
    );
    return res.status(201).json({ mensagem: 'Adicionado aos favoritos' });
  } catch (err) {
    if (err.code === '23505') { // unique_violation
      return res.status(409).json({ erro: 'Anúncio já está nos favoritos' });
    }
    console.error('Erro ao favoritar:', err.message);
    return res.status(500).json({ erro: 'Erro ao favoritar' });
  }
});

// DELETE /api/favoritos/:anuncioId
router.delete('/:anuncioId', autenticar, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM favoritos WHERE usuario_id = $1 AND anuncio_id = $2',
      [req.usuarioId, req.params.anuncioId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Favorito não encontrado' });
    }

    return res.json({ mensagem: 'Removido dos favoritos' });
  } catch (err) {
    console.error('Erro ao remover favorito:', err.message);
    return res.status(500).json({ erro: 'Erro ao remover favorito' });
  }
});

module.exports = router;
