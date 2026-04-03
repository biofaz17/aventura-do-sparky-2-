#!/usr/bin/env node

/**
 * 🚀 Script de Configuração do Supabase
 * Facilita a setup das variáveis de ambiente e RLS policies
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

const SUPABASE_URL_REGEX = /^https:\/\/[a-z0-9]+\.supabase\.co$/;
const KEY_REGEX = /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

const RLS_POLICIES = {
  read: `CREATE POLICY "Allow public to read users" ON users
  FOR SELECT
  USING (true);`,
  
  insert: `CREATE POLICY "Allow public to create users" ON users
  FOR INSERT
  WITH CHECK (true);`,
  
  update: `CREATE POLICY "Allow public to update users" ON users
  FOR UPDATE
  USING (true)
  WITH CHECK (true);`,
  
  delete: `CREATE POLICY "Allow public to delete users" ON users
  FOR DELETE
  USING (true);`
};

const SQL_CREATE_USERS_TABLE = `
-- Create users table with proper structure
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  cpf TEXT,
  parent_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active BIGINT,
  profile_data JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public to read users" ON users;
DROP POLICY IF EXISTS "Allow public to create users" ON users;
DROP POLICY IF EXISTS "Allow public to update users" ON users;
DROP POLICY IF EXISTS "Allow public to delete users" ON users;

-- Create new policies
${RLS_POLICIES.read}
${RLS_POLICIES.insert}
${RLS_POLICIES.update}
${RLS_POLICIES.delete}
`;

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║         🚀 Configurador Supabase - Aventura do Sparky   ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const envLocalPath = path.join(__dirname, '.env.local');
  const envExamplePath = path.join(__dirname, '.env.example');

  // Step 1: Check if .env.local exists
  console.log('📋 PASSO 1: Verificando .env.local...\n');
  
  if (fs.existsSync(envLocalPath)) {
    console.log('✅ .env.local já existe');
    const update = await question('Deseja atualizar as credenciais? (s/n) ');
    if (update.toLowerCase() !== 's') {
      console.log('\n👋 Saindo...\n');
      rl.close();
      return;
    }
  } else {
    console.log('⚠️  .env.local não encontrado');
    console.log('📝 Criando novo arquivo...\n');
    
    if (!fs.existsSync(envExamplePath)) {
      console.log('❌ Erro: .env.example não encontrado');
      rl.close();
      process.exit(1);
    }
    
    fs.copyFileSync(envExamplePath, envLocalPath);
    console.log('✅ .env.local criado com sucesso\n');
  }

  // Step 2: Get Supabase credentials
  console.log('🔐 PASSO 2: Adicionar Credenciais do Supabase\n');
  console.log('Para obter suas credenciais:');
  console.log('1. Acesse: https://app.supabase.com');
  console.log('2. Selecione seu projeto');
  console.log('3. Vá em Settings → API');
  console.log('4. Copie os valores abaixo\n');

  let supabaseUrl = '';
  let anonKey = '';

  // Get URL
  while (!supabaseUrl) {
    supabaseUrl = await question('📍 VITE_SUPABASE_URL (ex: https://seu-projeto.supabase.co): ');
    
    if (!SUPABASE_URL_REGEX.test(supabaseUrl)) {
      console.log('❌ URL inválida. Use o formato: https://seu-projeto.supabase.co\n');
      supabaseUrl = '';
    }
  }

  // Get Anon Key
  while (!anonKey) {
    anonKey = await question('\n🔑 VITE_SUPABASE_ANON_KEY (chave anônima pública): ');
    
    if (!KEY_REGEX.test(anonKey)) {
      console.log('❌ Chave inválida. Deve começar com "eyJ"\n');
      anonKey = '';
    }
  }

  // Step 3: Save to .env.local
  console.log('\n💾 PASSO 3: Salvando credenciais...\n');
  
  let envContent = fs.readFileSync(envLocalPath, 'utf8');
  
  envContent = envContent.replace(
    /VITE_SUPABASE_URL=.*/,
    `VITE_SUPABASE_URL=${supabaseUrl}`
  );
  
  envContent = envContent.replace(
    /VITE_SUPABASE_ANON_KEY=.*/,
    `VITE_SUPABASE_ANON_KEY=${anonKey}`
  );

  fs.writeFileSync(envLocalPath, envContent);
  console.log('✅ Credenciais salvas em .env.local\n');

  // Step 4: Setup RLS Policies
  console.log('🛡️  PASSO 4: Configurar RLS Policies\n');
  console.log('Você pode configurar as políticas de segurança de 2 formas:\n');
  console.log('Opção A: Manual (via Supabase Dashboard)');
  console.log('  → Supabase → SQL Editor → Copie/Cole os comandos\n');
  console.log('Opção B: Automático (se você tiver acesso via API)\n');

  const setupRls = await question('Deseja ver os comandos SQL para copiar/colar? (s/n) ');

  if (setupRls.toLowerCase() === 's') {
    console.log('\n' + '='.repeat(60));
    console.log('📋 COMANDOS SQL PARA SUPABASE SQL EDITOR');
    console.log('='.repeat(60) + '\n');
    console.log(SQL_CREATE_USERS_TABLE);
    console.log('\n' + '='.repeat(60) + '\n');
    
    console.log('📌 Como aplicar:');
    console.log('1. Acesse: https://app.supabase.com');
    console.log('2. Vá em: SQL Editor');
    console.log('3. Cole todo o código acima');
    console.log('4. Clique em "Run"\n');

    const saveToFile = await question('Salvar SQL em um arquivo? (s/n) ');
    if (saveToFile.toLowerCase() === 's') {
      const sqlPath = path.join(__dirname, 'setup-supabase.sql');
      fs.writeFileSync(sqlPath, SQL_CREATE_USERS_TABLE);
      console.log(`✅ Salvo em: ${sqlPath}\n`);
    }
  }

  // Step 5: Verify configuration
  console.log('✅ PASSO 5: Verificando Configuração\n');
  console.log('Seu .env.local foi atualizado com:');
  console.log(`  • VITE_SUPABASE_URL=${supabaseUrl}`);
  console.log(`  • VITE_SUPABASE_ANON_KEY=${anonKey.substring(0, 20)}...`);

  // Step 6: Next steps
  console.log('\n🚀 PRÓXIMOS PASSOS:\n');
  console.log('1. ⚡ Inicie o servidor:');
  console.log('   npm run dev\n');
  console.log('2. 🌐 Acesse o admin panel:');
  console.log('   http://localhost:5173/#/admin\n');
  console.log('3. 🔐 Digite o PIN: 031415\n');
  console.log('4. ➕ Tente criar um usuário novo\n');
  console.log('5. 🐛 Se houver erro, abra F12 (Console) para ver detalhes\n');

  console.log('💡 Dica: Se receber erro "Supabase not configured":');
  console.log('   → Reinicie o servidor (Ctrl+C e npm run dev)\n');

  console.log('✨ Setup concluído! Boa sorte! 🎉\n');

  rl.close();
}

main().catch(err => {
  console.error('❌ Erro:', err.message);
  rl.close();
  process.exit(1);
});
