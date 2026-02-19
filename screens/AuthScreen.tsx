
import React, { useState } from 'react';
import { Button } from '../components/Button';
import { UserProfile, SubscriptionTier } from '../types';
import { User, Lock, Gamepad2, PlayCircle, LogIn, UserPlus } from 'lucide-react';
import { SparkyLogo } from '../components/SparkyLogo';
import toast from 'react-hot-toast';

interface AuthScreenProps {
  onLogin: (user: UserProfile) => void;
}

type AuthMode = 'login' | 'register';

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('register');
  
  // Form States
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  
  const [error, setError] = useState('');

  // Helper para gerar ID consistente (Simulando Backend)
  const generateUserId = (username: string) => {
      return 'user_' + username.toLowerCase().trim().replace(/\s+/g, '');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const userId = generateUserId(name);
    const storageKey = `sparky_user_${userId}`;
    const storedData = localStorage.getItem(storageKey);

    if (!storedData) {
        setError('Usuário não encontrado. Verifique o nome ou crie uma conta.');
        return;
    }

    try {
        const user: UserProfile = JSON.parse(storedData);
        
        // Verificação de Senha (Simples para Demo)
        if (user.password && user.password !== password) {
            setError('Senha incorreta.');
            return;
        }

        // Login Sucesso
        onLogin({ ...user, lastActive: Date.now() });
    } catch (err) {
        setError('Erro ao ler dados do usuário.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const userId = generateUserId(name);
    const storageKey = `sparky_user_${userId}`;

    // Verifica se já existe
    if (localStorage.getItem(storageKey)) {
        setError('Este nome de usuário já existe. Tente outro ou faça login.');
        return;
    }

    if (password.length < 4) {
        setError('A senha deve ter pelo menos 4 caracteres.');
        return;
    }

    // Cria novo usuário
    const newUser: UserProfile = {
      id: userId,
      name: name.trim(),
      password: password, // Persiste a senha
      parentEmail: parentEmail || 'pai@exemplo.com',
      age: parseInt(age) || 7,
      subscription: SubscriptionTier.FREE, 
      progress: {
        unlockedLevels: 1, 
        stars: 0,          
        creativeProjects: 0,
        totalBlocksUsed: 0, 
        secretsFound: 0
      },
      settings: {
        soundEnabled: true,
        musicEnabled: true
      },
      isGuest: false,
      lastActive: Date.now()
    };

    // Salva "no banco" (LocalStorage)
    localStorage.setItem(storageKey, JSON.stringify(newUser));
    
    // Autentica
    onLogin(newUser);
  };

  const handleGuestPlay = () => {
    const guestUser: UserProfile = {
      id: 'guest_' + Date.now(),
      name: 'Visitante',
      parentEmail: '',
      age: 7, 
      subscription: SubscriptionTier.FREE,
      progress: {
        unlockedLevels: 1,
        stars: 0,
        creativeProjects: 0,
        totalBlocksUsed: 0,
        secretsFound: 0
      },
      settings: {
        soundEnabled: true,
        musicEnabled: true
      },
      isGuest: true
    };
    onLogin(guestUser);
  };

  const toggleMode = (mode: AuthMode) => {
      setAuthMode(mode);
      setError('');
      setPassword('');
  };

  return (
    <div className="min-h-full w-full bg-indigo-500 flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] py-12">
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col">
        {/* Decor */}
        <div className={`absolute top-0 left-0 w-full h-4 bg-gradient-to-r transition-colors duration-500 from-blue-400 via-purple-400 to-yellow-400`} />
        
        <div className="flex flex-col items-center mb-6">
           <div className="transform hover:scale-105 transition-transform duration-300">
             <SparkyLogo size="lg" />
           </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button 
                onClick={() => toggleMode('login')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${authMode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <LogIn size={16} /> Entrar
            </button>
            <button 
                onClick={() => toggleMode('register')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${authMode === 'register' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <UserPlus size={16} /> Criar Conta
            </button>
        </div>

        <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
          
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1 ml-2">Nome de Usuário (Criança)</label>
            <div className="relative">
               <User className="absolute left-4 top-3.5 text-slate-400" size={20} />
               <input 
                 type="text" 
                 value={name}
                 onChange={e => setName(e.target.value)}
                 className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 pl-12 font-bold text-slate-700 focus:border-indigo-400 outline-none transition"
                 placeholder="Ex: supermario"
                 required
               />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1 ml-2">Senha Secreta</label>
            <div className="relative">
               <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
               <input 
                 type="password" 
                 value={password}
                 onChange={e => setPassword(e.target.value)}
                 className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 pl-12 font-bold text-slate-700 focus:border-indigo-400 outline-none transition"
                 placeholder="****"
                 required
               />
            </div>
          </div>

          {authMode === 'register' && (
            <div className="animate-fadeIn space-y-4">
                <div>
                <label className="block text-sm font-bold text-slate-600 mb-1 ml-2">Idade</label>
                <input 
                    type="number" 
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 font-bold text-slate-700 focus:border-indigo-400 outline-none transition"
                    placeholder="Ex: 8"
                    min="5"
                    max="16"
                    required
                />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1 ml-2">Email do Responsável</label>
                    <div className="relative">
                    <input 
                        type="email" 
                        value={parentEmail}
                        onChange={e => setParentEmail(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 font-bold text-slate-700 focus:border-indigo-400 outline-none transition"
                        placeholder="pai@email.com"
                        required
                    />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 ml-2">Para recuperar senha e receber relatórios.</p>
                </div>
            </div>
          )}

          {error && (
              <div className="bg-red-50 text-red-600 text-sm font-bold p-3 rounded-xl border border-red-100 text-center animate-shake">
                  {error}
              </div>
          )}

          <Button 
            variant={'primary'} 
            size="lg" 
            className={`w-full mt-4`}
          >
             {authMode === 'login' ? 'Continuar Aventura' : 'Começar Aventura'}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-4">
           <div className="h-px bg-slate-200 flex-1" />
           <span className="text-slate-400 text-xs font-bold uppercase">OU</span>
           <div className="h-px bg-slate-200 flex-1" />
        </div>

        <button 
          onClick={handleGuestPlay}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm touch-manipulation"
        >
           <Gamepad2 size={18} /> Testar como Visitante (Sem salvar)
        </button>

      </div>
    </div>
  );
};
