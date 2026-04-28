# Deploy do UniMarket no Render

## Pré-requisitos

- Conta no [GitHub](https://github.com) com o repositório do projeto
- Conta no [Render](https://render.com) (plano gratuito é suficiente)

---

## 1. Gerar um JWT_SECRET seguro

Execute no terminal antes de configurar o Render:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copie o resultado — você vai usá-lo como valor de `JWT_SECRET`.

---

## 2. Criar o banco de dados PostgreSQL no Render

1. No dashboard do Render, clique em **New → PostgreSQL**
2. Preencha:
   - **Name:** `unimarket-db`
   - **Region:** escolha a mais próxima (ex: `Oregon (US West)`)
   - **Plan:** Free
3. Clique em **Create Database**
4. Aguarde o banco ficar com status **Available** (~1 min)
5. Na página do banco, copie o valor de **Internal Database URL**
   - Formato: `postgresql://usuario:senha@host/nome_db`
   - Guarde esse valor — será usado como `DATABASE_URL`

---

## 3. Criar o Web Service no Render

1. No dashboard, clique em **New → Web Service**
2. Conecte ao repositório do GitHub e selecione o repo do UniMarket
3. Configure:

| Campo | Valor |
|---|---|
| **Name** | `unimarket` |
| **Region** | mesma do banco |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free |

4. Clique em **Advanced** e adicione as variáveis de ambiente:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | Internal URL copiada no passo 2 |
| `JWT_SECRET` | String gerada no passo 1 |
| `NODE_ENV` | `production` |

5. Clique em **Create Web Service**

---

## 4. Verificar o deploy

1. Aguarde o build concluir (primeira vez leva ~3 min)
2. Acesse a URL do serviço: `https://unimarket.onrender.com`
3. Teste a rota de status:
   ```
   GET https://unimarket.onrender.com/api/status
   ```
   Resposta esperada:
   ```json
   { "status": "ok", "mensagem": "UniMarket API rodando", "timestamp": "..." }
   ```
4. Acesse a interface:
   ```
   https://unimarket.onrender.com/login.html
   ```

---

## 5. Observações importantes

### Plano gratuito do Render
- O serviço **hiberna após 15 minutos sem requisições** — a primeira requisição pode demorar ~30 segundos para "acordar"
- O banco PostgreSQL gratuito expira após **90 dias** sem uso e tem limite de **1 GB**

### Upload de imagens
- O filesystem do Render é **efêmero**: arquivos enviados para `uploads/` são perdidos quando o serviço reinicia ou faz novo deploy
- Para produção real, migre os uploads para um serviço externo como **Cloudinary** ou **AWS S3**
- Para fins de demonstração/TCC, o comportamento atual é aceitável

### Variáveis sensíveis
- Nunca commite o arquivo `.env` (já está no `.gitignore`)
- Use sempre o `.env.example` como referência para outros desenvolvedores

---

## 6. Redeploy após alterações

Qualquer push para a branch `main` dispara um novo deploy automaticamente no Render.

Para forçar redeploy manualmente:
1. No dashboard do Render, acesse o serviço
2. Clique em **Manual Deploy → Deploy latest commit**
