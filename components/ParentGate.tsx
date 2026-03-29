
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Lock, ShieldCheck, X } from 'lucide-react';

interface ParentGateProps {
  onSuccess: () => void;
  onCancel: () => void;
  action: string;
}

export const ParentGate: React.FC<ParentGateProps> = ({ onSuccess, onCancel, action }) => {
  const [problem, setProblem] = useState({ q: '', a: 0 });
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    // Gera um problema matemático simples para evitar acesso acidental de crianças muito pequenas
    const isAddition = Math.random() > 0.5;
    let n1, n2, q, a;

    if (isAddition) {
        // Soma simples: 10..40 + 10..40
        n1 = Math.floor(Math.random() * 30) + 10;
        n2 = Math.floor(Math.random() * 30) + 10;
        q = `${n1} + ${n2}`;
        a = n1 + n2;
    } else {
        // Multiplicação (Tabuada): 2..9 x 2..9
        n1 = Math.floor(Math.random() * 8) + 2; 
        n2 = Math.floor(Math.random() * 8) + 2;
        q = `${n1} x ${n2}`;
        a = n1 * n2;
    }
    
    setProblem({ q, a });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(input) === problem.a) {
      onSuccess();
    } else {
      setError(true);
      setInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 max-w-sm w-full relative border border-cyan-500/30 shadow-2xl">
        <button onClick={onCancel} className="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition">
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="bg-cyan-950/40 p-4 rounded-full mb-4 border border-cyan-500/30">
             <ShieldCheck size={40} className="text-cyan-400" />
          </div>
          
          <h3 className="font-heading text-xl text-cyan-300 mb-2">Area Restrita</h3>
          <p className="text-slate-400 text-sm mb-6">
            Para {action}, peca para seus pais resolverem o desafio:
          </p>

          <form onSubmit={handleSubmit} className="w-full">
            <div className="mb-4 bg-cyan-950/40 p-4 rounded-xl border border-cyan-500/50">
              <span className="text-2xl font-black text-cyan-300 tracking-wider">
                {problem.q} = ?
              </span>
            </div>
            
            <input
              type="number"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(false); }}
              placeholder="Resposta"
              className="w-full text-center text-xl p-3 border-2 border-slate-600 bg-slate-800/50 rounded-xl mb-4 focus:border-cyan-400 outline-none font-bold text-slate-200 focus:bg-slate-800/80 transition"
              autoFocus
            />
            
            {error && <p className="text-red-400 text-xs font-bold mb-4">Ops! Tente novamente.</p>}

            <Button type="submit" variant="primary" className="w-full">
              Confirmar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
