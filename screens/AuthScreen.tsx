import React, { useState } from 'react';
import { Button } from '../components/Button';
import { UserProfile, SubscriptionTier } from '../types';
import { User, Lock, Gamepad2, LogIn } from 'lucide-react';
import { SparkyLogo } from '../components/SparkyLogo';
import { supabase } from '../services/supabase';

interface AuthScreenProps {
  onLogin: (user: UserProfile) => void;
  onAdminAccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onAdminAccess }) => {
  const [adminClicks, setAdminClicks] = useState(0);
  
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const generateUserId = (username: string) => {
      return 'user_' + username.toLowerCase().trim().replace(/\s+/g, '');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const userId = generateUserId(name);
    const storageKey = `sparky_user_${userId}`;
    const storedData = localStorage.getItem(storageKey);

    let foundUser: UserProfile | null = null;

    // 1. Tentar ler do LocalStorage (Caso já tenha logado neste PC antes)
    if (storedData) {
        try {
            const localUser: UserProfile = JSON.parse(storedData);
            if (localUser.password === password) {
                foundUser = localUser;
            } else {
                setError('Senha incorreta.');
                setLoading(false);
                return;
            }
        } catch (err) {
            console.error(err);
        }
    }

    // 2. Se não achou (Conta Nova criada pelo Admin), buscar na Nuvem (Supabase)
    if (!foundUser) {
        try {
            const cleanUsername = name.toLowerCase().trim().replace(/\s+/g, '');
            const { data, error: dbError } = await supabase
                .from('users')
                .select('profile_data, password')
                .eq('username', cleanUsername)
                .single();
            
            if (dbError || !data) {
                setError(dbError?.message?.includes('não configurado')
                   ? 'O modo online (nuvem) está offline. Crie a conta ou tente novamente mais tarde.' 
                   : 'Usuário não localizado no sistema. Verifique o nome digitado.');
                setLoading(false);
                return;
            }

            if (data.password !== password) {
                setError('Senha incorreta.');
                setLoading(false);
                return;
            }

            // O Admin gerou este objeto e salvou no banco
            foundUser = data.profile_data as UserProfile;

            // Faz o "download" persistindo para funcionar offline depois
            localStorage.setItem(storageKey, JSON.stringify(foundUser));
            
        } catch (err) {
            setError('Falha de conexão com os servidores Sparky. Tente novamente mais tarde.');
            setLoading(false);
            return;
        }
    }

    // 3. Efetuar Mapeamento Final e Login
    if (foundUser) {
        onLogin({ ...foundUser, lastActive: Date.now() });
    }
    setLoading(false);
  };

  const handleGuestPlay = () => {
    const guestUser: UserProfile = {
      id: 'guest_' + Date.now(),
      name: 'Explorador',
      parentEmail: '',
      age: 7, 
      subscription: SubscriptionTier.FREE,
      progress: {
        unlockedLevels: 1, stars: 0, creativeProjects: 0, totalBlocksUsed: 0, secretsFound: 0
      },
      settings: { soundEnabled: true, musicEnabled: true },
      isGuest: true
    };
    onLogin(guestUser);
  };

  const handleLogoClick = () => {
      const newClicks = adminClicks + 1;
      setAdminClicks(newClicks);
      if (newClicks >= 5) {
          setAdminClicks(0);
          const code = prompt("Acesso Restrito (Painel Admin). Senha Mestre:");
          if (code === "SparkyMaster") {
              if (onAdminAccess) onAdminAccess();
          } else if (code) {
              alert("Acesso Negado.");
          }
      }
  };

  return (
    <div className="min-h-full w-full bg-indigo-500 flex items-center justify-center p-4 bg-[url('/assets/patterns/cubes.png')] py-12">
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col">
        {/* Decor */}
        <div className={`absolute top-0 left-0 w-full h-4 bg-gradient-to-r transition-colors duration-500 from-blue-400 via-purple-400 to-yellow-400`} />
        
        <div className="flex flex-col items-center mb-8 mt-2">
           <div 
              className="transform hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={handleLogoClick}
              title="A aventura começa aqui!"
           >
             <SparkyLogo size="lg" />
           </div>
           <p className="text-slate-500 font-bold text-sm mt-4 tracking-wide text-center">
             Bem-vindo à maior jornada <br/> de programação!
           </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1 ml-2">Qual seu Nome de Explorador?</label>
            <div className="relative">
               <User className="absolute left-4 top-3.5 text-slate-400" size={20} />
               <input 
                 type="text" 
                 value={name}
                 onChange={e => setName(e.target.value)}
                 className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 pl-12 font-bold text-slate-700 focus:border-indigo-400 outline-none transition"
                 placeholder="Ex: Pedro123"
                 required
                 disabled={loading}
               />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1 ml-2">Senha do Jogador</label>
            <div className="relative">
               <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
               <input 
                 type="password" 
                 value={password}
                 onChange={e => setPassword(e.target.value)}
                 className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 pl-12 font-bold text-slate-700 focus:border-indigo-400 outline-none transition"
                 placeholder="Digite a senha liberada"
                 required
                 disabled={loading}
               />
            </div>
          </div>

          {error && (
              <div className="bg-red-50 text-red-600 text-sm font-bold p-3 rounded-xl border border-red-100 text-center animate-shake">
                  {error}
              </div>
          )}

          <Button 
            variant={'primary'} 
            size="lg" 
            className={`w-full mt-4 flex items-center justify-center gap-2`}
            disabled={loading}
          >
             <LogIn size={20} /> {loading ? 'Sincronizando...' : 'ENTRAR NO JOGO'}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-4">
           <div className="h-px bg-slate-200 flex-1" />
           <span className="text-slate-400 text-xs font-bold uppercase">OU</span>
           <div className="h-px bg-slate-200 flex-1" />
        </div>

        <button 
          onClick={handleGuestPlay}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm"
          disabled={loading}
        >
           <Gamepad2 size={18} /> JOGAR VERSÃO GRÁTIS
        </button>

      </div>
    </div>
  );
};
