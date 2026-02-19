import React from 'react';
import { Button } from './Button';
import { Gift, Zap, Crown, Star, X, Gamepad2 } from 'lucide-react';

interface MarketingModalProps {
  onUpgrade: () => void;
  onClose: () => void;
}

export const MarketingModal: React.FC<MarketingModalProps> = ({ onUpgrade, onClose }) => {
  
  // Definição das Skins Exclusivas para o Marketing
  const skins = [
    { 
      id: 1, 
      name: "Capitão Byte", 
      role: "O Líder", 
      color: "bg-blue-600", 
      border: "border-blue-800",
      face: "bg-blue-100",
      icon: "🚀" 
    },
    { 
      id: 2, 
      name: "Princesa Pixel", 
      role: "A Criativa", 
      color: "bg-pink-500", 
      border: "border-pink-700",
      face: "bg-pink-100",
      icon: "👑" 
    },
    { 
      id: 3, 
      name: "Ninja Glitch", 
      role: "O Ágil", 
      color: "bg-slate-800", 
      border: "border-slate-950",
      face: "bg-slate-200",
      icon: "🥷" 
    },
    { 
      id: 4, 
      name: "Cyber Ada", 
      role: "A Visionária", 
      color: "bg-cyan-500", 
      border: "border-cyan-700",
      face: "bg-cyan-100",
      icon: "👓" 
    }
  ];

  return (
    <div className="fixed inset-0 z-[70] bg-indigo-900/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-yellow-400">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition z-20"
        >
          <X size={24} />
        </button>

        {/* Header Visual */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 p-8 pt-10 text-center relative overflow-hidden">
           {/* Background Pattern */}
           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
           
           <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 shadow-lg transform -rotate-2">
                <Crown size={16} /> Oferta Exclusiva VIP
              </div>
              <h2 className="text-3xl md:text-5xl font-heading text-white mb-4 leading-tight drop-shadow-md">
                Torne-se uma Lenda do Código!
              </h2>
              <p className="text-indigo-100 font-bold text-lg md:text-xl max-w-xl mx-auto">
                Desbloqueie acesso imediato às 4 Skins Raras e jogue em Níveis Secretos que ninguém mais tem.
              </p>
           </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-10 bg-slate-50">
           
           {/* Skins Showcase Grid */}
           <div className="mb-8">
              <h3 className="text-center text-slate-500 font-bold text-sm uppercase tracking-wider mb-6 flex items-center justify-center gap-2">
                 <Star className="text-yellow-500 fill-yellow-500" size={16} /> 
                 Novos Personagens Disponíveis 
                 <Star className="text-yellow-500 fill-yellow-500" size={16} />
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {skins.map((skin) => (
                    <div key={skin.id} className="group relative bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-400 hover:-translate-y-2 transition-all duration-300 text-center">
                       {/* Robot Mini Visual */}
                       <div className="relative w-16 h-16 mx-auto mb-3">
                          <div className={`absolute inset-0 ${skin.color} rounded-xl border-b-4 ${skin.border} shadow-inner`}></div>
                          {/* Face */}
                          <div className={`absolute top-2 left-2 right-2 bottom-4 ${skin.face} rounded-lg flex items-center justify-center text-xl`}>
                             {/* Eyes */}
                             <div className="flex gap-1">
                                <div className="w-1.5 h-2 bg-slate-800 rounded-full"></div>
                                <div className="w-1.5 h-2 bg-slate-800 rounded-full"></div>
                             </div>
                          </div>
                          {/* Icon/Accessory Badge */}
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-md border-2 border-yellow-400 flex items-center justify-center text-lg animate-bounce-subtle">
                             {skin.icon}
                          </div>
                       </div>
                       
                       <h4 className="font-heading text-slate-800 text-sm leading-none mb-1">{skin.name}</h4>
                       <span className="text-[10px] font-bold text-slate-400 uppercase">{skin.role}</span>
                    </div>
                 ))}
              </div>
           </div>

           {/* Features Split */}
           <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="flex-1 bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm flex items-start gap-4">
                 <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
                    <Zap size={24} />
                 </div>
                 <div>
                    <h4 className="font-bold text-indigo-900 text-lg">Poder Imediato</h4>
                    <p className="text-sm text-slate-600">Sem espera! As skins e recompensas aparecem na sua conta no segundo que você assinar.</p>
                 </div>
              </div>
              
              <div className="flex-1 bg-white p-5 rounded-2xl border border-purple-100 shadow-sm flex items-start gap-4">
                 <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                    <Gamepad2 size={24} />
                 </div>
                 <div>
                    <h4 className="font-bold text-purple-900 text-lg">Níveis Secretos</h4>
                    <p className="text-sm text-slate-600">Acesso exclusivo ao "Mundo Hacker" e desafios que testam sua verdadeira habilidade.</p>
                 </div>
              </div>
           </div>

           {/* Pricing & CTA */}
           <div className="bg-slate-900 rounded-3xl p-6 text-white text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500 rounded-full blur-3xl opacity-20 translate-x-10 -translate-y-10"></div>
              
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">Plano Pro (Melhor Valor)</p>
              <div className="flex justify-center items-end gap-2 mb-6">
                 <span className="text-5xl font-black text-yellow-400">R$ 49,90</span>
                 <span className="text-slate-400 font-bold mb-2">(Único)</span>
              </div>

              <div className="flex flex-col gap-3">
                 <Button onClick={onUpgrade} variant="success" size="lg" className="w-full shadow-lg shadow-green-900/50 py-4 text-xl hover:scale-[1.02]">
                    <Crown className="mr-2" size={24} fill="currentColor" /> DESBLOQUEAR TUDO AGORA
                 </Button>
                 <button onClick={onClose} className="text-slate-500 text-sm font-bold hover:text-white transition mt-2">
                    Não, obrigado. Prefiro jogar sem skins por enquanto.
                 </button>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
};