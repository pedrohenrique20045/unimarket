# Prompt Mestre para Claude Code

Este é o prompt que você deve copiar e colar no Claude Code para gerar todo o projeto UniMarket. Ele foi escrito para garantir que o Claude Code siga a documentação fielmente e produza um projeto pronto para apresentação de TCC.

---

## INSTRUÇÕES DE USO

1. Abra o terminal dentro da pasta `unimarket/` (que já contém a pasta `docs/`)
2. Execute o comando `claude` para iniciar o Claude Code
3. Copie TODO o conteúdo da seção "PROMPT" abaixo (a partir da linha que começa com "Você vai construir...")
4. Cole no Claude Code e pressione Enter
5. Acompanhe o trabalho dele, confirmando com `y` quando pedir permissão

---

## PROMPT

```
Você vai construir um projeto chamado UniMarket — um marketplace web para alunos de uma faculdade comprarem e venderem materiais usados entre si. É um projeto de TCC, então a qualidade técnica e a clareza do código importam muito.

PASSO 1 — LER TODA A DOCUMENTAÇÃO

Antes de escrever qualquer código, leia atentamente, na ordem, os seguintes arquivos da pasta docs/:

1. docs/01-visao-do-produto.md — entenda o problema, a solução e o escopo
2. docs/02-requisitos.md — todos os requisitos funcionais (RF) e não funcionais (RNF) que precisa atender
3. docs/03-modelagem-banco.md — estrutura exata do banco SQLite com todas as tabelas e relacionamentos
4. docs/04-casos-de-uso.md — fluxos detalhados das principais funcionalidades
5. docs/05-arquitetura.md — arquitetura do sistema, endpoints da API e organização de pastas
6. docs/06-plano-de-testes.md — casos de teste que o projeto precisa passar
7. docs/07-manual-do-usuario.md — fluxo de uso pela perspectiva do usuário final

Após ler tudo, faça um resumo de uma frase do que entendeu sobre o projeto antes de prosseguir. Não pule essa leitura — todo o resto depende dela.

PASSO 2 — STACK TECNOLÓGICA

Use exatamente esta stack (não substitua por outras):

Backend:
- Node.js com Express
- SQLite com better-sqlite3 (se houver problema de build, use sqlite3 + sqlite com Promises)
- bcryptjs para hash de senhas
- jsonwebtoken para autenticação JWT
- multer para upload de imagens
- cors e dotenv

Frontend:
- HTML5, CSS3, JavaScript ES6+ puro (sem React, Vue, Angular)
- Bootstrap 5 via CDN
- Fetch API para chamadas ao backend

PASSO 3 — ESTRUTURA DE PASTAS

Crie exatamente esta estrutura conforme o documento de arquitetura:

unimarket/
├── backend/
│   ├── server.js
│   ├── database.js
│   ├── package.json
│   ├── .env
│   ├── .gitignore
│   ├── routes/
│   │   ├── auth.js
│   │   ├── anuncios.js
│   │   ├── usuarios.js
│   │   └── favoritos.js
│   ├── middleware/
│   │   └── autenticar.js
│   └── uploads/
│       └── .gitkeep
└── frontend/
    ├── login.html
    ├── cadastro.html
    ├── home.html
    ├── anuncio.html
    ├── criar-anuncio.html
    ├── editar-anuncio.html
    ├── meus-anuncios.html
    ├── perfil.html
    ├── perfil-publico.html
    ├── favoritos.html
    ├── css/
    │   └── style.css
    └── js/
        ├── auth.js
        ├── api.js
        ├── home.js
        ├── anuncio.js
        ├── criar-anuncio.js
        ├── editar-anuncio.js
        ├── meus-anuncios.js
        ├── perfil.js
        ├── perfil-publico.js
        └── favoritos.js

PASSO 4 — REQUISITOS DE IMPLEMENTAÇÃO

Backend:

1. Crie o database.js que conecta ao SQLite, cria todas as tabelas conforme docs/03-modelagem-banco.md (usuarios, anuncios, fotos_anuncio, favoritos, categorias) e insere as categorias padrão.

2. Crie o middleware autenticar.js que extrai o token JWT do header Authorization, valida e injeta req.usuarioId na requisição. Se inválido, retorne 401.

3. Implemente todas as rotas listadas em docs/05-arquitetura.md, seção 6 (Endpoints da API). Toda rota privada usa o middleware de autenticação. Rotas de edição/exclusão devem verificar se o usuário autenticado é o dono do recurso (RNF07).

4. Use prepared statements em todas as queries SQL para prevenir SQL injection.

5. Hash de senha com bcryptjs (10 rounds). Token JWT com expiração de 7 dias.

6. Upload com multer: máximo 5MB por foto, máximo 5 fotos por anúncio, formatos aceitos jpg/jpeg/png/webp.

7. Sirva a pasta uploads/ como estática para que as imagens sejam acessíveis via URL.

8. Sirva a pasta frontend/ como estática para que os HTMLs sejam acessíveis pelo navegador.

9. Trate erros adequadamente, retornando JSON com mensagem clara em português brasileiro.

Frontend:

1. Toda página privada deve, ao carregar, verificar se existe token no localStorage. Se não existir, redirecionar para login.html.

2. Crie um arquivo js/api.js com um wrapper para fetch que automaticamente adiciona o token no header Authorization e trata erros 401 (token expirado) redirecionando para login.

3. Crie um arquivo js/auth.js com funções utilitárias: login, logout, getUsuarioLogado, redirectIfNotAuthenticated.

4. As páginas devem ser totalmente responsivas (RNF01) usando classes do Bootstrap 5.

5. Toda interface deve estar em português brasileiro (RNF02).

6. Forneça feedback visual para todas as ações: loading durante requisições, mensagens de sucesso, mensagens de erro (RNF03).

7. Na home.html, implemente a listagem de anúncios em formato de cards (foto, título, preço, categoria), com filtros laterais por categoria, curso e faixa de preço, mais um campo de busca por palavra-chave.

8. Na anuncio.html (detalhe), exiba carrossel de fotos, descrição completa, dados do vendedor com link pro perfil público, botão "Falar no WhatsApp" que abre wa.me com mensagem pré-formatada referenciando o anúncio, e botão de favoritar.

9. Em criar-anuncio.html, formulário com upload múltiplo de fotos, preview antes de enviar, validações de campos obrigatórios.

10. Em meus-anuncios.html, separar visualmente anúncios ativos e vendidos, com botões de editar, excluir e marcar como vendido em cada card.

PASSO 5 — DESIGN VISUAL

Use uma paleta de cores moderna e amigável. Sugestão: primária azul (Bootstrap padrão #0d6efd ou similar), com bom contraste e legibilidade. Cards com sombra sutil. Botões com hover destacado. Fonte legível (sans-serif padrão do Bootstrap está OK).

A interface deve transmitir profissionalismo e confiabilidade, já que envolve transações entre alunos.

PASSO 6 — DADOS DE EXEMPLO

Crie um script seed.js no backend que popula o banco com:
- 5 usuários de teste (com senhas conhecidas que você documente)
- 15 anúncios variados em diferentes categorias e cursos
- Algumas imagens placeholder (pode usar https://picsum.photos)

Documente no README como rodar o seed.

PASSO 7 — DOCUMENTAÇÃO ADICIONAL

Crie um README.md na raiz do projeto contendo:
- Descrição do projeto
- Tecnologias usadas
- Pré-requisitos
- Como instalar e rodar (passo a passo)
- Como rodar o seed
- Lista de credenciais de teste
- Estrutura de pastas
- Link para a documentação completa em docs/
- Capturas de tela (deixe placeholders que o usuário preencherá depois)

PASSO 8 — TESTE FINAL

Após criar tudo, execute:
1. npm install no diretório backend
2. node seed.js para popular o banco
3. npm start para iniciar o servidor

Confirme que o servidor sobe sem erros e que o endpoint http://localhost:3000/api/status responde com JSON. Liste os arquivos criados e me dê instruções claras de como abrir o frontend no navegador.

REGRAS GERAIS

- Comente o código em pontos importantes (não exagere, mas explique decisões não-óbvias)
- Use nomes de variáveis e funções em português ou inglês, mas seja consistente
- Não invente funcionalidades que não estão na documentação
- Não simplifique cortando funcionalidades — entregue tudo que está nos requisitos
- Se tiver dúvida sobre algum detalhe, me pergunte ANTES de implementar errado
- Faça commits git intermediários a cada etapa principal concluída

Pode começar pelo PASSO 1.
```

