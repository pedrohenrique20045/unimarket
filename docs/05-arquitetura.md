# Arquitetura do Sistema — UniMarket

## 1. Visão Geral

O UniMarket adota uma arquitetura cliente-servidor de duas camadas, com separação clara entre frontend (interface do usuário) e backend (lógica de negócio e dados).

## 2. Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENTE                             │
│  (Navegador Web — Chrome, Firefox, Safari, Edge)            │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Frontend (HTML/CSS/JS)                  │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐      │   │
│  │  │   Login    │  │    Home    │  │  Anúncios  │      │   │
│  │  └────────────┘  └────────────┘  └────────────┘      │   │
│  │           Bootstrap 5  +  Fetch API                  │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │  HTTP/HTTPS
                             │  (JSON + JWT no header)
                             │
┌────────────────────────────▼────────────────────────────────┐
│                         SERVIDOR                            │
│              (Node.js + Express — Porta 3000)               │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   Camada de Rotas                    │   │
│  │   /api/auth   /api/anuncios   /api/usuarios   ...    │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                Middlewares                           │   │
│  │   CORS  │  JSON Parser  │  Autenticação JWT          │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Lógica de Negócio                       │   │
│  │   Validações  │  bcryptjs  │  jsonwebtoken           │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Camada de Dados                         │   │
│  │            better-sqlite3 (driver)                   │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │  SQL
                             │
┌────────────────────────────▼────────────────────────────────┐
│                         BANCO                               │
│                                                             │
│   ┌──────────────────────────────────────────────────┐      │
│   │           SQLite (unimarket.db)                  │      │
│   │   usuarios │ anuncios │ fotos │ favoritos │ ...  │      │
│   └──────────────────────────────────────────────────┘      │
│                                                             │
│   ┌──────────────────────────────────────────────────┐      │
│   │       Sistema de Arquivos (uploads/)             │      │
│   │            Fotos dos anúncios                    │      │
│   └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## 3. Camadas e Responsabilidades

### 3.1 Frontend (Cliente)

Responsável pela apresentação e interação com o usuário. Composto por páginas HTML estáticas que consomem a API REST do backend via JavaScript (Fetch API).

**Tecnologias:**
- HTML5 para estrutura
- CSS3 e Bootstrap 5 para estilização e responsividade
- JavaScript ES6+ para lógica de interface e chamadas à API

**Principais responsabilidades:**
- Renderizar telas e formulários
- Validar dados antes de enviar ao servidor
- Armazenar token JWT no localStorage
- Redirecionar usuário baseado no estado de autenticação
- Exibir mensagens de erro e sucesso

### 3.2 Backend (Servidor)

Responsável pela lógica de negócio, autenticação, validações e persistência de dados.

**Tecnologias:**
- Node.js como ambiente de execução
- Express como framework web
- bcryptjs para hash de senhas
- jsonwebtoken para tokens de autenticação
- multer para upload de arquivos

**Organização em camadas:**

**Camada de Rotas** — Recebe as requisições HTTP e direciona para a lógica adequada. Cada conjunto de rotas relacionadas fica em um arquivo separado dentro de `routes/`.

**Camada de Middlewares** — Funções que processam a requisição antes de chegar à rota. Inclui parser de JSON, configuração de CORS e verificação de autenticação JWT.

**Camada de Lógica de Negócio** — Implementa as regras do sistema, como validações de propriedade do anúncio, hash de senhas, geração de tokens.

**Camada de Dados** — Acesso ao banco SQLite via biblioteca better-sqlite3, executando consultas SQL parametrizadas.

### 3.3 Banco de Dados

SQLite armazenado em arquivo único (`unimarket.db`) na pasta do backend. Contém cinco tabelas: usuarios, anuncios, fotos_anuncio, favoritos e categorias.

As fotos enviadas pelos usuários não são armazenadas no banco — apenas seus caminhos. Os arquivos físicos ficam na pasta `backend/uploads/`.

## 4. Fluxo de Autenticação

1. Usuário envia email e senha pela tela de login
2. Backend busca o usuário no banco pelo email
3. Backend compara a senha enviada com o hash salvo (usando bcryptjs)
4. Se válido, backend gera um token JWT contendo o ID do usuário e prazo de validade
5. Token é retornado ao frontend e armazenado no localStorage do navegador
6. Em toda requisição subsequente a rotas protegidas, o frontend envia o token no cabeçalho `Authorization: Bearer <token>`
7. Middleware de autenticação valida o token antes de permitir acesso à rota

## 5. Padrão de API REST

A API segue o padrão REST com os seguintes verbos HTTP:

| Verbo  | Uso                                            |
|--------|------------------------------------------------|
| GET    | Buscar dados                                   |
| POST   | Criar novos registros                          |
| PUT    | Atualizar registros existentes (substituição)  |
| DELETE | Remover registros                              |

### Endpoints principais

**Autenticação**
- `POST /api/auth/cadastro` — Cria nova conta
- `POST /api/auth/login` — Autentica usuário e retorna token

**Anúncios**
- `GET /api/anuncios` — Lista anúncios (com filtros opcionais)
- `GET /api/anuncios/:id` — Detalhes de um anúncio
- `POST /api/anuncios` — Cria novo anúncio (autenticado)
- `PUT /api/anuncios/:id` — Atualiza anúncio próprio
- `DELETE /api/anuncios/:id` — Remove anúncio próprio
- `PUT /api/anuncios/:id/vendido` — Marca como vendido

**Usuários**
- `GET /api/usuarios/me` — Dados do usuário logado
- `PUT /api/usuarios/me` — Atualiza próprio perfil
- `GET /api/usuarios/:id` — Perfil público de um vendedor

**Favoritos**
- `GET /api/favoritos` — Lista favoritos do usuário
- `POST /api/favoritos/:idAnuncio` — Adiciona aos favoritos
- `DELETE /api/favoritos/:idAnuncio` — Remove dos favoritos

## 6. Decisões Arquiteturais

### Por que SQLite?
Banco em arquivo único, sem necessidade de servidor de banco separado. Ideal para projetos acadêmicos e protótipos. Performance adequada para a escala esperada (uma faculdade).

### Por que JWT em vez de sessão tradicional?
Tokens JWT são stateless (o servidor não precisa guardar sessão), facilitam a escalabilidade e funcionam bem com APIs REST consumidas por SPAs ou apps mobile no futuro.

### Por que armazenar imagens em arquivos e não no banco?
Bancos de dados não são otimizados para arquivos binários. Armazenar caminhos e servir os arquivos via filesystem é mais eficiente e permite usar CDNs em produção sem mudanças de código.

### Por que HTML estático em vez de SSR ou framework?
Simplicidade e foco didático. Reduz a curva de aprendizado e o tempo de desenvolvimento, permitindo concentrar esforços nas regras de negócio. Em uma evolução futura, o frontend pode ser migrado para React ou Vue sem alterar o backend.
