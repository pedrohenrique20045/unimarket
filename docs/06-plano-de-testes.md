# Plano de Testes — UniMarket

## 1. Objetivo

Garantir que todas as funcionalidades do sistema estejam operando conforme os requisitos especificados, identificando defeitos antes da entrega final.

## 2. Tipos de Teste Aplicados

### Testes Funcionais
Verificação manual de cada funcionalidade descrita nos requisitos funcionais (RF01 a RF21), executando os casos de uso e confirmando o comportamento esperado.

### Testes de Validação
Verificação dos campos de formulário com dados inválidos para garantir que o sistema rejeita corretamente entradas mal formadas.

### Testes de Segurança
Verificação básica de proteção de rotas, hash de senhas e impossibilidade de editar anúncios de outros usuários.

### Testes de Usabilidade
Verificação manual da interface em diferentes tamanhos de tela (desktop, tablet, mobile).

## 3. Casos de Teste

### CT01 — Cadastro com sucesso
**Pré-condição:** Email não cadastrado
**Passos:**
1. Acessar tela de cadastro
2. Preencher todos os campos com dados válidos
3. Clicar em "Cadastrar"

**Resultado esperado:** Usuário cadastrado, mensagem de sucesso e redirecionamento para login.

### CT02 — Cadastro com email já existente
**Pré-condição:** Email já cadastrado
**Passos:**
1. Acessar tela de cadastro
2. Usar email já existente
3. Submeter formulário

**Resultado esperado:** Mensagem "Email já cadastrado" e formulário não é enviado.

### CT03 — Cadastro com campos vazios
**Passos:**
1. Acessar tela de cadastro
2. Deixar campos obrigatórios em branco
3. Submeter

**Resultado esperado:** Validação impede envio, indicando os campos obrigatórios.

### CT04 — Login com sucesso
**Pré-condição:** Usuário cadastrado
**Passos:**
1. Acessar tela de login
2. Informar email e senha corretos

**Resultado esperado:** Login realizado, token salvo, redirecionamento para a home.

### CT05 — Login com senha incorreta
**Passos:**
1. Acessar tela de login
2. Informar senha errada

**Resultado esperado:** Mensagem "Email ou senha incorretos".

### CT06 — Acesso a página privada sem login
**Passos:**
1. Sem estar autenticado, acessar diretamente uma URL privada (ex: /home.html)

**Resultado esperado:** Redirecionamento automático para tela de login.

### CT07 — Criar anúncio com sucesso
**Pré-condição:** Usuário logado
**Passos:**
1. Acessar "Criar anúncio"
2. Preencher todos os campos
3. Adicionar pelo menos uma foto
4. Submeter

**Resultado esperado:** Anúncio criado e visível na home.

### CT08 — Criar anúncio sem foto
**Passos:** Tentar criar anúncio sem adicionar foto

**Resultado esperado:** Mensagem solicitando ao menos uma foto.

### CT09 — Editar anúncio próprio
**Pré-condição:** Usuário logado, com anúncio criado
**Passos:**
1. Acessar "Meus anúncios"
2. Editar um anúncio
3. Salvar

**Resultado esperado:** Alterações persistidas no banco.

### CT10 — Tentar editar anúncio de outro usuário
**Passos:**
1. Logado como usuário A, tentar fazer requisição PUT para anúncio do usuário B

**Resultado esperado:** Servidor retorna erro 403 (Acesso negado).

### CT11 — Excluir anúncio próprio
**Passos:**
1. Acessar "Meus anúncios"
2. Clicar em excluir
3. Confirmar

**Resultado esperado:** Anúncio removido da listagem.

### CT12 — Marcar anúncio como vendido
**Passos:**
1. Acessar "Meus anúncios"
2. Clicar em "Marcar como vendido"

**Resultado esperado:** Anúncio recebe status "vendido" e some da listagem geral.

### CT13 — Filtrar anúncios por categoria
**Passos:**
1. Na home, selecionar categoria "Livros"

**Resultado esperado:** Apenas anúncios da categoria Livros são exibidos.

### CT14 — Buscar por palavra-chave
**Passos:**
1. Digitar termo na busca (ex: "Cálculo")
2. Submeter

**Resultado esperado:** Apenas anúncios contendo o termo no título ou descrição aparecem.

### CT15 — Filtrar por faixa de preço
**Passos:**
1. Definir preço mínimo R$ 50 e máximo R$ 100
2. Aplicar filtro

**Resultado esperado:** Apenas anúncios dentro da faixa são exibidos.

### CT16 — Favoritar anúncio
**Passos:**
1. Visualizar um anúncio
2. Clicar em "Favoritar"

**Resultado esperado:** Anúncio aparece na lista de favoritos do usuário.

### CT17 — Botão WhatsApp abre conversa correta
**Passos:**
1. Visualizar anúncio de outro usuário
2. Clicar em "Falar com vendedor"

**Resultado esperado:** WhatsApp abre com número do vendedor e mensagem pré-preenchida referenciando o anúncio.

### CT18 — Logout
**Passos:**
1. Estar logado
2. Clicar em "Sair"

**Resultado esperado:** Token removido, redirecionamento para login.

### CT19 — Responsividade mobile
**Passos:**
1. Acessar o site em smartphone ou redimensionar navegador para 375px

**Resultado esperado:** Interface se adapta sem quebras visuais ou overflow horizontal.

### CT20 — Senha armazenada com hash
**Passos:**
1. Cadastrar usuário com senha "123456"
2. Inspecionar tabela usuarios no banco

**Resultado esperado:** Coluna senha_hash contém hash bcrypt, não a senha em texto.

## 4. Tabela de Rastreabilidade

| Caso de Teste | Requisitos Cobertos    |
|---------------|------------------------|
| CT01          | RF01                   |
| CT02, CT03    | RF01                   |
| CT04, CT05    | RF02                   |
| CT06          | RF04, RNF06            |
| CT07, CT08    | RF08                   |
| CT09          | RF11                   |
| CT10          | RNF07                  |
| CT11          | RF12                   |
| CT12          | RF13                   |
| CT13          | RF16                   |
| CT14          | RF15                   |
| CT15          | RF18                   |
| CT16          | RF20                   |
| CT17          | RF19                   |
| CT18          | RF03                   |
| CT19          | RNF01                  |
| CT20          | RNF04                  |

## 5. Critério de Aceitação

O projeto será considerado pronto para apresentação quando todos os 20 casos de teste passarem com sucesso.
