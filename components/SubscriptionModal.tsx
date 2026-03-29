import React from 'react';
import { Button } from './Button';
import { Check, Zap, Crown } from 'lucide-react';
import { SubscriptionTier } from '../types';
import { PLANS } from '../constants';

interface SubscriptionModalProps {
  onCheckoutStart: (tier: SubscriptionTier) => void;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onCheckoutStart, onClose }) => {
  const starter = PLANS[SubscriptionTier.STARTER];
  const pro = PLANS[SubscriptionTier.PRO];

  return (
    <div className="fixed inset-0 z-50 bg-indigo-900/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-5xl flex flex-col items-center">
        
        <h2 className="text-3xl font-heading text-white mb-6">Escolha o Melhor Plano</h2>

        <div className="grid md:grid-cols-3 gap-6 w-full">
          
          {/* FREE */}
          <div className="bg-white rounded-2xl p-6 flex flex-col items-center text-center opacity-90 border-2 border-transparent hover:opacity-100 transition">
             <h3 className="font-heading text-xl text-slate-500 mb-4">Explorador</h3>
             <div className="text-3xl font-black text-slate-800 mb-2">Grátis</div>
             <ul className="flex-1 space-y-3 text-sm text-slate-600 mb-6 w-full text-left pl-4">
               <li className="flex gap-2"><Check size={16} /> Níveis Básicos</li>
               <li className="flex gap-2"><Check size={16} /> Modo Criativo Limitado</li>
             </ul>
             <Button variant="secondary" onClick={onClose} size="sm" className="w-full mt-auto">Continuar</Button>
          </div>

          {/* STARTER */}
          <div className="bg-gradient-to-b from-blue-50 to-white rounded-3xl p-6 flex flex-col items-center text-center border-4 border-blue-400 shadow-xl relative z-10 transform hover:-translate-y-1 transition-transform">
             <Zap size={40} className="text-blue-500 mb-2" fill="currentColor" />
             <h3 className="font-heading text-xl text-blue-900 mb-2">{starter.title}</h3>
             <div className="text-3xl font-black text-blue-600 mb-1">R$ {starter.priceLabel}</div>
             <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 bg-blue-100 px-2 py-1 rounded">Pagamento Único</div>
             <ul className="flex-1 space-y-3 text-sm text-slate-700 font-bold mb-6 w-full text-left pl-2 mt-4">
               {starter.features.map((feature, i) => (
                  <li key={i} className="flex gap-2 items-start"><Check className="text-green-500 shrink-0 mt-0.5" size={16} /> {feature}</li>
               ))}
             </ul>
             <Button variant="primary" onClick={() => onCheckoutStart(SubscriptionTier.STARTER)} size="md" className="w-full mt-auto">
               Comprar Agora
             </Button>
          </div>

          {/* PRO */}
          <div className="bg-gradient-to-b from-yellow-50 to-white rounded-3xl p-6 flex flex-col items-center text-center border-4 border-yellow-400 shadow-xl transform hover:-translate-y-1 transition-transform relative">
             <div className="absolute -top-3 bg-yellow-500 text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm">
               Recomendado
             </div>
             <Crown size={40} className="text-yellow-500 mb-2" fill="currentColor" />
             <h3 className="font-heading text-xl text-yellow-800 mb-2">{pro.title}</h3>
             <div className="text-3xl font-black text-yellow-600 mb-1">R$ {pro.priceLabel}</div>
             <div className="text-xs text-yellow-800 font-bold uppercase tracking-wider mb-2 bg-yellow-100 px-2 py-1 rounded">Acesso Vitalício</div>
             <ul className="flex-1 space-y-3 text-sm text-slate-700 font-bold mb-6 w-full text-left pl-2 mt-4">
               {pro.features.map((feature, i) => (
                  <li key={i} className="flex gap-2 items-start"><Check className="text-green-500 shrink-0 mt-0.5" size={16} /> {feature}</li>
               ))}
             </ul>
             <Button variant="success" onClick={() => onCheckoutStart(SubscriptionTier.PRO)} size="md" className="w-full mt-auto">
               Comprar Agora
             </Button>
          </div>

        </div>
        
        <button onClick={onClose} className="mt-8 text-white/50 hover:text-white font-bold text-sm underline">
          Fechar comparativo
        </button>
      </div>
    </div>
  );
};