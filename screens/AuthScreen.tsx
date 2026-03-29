import React, { useState } from 'react';
import { Button } from '../components/Button';
import { UserProfile, SubscriptionTier } from '../types';
import { User, Lock, Gamepad2, LogIn, Code, Sparkles, Star, ShieldCheck, Mail, Instagram, Info, X } from 'lucide-react';
import { SparkyLogo } from '../components/SparkyLogo';
import { supabase } from '../services/supabase';

interface AuthScreenProps {
  onLogin: (user: UserProfile) => void;
  onAdminAccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onAdminAccess }) => {
  const [adminClicks, setAdminClicks] = useState(0);
  const [showAbout, setShowAbout] = useState(false);
  const currentYear = new Date().getFullYear();
  
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-4 py-12">
      
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="mb-12 flex flex-col items-center justify-center">
            <div 
              className="transform hover:scale-105 transition-transform duration-300 cursor-pointer mb-4"
              onClick={handleLogoClick}
              title="A aventura começa aqui!"
            >
              <SparkyLogo size="lg" />
            </div>
            <p className="text-center text-blue-600 font-bold text-sm tracking-widest uppercase">
              Code Adventure
            </p>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-slate-200">
          
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 text-center mb-2 uppercase tracking-tight">
            Login do Explorador
          </h1>

          <p className="text-center text-slate-500 text-sm md:text-base mb-8 leading-relaxed">
            Bem-vindo à maior jornada de programação! Entre com suas credenciais para continuar a aventura.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Qual seu Nome de Explorador?</label>
              <div className="relative">
                 <User className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                 <input 
                   type="text" 
                   value={name}
                   onChange={e => setName(e.target.value)}
                   className="w-full bg-white border-2 border-slate-200 rounded-lg p-3 pl-11 font-medium text-slate-700 focus:border-blue-400 focus:outline-none transition"
                   placeholder="Ex: Pedro123"
                   required
                   disabled={loading}
                 />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Senha do Jogador</label>
              <div className="relative">
                 <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                 <input 
                   type="password" 
                   value={password}
                   onChange={e => setPassword(e.target.value)}
                   className="w-full bg-white border-2 border-slate-200 rounded-lg p-3 pl-11 font-medium text-slate-700 focus:border-blue-400 focus:outline-none transition"
                   placeholder="Digite a senha liberada"
                   required
                   disabled={loading}
                 />
              </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 text-sm font-bold p-3 rounded-lg border border-red-200 text-center">
                    {error}
                </div>
            )}

            <Button 
              variant={'primary'} 
              size="lg" 
              className={`w-full mt-6 flex items-center justify-center gap-2 py-4 text-base font-bold rounded-lg`}
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
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 text-sm"
            disabled={loading}
          >
             <Gamepad2 size={18} /> JOGAR VERSÃO GRÁTIS
          </button>

          <div className="flex gap-4 items-center justify-center mt-6 pt-4 border-t border-slate-200">
             <button 
               onClick={() => setShowAbout(true)}
               className="text-slate-400 font-bold text-xs hover:text-blue-500 flex items-center gap-1 transition"
             >
                <Info size={14} /> Saiba Mais
             </button>
          </div>
        </div>

        {/* Footer - Simples */}
        <footer className="mt-8 text-center text-xs text-slate-400 space-y-1">
          <div>© {currentYear} TekTok TI. | Prof. Fabio Gouvêa Cabral T.</div>
          <div className="flex items-center justify-center gap-3">
            <a 
              href="https://instagram.com/sparky.aventura" 
              target="_blank" 
              rel="noreferrer"
              className="hover:text-pink-500 transition"
            >
              @sparky.aventura
            </a>
            <span>•</span>
            <a 
              href="mailto:robotix28@gmail.com?subject=Contato%20Sparky%20App" 
              className="hover:text-blue-500 transition"
            >
              Suporte
            </a>
          </div>
        </footer>
      </div>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl p-8 max-w-lg w-full relative shadow-2xl border border-slate-200 max-h-[80vh] overflow-y-auto">
              <button 
                onClick={() => setShowAbout(false)}
                className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500 transition"
              >
                 <X size={24} />
              </button>

              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                 <Sparkles className="text-yellow-400 fill-yellow-400" size={24} /> Sobre o Sparky
              </h2>

              <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
                 <div>
                    <h3 className="font-bold text-slate-800 mb-1">Jogos Educacionais que Empolgam</h3>
                    <p>
                       Motive seus alunos e filhos com nossa coleção de desafios pedagógicos. Construímos habilidades em raciocínio lógico, sequenciamento e programação.
                    </p>
                 </div>

                 <div>
                    <h3 className="font-bold text-slate-800 mb-1">Aprendizado Interativo</h3>
                    <p>
                       Com nossa variedade de fases, seu filho se diverte enquanto desenvolve competências essenciais, preparando-o para o futuro digital.
                    </p>
                 </div>

                 <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-blue-800 text-xs font-bold uppercase mb-1">Nossa Missão</p>
                    <p>Aprender a programar deve ser tão natural e divertido quanto brincar de blocos.</p>
                 </div>

                 <div className="flex justify-center pt-2">
                     <a 
                       href="https://instagram.com/sparky.aventura"
                       target="_blank" 
                       rel="noreferrer" 
                       className="inline-flex items-center gap-2 text-pink-600 font-bold hover:underline text-sm"
                     >
                        <Instagram size={16} /> Siga @sparky.aventura
                     </a>
                 </div>
              </div>

              <div className="mt-6">
                 <Button onClick={() => setShowAbout(false)} className="w-full" variant="secondary">
                    Voltar
                 </Button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};
