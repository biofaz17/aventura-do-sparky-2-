
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
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative border-4 border-slate-300">
        <button onClick={onCancel} className="absolute top-4 right-4 text-slate-400 hover:text-red-500">
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="bg-slate-100 p-4 rounded-full mb-4">
             <ShieldCheck size={40} className="text-blue-600" />
          </div>
          
          <h3 className="font-heading text-xl text-slate-800 mb-2">Área Restrita</h3>
          <p className="text-slate-500 text-sm mb-6">
            Para {action}, peça para seus pais resolverem o desafio:
          </p>

          <form onSubmit={handleSubmit} className="w-full">
            <div className="mb-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
              <span className="text-2xl font-black text-blue-900 tracking-wider">
                {problem.q} = ?
              </span>
            </div>
            
            <input
              type="number"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(false); }}
              placeholder="Resposta"
              className="w-full text-center text-xl p-3 border-2 border-slate-300 rounded-xl mb-4 focus:border-blue-500 outline-none font-bold"
              autoFocus
            />
            
            {error && <p className="text-red-500 text-xs font-bold mb-4">Ops! Tente novamente.</p>}

            <Button type="submit" variant="primary" className="w-full">
              Confirmar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
