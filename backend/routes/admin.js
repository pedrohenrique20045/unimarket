const express = require('express');
const { pool } = require('../database');
const autenticar = require('../middleware/autenticar');
const verificarAdmin = require('../middleware/verificarAdmin');

const router = express.Router();

router.use(autenticar, verificarAdmin);

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsuarios,
      totalBanidos,
      totalAnuncios,
      totalAtivos,
      totalVendidos,
      totalFavoritos,
      usuariosRecentes,
      anunciosRecentes,
      categoriasPopulares
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM usuarios'),
      pool.query('SELECT COUNT(*) FROM usuarios WHERE banido = TRUE'),
      pool.query('SELECT COUNT(*) FROM anuncios'),
      pool.query("SELECT COUNT(*) FROM anuncios WHERE status = 'ativo'"),
      pool.query("SELECT COUNT(*) FROM anuncios WHERE status = 'vendido'"),
      pool.query('SELECT COUNT(*) FROM favoritos'),
      pool.query("SELECT COUNT(*) FROM usuarios WHERE data_cadastro >= NOW() - INTERVAL '7 days'"),
      pool.query("SELECT COUNT(*) FROM anuncios WHERE data_publicacao >= NOW() - INTERVAL '7 days'"),
      pool.query(`
        SELECT categoria, COUNT(*) AS total
        FROM anuncios
        WHERE status = 'ativo'
        GROUP BY categoria
        ORDER BY COUNT(*) DESC
        LIMIT 5
      `)
    ]);

    return res.json({
      total_usuarios:          Number(totalUsuarios.rows[0].count),
      total_usuarios_banidos:  Number(totalBanidos.rows[0].count),
      total_anuncios:          Number(totalAnuncios.rows[0].count),
      total_anuncios_ativos:   Number(totalAtivos.rows[0].count),
      total_anuncios_vendidos: Number(totalVendidos.rows[0].count),
      total_favoritos:         Number(totalFavoritos.rows[0].count),
      usuarios_ultimos_7_dias: Number(usuariosRecentes.rows[0].count),
      anuncios_ultimos_7_dias: Number(anunciosRecentes.rows[0].count),
      categorias_populares:    categoriasPopulares.rows
    });
  } catch (err) {
    console.error('Erro no dashboard admin:', err.message);
    return res.status(500).json({ erro: 'Erro ao buscar estatísticas' });
  }
});

// GET /api/admin/usuarios
router.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nome, email, curso, telefone, foto_perfil, data_cadastro, is_admin, banido
      FROM usuarios
      ORDER BY data_cadastro DESC
    `);
    return res.json(result.rows);
  } catch (err) {
    console.error('Erro ao listar usuários (admin):', err.message);
    return res.status(500).json({ erro: 'Erro ao listar usuários' });
  }
});

// PATCH /api/admin/usuarios/:id/banir
router.patch('/usuarios/:id/banir', async (req, res) => {
  const idAlvo = Number(req.params.id);

  if (idAlvo === req.usuarioId) {
    return res.status(403).json({ erro: 'Você não pode banir sua própria conta' });
  }

  try {
    const check = await pool.query('SELECT is_admin FROM usuarios WHERE id = $1', [idAlvo]);

    if (check.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    if (check.rows[0].is_admin) {
      return res.status(403).json({ erro: 'Não é possível banir um administrador' });
    }

    await pool.query('UPDATE usuarios SET banido = TRUE WHERE id = $1', [idAlvo]);
    return res.json({ mensagem: 'Usuário banido com sucesso' });
  } catch (err) {
    console.error('Erro ao banir usuário:', err.message);
    return res.status(500).json({ erro: 'Erro ao banir usuário' });
  }
});

// PATCH /api/admin/usuarios/:id/desbanir
router.patch('/usuarios/:id/desbanir', async (req, res) => {
  const idAlvo = Number(req.params.id);

  try {
    const check = await pool.query('SELECT id FROM usuarios WHERE id = $1', [idAlvo]);

    if (check.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    await pool.query('UPDATE usuarios SET banido = FALSE WHERE id = $1', [idAlvo]);
    return res.json({ mensagem: 'Usuário desbanido com sucesso' });
  } catch (err) {
    console.error('Erro ao desbanir usuário:', err.message);
    return res.status(500).json({ erro: 'Erro ao desbanir usuário' });
  }
});

// GET /api/admin/anuncios
router.get('/anuncios', async (req, res) => {
  const { status } = req.query;

  let query = `
    SELECT a.id, a.titulo, a.descricao, a.preco, a.categoria, a.status,
           a.data_publicacao, a.usuario_id AS id_vendedor,
           u.nome AS nome_vendedor, u.email AS email_vendedor
    FROM anuncios a
    JOIN usuarios u ON a.usuario_id = u.id
  `;

  const params = [];
  if (status && status !== 'todos') {
    params.push(status);
    query += ` WHERE a.status = $1`;
  }

  query += ' ORDER BY a.data_publicacao DESC';

  try {
    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (err) {
    console.error('Erro ao listar anúncios (admin):', err.message);
    return res.status(500).json({ erro: 'Erro ao listar anúncios' });
  }
});

// DELETE /api/admin/anuncios/:id
router.delete('/anuncios/:id', async (req, res) => {
  try {
    const check = await pool.query('SELECT id FROM anuncios WHERE id = $1', [req.params.id]);

    if (check.rows.length === 0) {
      return res.status(404).json({ erro: 'Anúncio não encontrado' });
    }

    await pool.query('DELETE FROM anuncios WHERE id = $1', [req.params.id]);
    return res.json({ mensagem: 'Anúncio removido com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir anúncio (admin):', err.message);
    return res.status(500).json({ erro: 'Erro ao excluir anúncio' });
  }
});

module.exports = router;
