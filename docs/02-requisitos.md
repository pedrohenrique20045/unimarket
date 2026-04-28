# Requisitos do Sistema — UniMarket

## 1. Requisitos Funcionais (RF)

### Autenticação e Cadastro

**RF01 — Cadastro de usuário**
O sistema deve permitir que novos usuários se cadastrem informando nome completo, email, senha, curso e telefone (WhatsApp).

**RF02 — Login**
O sistema deve permitir que usuários cadastrados façam login informando email e senha.

**RF03 — Logout**
O sistema deve permitir que o usuário encerre sua sessão.

**RF04 — Acesso restrito**
O sistema deve exigir autenticação para acesso a qualquer funcionalidade, exceto as telas de login e cadastro.

### Perfil do Usuário

**RF05 — Visualizar perfil próprio**
O sistema deve permitir que o usuário visualize seus próprios dados cadastrais.

**RF06 — Editar perfil**
O sistema deve permitir que o usuário edite nome, curso, telefone e foto de perfil.

**RF07 — Visualizar perfil público**
O sistema deve permitir que qualquer usuário logado visualize o perfil público de outros vendedores, exibindo nome, curso, foto e anúncios ativos.

### Anúncios

**RF08 — Criar anúncio**
O sistema deve permitir que o usuário crie um anúncio informando título, descrição, preço, categoria, curso relacionado, estado de conservação e até cinco fotos.

**RF09 — Listar anúncios**
O sistema deve exibir todos os anúncios ativos na página inicial, ordenados por data de publicação (mais recentes primeiro).

**RF10 — Visualizar detalhe do anúncio**
O sistema deve permitir a visualização completa de um anúncio, exibindo todas as fotos, descrição, dados do vendedor e botão de contato.

**RF11 — Editar anúncio próprio**
O sistema deve permitir que o usuário edite os anúncios criados por ele.

**RF12 — Excluir anúncio próprio**
O sistema deve permitir que o usuário exclua os anúncios criados por ele.

**RF13 — Marcar anúncio como vendido**
O sistema deve permitir que o usuário marque seus anúncios como vendidos, alterando seu status sem excluí-los.

**RF14 — Painel "Meus anúncios"**
O sistema deve oferecer ao usuário um painel com todos os seus anúncios, separados por status (ativo, vendido).

### Busca e Filtros

**RF15 — Buscar por palavra-chave**
O sistema deve permitir busca por palavras-chave que serão pesquisadas no título e descrição dos anúncios.

**RF16 — Filtrar por categoria**
O sistema deve permitir filtrar anúncios por categoria (Livros, Apostilas, Eletrônicos, Vestuário, Instrumentos, Outros).

**RF17 — Filtrar por curso**
O sistema deve permitir filtrar anúncios por curso relacionado.

**RF18 — Filtrar por faixa de preço**
O sistema deve permitir filtrar anúncios por preço mínimo e máximo.

### Contato e Favoritos

**RF19 — Contato via WhatsApp**
O sistema deve oferecer um botão que redireciona para o WhatsApp do vendedor com mensagem pré-preenchida contendo referência ao anúncio.

**RF20 — Favoritar anúncio**
O sistema deve permitir que o usuário favorite anúncios de interesse.

**RF21 — Listar favoritos**
O sistema deve oferecer uma página com todos os anúncios favoritados pelo usuário.

## 2. Requisitos Não Funcionais (RNF)

### Usabilidade

**RNF01 — Interface responsiva**
A aplicação deve ser totalmente funcional em dispositivos móveis, tablets e desktops.

**RNF02 — Idioma**
A interface deve ser apresentada em português brasileiro.

**RNF03 — Feedback de ações**
O sistema deve fornecer feedback visual claro para todas as ações do usuário (sucesso, erro, carregamento).

### Segurança

**RNF04 — Hash de senha**
As senhas devem ser armazenadas com hash criptográfico (bcrypt), nunca em texto puro.

**RNF05 — Autenticação por token**
A autenticação de sessão deve utilizar JSON Web Tokens (JWT) com tempo de expiração definido.

**RNF06 — Proteção de rotas**
Rotas privadas devem validar a autenticação do usuário antes de processar requisições.

**RNF07 — Validação de propriedade**
Operações de edição e exclusão de anúncios devem verificar se o usuário autenticado é o proprietário do anúncio.

### Desempenho

**RNF08 — Tempo de resposta**
Páginas devem carregar em até 3 segundos em conexão de internet padrão.

**RNF09 — Limite de upload**
O tamanho máximo de cada foto enviada deve ser de 5 MB.

### Compatibilidade

**RNF10 — Navegadores suportados**
A aplicação deve funcionar nas versões atuais de Chrome, Firefox, Safari e Edge.

### Manutenibilidade

**RNF11 — Organização do código**
O código deve seguir separação clara entre frontend e backend, com rotas, middlewares e configurações em arquivos distintos.

**RNF12 — Documentação**
O projeto deve possuir README explicando instalação, execução e principais funcionalidades.
