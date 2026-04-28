# Documento de Visão — UniMarket

## 1. Identificação do Projeto

**Nome:** UniMarket — Marketplace Universitário
**Tipo:** Trabalho de Conclusão de Curso (TCC)
**Modalidade:** Aplicação Web

## 2. Problema

Estudantes universitários acumulam, ao longo do curso, uma grande quantidade de materiais didáticos como livros, apostilas, calculadoras, jalecos, instrumentos e equipamentos específicos de suas áreas. Após o uso, esses materiais geralmente ficam guardados sem utilidade, enquanto outros estudantes — especialmente calouros — precisam adquirir os mesmos itens, frequentemente a preços altos quando comprados novos.

Atualmente, a troca e venda desses materiais entre alunos ocorre de forma desorganizada, principalmente em grupos de WhatsApp e redes sociais, onde as ofertas se perdem rapidamente no fluxo de mensagens, não há filtros por categoria ou curso, e não existe um histórico consultável.

## 3. Solução Proposta

Desenvolver uma plataforma web fechada para alunos de uma instituição de ensino, onde os usuários cadastrados possam publicar anúncios de venda de materiais usados, navegar por anúncios de outros alunos com filtros por categoria e curso, e iniciar contato direto com o vendedor via WhatsApp.

A plataforma não processa pagamentos nem entregas — atua apenas como ponto de encontro entre vendedor e comprador, que combinam a transação diretamente, presencialmente no campus.

## 4. Público-Alvo

Alunos de graduação e pós-graduação da instituição de ensino, com idade entre 17 e 40 anos, que possuem materiais didáticos para revender ou que buscam adquirir materiais usados a preços acessíveis.

## 5. Objetivos do Projeto

**Objetivo geral:** Desenvolver uma aplicação web que facilite a comercialização de materiais usados entre estudantes da mesma instituição.

**Objetivos específicos:**
- Permitir cadastro e autenticação de usuários
- Permitir que usuários publiquem, editem e removam seus próprios anúncios
- Disponibilizar busca e filtros para localização rápida de itens de interesse
- Facilitar o contato entre comprador e vendedor por meio de integração com WhatsApp
- Oferecer painel para gestão dos anúncios próprios do usuário

## 6. Escopo do MVP

### Funcionalidades incluídas
- Cadastro de usuário com email e senha
- Login e logout
- Listagem de anúncios com filtros (categoria, curso, preço)
- Busca por palavra-chave
- Criação, edição e exclusão de anúncios próprios
- Upload de fotos do produto
- Marcação de anúncio como "vendido"
- Visualização de perfil público de outros vendedores
- Botão de contato via WhatsApp com mensagem pré-preenchida
- Sistema de favoritos

### Funcionalidades fora do escopo (versões futuras)
- Sistema de pagamento online
- Chat interno entre usuários
- Sistema de avaliação de vendedores
- Notificações por email
- Aplicativo mobile nativo
- Integração com sistema acadêmico da instituição

## 7. Diferenciais

- Acesso restrito a usuários cadastrados, criando ambiente fechado e mais seguro
- Filtro por curso, permitindo encontrar materiais específicos da área
- Integração direta com WhatsApp, eliminando atrito no contato
- Interface focada exclusivamente em materiais acadêmicos

## 8. Stack Tecnológica

**Frontend:** HTML5, CSS3, JavaScript (ES6+), Bootstrap 5
**Backend:** Node.js com Express
**Banco de dados:** SQLite
**Autenticação:** JSON Web Tokens (JWT) com hash de senha via bcrypt
**Upload de arquivos:** Multer
**Controle de versão:** Git e GitHub
