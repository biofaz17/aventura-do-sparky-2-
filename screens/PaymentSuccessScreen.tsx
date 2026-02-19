
import React, { useEffect } from 'react';
import { Button } from '../components/Button';
import { CheckCircle, ArrowRight, Mail } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentSuccessScreenProps {
  onContinue: () => void;
}

export const PaymentSuccessScreen: React.FC<PaymentSuccessScreenProps> = ({ onContinue }) => {
  
  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#22c55e', '#3b82f6'] // Green and Blue
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#22c55e', '#3b82f6']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4 font-sans">
      <div className="text-center max-w-md w-full bg-white p-10 rounded-[2rem] shadow-xl border-4 border-green-100">
        
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} className="text-green-600" />
        </div>

        <h1 className="text-3xl font-heading text-slate-800 mb-2">Pagamento Confirmado!</h1>
        <p className="text-slate-500 font-bold mb-8">
          Parabéns! O plano foi ativado e novos mundos foram desbloqueados para sua aventura.
        </p>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8 text-left">
           <div className="text-xs text-slate-400 font-bold uppercase mb-1">Status do Pedido</div>
           <div className="font-bold text-slate-800 flex items-center gap-2 mb-4">
             <span className="w-2 h-2 rounded-full bg-green-500"></span> Aprovado
           </div>
           
           <div className="bg-white border border-slate-200 p-3 rounded-lg flex items-start gap-3">
               <div className="bg-blue-100 p-2 rounded-full text-blue-600 shrink-0">
                  <Mail size={16} />
               </div>
               <div>
                  <div className="text-sm font-bold text-slate-700">Recibo Enviado</div>
                  <div className="text-xs text-slate-500 leading-tight">
                      Enviamos a Nota Fiscal e os detalhes da transação para o email do responsável cadastrado.
                  </div>
               </div>
           </div>
        </div>

        <Button onClick={onContinue} variant="primary" size="lg" className="w-full">
          Voltar para Aventura <ArrowRight />
        </Button>

      </div>
    </div>
  );
};
