# 🔧 Guia de Debug - Admin Panel

## ✅ O que foi corrigido

### 1. **Melhor logging de erros**
Agora o código mostra logs detalhados no console:

```javascript
// ✅ Ao carregar usuários:
📡 Carregando usuários do Supabase...
✅ 5 usuários carregados com sucesso

// ✅ Ao criar usuário:
📝 Criando novo usuário: { username: "test", id: "user_test", parent_email: "..." }
✅ Usuário criado com sucesso!

// ✅ Ao editar:
✅ Usuário atualizado com sucesso: user_id

// ✅ Ao deletar:
🗑️ Deletando usuário: user_id
✅ Usuário deletado com sucesso
```

### 2. **Tratamento de erros melhorado**
- Try-catch em todas as operações
- Mensagens de erro claras
- Logs de exceções

### 3. **Estrutura de dados corrigida**
- Removidas duplicações (senha não precisa estar em `profile_data`)
- Campos consistentes: `parent_email` (não `parentEmail`)
- ID do usuário agora é salvo explicitamente na tabela

---

## 🔍 Como Debuggar Problemas

### **PASSO 1: Abrir Console do Navegador**
```
Pressione: F12 ou Ctrl+Shift+I
Vá para a aba: Console
```

### **PASSO 2: Executar Ações e Observar Logs**

#### **Teste: Carregar Usuários**
No console você deve ver:
```
📡 Carregando usuários do Supabase...
✅ 3 usuários carregados com sucesso [Array(3)]
  └─ [0] {id: "user_joao", username: "joao", ...}
```

**Se vir erro:**
```
❌ Erro ao carregar usuários: {
  code: "...",
  message: "..."
}
```
→ Copie o `message` e me mostre

---

#### **Teste: Criar Usuário**

**Esperado:**
```
📝 Criando novo usuário: {username: "test1", id: "user_test1", parent_email: "..."}
✅ Usuário criado com sucesso!
```

**Se falhar:**
```
❌ Erro ao criar usuário: {
  code: "23505",  // unique constraint
  message: "duplicate key value violates unique constraint..."
}
```

Possíveis causas:
- Usuário com esse nome já existe
- Falta de permissão no Supabase
- Tabela `users` não existe

---

#### **Teste: Editar Usuário**

**Esperado:**
```
✅ Usuário atualizado com sucesso: user_joao
[Modal fecha automaticamente]
[Usuário atualiza na tabela]
```

**Se falhar:**
```
❌ Erro ao atualizar usuário: {
  code: "...",
  message: "..."
}
```

---

#### **Teste: Deletar Usuário**

**Esperado:**
```
🗑️ Deletando usuário: user_joao
✅ Usuário deletado com sucesso
📡 Carregando usuários do Supabase...
✅ 2 usuários carregados com sucesso
```

---

## 🚨 Erros Comuns e Soluções

### ❌ "Erro: Supabase não configurado"
**Solução:**
```bash
# 1. Verifique .env.local
echo $VITE_SUPABASE_URL

# 2. Reinicie servidor
npm run dev

# 3. No navegador, recarregue: F5
```

---

### ❌ Usuário criado mas não aparece na tabela
**Passos de debug:**
1. Abra F12 → Console
2. Procure por logs de criação (deve ter ✅)
3. Clique no botão **Refresh** (ícone de rotação)
4. Verifique se ele aparece

**Se ainda não aparecer:**
- Vá ao Supabase (https://app.supabase.com)
- Acesse o projeto
- Vá para **SQL Editor**
- Execute:
```sql
SELECT * FROM users ORDER BY created_at DESC LIMIT 5;
```
- Se o usuário está lá, o problema é na leitura
- Se não está, o problema é na escrita

---

### ❌ "Erro ao atualizar: Row updated count was 0"
**Causa:** O ID do usuário não existe ou está em formato errado

**Solução:**
1. Verifique no console qual foi o ID tentado
2. Vá ao Supabase e veja qual é o formato do ID real
3. Pode ser que a tabela use UUID em vez de texto

---

### ❌ "Erro: CORS ou Permission Denied"
**Causa:** Permissões do Supabase

**Passos:**
1. Vá ao Supabase → Settings → Authentication
2. Verifique se "Anon Key" permissions permite INSERT/UPDATE/DELETE
3. Se não, crie uma política:

```sql
-- Políticas recomendadas
CREATE POLICY "Allow all operations" ON users
  FOR ALL USING (true);
```

---

## 📊 O que Deve Acontecer

### **Fluxo Correto de Criação:**
```
1. Preenche formulário
2. Clica "Criar"
3. Vê: 📝 Criando novo usuário: {...}
4. Espera 1-2 segundos
5. Vê: ✅ Usuário criado com sucesso!
6. Vê: Toast verde aparece
7. Formulário limpa
8. Usuário aparece no topo da tabela (sem F5)
```

### **Fluxo Correto de Edição:**
```
1. Clica no ícone lápis
2. Modal abre com dados preenchidos
3. Altera dados
4. Clica "Salvar"
5. Vê status "Salvando..."
6. Vê: ✅ Usuário atualizado com sucesso: user_id
7. Modal fecha automaticamente
8. Tabela atualiza sem recarregar (F5)
```

### **Fluxo Correto de Deleção:**
```
1. Clica no ícone lixo
2. Confirma no diálogo
3. Vê: 🗑️ Deletando usuário: user_id
4. Espera 1-2 segundos
5. Vê: ✅ Usuário deletado com sucesso
6. Vê: 📡 Carregando usuários...
7. Usuário desaparece da tabela
```

---

## 📝 Estrutura de Dados Esperada

No Supabase, tabela `users` deve ter:
```json
{
  "id": "user_joao",
  "username": "joao",
  "password": "senha123",
  "cpf": "12345678901",
  "parent_email": "joao@email.com",
  "created_at": "2024-01-15T10:30:00Z",
  "last_active": 1705320600000,
  "profile_data": {
    "id": "user_joao",
    "name": "João",
    "age": 8,
    "subscription": "PRO",
    "progress": {
      "unlockedLevels": 1,
      "stars": 0
    }
  }
}
```

**Importante:**
- `parent_email` na tabela principal (snake_case)
- `profile_data` é um JSON/OBJECT (não texto)
- `id` deve ser string única

---

## 🎯 Próximas Ações

1. **Abra o navegador em:** http://localhost:3000/#/admin
2. **PIN:** 031415
3. **Abra F12** para ver os logs
4. **Tente criar um usuário** e observe os logs
5. **Se der erro, copie o log completo** e me mostre

---

## 💡 Comandos Úteis de Dev

```bash
# Ver logs do servidor
npm run dev

# Parar servidor
# Ctrl+C no terminal

# Limpar cache e reiniciar
rm -rf node_modules/.vite
npm run dev

# Build de produção
npm run build
```

---

## 📞 Checklist de Debug

- [ ] Console (F12) abre sem erro?
- [ ] Supabase URL em .env.local está correcta?
- [ ] Logs mostram "Carregando usuários"?
- [ ] Ao criar, vê o log "Criando novo usuário"?
- [ ] Ao editar, vê "Usuário atualizado"?
- [ ] Ao deletar, vê "Deletando usuário"?
- [ ] Recarregar (F5) mantém dados?
- [ ] Tabela atualiza após ações (sem F5)?

---

**Se tiver dúvida, me mostre os logs do console (F12) que aí acho o problema! 🚀**
