require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id            SERIAL PRIMARY KEY,
      nome          TEXT      NOT NULL,
      email         TEXT      NOT NULL UNIQUE,
      senha_hash    TEXT      NOT NULL,
      curso         TEXT      NOT NULL,
      telefone      TEXT      NOT NULL,
      foto_perfil   TEXT,
      data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS anuncios (
      id                 SERIAL PRIMARY KEY,
      usuario_id         INTEGER   NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      titulo             TEXT      NOT NULL,
      descricao          TEXT      NOT NULL,
      preco              NUMERIC   NOT NULL,
      categoria          TEXT      NOT NULL,
      curso_relacionado  TEXT,
      estado_conservacao TEXT      NOT NULL,
      status             TEXT      DEFAULT 'ativo',
      data_publicacao    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS fotos_anuncio (
      id         SERIAL PRIMARY KEY,
      anuncio_id INTEGER NOT NULL REFERENCES anuncios(id) ON DELETE CASCADE,
      caminho    TEXT    NOT NULL,
      ordem      INTEGER DEFAULT 0
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS favoritos (
      id         SERIAL PRIMARY KEY,
      usuario_id INTEGER   NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      anuncio_id INTEGER   NOT NULL REFERENCES anuncios(id) ON DELETE CASCADE,
      data       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (usuario_id, anuncio_id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categorias (
      id   SERIAL PRIMARY KEY,
      nome TEXT NOT NULL UNIQUE
    )
  `);

  // Seed das categorias padrão
  const categorias = ['Livros', 'Apostilas', 'Eletrônicos', 'Vestuário', 'Instrumentos', 'Outros'];
  for (const nome of categorias) {
    await pool.query(
      'INSERT INTO categorias (nome) VALUES ($1) ON CONFLICT (nome) DO NOTHING',
      [nome]
    );
  }

  console.log('Banco de dados PostgreSQL inicializado com sucesso');
}

module.exports = { pool, initDatabase };
