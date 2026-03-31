import React from 'react';
import { Button } from './Button';
import { Check, Zap, Crown } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-5xl flex flex-col items-center">
        
        <h2 className="text-3xl font-heading text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-300 mb-6">Escolha o Melhor Plano</h2>

        <div className="grid md:grid-cols-3 gap-6 w-full">
          
          {/* FREE */}
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-6 flex flex-col items-center text-center opacity-90 border border-cyan-500/20 hover:opacity-100 transition">
             <h3 className="font-heading text-xl text-cyan-300 mb-4">Explorador</h3>
             <div className="text-3xl font-black text-cyan-300 mb-2">Grátis</div>
             <ul className="flex-1 space-y-3 text-sm text-slate-300 mb-6 w-full text-left pl-4">
               <li className="flex gap-2"><Check size={16} className="text-emerald-400" /> Níveis Básicos</li>
               <li className="flex gap-2"><Check size={16} className="text-emerald-400" /> Modo Criativo Limitado</li>
             </ul>
             <Button variant="secondary" onClick={onClose} size="sm" className="w-full mt-auto">Continuar</Button>
          </div>

          {/* STARTER */}
          <div className="bg-gradient-to-b from-cyan-900/40 to-cyan-950/20 rounded-2xl p-6 flex flex-col items-center text-center border border-cyan-500/50 shadow-xl relative z-10 transform hover:-translate-y-1 transition-transform">
             <Zap size={40} className="text-cyan-400 mb-2" fill="currentColor" />
             <h3 className="font-heading text-xl text-cyan-300 mb-2">{starter.title}</h3>
             <div className="text-3xl font-black text-cyan-400 mb-1">R$ {starter.priceLabel}</div>
             <div className="text-xs text-cyan-300/60 font-bold uppercase tracking-wider mb-2 bg-cyan-500/10 px-2 py-1 rounded">Pagamento Único</div>
             <ul className="flex-1 space-y-3 text-sm text-slate-300 font-bold mb-6 w-full text-left pl-2 mt-4">
               {starter.features.map((feature, i) => (
                  <li key={i} className="flex gap-2 items-start"><Check className="text-emerald-400 shrink-0 mt-0.5" size={16} /> {feature}</li>
               ))}
             </ul>
             <Button 
                variant="primary" 
                onClick={() => onCheckoutStart(SubscriptionTier.STARTER)} 
                disabled={isStarter || isPro}
                size="md" 
                className="w-full mt-auto"
              >
                {isStarter || isPro ? "Sua Trilha Atual" : "Comprar Agora"}
              </Button>
          </div>

          {/* PRO */}
          <div className="bg-gradient-to-b from-violet-900/40 to-violet-950/20 rounded-2xl p-6 flex flex-col items-center text-center border border-violet-500/50 shadow-xl transform hover:-translate-y-1 transition-transform relative">
             <div className="absolute -top-3 bg-violet-600 text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm">
               Recomendado
             </div>
             <Crown size={40} className="text-violet-400 mb-2" fill="currentColor" />
             <h3 className="font-heading text-xl text-violet-300 mb-2">{pro.title}</h3>
             <div className="text-3xl font-black text-violet-400 mb-1">R$ {pro.priceLabel}</div>
             <div className="text-xs text-violet-300/60 font-bold uppercase tracking-wider mb-2 bg-violet-500/10 px-2 py-1 rounded">Acesso Vitalício</div>
             <ul className="flex-1 space-y-3 text-sm text-slate-300 font-bold mb-6 w-full text-left pl-2 mt-4">
               {pro.features.map((feature, i) => (
                  <li key={i} className="flex gap-2 items-start"><Check className="text-emerald-400 shrink-0 mt-0.5" size={16} /> {feature}</li>
               ))}
             </ul>
             <Button 
                variant="success" 
                onClick={() => onCheckoutStart(SubscriptionTier.PRO)} 
                disabled={isPro}
                size="md" 
                className="w-full mt-auto shadow-lg shadow-green-900/50 flex items-center justify-center gap-2"
              >
                {isPro ? <Check size={20} /> : <Zap size={20} />}
                {isPro ? "Sua Trilha Atual" : isStarter ? "Fazer Upgrade Agora" : "Comprar Agora"}
              </Button>
          </div>

        </div>
        
        <button onClick={onClose} className="mt-8 text-cyan-400/50 hover:text-cyan-400 font-bold text-sm underline">
          Fechar comparativo
        </button>
      </div>
    </div>
  );
};