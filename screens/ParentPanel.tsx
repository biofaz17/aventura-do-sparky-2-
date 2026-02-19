import React, { useState } from 'react';
import { Button } from '../components/Button';
import { UserProfile, SubscriptionTier, UserSettings } from '../types';
import { PLANS } from '../constants';
import { 
  BarChart3, Clock, Brain, ArrowLeft, User, CreditCard, 
  Settings, LogOut, ShieldCheck, CheckCircle, AlertCircle, Volume2, Music,
  Building2, Mail
} from 'lucide-react';

interface ParentPanelProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onLogout: () => void;
  onBack: () => void;
  onRequestUpgrade: () => void;
}

type Tab = 'overview' | 'profile' | 'subscription' | 'settings';

export const ParentPanel: React.FC<ParentPanelProps> = ({ 
  user, 
  onUpdateUser, 
  onLogout, 
  onBack,
  onRequestUpgrade
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Local state for profile editing form
  const [editName, setEditName] = useState(user.name);
  const [editAge, setEditAge] = useState(user.age.toString());
  const [saveMessage, setSaveMessage] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name: editName,
      age: parseInt(editAge) || user.age
    });
    setSaveMessage('Perfil atualizado com sucesso!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const toggleSetting = (key: keyof UserSettings) => {
    onUpdateUser({
      ...user,
      settings: {
        ...user.settings,
        [key]: !user.settings[key]
      }
    });
  };

  const plan = PLANS[user.subscription] || { title: 'Gratuito', priceLabel: '0,00' };
  const isFree = user.subscription === SubscriptionTier.FREE;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
           <button onClick={onBack} className="bg-slate-100 p-2 rounded-lg hover:bg-slate-200 transition text-slate-600">
             <ArrowLeft size={20} />
           </button>
           <h1 className="font-heading text-xl text-indigo-900 leading-none">
             Minha Conta
           </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
           <NavButton 
             active={activeTab === 'overview'} 
             onClick={() => setActiveTab('overview')} 
             icon={<BarChart3 size={20} />} 
             label="Visão Geral" 
           />
           <NavButton 
             active={activeTab === 'profile'} 
             onClick={() => setActiveTab('profile')} 
             icon={<User size={20} />} 
             label="Perfil do Aluno" 
           />
           <NavButton 
             active={activeTab === 'subscription'} 
             onClick={() => setActiveTab('subscription')} 
             icon={<CreditCard size={20} />} 
             label="Assinatura" 
           />
           <NavButton 
             active={activeTab === 'settings'} 
             onClick={() => setActiveTab('settings')} 
             icon={<Settings size={20} />} 
             label="Configurações" 
           />
        </nav>

        <div className="p-4 border-t border-slate-100">
           <div className="flex items-center gap-3 px-4 py-3 bg-indigo-50 rounded-xl mb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center font-bold text-indigo-700">
                 {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                 <p className="text-sm font-bold text-indigo-900 truncate">{user.name}</p>
                 <p className="text-xs text-indigo-600 truncate">{user.subscription === 'FREE' ? 'Plano Grátis' : `Plano ${plan.title}`}</p>
              </div>
           </div>
           <button 
             onClick={onLogout}
             className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-bold"
           >
             <LogOut size={18} /> Sair da Conta
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          
          {/* TAB: VISÃO GERAL */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fadeIn">
               <div>
                 <h2 className="text-2xl font-bold text-slate-800 mb-2">Progresso de Aprendizado</h2>
                 <p className="text-slate-500">Acompanhe o desenvolvimento lógico de {user.name}.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard 
                    title="Níveis Completos" 
                    value={user.progress.unlockedLevels - 1} 
                    icon={<CheckCircle className="text-green-500" />} 
                    color="bg-green-50 border-green-200"
                  />
                  <StatCard 
                    title="Estrelas Coletadas" 
                    value={user.progress.stars} 
                    icon={<Brain className="text-yellow-500" />} 
                    color="bg-yellow-50 border-yellow-200"
                  />
                  <StatCard 
                    title="Projetos Criativos" 
                    value={user.progress.creativeProjects} 
                    icon={<Clock className="text-purple-500" />} 
                    color="bg-purple-50 border-purple-200"
                  />
               </div>

               <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <ShieldCheck className="text-indigo-600" /> Competências da BNCC
                  </h3>
                  <div className="space-y-4">
                     <SkillBar label="Pensamento Algorítmico" percentage={user.progress.unlockedLevels * 10} color="bg-blue-500" />
                     <SkillBar label="Depuração (Debugging)" percentage={Math.min(100, user.progress.stars * 5)} color="bg-orange-500" />
                     <SkillBar label="Criatividade Digital" percentage={Math.min(100, user.progress.creativeProjects * 15)} color="bg-purple-500" />
                  </div>
               </div>
            </div>
          )}

          {/* TAB: PERFIL */}
          {activeTab === 'profile' && (
             <div className="max-w-lg animate-fadeIn">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Editar Perfil</h2>
                
                <form onSubmit={handleSaveProfile} className="space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                   <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Nome da Criança</label>
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-indigo-500 outline-none transition font-medium"
                      />
                   </div>
                   
                   <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Idade</label>
                      <input 
                        type="number" 
                        value={editAge}
                        onChange={(e) => setEditAge(e.target.value)}
                        min="5" max="16"
                        className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-indigo-500 outline-none transition font-medium"
                      />
                      <p className="text-xs text-slate-400 mt-2">A idade define a dificuldade inicial recomendada.</p>
                   </div>

                   <div className="pt-4">
                      <Button type="submit" variant="primary" className="w-full">Salvar Alterações</Button>
                   </div>
                   
                   {saveMessage && (
                      <div className="bg-green-100 text-green-700 p-3 rounded-lg text-center text-sm font-bold animate-pulse">
                         {saveMessage}
                      </div>
                   )}
                </form>
             </div>
          )}

          {/* TAB: ASSINATURA */}
          {activeTab === 'subscription' && (
             <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Gerenciar Assinatura</h2>
                  <p className="text-slate-500">Detalhes do seu plano atual e faturamento.</p>
                </div>

                <div className={`
                   rounded-2xl p-8 border-2 relative overflow-hidden
                   ${isFree ? 'bg-slate-100 border-slate-200' : 
                     'bg-gradient-to-br from-indigo-600 to-purple-600 border-indigo-500 text-white'}
                `}>
                   <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div>
                         <div className="uppercase tracking-wider text-xs font-bold opacity-70 mb-1">Plano Atual</div>
                         <h3 className="text-3xl font-heading mb-2">{isFree ? 'Explorador (Grátis)' : `Sparky ${plan.title}`}</h3>
                         <p className={`text-sm ${isFree ? 'text-slate-500' : 'text-indigo-100'}`}>
                            {isFree 
                               ? 'Acesso limitado aos níveis iniciais.' 
                               : 'Acesso Vitalício Garantido. Sem pagamentos futuros.'
                            }
                         </p>
                      </div>
                      
                      {isFree ? (
                         <Button onClick={onRequestUpgrade} variant="success" className="shadow-xl">
                            Fazer Upgrade Agora
                         </Button>
                      ) : (
                         <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30 text-sm font-bold">
                            Assinatura Vitalícia
                         </div>
                      )}
                   </div>
                </div>

                {!isFree && (
                   <div className="bg-white rounded-2xl border border-slate-200 p-6">
                      <h4 className="font-bold text-slate-800 mb-4">Informações de Pagamento</h4>
                      <div className="flex items-center gap-4 text-slate-600 bg-green-50 p-4 rounded-xl border border-green-100">
                         <CheckCircle className="text-green-500" size={24} />
                         <span className="flex-1 font-bold">Pagamento Único Realizado</span>
                         <span className="text-xs font-bold bg-green-200 text-green-800 px-2 py-1 rounded">VITALÍCIO</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Você tem acesso permanente a todo o conteúdo do plano {plan.title}.</p>
                   </div>
                )}

                {isFree && (
                   <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex gap-3">
                         <AlertCircle className="text-yellow-600 flex-shrink-0" />
                         <div>
                            <h4 className="font-bold text-yellow-800">Liberar Modo Criativo?</h4>
                            <p className="text-sm text-yellow-700 mt-1">O plano Starter libera criações ilimitadas com um único pagamento.</p>
                         </div>
                      </div>
                   </div>
                )}
             </div>
          )}

          {/* TAB: CONFIGURAÇÕES */}
          {activeTab === 'settings' && (
             <div className="max-w-xl animate-fadeIn">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Preferências do App</h2>
                
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                   <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
                            <Volume2 size={24} />
                         </div>
                         <div>
                            <h4 className="font-bold text-slate-800">Efeitos Sonoros</h4>
                            <p className="text-xs text-slate-500">Sons de pulo, vitória e erro.</p>
                         </div>
                      </div>
                      <Toggle 
                        active={user.settings.soundEnabled} 
                        onToggle={() => toggleSetting('soundEnabled')} 
                      />
                   </div>

                   <div className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                            <Music size={24} />
                         </div>
                         <div>
                            <h4 className="font-bold text-slate-800">Música de Fundo</h4>
                            <p className="text-xs text-slate-500">Música ambiente durante os níveis.</p>
                         </div>
                      </div>
                      <Toggle 
                        active={user.settings.musicEnabled} 
                        onToggle={() => toggleSetting('musicEnabled')} 
                      />
                   </div>
                </div>

                {/* Company & Support Section */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Sobre o Desenvolvedor</h3>
                    <div className="flex items-start gap-4">
                        <div className="bg-slate-100 p-3 rounded-full">
                            <Building2 className="text-slate-600" size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800">TekTok TI</h4>
                            <p className="text-xs text-slate-500 mb-1">CNPJ: 14.773.860/0001-72</p>
                            <a 
                                href="mailto:robotix28@gmail.com?subject=Suporte%20Sparky" 
                                className="inline-flex items-center gap-1.5 text-sm text-indigo-600 font-bold hover:underline mt-2 bg-indigo-50 px-3 py-1.5 rounded-lg transition"
                            >
                                <Mail size={14} /> Fale com nosso Suporte
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                   <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Zona de Perigo</h3>
                   <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex items-center justify-between">
                      <div>
                         <h4 className="font-bold text-red-700">Apagar Todo o Progresso</h4>
                         <p className="text-xs text-red-600 mt-1">Isso resetará níveis e estrelas. Não pode ser desfeito.</p>
                      </div>
                      <button className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition">
                         Resetar
                      </button>
                   </div>
                </div>
             </div>
          )}

        </div>
      </main>
    </div>
  );
};

// UI Sub-components for ParentPanel

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm
      ${active 
        ? 'bg-indigo-600 text-white shadow-md' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}
    `}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const StatCard = ({ title, value, icon, color }: any) => (
  <div className={`p-6 rounded-2xl border ${color} flex flex-col items-center text-center shadow-sm`}>
     <div className="mb-2 p-3 bg-slate-50 rounded-full shadow-inner">{icon}</div>
     <div className="text-3xl font-heading text-slate-800 mb-1">{value}</div>
     <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">{title}</div>
  </div>
);

const SkillBar = ({ label, percentage, color }: any) => (
  <div>
     <div className="flex justify-between text-sm font-bold text-slate-700 mb-1">
        <span>{label}</span>
        <span>{percentage}%</span>
     </div>
     <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${color}`} 
          style={{ width: `${percentage}%` }}
        />
     </div>
  </div>
);

const Toggle = ({ active, onToggle }: any) => (
  <button 
    onClick={onToggle}
    className={`
      w-12 h-6 rounded-full p-1 transition-colors duration-300 relative
      ${active ? 'bg-green-500' : 'bg-slate-300'}
    `}
  >
    <div className={`
       w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300
       ${active ? 'translate-x-6' : 'translate-x-0'}
    `} />
  </button>
);