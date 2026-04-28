# Diagrama de Casos de Uso — UniMarket

## 1. Atores

**Visitante** — Pessoa que acessa o sistema mas ainda não está autenticada.

**Usuário** — Aluno cadastrado e autenticado no sistema. Herda todos os comportamentos do Visitante.

## 2. Casos de Uso

### Casos de uso do Visitante

- UC01 — Cadastrar-se no sistema
- UC02 — Fazer login

### Casos de uso do Usuário

- UC03 — Fazer logout
- UC04 — Visualizar lista de anúncios
- UC05 — Buscar anúncios por palavra-chave
- UC06 — Filtrar anúncios (por categoria, curso, preço)
- UC07 — Visualizar detalhes de um anúncio
- UC08 — Contatar vendedor via WhatsApp
- UC09 — Criar anúncio
- UC10 — Editar anúncio próprio
- UC11 — Excluir anúncio próprio
- UC12 — Marcar anúncio como vendido
- UC13 — Visualizar painel "Meus anúncios"
- UC14 — Editar perfil próprio
- UC15 — Visualizar perfil público de outro usuário
- UC16 — Favoritar anúncio
- UC17 — Visualizar lista de favoritos
- UC18 — Remover anúncio dos favoritos

## 3. Diagrama (representação textual)

```
                    ┌─────────────────────────────────────────┐
                    │              UniMarket                  │
                    │                                         │
  ┌──────────┐      │   UC01 — Cadastrar-se                  │
  │          │──────┼──→                                      │
  │Visitante │      │   UC02 — Fazer login                   │
  │          │──────┼──→                                      │
  └──────────┘      │                                         │
        △           │                                         │
        │ herda     │                                         │
        │           │                                         │
  ┌──────────┐      │   UC03 — Fazer logout                  │
  │          │──────┼──→                                      │
  │ Usuário  │      │   UC04 — Visualizar anúncios          │
  │          │──────┼──→                                      │
  │          │      │   UC05 — Buscar anúncios               │
  │          │──────┼──→                                      │
  │          │      │   UC06 — Filtrar anúncios              │
  │          │──────┼──→                                      │
  │          │      │   UC07 — Ver detalhe de anúncio        │
  │          │──────┼──→                                      │
  │          │      │   UC08 — Contatar vendedor (WhatsApp)  │
  │          │──────┼──→                                      │
  │          │      │   UC09 — Criar anúncio                 │
  │          │──────┼──→                                      │
  │          │      │   UC10 — Editar anúncio próprio        │
  │          │──────┼──→                                      │
  │          │      │   UC11 — Excluir anúncio próprio       │
  │          │──────┼──→                                      │
  │          │      │   UC12 — Marcar como vendido           │
  │          │──────┼──→                                      │
  │          │      │   UC13 — Painel meus anúncios          │
  │          │──────┼──→                                      │
  │          │      │   UC14 — Editar perfil                 │
  │          │──────┼──→                                      │
  │          │      │   UC15 — Ver perfil público            │
  │          │──────┼──→                                      │
  │          │      │   UC16 — Favoritar anúncio             │
  │          │──────┼──→                                      │
  │          │      │   UC17 — Ver favoritos                 │
  │          │──────┼──→                                      │
  │          │      │   UC18 — Remover dos favoritos         │
  │          │──────┼──→                                      │
  └──────────┘      │                                         │
                    └─────────────────────────────────────────┘
```

> **Observação:** Para o documento final do TCC, refaça este diagrama em formato visual usando ferramentas como draw.io, Lucidchart ou Astah, exportando como PNG e substituindo este arquivo.

## 4. Detalhamento dos Casos de Uso Principais

### UC09 — Criar Anúncio

**Ator:** Usuário
**Pré-condição:** Usuário autenticado
**Fluxo principal:**
1. Usuário acessa a opção "Criar anúncio"
2. Sistema apresenta formulário com campos: título, descrição, preço, categoria, curso relacionado, estado de conservação, fotos
3. Usuário preenche o formulário e envia
4. Sistema valida os dados
5. Sistema salva o anúncio no banco com status "ativo"
6. Sistema redireciona para a página de detalhe do anúncio criado

**Fluxo alternativo (dados inválidos):**
4a. Sistema identifica campos obrigatórios não preenchidos ou inválidos
4b. Sistema exibe mensagens de erro junto aos campos
4c. Retorna ao passo 3

**Pós-condição:** Anúncio publicado e visível na listagem geral.

### UC08 — Contatar Vendedor via WhatsApp

**Ator:** Usuário
**Pré-condição:** Usuário autenticado e visualizando um anúncio
**Fluxo principal:**
1. Usuário clica no botão "Falar com vendedor"
2. Sistema gera link do WhatsApp com o telefone do vendedor e mensagem pré-formatada referenciando o anúncio
3. Sistema abre o WhatsApp Web ou aplicativo

**Pós-condição:** Conversa iniciada entre comprador e vendedor fora da plataforma.

### UC02 — Fazer Login

**Ator:** Visitante
**Pré-condição:** Usuário previamente cadastrado
**Fluxo principal:**
1. Visitante acessa a tela de login
2. Sistema apresenta campos de email e senha
3. Visitante informa credenciais e envia
4. Sistema valida as credenciais
5. Sistema gera token JWT
6. Sistema redireciona para a página inicial autenticado

**Fluxo alternativo (credenciais inválidas):**
4a. Sistema não localiza usuário ou senha está incorreta
4b. Sistema exibe mensagem "Email ou senha incorretos"
4c. Retorna ao passo 2

**Pós-condição:** Usuário autenticado com token de sessão ativo.
