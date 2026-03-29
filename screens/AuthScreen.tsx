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
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-indigo-600 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
      
      {/* Background Patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #ffffff 2px, transparent 2px)', backgroundSize: '30px 30px' }}>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-10 left-10 text-yellow-300 animate-bounce delay-700 opacity-60"><Code size={48} /></div>
      <div className="absolute bottom-20 right-10 text-blue-200 animate-pulse delay-300 opacity-60"><Star size={64} /></div>
      <div className="absolute top-1/3 right-10 text-white animate-spin-slow opacity-20"><Sparkles size={80} /></div>

      <div className="bg-white/95 backdrop-blur-xl p-8 md:p-16 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-8 border-white max-w-2xl w-full relative z-10 transform hover:scale-[1.01] transition-transform duration-500 mb-20 md:mb-10">
        
        {/* Logo Section */}
        <div className="mb-10 animate-float flex justify-center">
            <div 
              className="transform hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={handleLogoClick}
              title="A aventura começa aqui!"
            >
              <SparkyLogo size="xl" />
            </div>
        </div>

        <div className="space-y-6">
            <h2 className="text-xl md:text-2xl text-slate-500 font-bold uppercase tracking-widest">
              Login do Explorador
            </h2>

            <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-md mx-auto">
              Bem-vindo à maior jornada de programação! Entre com suas credenciais para continuar a aventura.
            </p>

            <form onSubmit={handleLogin} className="space-y-4 mt-8">
              
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2 ml-2">Qual seu Nome de Explorador?</label>
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
                <label className="block text-sm font-bold text-slate-600 mb-2 ml-2">Senha do Jogador</label>
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
                className={`w-full mt-6 flex items-center justify-center gap-2 px-12 py-5 text-xl shadow-blue-300 shadow-xl hover:shadow-2xl scale-105 hover:scale-110 transition-all`}
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

            <div className="flex gap-4 items-center justify-center mt-4">
               <button 
                 onClick={() => setShowAbout(true)}
                 className="text-slate-400 font-bold text-sm hover:text-blue-500 flex items-center gap-1 transition"
               >
                  <Info size={16} /> Saiba Mais
               </button>
            </div>
        </div>
      </div>
      
      {/* Footer - Ajustado para Alta Visibilidade */}
      <footer className="absolute bottom-6 w-full px-4 flex justify-center z-50 pointer-events-none">
        <div className="pointer-events-auto flex flex-col md:flex-row items-center justify-center gap-y-2 gap-x-6 text-[11px] md:text-xs font-bold text-white bg-slate-900/90 px-8 py-3 rounded-full backdrop-blur-md shadow-2xl border border-white/20 text-center hover:bg-black transition-colors">
           
           <div className="flex items-center gap-1">
             <span>© {currentYear} TekTok TI.</span>
           </div>
           
           <span className="hidden md:inline opacity-30 text-white">|</span>

           <div className="flex items-center gap-1">
             <span>Criado por: Prof. Fabio Gouvêa Cabral T.</span>
           </div>

           <span className="hidden md:inline opacity-30 text-white">|</span>
           
           <a 
             href="https://instagram.com/sparky.aventura" 
             target="_blank" 
             rel="noreferrer"
             className="flex items-center gap-1.5 text-pink-300 hover:text-white hover:scale-105 transition cursor-pointer group bg-pink-500/10 px-2 py-0.5 rounded-lg border border-pink-500/20"
           >
             <Instagram size={14} className="group-hover:rotate-12 transition" />
             <span>@sparky.aventura</span>
           </a>

           <span className="hidden md:inline opacity-30 text-white">|</span>

           <div className="flex items-center gap-1 text-slate-300">
             <ShieldCheck size={12} />
             <span>CNPJ 14.773.860/0001-72</span>
           </div>
           
           <span className="hidden md:inline opacity-30 text-white">|</span>
           
           <a 
             href="mailto:robotix28@gmail.com?subject=Contato%20Sparky%20App" 
             className="flex items-center gap-1 hover:text-blue-300 hover:underline transition cursor-pointer text-slate-300"
           >
             <Mail size={12} />
             <span>Suporte</span>
           </a>
        </div>
      </footer>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
           <div className="bg-white rounded-3xl p-8 max-w-lg w-full relative shadow-2xl border-4 border-blue-200 max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setShowAbout(false)}
                className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500 transition"
              >
                 <X size={24} />
              </button>

              <h2 className="text-2xl font-heading text-indigo-900 mb-6 flex items-center gap-2">
                 <Sparkles className="text-yellow-400 fill-yellow-400" /> Sobre o Sparky
              </h2>

              <div className="space-y-6 text-slate-600 leading-relaxed text-sm md:text-base">
                 <div>
                    <h3 className="font-bold text-lg text-slate-800 mb-2">Jogos Educacionais que Empolgam</h3>
                    <p>
                       Motive seus alunos e filhos com nossa coleção de desafios pedagógicos. 
                       Com atividades ideais para o ensino fundamental, construímos habilidades fundamentais 
                       em raciocínio lógico, sequenciamento e programação básica. 
                       Abandone as lições secas e deixe que os jogos transformem o estudo em uma aventura 
                       que as crianças vão querer repetir!
                    </p>
                 </div>

                 <div>
                    <h3 className="font-bold text-lg text-slate-800 mb-2">Aprendizado Interativo</h3>
                    <p>
                       Com nossa variedade de fases, seu filho se diverte enquanto desenvolve competências essenciais.
                       Seja iniciando a jornada educacional ou avançando para desafios complexos, o Sparky oferece 
                       prática e reforço positivo. Introduzimos conceitos importantes de forma acessível, 
                       como reconhecimento de padrões e algoritmos, preparando os jovens para o futuro digital.
                    </p>
                 </div>

                 <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <h4 className="font-bold text-indigo-900 mb-2 text-xs uppercase tracking-wider">Nossa Missão</h4>
                    <p className="text-indigo-800 text-sm">
                       Acreditamos que aprender a programar deve ser tão natural e divertido quanto brincar de blocos.
                       Acompanhe o crescimento do seu pequeno gênio enquanto ele define novos recordes!
                    </p>
                 </div>

                 <div className="flex justify-center pt-4">
                     <a 
                       href="https://instagram.com/sparky.aventura"
                       target="_blank" 
                       rel="noreferrer" 
                       className="inline-flex items-center gap-2 text-pink-600 font-bold hover:underline bg-pink-50 px-6 py-3 rounded-full shadow-sm hover:shadow-md transition"
                     >
                        <Instagram size={20} /> Siga @sparky.aventura
                     </a>
                 </div>
              </div>

              <div className="mt-8">
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
