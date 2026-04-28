const express = require('express');
const db = require('../database');
const autenticar = require('../middleware/autenticar');

const router = express.Router();

// GET /api/favoritos
router.get('/', autenticar, (req, res) => {
  const favoritos = db.prepare(`
    SELECT a.*, u.nome AS vendedor_nome, u.curso AS vendedor_curso,
           (SELECT caminho FROM fotos_anuncio WHERE anuncio_id = a.id ORDER BY ordem LIMIT 1) AS foto_principal,
           f.data AS data_favoritado
    FROM favoritos f
    JOIN anuncios a ON f.anuncio_id = a.id
    JOIN usuarios u ON a.usuario_id = u.id
    WHERE f.usuario_id = ?
    ORDER BY f.data DESC
  `).all(req.usuarioId);

  return res.json(favoritos);
});

// POST /api/favoritos/:anuncioId
router.post('/:anuncioId', autenticar, (req, res) => {
  const anuncio = db.prepare('SELECT id FROM anuncios WHERE id = ?').get(req.params.anuncioId);
  if (!anuncio) {
    return res.status(404).json({ erro: 'Anúncio não encontrado' });
  }

  try {
    db.prepare('INSERT INTO favoritos (usuario_id, anuncio_id) VALUES (?, ?)').run(req.usuarioId, req.params.anuncioId);
    return res.status(201).json({ mensagem: 'Adicionado aos favoritos' });
  } catch (err) {
    return res.status(409).json({ erro: 'Anúncio já está nos favoritos' });
  }
});

// DELETE /api/favoritos/:anuncioId
router.delete('/:anuncioId', autenticar, (req, res) => {
  const resultado = db.prepare(
    'DELETE FROM favoritos WHERE usuario_id = ? AND anuncio_id = ?'
  ).run(req.usuarioId, req.params.anuncioId);

  if (resultado.changes === 0) {
    return res.status(404).json({ erro: 'Favorito não encontrado' });
  }

  return res.json({ mensagem: 'Removido dos favoritos' });
});

module.exports = router;
