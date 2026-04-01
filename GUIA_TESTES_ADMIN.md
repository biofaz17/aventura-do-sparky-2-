# 📋 Guia Prático de Testes - Página de Admin

## ⚙️ PASSO 1: Configuração Inicial

### 1.1 Verificar Supabase
A página de admin depende do Supabase. Você tem 3 opções:

**Opção A: Tem chaves do Supabase?**
- Abra o arquivo `.env.local`
- Preencha as variáveis:
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

**Opção B: Não tem Supabase configurado?**
- A app vai funcionar em "mock mode"
- O AdminPanel mostrará mensagem de erro
- Você ainda consegue testar a interface (sem carregar dados reais)

**Opção C: Testar com dados simulados**
- Use o componente `SupabaseTest.tsx` para entender a estrutura de dados

### 1.2 Validar Ambiente
```bash
# No terminal, verifique se as dependências estão instaladas
npm install

# Verifique se o Vite está disponível
npm run dev
```

---

## 🚀 PASSO 2: Iniciar o Servidor

```bash
# Terminal: Execute o servidor de desenvolvimento
npm run dev

# A app abrirá em http://localhost:5173/
```

---

## 🔐 PASSO 3: Acessar Painel Admin

### 3.1 Navegação para Admin
1. Abra seu navegador
2. Vá para: **`http://localhost:5173/#/admin`**
3. Você verá a tela de PIN

### 3.2 Desbloquear Admin
- **PIN**: `031415`
- Digitar os 6 dígitos (um por vez)
- Clique para próximo campo automaticamente
- Se errar, volta para início (com animação)

---

## ✅ PASSO 4: EXECUTAR OS TESTES

### **TESTE 1: Carregar Dados Existentes**
**Objetivo:** Verificar se os usuários aparecem corretamente

**Passos:**
1. Após desbloquear, você estará na aba **"Usuários"**
2. Procure por usuários criados anteriormente
3. **Valide:**
   - ✓ Lista mostra nome de usuário?
   - ✓ Senha aparece?
   - ✓ Plano (FREE/STARTER/PRO) está correto?
   - ✓ Progresso (nível e estrelas) é mostrado?
   - ✓ Data de criação está correta?

**Se não há usuários:**
- Clique em **"Novo Usuário"** (verde)
- Crie um teste agora

---

### **TESTE 2: Criar Novo Usuário (CREATE)**
**Objetivo:** Validar criação e persistência de dados

**Passos:**
1. Clique no botão verde **"Novo Usuário"**
2. Preencha o formulário:
   ```
   Nome: test_explorer_01
   Senha: senha123
   Idade: 8
   Email: test@example.com
   CPF: 12345678901
   ```
3. Clique **"Criar Acesso PRO Vitalício"**

**Valide a resposta:**
- ✓ Mensagem verde de sucesso aparece?
- ✓ O novo usuário aparece no topo da tabela?
- ✓ Status mostra "PRO" com coroa?
- ✓ Email está correto?
- ✓ Dados estão salvos no Supabase (recarregue a página F5)?

**Código de verificação:**
```javascript
// No Console do navegador (F12 → Console):
// Você deve ver o novo usuário em profile_data.subscription = "PRO"
```

---

### **TESTE 3: Editar Usuário (UPDATE)**
**Objetivo:** Verificar atualização de dados

**Passos:**
1. Na tabela, encontre um usuário
2. Clique no ícone **lápis azul** (Edit)
3. Modal abre - altere:
   ```
   Senha: novaSenha456
   Email: novo@email.com
   Plano: STARTER
   ```
4. Clique **"Salvar Alterações"**

**Valide:**
- ✓ Modal fechou?
- ✓ Tabela atualizou sem reload?
- ✓ O plano agora mostra "STARTER"?
- ✓ Recarregue (F5) e veja se dados persistiram?

---

### **TESTE 4: Copiar Credenciais**
**Objetivo:** Testar função de cópia

**Passos:**
1. Na tabela, clique no ícone **copiar** (copy icon)
2. Você deve ver toast: **"Credenciais copiadas!"**
3. Cole em outro lugar: `Ctrl+V`

**Valide:**
- ✓ Toast apareceu por 2.5 segundos?
- ✓ Credenciais foram copiadas corretamente?
- ✓ Formato é: "Login: username | Senha: password"?

---

### **TESTE 5: Deletar Usuário (DELETE)**
**Objetivo:** Validar exclusão

**Passos:**
1. Na tabela, clique no ícone **lixo vermelho**
2. Confirme no diálogo: **"Excluir definitivamente a conta?"**
3. Aguarde a exclusão

**Valide:**
- ✓ Usuário desapareceu da tabela?
- ✓ Total de usuários diminuiu?
- ✓ Recarregue (F5) e verifique que foi realmente deletado?

---

### **TESTE 6: Busca (Search)**
**Objetivo:** Testar filtro de usuários

**Passos:**
1. Na barra de busca, digite: **parte do nome do usuário**
   Exemplo: "test" ou "explorer"
2. A tabela filtra em tempo real

