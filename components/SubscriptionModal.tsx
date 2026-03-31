import React from 'react';
import { Button } from './Button';
import { Check, Zap, Crown, ShieldCheck, BookOpen, GraduationCap, Heart, Gift } from 'lucide-react';
import { SubscriptionTier } from '../types';
import { PLANS } from '../constants';

interface SubscriptionModalProps {
  userTier: SubscriptionTier;
  onCheckoutStart: (tier: SubscriptionTier) => void;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ userTier, onCheckoutStart, onClose }) => {
  const starter = PLANS[SubscriptionTier.STARTER];
  const pro = PLANS[SubscriptionTier.PRO];

  const isStarter = userTier === SubscriptionTier.STARTER;
  const isPro = userTier === SubscriptionTier.PRO;

  return (
    <div className="fixed inset-0 z-[90] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-5xl flex flex-col items-center py-10">
        
        {/* Playful Header */}
        <div className="text-center mb-10 animate-fadeIn">
            <div className="inline-flex items-center justify-center p-3 bg-yellow-400 rounded-2xl mb-4 shadow-lg shadow-yellow-400/20">
                <Gift size={32} className="text-yellow-900" />
            </div>
            <h2 className="text-4xl md:text-5xl font-heading text-white mb-2 drop-shadow-sm">Novas Aventuras!</h2>
            <p className="text-slate-300 font-bold max-w-md mx-auto">
               Desbloqueie todos os mundos e dê ao seu pequeno as ferramentas para ser um gênio da lógica.
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-3xl">
          
          {/* STARTER CARD */}
          <div className="group bg-gradient-to-b from-cyan-500 to-cyan-700 rounded-[2.5rem] p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
             <div className="absolute top-0 right-0 p-6 opacity-10">
                <Zap size={120} />
             </div>

             <div className="bg-white/20 p-4 rounded-3xl mb-6 backdrop-blur-sm">
                <Zap size={32} className="text-white" fill="currentColor" />
             </div>

             <h3 className="font-heading text-2xl text-white mb-1">{starter.title}</h3>
             <p className="text-cyan-100 text-sm font-bold opacity-80 mb-4">Mundo da Floresta + Padrões</p>
             
             <div className="text-4xl font-black text-white mb-1">R$ {starter.priceLabel}</div>
             <div className="text-[10px] text-cyan-200 font-bold uppercase tracking-widest mb-6">Pagamento Único</div>

             <ul className="flex-1 space-y-3 text-sm text-white font-bold mb-8 w-full text-left">
                {starter.features.map((feature, i) => (
                   <li key={i} className="flex gap-3 items-start">
                      <div className="bg-white/20 rounded-full p-1 mt-0.5"><Check className="text-white shrink-0" size={14} /></div>
                      {feature}
                   </li>
                ))}
             </ul>

             <Button 
                variant="primary" 
                onClick={() => onCheckoutStart(SubscriptionTier.STARTER)} 
                disabled={isStarter || isPro}
                size="lg" 
                className="w-full mt-auto rounded-2xl shadow-xl shadow-cyan-900/40 bg-white text-cyan-700 hover:bg-cyan-50 border-0 py-4"
              >
                {isStarter || isPro ? "Trilha Ativa" : "Mundo da Floresta"}
              </Button>
          </div>

          {/* PRO CARD (MOST POPULAR / BEST VALUE) */}
          <div className="group bg-gradient-to-b from-violet-500 to-violet-700 rounded-[2.5rem] p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden transform hover:scale-[1.05] transition-all duration-300 ring-4 ring-yellow-400 ring-offset-4 ring-offset-slate-900">
             <div className="absolute -top-3 bg-yellow-400 text-yellow-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm z-20">
                O Melhor Investimento
             </div>
             
             <div className="absolute top-0 right-0 p-6 opacity-10">
                <Crown size={120} />
             </div>

             <div className="bg-white/20 p-4 rounded-3xl mb-6 backdrop-blur-sm">
                <Crown size={32} className="text-white" fill="currentColor" />
             </div>

             <h3 className="font-heading text-2xl text-white mb-1">{pro.title}</h3>
             <p className="text-violet-100 text-sm font-bold opacity-80 mb-4">Acesso Vitalício Completo</p>

             <div className="text-4xl font-black text-white mb-1">R$ {pro.priceLabel}</div>
             <div className="text-[10px] text-violet-200 font-bold uppercase tracking-widest mb-6">Todos os Mundos Liberados</div>

             <ul className="flex-1 space-y-3 text-sm text-white font-bold mb-8 w-full text-left">
                {pro.features.map((feature, i) => (
                   <li key={i} className="flex gap-3 items-start">
                      <div className="bg-white/20 rounded-full p-1 mt-0.5"><Check className="text-white shrink-0" size={14} /></div>
                      {feature}
                   </li>
                ))}
             </ul>

             <Button 
                variant="success" 
                onClick={() => onCheckoutStart(SubscriptionTier.PRO)} 
                disabled={isPro}
                size="lg" 
                className="w-full mt-auto rounded-2xl shadow-xl shadow-slate-900/60 bg-green-400 text-green-900 hover:bg-green-300 border-0 py-4 flex items-center justify-center gap-2"
              >
                {isPro ? <Check size={20} /> : <Zap size={20} />}
                {isPro ? "Trilha Ativa" : isStarter ? "Tornar-se Mestre" : "Liberar Tudo"}
              </Button>
          </div>

        </div>

        {/* Parents Section: The "Logical" side for adults */}
        <div className="mt-16 w-full max-w-4xl bg-white/5 backdrop-blur-sm border border-white/10 rounded-[2rem] p-8 md:p-10 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-20 h-20 bg-indigo-500/20 rounded-3xl flex items-center justify-center text-indigo-400">
                    <ShieldCheck size={40} />
                </div>
                <div className="flex-1">
                    <h4 className="text-xl font-heading text-white mb-2 underline decoration-indigo-500">Espaço Seguro para Pais</h4>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                        O Sparky é projetado por educadores para transformar o tempo de tela em desenvolvimento cognitivo real. Sem anúncios, sem compras ocultas, apenas aprendizado.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase">
                            <BookOpen size={16} /> 100% Didático
                        </div>
                        <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase">
                            <GraduationCap size={16} /> Lógica STEM
                        </div>
                        <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase">
                            <ShieldCheck size={16} /> Seguro (Ads Free)
                        </div>
                        <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase">
                            <Heart size={16} /> Feito com Amor
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <button onClick={onClose} className="mt-10 text-white/30 hover:text-white transition-colors font-bold text-xs uppercase tracking-[0.2em] py-2 px-4 border border-white/10 rounded-full">
          Continuar explorando o mundo atual
        </button>
      </div>
    </div>
  );
};