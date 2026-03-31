import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Lock } from 'lucide-react';
import { Button } from './Button';

interface ParentalGateProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ParentalGate: React.FC<ParentalGateProps> = ({ isOpen, onSuccess, onCancel }) => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNum1(Math.floor(Math.random() * 9) + 5); // 5-13
      setNum2(Math.floor(Math.random() * 9) + 2); // 2-10
      setAnswer('');
      setError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(answer) === num1 + num2) {
      onSuccess();
    } else {
      setError(true);
      setAnswer('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border-4 border-slate-100 flex flex-col items-center text-center animate-popIn">
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
        >
          <X size={24} />
        </button>

        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 text-slate-400">
           <Lock size={32} />
        </div>

        <h3 className="text-xl font-heading text-slate-800 mb-2">Espaço dos Pais</h3>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          Para continuar, peça para um adulto responder:<br />
          <span className="font-bold text-slate-800 text-lg">Quanto é {num1} + {num2}?</span>
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <input
            autoFocus
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Resultado"
            className={`w-full bg-slate-50 border-2 rounded-2xl p-4 text-center text-2xl font-bold outline-none transition ${error ? 'border-red-300 animate-shake' : 'border-slate-200 focus:border-slate-400'}`}
          />
          
          {error && <p className="text-xs font-bold text-red-500">Ops! Tente novamente.</p>}

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full rounded-2xl py-4 shadow-lg shadow-slate-200"
          >
            Confirmar <CheckCircle2 size={20} className="ml-2" />
          </Button>
        </form>

        <p className="mt-8 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
          Ambiente Seguro e Educativo
        </p>
      </div>
    </div>
  );
};
