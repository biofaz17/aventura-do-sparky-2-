# 🔧 Configuração de Variáveis de Ambiente - Desenvolvimento Local

## ⚠️ IMPORTANTE: Segurança

As credenciais sensíveis do Supabase **NÃO devem ser commitadas** no repositório.

- ✅ `.env.local` está no `.gitignore` (seguro)
- ✅ Em produção (Vercel), use o dashboard para adicionar secrets
- ❌ Nunca commite `.env.local` com credenciais reais

---

## 🚀 Setup Inicial

### 1. Copie o arquivo de exemplo:
```bash
cp .env.example .env.local
```

### 2. Preencha as chaves do Supabase:

Acesse: https://app.supabase.com/

1. Selecione seu projeto
2. Vá em **Settings → API**
3. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

### 3. Seu `.env.local` deve ficar assim:

```env
VITE_SUPABASE_URL=https://seu-projeto-xyz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔒 Como Funciona a Segurança

### Em Desenvolvimento (`npm run dev`):
```
Frontend → POST /api/users
         → Backend (api/users.ts)
         → Usa SUPABASE_ANON_KEY (fallback)
         → Supabase (com RLS policies)
```

A chave anônima é **pública por design** - o Supabase protege dados via **Row Level Security (RLS)**.

### Em Produção (Vercel):
```
Frontend → POST /api/users
         → Backend (api/users.ts)
         → Usa SUPABASE_SERVICE_ROLE_KEY (super admin)
         → Supabase (operações administrativas)
```

A chave de service role é **privada** - só existe no backend.

---

## 📋 RLS Policies Necessárias

Para proteger dados no Supabase, você precisa dessas políticas:

### 1. **Tabela `users`** - Permitir leitura anônima
```sql
-- Em Supabase SQL Editor
CREATE POLICY "Allow public to read users" ON users
  FOR SELECT
  USING (true);
```

### 2. **Tabela `users`** - Permitir criação anônima (admin panel)
```sql
CREATE POLICY "Allow public to create users" ON users
  FOR INSERT
  WITH CHECK (true);
```

### 3. **Tabela `users`** - Permitir update anônima (admin panel)
```sql
CREATE POLICY "Allow public to update users" ON users
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
```

### 4. **Tabela `users`** - Permitir delete anônima (admin panel)
```sql
CREATE POLICY "Allow public to delete users" ON users
  FOR DELETE
  USING (true);
```

⚠️ **Nota**: Essas policies abrem o admin panel para qualquer um. 

**Para mais segurança**, adicione um token/PIN no frontend e valide no backend antes de permitir operações.

---

## ✅ Verificar Configuração

```bash
# 1. Inicie o servidor
npm run dev

# 2. Abra o navegador
# http://localhost:5173/#/admin

# 3. PIN: 031415

# 4. Tente criar um usuário
# Abra F12 (Console) para ver logs
```

**Esperado:**
```
📝 Criando novo usuário via API...
✅ Usuário criado com sucesso!
```

---

## 🆘 Solução de Problemas

### ❌ "Supabase not configured"
1. Verifique se `.env.local` existe
2. Confirme se `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão preenchidas
3. Reinicie o servidor: `npm run dev`

### ❌ "Failed to create user"
1. Verifique se tabela `users` existe no Supabase
2. Confirme se RLS policies estão criadas
3. Abra F12 Console e copie o erro completo

### ❌ "Network error / CORS"
1. Verifique se Supabase URL está correta
2. Confirme se está usando `https://`
3. Não use localhost ou IP - use o domínio Supabase

---

## 📝 Seu `.env.local` (exemplo real)

```env
VITE_SUPABASE_URL=https://abcdef123456.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZjEyMzQ1NiIsInJvbGUiOiJhbm9uIn0.abcdef123456789
```

---

## 🔐 Protegendo o Admin Panel

Para adicionar mais segurança além do PIN:

1. O PIN (`031415`) já é verificado no frontend
2. Adicione um header de autenticação nas requisições
3. O backend valida o header antes de processar

Exemplo com Token:
```typescript
// AdminPanel.tsx
const createUserWithAuth = async (data) => {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Token': 'seu-token-secreto' // Adicione isso
    },
    body: JSON.stringify(data),
  });
};

// api/users.ts
const adminToken = req.headers['x-admin-token'];
if (adminToken !== process.env.ADMIN_API_TOKEN) {
  return res.status(403).json({ error: 'Unauthorized' });
}
```

---

**Dúvidas?** Verifique os logs do console (F12) para mensagens detalhadas. 🚀
