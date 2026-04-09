import React, { useState } from 'react';
import { Button } from '../components/Button';
import { UserProfile, SubscriptionTier } from '../types';
import { User, Lock, Gamepad2, LogIn, Code, Sparkles, Star, ShieldCheck, Mail, Instagram, Info, X } from 'lucide-react';
import { SparkyLogo } from '../components/SparkyLogo';
import { userService } from '../services/userService';

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
            const data = await userService.getUserByUsername(cleanUsername);
            
            if (!data) {
                setError('Usuário não localizado no sistema. Verifique o nome digitado.');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex flex-col items-center justify-center p-4 py-12 relative scrollable-y">
      {/* Colorful animated background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="mb-10 flex flex-col items-center justify-center">
            <div 
              className="transform hover:scale-125 transition-transform duration-300 cursor-pointer mb-6 drop-shadow-2xl animate-bounce"
              onClick={handleLogoClick}
              title="A aventura começa aqui!"
            >
              <SparkyLogo size="lg" />
            </div>
            <p className="text-center text-white font-black text-2xl tracking-widest uppercase drop-shadow-lg">
              Code Adventure
            </p>
            <p className="text-center text-white/80 font-bold text-sm mt-1 drop-shadow">Explore, Aprenda, Crie!</p>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl border-0 backdrop-blur-xl">
          
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-center mb-2 uppercase tracking-tight">
            Bem-vindo!
          </h1>

          <p className="text-center text-gray-700 text-sm md:text-base mb-8 leading-relaxed font-semibold">
            Faça login para continuar sua jornada épica!
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Qual seu Nome de Explorador?</label>
              <div className="relative">
                 <User className="absolute left-4 top-4 text-purple-500" size={20} />
                 <input 
                   type="text" 
                   value={name}
                   onChange={e => setName(e.target.value)}
                   className="w-full bg-gray-100 border-3 border-purple-200 rounded-2xl p-3 pl-12 font-medium text-gray-900 focus:border-purple-500 focus:outline-none focus:bg-white transition placeholder-gray-500"
                   placeholder="Ex: Pedro123"
                   required
                   disabled={loading}
                 />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Senha do Jogador</label>
              <div className="relative">
                 <Lock className="absolute left-4 top-4 text-purple-500" size={20} />
                 <input 
                   type="password" 
                   value={password}
                   onChange={e => setPassword(e.target.value)}
                   className="w-full bg-gray-100 border-3 border-purple-200 rounded-2xl p-3 pl-12 font-medium text-gray-900 focus:border-purple-500 focus:outline-none focus:bg-white transition placeholder-gray-500"
                   placeholder="Digite a senha liberada"
                   required
                   disabled={loading}
                 />
              </div>
            </div>

            {error && (
                <div className="bg-red-100 text-red-700 text-sm font-bold p-4 rounded-2xl border-3 border-red-300 text-center">
                    {error}
                </div>
            )}

            <Button 
              variant={'primary'} 
              size="lg" 
              className={`w-full mt-6 flex items-center justify-center gap-2 py-4 text-base font-bold rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg`}
              disabled={loading}
            >
               <LogIn size={20} /> {loading ? 'Sincronizando...' : 'ENTRAR NO JOGO'}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-4">
             <div className="h-px bg-gray-300 flex-1" />
             <span className="text-gray-500 text-xs font-bold uppercase">OU</span>
             <div className="h-px bg-gray-300 flex-1" />
          </div>

          <button 
            onClick={handleGuestPlay}
            className="w-full bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 rounded-2xl transition border-0 flex items-center justify-center gap-2 text-base shadow-lg"
            disabled={loading}
          >
             <Gamepad2 size={20} /> JOGAR VERSÃO GRÁTIS
          </button>

          <div className="flex gap-4 items-center justify-center mt-6 pt-4 border-t-3 border-gray-200">
             <button 
               onClick={() => setShowAbout(true)}
               className="text-purple-600 font-bold text-sm hover:text-purple-700 flex items-center gap-1 transition"
             >
                <Info size={16} /> Saiba Mais
             </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-white/90 space-y-2 drop-shadow-lg">
          <div className="font-semibold">© {currentYear} TekTok TI. | Prof. Fabio Gouvêa Cabral T.</div>
          <div className="flex items-center justify-center gap-3">
            <a 
              href="https://instagram.com/sparky.aventura" 
              target="_blank" 
              rel="noreferrer"
              className="hover:text-white transition font-semibold"
            >
              @sparky.aventura
            </a>
            <span>•</span>
            <a 
              href="mailto:robotix28@gmail.com?subject=Contato%20Sparky%20App" 
              className="hover:text-white transition font-semibold"
            >
              Suporte
            </a>
          </div>
        </footer>
      </div>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl p-8 max-w-lg w-full relative shadow-2xl border-0 max-h-[80vh] overflow-y-auto">
              <button 
                onClick={() => setShowAbout(false)}
                className="absolute top-4 right-4 p-2 bg-gray-200 rounded-full hover:bg-gray-300 text-gray-600 transition"
              >
                 <X size={24} />
              </button>

              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6 flex items-center gap-2">
                 <Sparkles className="text-purple-500" size={28} /> Sobre o Sparky
              </h2>

              <div className="space-y-5 text-gray-800 leading-relaxed text-sm">
                 <div>
                    <h3 className="font-bold text-lg text-purple-600 mb-2">🎮 Jogos Educacionais que Empolgam</h3>
                    <p>
                       Motive seus alunos e filhos com nossa coleção de desafios pedagógicos. Construímos habilidades em raciocínio lógico, sequenciamento e programação.
                    </p>
                 </div>

                 <div>
                    <h3 className="font-bold text-lg text-blue-600 mb-2">✨ Aprendizado Interativo</h3>
                    <p>
                       Com nossa variedade de fases, seu filho se diverte enquanto desenvolve competências essenciais, preparando-o para o futuro digital.
                    </p>
                 </div>

                 <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-4 rounded-2xl border-3 border-pink-300">
                    <p className="text-pink-700 text-xs font-black uppercase mb-2">🎯 Nossa Missão</p>
                    <p className="text-gray-800 font-semibold">Aprender a programar deve ser tão natural e divertido quanto brincar de blocos.</p>
                 </div>

                 <div className="flex justify-center pt-3">
                     <a 
                       href="https://instagram.com/sparky.aventura"
                       target="_blank" 
                       rel="noreferrer" 
                       className="inline-flex items-center gap-2 text-purple-600 font-black hover:text-purple-700 transition text-base"
                     >
                        <Instagram size={18} /> Siga @sparky.aventura
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