---

## DICAS APÓS COLAR O PROMPT

**Se o Claude Code parecer travar ou ficar lento**, pode ser que esteja lendo arquivos longos. Aguarde.

**Se ele pedir permissão para rodar comandos ou escrever arquivos**, responda `y` (yes) para autorizar.

**Se ele perguntar algo durante a execução**, responda baseado nas suas preferências. Se tiver dúvida, diga "use o padrão recomendado".

**Quando ele terminar**, peça para ele:

> "Crie um arquivo CHECKLIST.md listando, para cada requisito funcional do docs/02-requisitos.md, se foi implementado e em qual arquivo está a implementação."

Isso vai te dar um documento perfeito para mostrar à banca que cada requisito foi atendido.

## DEPOIS QUE O PROJETO ESTIVER PRONTO

Use estes prompts adicionais conforme a necessidade:

**Para melhorar visual:**
> "A página home.html está com visual genérico. Refaça o CSS para ter uma identidade visual mais moderna e profissional, mantendo a usabilidade."

**Para corrigir bugs:**
> "Quando faço X, acontece Y, mas era esperado Z. Aqui está a mensagem de erro: [cole a mensagem]. Investigue e corrija."

**Para adicionar testes:**
> "Crie testes automatizados das principais rotas do backend usando Jest e supertest. Documente como rodar os testes."

**Para preparar deploy:**
> "Quero hospedar o projeto na Render para apresentar no TCC. Adapte o código para funcionar em produção e me dê o passo a passo de deploy."