**Valide:**
- ✓ Filtra por nome de usuário?
- ✓ Filtra por email?
- ✓ Ação é instantânea (sem lag)?

---

### **TESTE 7: Recarregar Dados**
**Objetivo:** Verificar sincronização

**Passos:**
1. Clique no ícone **de rotação** (Refresh) no topo
2. Aguarde o ícone girar
3. Confirme que dados foram recarregados

**Valide:**
- ✓ Ícone gira durante carregamento?
- ✓ Lista atualiza do Supabase?
- ✓ Reflexo de mudanças feitas fora do admin?

---

### **TESTE 8: Estatísticas (Stats)**
**Objetivo:** Validar cálculos

**No topo da página, 4 cards mostram:**
- **Total Usuários**: Deve ser número correto
- **Assinantes**: Soma de PRO + STARTER
- **Ativos Hoje**: Usuários com last_active = hoje
- **Média Estrelas**: Soma stars / total

**Valide:**
- ✓ Total = quantidade exata de usuários?
- ✓ Assinantes = PRO + STARTER (manualmente some)?
- ✓ Stats atualizam após criar usuário?

---

### **TESTE 9: Aba Vendas & Planos**
**Objetivo:** Validar relatório de faturamento

**Clique na aba "Vendas & Planos"**

Valide os valores:
- **Planos PRO**: ${proCount} × R$ 49,90
- **Planos STARTER**: ${starterCount} × R$ 19,90
- **Gratuitos**: Percentual de abandono
- **Ticket Médio**: (Total Vendido) / (Total Usuários)

```
Fórmula: 
Ticket Médio = ((PRO × 49.90) + (STARTER × 19.90)) / Total
```

**Valide:**
- ✓ Valores batem manual?
- ✓ Percentual de conversão está correto?

---

### **TESTE 10: Aba Infra & Dev**
**Objetivo:** Validar health check

**Clique na aba "Infra & Dev"**

Procure por:
1. **Banco de Dados**
   - ✓ Mostra contagem correta de registros?
   - ✓ Supabase está UP (verde)?

2. **Segurança**
   - ✓ SSL ativo (Cloudflare)?
   - ✓ Encryption AES-256?
   - ✓ Backup diário?

3. **Logs do Sistema**
   - ✓ Mostra timestamp do acesso?
   - ✓ Confirma conexão Supabase?

---

## 🐛 CHECKLIST DE VALIDAÇÃO

Após completar todos os testes, marque:

- [ ] Dados carregam sem erro?
- [ ] Criar usuário persiste no Supabase?
- [ ] Editar atualiza todos os campos?
- [ ] Deletar remove completamente?
- [ ] Busca funciona em tempo real?
- [ ] Estatísticas calculam corretamente?
- [ ] Nenhum console error (F12)?
- [ ] Recarregar página (F5) mantém dados atualizados?
- [ ] Aba Vendas calcula receita corretamente?
- [ ] Infra mostra status correto do Supabase?

---

## ⚠️ PROBLEMAS COMUNS & SOLUÇÕES

### ❌ "Supabase não configurado"
**Solução:** 
1. Verifique `.env.local`
2. Adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
3. Reinicie o servidor: `npm run dev`

### ❌ Dados não atualizam após editar
**Solução:**
1. Abra F12 → Console
2. Procure por erros de rede
3. Verifique permissões no Supabase
4. Tente recarregar: F5

### ❌ Usuário criado mas não aparece
**Solução:**
1. Clique no botão Refresh
2. Verifique dados na tabela `users` do Supabase diretamente
3. Confirme que a tabela tem coluna `username`

### ❌ PIN não funciona
**Solução:**
- PIN correto é: **031415**
- Certifique-se de digitar sem espaços
- Se errar, animação de shake aparece e reseta

---

## 📊 DADOS ESPERADOS NO SUPABASE

Estrutura de usuário esperada:
```json
{
  "id": "user_joao_silva",
  "username": "joao_silva",
  "password": "senha123",
  "cpf": "12345678901",
  "parent_email": "responsavel@email.com",
  "created_at": "2024-01-15T10:30:00Z",
  "last_active": 1705320600000,
  "profile_data": {
    "subscription": "PRO",
    "progress": {
      "unlockedLevels": 5,
      "stars": 25
    }
  }
}
```

---

## 🎯 RESUMO

| Teste | O que testar | Status ✓ |
|-------|-------------|---------|
| 1 | Carregar dados | ✓ |
| 2 | Criar usuário | ✓ |
| 3 | Editar usuário | ✓ |
| 4 | Copiar credenciais | ✓ |
| 5 | Deletar usuário | ✓ |
| 6 | Busca/Filtro | ✓ |
| 7 | Recarregar | ✓ |
| 8 | Estatísticas | ✓ |
| 9 | Vendas & Planos | ✓ |
| 10 | Infra & Health | ✓ |

---

**Criado:** 1º de Abril de 2024  
**Versão:** 1.0  
**Comandos principais:**
```bash
npm run dev          # Inicia servidor
npm run build        # Build para produção
npm run preview      # Preview do build
```

Boa sorte nos testes! 🚀
