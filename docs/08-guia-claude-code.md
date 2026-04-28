# Guia: Construindo o UniMarket com Claude Code

Este guia te ensina, do zero, como usar o **Claude Code** para gerar todo o código do projeto UniMarket a partir da documentação que está na pasta `docs/`.

## O que é Claude Code?

Claude Code é uma ferramenta de linha de comando que roda no seu computador e permite que você converse com o Claude para criar, editar e executar código diretamente nos seus arquivos. Diferente de copiar e colar código de um chat, o Claude Code **lê o seu projeto, escreve os arquivos pra você, executa comandos no terminal e testa o que cria**.

## Pré-requisitos

Antes de começar, instale na sua máquina:

1. **Node.js 18 ou superior** — baixe em https://nodejs.org
2. **Git** — baixe em https://git-scm.com
3. **Visual Studio Code** (recomendado) — baixe em https://code.visualstudio.com
4. **Conta Anthropic** — crie em https://claude.ai (a versão paga do Claude tem acesso ao Code)

Para confirmar que está tudo instalado, abra o terminal e rode:

```bash
node --version    # deve mostrar v18.x.x ou superior
npm --version     # deve mostrar a versão
git --version     # deve mostrar a versão
```

## Passo 1: Instalar o Claude Code

No terminal, execute:

```bash
npm install -g @anthropic-ai/claude-code
```

Aguarde a instalação terminar. Depois confirme:

```bash
claude --version
```

## Passo 2: Preparar a pasta do projeto

Crie uma pasta para o projeto, copie a documentação para dentro dela e abra no VS Code:

```bash
mkdir unimarket
cd unimarket
```

Agora copie a pasta `docs/` (que veio nos arquivos que você baixou) para dentro de `unimarket/`. A estrutura deve ficar assim:

```
unimarket/
└── docs/
    ├── 01-visao-do-produto.md
    ├── 02-requisitos.md
    ├── 03-modelagem-banco.md
    ├── 04-casos-de-uso.md
    ├── 05-arquitetura.md
    ├── 06-plano-de-testes.md
    └── 07-manual-do-usuario.md
```

Abra a pasta no VS Code:

```bash
code .
```

## Passo 3: Iniciar o Claude Code

No terminal (de preferência o terminal integrado do VS Code, abra com `Ctrl+'`), dentro da pasta `unimarket`, execute:

```bash
claude
```

Na primeira vez, ele vai pedir pra você fazer login na sua conta Anthropic. Siga as instruções na tela.

Quando aparecer o prompt do Claude Code (algo como `>`), você está dentro dele e pode começar a conversar.

## Passo 4: Cole o prompt mestre

O arquivo `prompt-mestre.md` (na pasta `docs/`) contém um prompt longo e detalhado. **Copie ele inteiro e cole no Claude Code**.

Esse prompt vai instruir o Claude Code a:

1. Ler todos os documentos da pasta `docs/`
2. Criar a estrutura completa de pastas do projeto
3. Gerar todos os arquivos de backend (servidor, rotas, autenticação, banco)
4. Gerar todos os arquivos de frontend (HTML, CSS, JavaScript)
5. Instalar as dependências
6. Te explicar como rodar

**Observação importante:** o Claude Code vai te pedir confirmação antes de executar comandos ou criar arquivos. Confirme com `y` quando ele pedir.

## Passo 5: Acompanhe o trabalho dele

À medida que o Claude Code trabalha, você vai ver:

- Comandos que ele executa no terminal
- Arquivos que ele cria ou edita
- Explicações do que ele está fazendo

Em alguns momentos ele pode parar e te perguntar algo. Responda direto no terminal.

Se algo der errado, **não entre em pânico**. Diga pra ele algo como:

> "Apareceu um erro X quando rodei o servidor. Como corrijo?"

Ele vai analisar e corrigir.

## Passo 6: Testar o projeto

Quando ele terminar, faça o teste:

```bash
cd backend
npm start
```

Abra o navegador em `http://localhost:3000` e teste:

1. Criar uma conta nova
2. Fazer login
3. Criar um anúncio com foto
4. Ver a listagem na home
5. Favoritar
6. Clicar no botão WhatsApp
7. Editar o anúncio
8. Marcar como vendido

## Passo 7: Subir para o GitHub

Depois que estiver funcionando, suba pro GitHub para mostrar no TCC:

```bash
git init
git add .
git commit -m "Versão inicial do UniMarket"
```

Crie um repositório novo em https://github.com/new e siga as instruções de "push existing repository".

## Dicas para usar bem o Claude Code

**Seja específico.** Em vez de "arruma a página", diga "na página home.html, os cards estão muito pequenos no celular, ajuste para serem maiores em telas menores que 768px".

**Mostre o erro.** Se algo quebrou, copie a mensagem de erro inteira e cole no Claude Code. Ele resolve melhor com a mensagem original.

**Faça uma coisa por vez.** Em vez de pedir 5 mudanças juntas, peça uma, teste, peça a próxima.

**Salve seu progresso com git.** A cada etapa que funciona, faça um commit. Se algo quebrar depois, você consegue voltar.

```bash
git add .
git commit -m "Descrição do que você fez"
```

**Peça pra explicar.** Você vai apresentar isso pra banca. Pergunte: "me explique como funciona a autenticação JWT nesse projeto, em palavras simples". Use as respostas pra estudar.

## Troubleshooting comum

**Erro: "EADDRINUSE: address already in use :::3000"**
A porta 3000 já está sendo usada. Feche o processo antigo ou mude a porta no `.env`.

**Erro de instalação do better-sqlite3**
Em alguns Windows, o build falha. Diga ao Claude Code: "troque better-sqlite3 por sqlite3 com a biblioteca sqlite (wrapper de promises)".

**Erro 401 ao tentar criar anúncio**
Token expirou. Faça logout e login novamente.

**Imagens não aparecem**
Verifique se a pasta `backend/uploads` existe e se o servidor está servindo essa pasta como estática.

## Cronograma sugerido

- **Dia 1-2:** Setup do Claude Code, geração inicial do projeto, primeiros testes
- **Dia 3-4:** Ajustes visuais, testes de cada funcionalidade
- **Dia 5:** Polimento (responsividade mobile, mensagens de erro, validações)
- **Dia 6:** Preparar slides e gravar vídeo demo
- **Dia 7:** Apresentação

Boa sorte com o TCC!
