const { pool } = require('../database');

async function verificarAdmin(req, res, next) {
  try {
    const result = await pool.query('SELECT is_admin FROM usuarios WHERE id = $1', [req.usuarioId]);

    if (result.rows.length === 0 || !result.rows[0].is_admin) {
      return res.status(403).json({ erro: 'Acesso negado: apenas administradores' });
    }

    next();
  } catch (err) {
    console.error('Erro ao verificar admin:', err.message);
    return res.status(500).json({ erro: 'Erro interno ao verificar permissões' });
  }
}

module.exports = verificarAdmin;
