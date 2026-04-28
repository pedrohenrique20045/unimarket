require('dotenv').config();
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'unimarket.db'));

db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    curso TEXT NOT NULL,
    telefone TEXT NOT NULL,
    foto_perfil TEXT,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS anuncios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    preco REAL NOT NULL,
    categoria TEXT NOT NULL,
    curso_relacionado TEXT,
    estado_conservacao TEXT NOT NULL,
    status TEXT DEFAULT 'ativo',
    data_publicacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS fotos_anuncio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    anuncio_id INTEGER NOT NULL,
    caminho TEXT NOT NULL,
    ordem INTEGER DEFAULT 0,
    FOREIGN KEY (anuncio_id) REFERENCES anuncios(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS favoritos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    anuncio_id INTEGER NOT NULL,
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, anuncio_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (anuncio_id) REFERENCES anuncios(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE
  );
`);

const inserirCategoria = db.prepare('INSERT OR IGNORE INTO categorias (nome) VALUES (?)');
const seedCategorias = db.transaction(() => {
  ['Livros', 'Apostilas', 'Eletrônicos', 'Vestuário', 'Instrumentos', 'Outros'].forEach(nome => {
    inserirCategoria.run(nome);
  });
});
seedCategorias();

module.exports = db;
