# 🚀 Guia de Setup - Supabase para Admin Panel

## 📋 O que foi criado

✅ Script automático de setup: `setup-supabase.js`  
✅ API backend corrigida: `api/users.ts`  
✅ Novo comando npm: `npm run setup`  
✅ Documentação de segurança: `ENV_SETUP_DEV.md`  

---

## 🎯 3 Passos Rápidos

### PASSO 1️⃣ : Obter Credenciais do Supabase

1. Acesse: **https://app.supabase.com**
2. Faça login com sua conta
3. **Selecione seu projeto** (ou crie um novo)
4. Vá em: **Settings → API** (no menu esquerdo)
5. Copie e guarde estes valores:
   ```
   📍 Project URL (URL do projeto)
   🔑 anon public key (Chave anônima pública)
   ```

---

### PASSO 2️⃣ : Executar Script de Setup

```bash
npm run setup
```

**O que vai acontecer:**
1. Script pergunta sua URL do Supabase
2. Script pergunta sua chave anônima
3. Script salva em `.env.local` (seguro, não commitado)
4. Script oferece os comandos SQL para copiar

---

### PASSO 3️⃣ : Configurar Banco de Dados

#### Opção A: Manual (Recomendado)

1. No Supabase, vá em: **SQL Editor**
2. Clique em **+ New Query**
3. **Cole o código SQL completo** que o script vai mostrar
4. Clique em **RUN**
5. Pronto! ✅

#### Opção B: Usar Arquivo SQL

Se o script salvou um arquivo `setup-supabase.sql`:
1. Supabase → SQL Editor → New Query
2. Clique em **Open** (arquivo)
3. Selecione `setup-supabase.sql`
4. Clique em **RUN**

---

## 🏃 Executar Agora

```bash
# Passo 1: Rodar o script
npm run setup

# Passo 2: Responder as perguntas
# - Deseja atualizar? → Sim (s)
# - URL do Supabase → Cole aqui
# - Chave anônima → Cole aqui
# - Ver SQL? → Sim (s)

# Passo 3: Copiar SQL do terminal
# → Cole no Supabase SQL Editor

# Passo 4: Testar
npm run dev
# Abra: http://localhost:5173/#/admin
# PIN: 031415
# Crie um usuário novo
```

---

## 🔐 Segurança

### ✅ O que é seguro:
- `.env.local` está no `.gitignore` (não commitado)
- Chave anônima é **pública por design**
- RLS Policies protegem os dados
- Em produção, usa SERVICE_ROLE_KEY (apenas backend)

### ❌ O que NÃO fazer:
- ❌ Não commite `.env.local` com credenciais
- ❌ Não use credenciais em código público
- ❌ Não compartilhe SERVICE_ROLE_KEY
- ❌ Não confie cegamente no RLS - valide no backend

---

## 📊 Estrutura de Dados Esperada

A tabela `users` terá esta estrutura:

```sql
id              TEXT PRIMARY KEY        -- ex: "user_joao"
username        TEXT UNIQUE NOT NULL    -- ex: "joao"
password        TEXT NOT NULL           -- ex: "senha123"
cpf             TEXT                    -- ex: "12345678901"
parent_email    TEXT                    -- ex: "responsavel@email.com"
created_at      TIMESTAMP               -- Auto
last_active     BIGINT                  -- Ex: 1705320600000
profile_data    JSONB                   -- JSON com subscription, progress, etc
```

---

## 🧪 Testar Após Setup

```bash
# 1. Inicie servidor
npm run dev

# 2. Abra navegador
http://localhost:5173/#/admin

# 3. PIN: 031415

# 4. Tente criar usuário:
Nome:      Test User
Senha:     senha123
Idade:     8
Email:     test@example.com
CPF:       12345678901

# 5. Clique em "Criar"

# 6. Abra F12 (Console) e procure por:
✅ Usuário criado com sucesso!

# 7. Verifique na tabela se apareceu
```

---

## 🆘 Problemas Comuns

### ❌ "Supabase not configured"
```bash
# Solução:
1. Verifique .env.local com:
   cat .env.local

2. Confirme se tem:
   VITE_SUPABASE_URL=https://...
   VITE_SUPABASE_ANON_KEY=eyJ...

3. Reinicie:
   npm run dev
```

### ❌ "Failed to create user"
```bash
# Solução:
1. Abra F12 → Console
2. Procure erro detalhado
3. Verifique se RLS policies foram criadas:
   Supabase → SQL Editor → SELECT * FROM pg_policies;
4. Se vazio, rode o SQL novamente
```

### ❌ "Connection refused"
```bash
# Solução:
1. Verifique URL: https://seu-projeto.supabase.co
2. Não use localhost ou IP
3. Confirme https:// (não http://)
4. Verifique internet
```

---

## 📝 Arquivo `.env.local` (Exemplo Real)

Depois do setup, seu arquivo ficará assim:

```env
# Variáveis de Ambiente - NUNCA COMMITAR!

# Supabase (Banco de Dados)
VITE_SUPABASE_URL=https://abcdef123456.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZjEyMzQ1NiIsInJvbGUiOiJhbm9uIn0.abcdefghijklmnopqrstuvwxyz

# Opcional: Mercado Pago (se usar pagamentos)
# VITE_MERCADO_PAGO_PUBLIC_KEY=seu-valor

# Opcional: Google Generative AI
# VITE_GOOGLE_GENAI_API_KEY=seu-valor
```

---

## 🎯 Checklist de Setup

- [ ] Criei/Selecionei projeto no Supabase
- [ ] Copiei URL do projeto (Settings → API)
- [ ] Copiei chave anônima (Settings → API)
- [ ] Executei `npm run setup`
- [ ] Respondi as perguntas do script
- [ ] Rodei SQL no Supabase (SQL Editor)
- [ ] `.env.local` foi atualizado
- [ ] Testei com `npm run dev`
- [ ] Consegui criar usuário no admin
- [ ] Usuário apareceu na tabela

---

## 💡 Dicas de Desenvolvimento

### Ver logs da API
```bash
# No navegador, abra F12 → Console
# Procure por: 📡 Carregando... ✅ Criado...

# Ou no terminal (node):
npm run dev
# Veja todos os logs do servidor
```

### Limpar dados de teste
```bash
# Supabase → SQL Editor
DELETE FROM users WHERE username LIKE 'test%';
```

### Reset completo (se der treta)
```bash
# Supabase → SQL Editor
DROP TABLE IF EXISTS users;

# Depois rode o SQL de setup novamente
```

---

## 🚀 Próximos Passos

Após confirmar que o salvamento funciona:

1. **Adicionar autenticação**: Login/Logout do usuário
2. **Proteger rotas**: Apenas admin pode acessar
3. **Validar dados**: Backend valida entrada
4. **Auditar**: Log de quem criou/editou usuários
5. **Backup**: Ativar backup automático no Supabase

---

## 📞 Referências

- **Supabase Docs**: https://supabase.com/docs
- **RLS Policies**: https://supabase.com/docs/guides/auth/row-level-security
- **SQL Editor**: https://supabase.com/docs/guides/database/quickstart

---

**Alguma dúvida?** Verifique os logs e a documentação `ENV_SETUP_DEV.md` 🚀
