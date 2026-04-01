# 🚨 Solução: "TypeError: failed to fetch" ao Criar Usuário

## O Problema

Quando você clica em "Criar Acesso PRO Vitalício", recebe:
```
TypeError: failed to fetch
```

Isso significa que a requisição HTTP foi bloqueada ou falhou. 

---

## 🔧 Como Diagnosticar

### **PASSO 1: Executar Teste de Diagnóstico**

1. Vá ao Admin Panel: `http://localhost:3000/#/admin`
2. PIN: `031415`
3. **Clique na aba "Infra & Dev"** (terceira aba)
4. **Clique no botão "🔍 Teste Diagnóstico"**
5. Aguarde o resultado

---

### **PASSO 2: Interpretar o Resultado**

#### ✅ Se Aparecer: "✅ Conexão OK!"
- Supabase está conectado e funciona
- **Problema:** Está no código de criação de usuário
- **Solução:** Vá para a seção **"RLS Policies"** abaixo

#### ❌ Se Aparecer: "❌ VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não configuradas"
- Arquivo `.env.local` não tem as chaves
- **Solução:** 
  ```bash
  # Abra .env.local e confirme se tem:
  VITE_SUPABASE_URL=https://seu-projeto.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJ...
  ```
- Se estão vazias, copie de: https://app.supabase.com → Settings → API

#### ❌ Se Aparecer: "❌ Erro de fetch: Verifique URL Supabase"
- **Causa:** URL Supabase está errada ou inválida
- **Solução:**
  1. Vá para https://app.supabase.com
  2. Selecione seu projeto
  3. Vá para **Settings → API**
  4. Copie **Project URL** para `VITE_SUPABASE_URL`
  5. Reinicie: `npm run dev`

#### ❌ Se Aparecer: "❌ Erro 401: Chave Supabase inválida"
- **Causa:** `VITE_SUPABASE_ANON_KEY` está errada ou expirada
- **Solução:**
  1. Vá para https://app.supabase.com → Settings → API
  2. Copie **anon (public)** para `VITE_SUPABASE_ANON_KEY`
  3. Reinicie: `npm run dev`

#### ❌ Se Aparecer: "❌ Erro 404: Tabela 'users' não encontrada"
- **Causa:** Tabela `users` não existe no banco de dados
- **Solução:**
  1. Vá para https://app.supabase.com
  2. SQL Editor → Execute:
  ```sql
  CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    cpf TEXT,
    parent_email TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    last_active BIGINT,
    profile_data JSONB
  );
  ```

#### ❌ Se Aparecer: "❌ Erro 403: Sem permissão. Verifique políticas RLS"
- **Causa:** Políticas RLS (Row Level Security) bloqueiam INSERT
- **Solução:** Vá para a seção **"RLS Policies"** abaixo ↓

---

## 🔐 RLS Policies (Solução Principal)

A maioria dos casos de "failed to fetch" é por **políticas RLS restritivas**.

### **Verificar/Criar Políticas RLS**

1. **Vá ao Supabase:** https://app.supabase.com
2. **Selecione seu projeto**
3. **Vá para:** Table Editor → `users` → RLS Policies
4. **Se não houver políticas, crie:**

```sql
-- Ir para: SQL Editor → Execute:

-- Permitir INSERT para usuários anônimos
CREATE POLICY "Allow inserts from auth and anon" ON users
  FOR INSERT
  WITH CHECK (true);

-- Permitir SELECT para todos
CREATE POLICY "Allow selects for all" ON users
  FOR SELECT
  USING (true);

-- Permitir UPDATE para todos
CREATE POLICY "Allow updates for all" ON users
  FOR UPDATE
  USING (true);

-- Permitir DELETE para todos
CREATE POLICY "Allow deletes for all" ON users
  FOR DELETE
  USING (true);
```

**OU (mais rápido):**
1. **Table: `users`**
2. **Clique em:** ⚙️ (Settings) → RLS
3. **Togel:** Enable RLS → OFF (desabilitar, se quiser máoxima permissão)
4. **OU adicione as 4 policies acima**

---

## 🔍 Debug Avançado (Console)

Se ainda tiver erro, abra o **Console do Navegador:**

### **PASSO 1: Abrir Console**
- Pressione: `F12` ou `Ctrl+Shift+I`
- Vá para aba: **Console**

### **PASSO 2: Tentar Criar Usuário**
- Preencha: Nome, Senha, Email
- Clique em "Criar"
- **Observe os logs:**

#### Você deve ver:
```
📝 Criando novo usuário: {username: "test", id: "user_test", ...}
```

#### Depois de 1-2s:
```
❌ Erro ao criar usuário (Supabase): {
  code: "23505",  // ou outro código
  message: "...",
  details: "...",
  hint: "..."
}
```

#### **Copie esse erro completo para me mostrar!**

---

## 📋 Checklist de Solução

- [ ] Teste Diagnóstico executado na aba "Infra & Dev"?
- [ ] Resultado do teste foi "✅ Conexão OK!"?
- [ ] Se erro 403: RLS policies adicionadas?
- [ ] Se erro 404: Tabela `users` criada?
- [ ] Se erro 401: Chave `VITE_SUPABASE_ANON_KEY` corrigida?
- [ ] Servidor reiniciado após mudanças? (`npm run dev`)
- [ ] Navegador recarregado? (`F5`)
- [ ] Ainda tem erro? Copie logs do console (F12) para me mostrar

---

## 🎯 Fluxo Rápido de Solução

```
1. Admin Panel → Aba "Infra & Dev"
   ↓
2. Clique "🔍 Teste Diagnóstico"
   ↓
3a. Se ✅ OK → RLS Policy (vou fazer para você)
3b. Se ❌ Erro → Corrija conforme tipo de erro
   ↓
4. Reinicie: npm run dev
   ↓
5. Recarregue navegador: F5
   ↓
6. Tente criar usuário novamente
```

---

## 📞 Se Ainda Não Funcionar

**Me mostre:**
1. O resultado exato do "Teste Diagnóstico"
2. Os logs do Console do navegador (F12)
3. Screenshot da aba "Infra & Dev"

**Com isso consigo corrigir em 2 minutos! 🚀**

---

## 💡 Resumo das Causas Mais Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `failed to fetch` | Conexão bloqueada | Teste Diagnóstico |
| `Tabela users não encontrada` | DB vazio | Criar tabela no SQL Editor |
| `Sem permissão (403)` | RLS restritivo | Adicionar RLS policies |
| `Chave inválida (401)` | .env.local errado | Copiar chaves corretas |
| `CORS erro` | Domínio não autorizado | Supabase Settings → CORS |

---

**Próximo passo: Clique no botão "🔍 Teste Diagnóstico" e me mostra o resultado!**
