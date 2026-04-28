# Modelagem do Banco de Dados — UniMarket

## 1. Visão Geral

O banco de dados utiliza SQLite, com cinco tabelas principais que se relacionam para suportar todas as funcionalidades da aplicação.

## 2. Tabelas

### Tabela: usuarios

Armazena os dados dos usuários cadastrados.

| Campo          | Tipo          | Restrições                  | Descrição                            |
|----------------|---------------|-----------------------------|--------------------------------------|
| id             | INTEGER       | PK, AUTOINCREMENT           | Identificador único                  |
| nome           | TEXT          | NOT NULL                    | Nome completo                        |
| email          | TEXT          | NOT NULL, UNIQUE            | Email de login                       |
| senha_hash     | TEXT          | NOT NULL                    | Hash bcrypt da senha                 |
| curso          | TEXT          | NOT NULL                    | Curso do aluno                       |
| telefone       | TEXT          | NOT NULL                    | Número de WhatsApp                   |
| foto_perfil    | TEXT          |                             | Caminho da foto de perfil            |
| data_cadastro  | DATETIME      | DEFAULT CURRENT_TIMESTAMP   | Data e hora do cadastro              |

### Tabela: anuncios

Armazena os anúncios publicados pelos usuários.

| Campo                 | Tipo     | Restrições                          | Descrição                            |
|-----------------------|----------|-------------------------------------|--------------------------------------|
| id                    | INTEGER  | PK, AUTOINCREMENT                   | Identificador único                  |
| usuario_id            | INTEGER  | NOT NULL, FK → usuarios(id)         | Autor do anúncio                     |
| titulo                | TEXT     | NOT NULL                            | Título do anúncio                    |
| descricao             | TEXT     | NOT NULL                            | Descrição detalhada                  |
| preco                 | REAL     | NOT NULL                            | Preço em reais                       |
| categoria             | TEXT     | NOT NULL                            | Categoria do produto                 |
| curso_relacionado     | TEXT     |                                     | Curso ao qual o material se relaciona|
| estado_conservacao    | TEXT     | NOT NULL                            | Novo, Seminovo ou Usado              |
| status                | TEXT     | DEFAULT 'ativo'                     | ativo ou vendido                     |
| data_publicacao       | DATETIME | DEFAULT CURRENT_TIMESTAMP           | Data e hora da publicação            |

### Tabela: fotos_anuncio

Armazena as fotos de cada anúncio (relação 1 anúncio para N fotos).

| Campo       | Tipo     | Restrições                     | Descrição                       |
|-------------|----------|--------------------------------|---------------------------------|
| id          | INTEGER  | PK, AUTOINCREMENT              | Identificador único             |
| anuncio_id  | INTEGER  | NOT NULL, FK → anuncios(id)    | Anúncio associado               |
| caminho     | TEXT     | NOT NULL                       | Caminho do arquivo de imagem    |
| ordem       | INTEGER  | DEFAULT 0                      | Ordem de exibição da foto       |

### Tabela: favoritos

Armazena os anúncios favoritados pelos usuários (relação muitos-para-muitos).

| Campo       | Tipo     | Restrições                          | Descrição                       |
|-------------|----------|-------------------------------------|---------------------------------|
| id          | INTEGER  | PK, AUTOINCREMENT                   | Identificador único             |
| usuario_id  | INTEGER  | NOT NULL, FK → usuarios(id)         | Usuário que favoritou           |
| anuncio_id  | INTEGER  | NOT NULL, FK → anuncios(id)         | Anúncio favoritado              |
| data        | DATETIME | DEFAULT CURRENT_TIMESTAMP           | Data do favoritamento           |

Restrição adicional: UNIQUE (usuario_id, anuncio_id) — um usuário não pode favoritar o mesmo anúncio duas vezes.

### Tabela: categorias

Tabela de referência com as categorias disponíveis.

| Campo   | Tipo     | Restrições         | Descrição                |
|---------|----------|--------------------|--------------------------|
| id      | INTEGER  | PK, AUTOINCREMENT  | Identificador único      |
| nome    | TEXT     | NOT NULL, UNIQUE   | Nome da categoria        |

Valores iniciais: Livros, Apostilas, Eletrônicos, Vestuário, Instrumentos, Outros.

## 3. Relacionamentos

- **usuarios → anuncios** (1:N): um usuário pode publicar vários anúncios
- **anuncios → fotos_anuncio** (1:N): um anúncio pode ter várias fotos
- **usuarios ↔ anuncios** (N:N via favoritos): um usuário pode favoritar vários anúncios e um anúncio pode ser favoritado por vários usuários

## 4. Script SQL de Criação

```sql
-- Tabela de usuários
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    curso TEXT NOT NULL,
    telefone TEXT NOT NULL,
    foto_perfil TEXT,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de anúncios
CREATE TABLE anuncios (
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

-- Tabela de fotos dos anúncios
CREATE TABLE fotos_anuncio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    anuncio_id INTEGER NOT NULL,
    caminho TEXT NOT NULL,
    ordem INTEGER DEFAULT 0,
    FOREIGN KEY (anuncio_id) REFERENCES anuncios(id) ON DELETE CASCADE
);

-- Tabela de favoritos
CREATE TABLE favoritos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    anuncio_id INTEGER NOT NULL,
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, anuncio_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (anuncio_id) REFERENCES anuncios(id) ON DELETE CASCADE
);

-- Tabela de categorias
CREATE TABLE categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE
);

-- Inserindo categorias padrão
INSERT INTO categorias (nome) VALUES
    ('Livros'),
    ('Apostilas'),
    ('Eletrônicos'),
    ('Vestuário'),
    ('Instrumentos'),
    ('Outros');
```
