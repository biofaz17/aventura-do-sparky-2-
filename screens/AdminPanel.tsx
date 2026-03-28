import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { ArrowLeft, UserPlus, Search, Trash2, CheckCircle, AlertTriangle, Shield, HardDrive, RefreshCw } from 'lucide-react';
import { Button } from '../components/Button';
import { UserProfile, SubscriptionTier } from '../types';

interface UserRecord {
  id: string; // uuid
  username: string;
  cpf: string;
  parent_email: string;
  password?: string;
  created_at?: string;
}

export const AdminPanel: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  
  // States of Form
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newAge, setNewAge] = useState('7');
  const [newCpf, setNewCpf] = useState('');
  const [newEmail, setNewEmail] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    
    // Busca tudo da tabela de usuários mestre
    const { data, error: dbError } = await supabase
      .from('users')
      .select('id, username, cpf, parent_email, password, created_at')
      .order('created_at', { ascending: false });

    if (dbError) {
      setError(dbError.message || 'Erro ao carregar os clientes cadastrados.');
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername.length < 3) return setError('Nome de jogador curto demais.');
    if (newPassword.length < 4) return setError('Senha fraca.');
    
    setLoading(true);
    setError('');
    setSuccess('');

    // Gera o Objeto Nativo do Sparky como se a criança tivesse feito localmente
    const cleanUsername = newUsername.toLowerCase().trim().replace(/\s+/g, '');
    const userId = 'user_' + cleanUsername;
    
    const newProfile: UserProfile = {
      id: userId,
      name: newUsername.trim(),
      password: newPassword,
      parentEmail: newEmail,
      age: parseInt(newAge) || 7,
      subscription: SubscriptionTier.PRO, // Sempre liberação Suprema!
      progress: {
        unlockedLevels: 1, stars: 0, creativeProjects: 0, totalBlocksUsed: 0, secretsFound: 0
      },
      settings: { soundEnabled: true, musicEnabled: true },
      isGuest: false,
      lastActive: Date.now()
    };

    // Monta o Payload DTO para o Banco Reacional
    const payload = {
       username: cleanUsername,
       password: newPassword, // Senha guardada na root pra checagem ou admin reset
       cpf: newCpf.replace(/\D/g, ''),
       parent_email: newEmail,
       profile_data: newProfile // Armazena o JSON completo que o jogo precisa ler
    };

    const { error: dbError } = await supabase
      .from('users')
      .insert([payload]);

    if (dbError) {
      // "duplicate key value violates unique constraint" handling user friendly
      if (dbError.message.includes('unique')) {
        setError(`Um jogador já existe com este (Nome: ${cleanUsername}) ou CPF. Tente variação no nome.`);
      } else {
        setError(dbError.message);
      }
    } else {
      setSuccess(`Jogador ${newUsername} ativado! Passe o Login/Senha para o cliente.`);
      setNewUsername('');
      setNewPassword('');
      setNewCpf('');
      setNewEmail('');
      setNewAge('7');
      fetchUsers();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`ATENÇÃO: Deseja EXCLUIR definitivamente a conta do jogador "${name}"? Todo progresso na nuvem dele vai desaparecer.`)) return;

    setLoading(true);
    const { error: dbError } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (dbError) {
      setError(dbError.message);
    } else {
      fetchUsers();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
             <button onClick={onBack} className="bg-slate-800 p-2 rounded-lg hover:bg-indigo-600 transition text-slate-300">
               <ArrowLeft size={20} />
             </button>
             <div>
               <h1 className="text-2xl font-black text-indigo-400 font-heading flex items-center gap-2">
                 <Shield size={24} /> Gerador de Clientes Pós-Venda
               </h1>
               <p className="text-slate-500 text-sm">Crie perfis e libere o acesso Oficial aqui</p>
             </div>
          </div>
        </header>

        {error && (
           <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl flex items-center gap-3 animate-shake">
              <AlertTriangle size={20} />
              <span className="text-sm font-bold">{error}</span>
           </div>
        )}
        {success && (
           <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-xl flex items-center gap-3 animate-pulse">
              <CheckCircle size={20} />
              <span className="text-sm font-bold">{success}</span>
           </div>
        )}

        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-8">
           
           {/* Formulário de Adicionar Contas PRO */}
           <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl h-fit">
             <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
               <UserPlus size={24} className="text-indigo-400" /> Cadastrar Jogo (Venda)
             </h2>
             <form onSubmit={handleAddUser} className="space-y-5">
                
                {/* DADOS DO ALUNO */}
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-700 pb-2">Credenciais do Jogo</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Nome no Jogo (LOGIN)</label>
                      <input 
                        type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)}
                        className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                        placeholder="Ex: fabio123" required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Senha Web</label>
                        <input 
                          type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                          placeholder="Ex: 5678" required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Idade</label>
                        <input 
                          type="number" value={newAge} onChange={(e) => setNewAge(e.target.value)} min="5" max="17"
                          className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* DADOS FISCAIS */}
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                  <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3 border-b border-slate-700 pb-2">Fiscal & Controle (Hotmart)</h3>
                  <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Email do Pagador</label>
                        <input 
                          type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                          className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                          placeholder="O email que comprou" required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">CPF de Verificação</label>
                        <input 
                          type="text" value={newCpf} onChange={(e) => setNewCpf(e.target.value.replace(/\D/g, ''))} maxLength={11}
                          className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                          placeholder="Apenas números"
                        />
                      </div>
                  </div>
                </div>

                <Button type="submit" variant="primary" className="w-full shadow-lg shadow-indigo-500/20" disabled={loading}>
                  {loading ? 'GERANDO CONTROLE...' : 'CRIAR ACESSO VITALÍCIO PRO'}
                </Button>
             </form>
           </div>

           {/* Painel Tabela / Visualização */}
           <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl flex flex-col h-[700px]">
             <div className="flex justify-between items-center mb-6">
                 <div>
                   <h2 className="text-xl font-bold flex items-center gap-2">
                     <HardDrive size={24} className="text-indigo-400" /> Tabela Nuvem: Jogadores
                   </h2>
                   <p className="text-xs text-slate-500">Estas pessoas têm acesso liberado pelo seu site.</p>
                 </div>
                 <div className="flex items-center gap-2">
                     <button onClick={fetchUsers} className="bg-slate-700 p-2 rounded-lg hover:bg-slate-600 transition" title="Recarregar Nuvem">
                         <RefreshCw size={16} className={`${loading ? 'animate-spin text-indigo-400' : 'text-slate-300'}`} />
                     </button>
                     <span className="bg-slate-900 text-xs px-3 py-1.5 rounded-lg text-slate-400 font-bold border border-slate-700 shadow-inner">
                        {users.length} ATIVOS
                     </span>
                 </div>
             </div>
             
             <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {users.length === 0 && !loading && (
                   <div className="text-center text-slate-500 font-bold text-sm py-20 bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-700">
                      Vazio. Seu Supabase não possui usuários na tabela `users` ou o banco está fora do ar.
                   </div>
                )}
                
                {users.map((u, i) => (
                   <div key={u.id || i} className="bg-slate-900 p-5 rounded-2xl border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md hover:border-slate-600 transition">
                      <div className="min-w-0">
                         <div className="flex items-center gap-2 mb-1">
                             <div className="bg-indigo-500/20 text-indigo-300 text-[10px] px-2 py-0.5 rounded uppercase font-black tracking-widest">
                                PRO 
                             </div>
                             <p className="text-lg font-bold text-white truncate max-w-[150px]">{u.username}</p>
                         </div>
                         <p className="text-xs text-slate-400 mb-1 flex items-center gap-2">
                            <span>🔑 Senha: <span className="text-slate-200 font-mono tracking-wider">{u.password || '****'}</span></span>
                         </p>
                         <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span>Email: <span className="text-slate-300">{u.parent_email || 'Não inf.'}</span></span>
                            <span>CPF: <span className="text-slate-300">{u.cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") || 'Não inf.'}</span></span>
                         </div>
                      </div>
                      
                      <div className="flex md:flex-col gap-2 items-end shrink-0">
                         <div className="text-[10px] text-slate-600 mb-2 hidden md:block border-b border-slate-700 pb-1">
                             {new Date(u.created_at || Date.now()).toLocaleDateString('pt-BR')} 
                         </div>
                         <button 
                           onClick={() => handleDelete(u.id, u.username)} 
                           className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2"
                         >
                            <Trash2 size={14} /> EXPLODIR
                         </button>
                      </div>
                   </div>
                ))}
             </div>
           </div>

        </div>
      </div>
    </div>
  );
};
