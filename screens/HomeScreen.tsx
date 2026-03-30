
import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Play, Sparkles, Code, Star, ShieldCheck, Mail, Instagram, Info, X } from 'lucide-react';
import { SparkyLogo } from '../components/SparkyLogo';

interface HomeScreenProps {
  onStart: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStart }) => {
  const [showAbout, setShowAbout] = useState(false);
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
      
      {/* Background Patterns */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-10 left-10 text-cyan-400/40 animate-bounce delay-700 opacity-40"><Code size={48} /></div>
      <div className="absolute bottom-20 right-10 text-violet-400/30 animate-pulse delay-300 opacity-40"><Star size={64} /></div>
      <div className="absolute top-1/3 right-10 text-cyan-300/20 animate-spin-slow opacity-20"><Sparkles size={80} /></div>

      <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl p-8 md:p-16 rounded-2xl shadow-2xl border border-cyan-500/30 max-w-2xl w-full relative z-10 transform hover:scale-[1.02] transition-transform duration-500 mb-20 md:mb-10">
        
        {/* Logo Section */}
        <div className="mb-10 animate-float flex justify-center">
            <SparkyLogo size="xl" />
        </div>

        <div className="space-y-6">
            <h2 className="text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-300 font-bold uppercase tracking-widest">
              Jogos Educativos Incríveis
            </h2>

            <p className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed max-w-md mx-auto">
              Transforme o tempo de tela em aprendizado! Junte-se ao <strong className="text-cyan-400">Sparky</strong> nessa aventura para dominar a lógica e a programação de forma divertida.
            </p>

            <div className="pt-4 flex flex-col items-center gap-4">
              <Button onClick={onStart} size="lg" variant="primary" className="w-full md:w-auto px-12 py-5 text-lg">
                <Play fill="currentColor" className="mr-2" /> JOGAR AGORA
              </Button>
              
              <div className="flex gap-4 items-center">
                 <button 
                   onClick={() => setShowAbout(true)}
                   className="text-cyan-400/60 font-bold text-sm hover:text-cyan-400 flex items-center gap-1 transition"
                 >
                    <Info size={16} /> Saiba Mais
                 </button>
              </div>
            </div>
        </div>
      </div>
      
      {/* Footer - Ajustado para Alta Visibilidade */}
      <footer className="absolute bottom-6 w-full px-4 flex justify-center z-50 pointer-events-none">
        <div className="pointer-events-auto flex flex-col md:flex-row items-center justify-center gap-y-2 gap-x-6 text-[11px] md:text-xs font-bold text-cyan-300 bg-slate-900/90 px-8 py-3 rounded-full backdrop-blur-md shadow-2xl border border-cyan-500/30 text-center hover:bg-slate-800 transition-colors">
           
           <div className="flex items-center gap-1">
             <span>© {currentYear} TekTok TI.</span>
           </div>
           
           <span className="hidden md:inline opacity-30 text-cyan-300">|</span>

           <div className="flex items-center gap-1">
             <span>Criado por: Prof. Fabio Gouvêa Cabral T.</span>
           </div>

           <span className="hidden md:inline opacity-30 text-cyan-300">|</span>
           
           <a 
             href="https://instagram.com/sparky.aventura" 
             target="_blank" 
             rel="noreferrer"
             className="flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200 hover:scale-105 transition cursor-pointer group bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20"
           >
             <Instagram size={14} className="group-hover:rotate-12 transition" />
             <span>@sparky.aventura</span>
           </a>

           <span className="hidden md:inline opacity-30 text-cyan-300">|</span>

           <div className="flex items-center gap-1 text-slate-400">
             <ShieldCheck size={12} />
             <span>CNPJ 14.773.860/0001-72</span>
           </div>
           
           <span className="hidden md:inline opacity-30 text-cyan-300">|</span>
           
           <a 
             href="mailto:robotix28@gmail.com?subject=Contato%20Sparky%20App" 
             className="flex items-center gap-1 hover:text-cyan-200 hover:underline transition cursor-pointer text-slate-400"
           >
             <Mail size={12} />
             <span>Suporte</span>
           </a>
        </div>
      </footer>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
           <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 max-w-lg w-full relative shadow-2xl border border-cyan-500/30 max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setShowAbout(false)}
                className="absolute top-4 right-4 p-2 bg-slate-700/50 rounded-full hover:bg-slate-600 text-cyan-400 transition"
              >
                 <X size={24} />
              </button>

              <h2 className="text-2xl font-heading text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-300 mb-6 flex items-center gap-2">
                 <Sparkles className="text-cyan-400" /> Sobre o Sparky
              </h2>

              <div className="space-y-6 text-slate-300 leading-relaxed text-sm md:text-base">
                 <div>
                    <h3 className="font-bold text-lg text-cyan-300 mb-2">Jogos Educacionais que Empolgam</h3>
                    <p>
                       Motive seus alunos e filhos com nossa coleção de desafios pedagógicos. 
                       Com atividades ideais para o ensino fundamental, construímos habilidades fundamentais 
                       em raciocínio lógico, sequenciamento e programação básica. 
                       Abandone as lições secas e deixe que os jogos transformem o estudo em uma aventura 
                       que as crianças vão querer repetir!
                    </p>
                 </div>

                 <div>
                    <h3 className="font-bold text-lg text-cyan-300 mb-2">Aprendizado Interativo</h3>
                    <p>
                       Com nossa variedade de fases, seu filho se diverte enquanto desenvolve competências essenciais.
                       Seja iniciando a jornada educacional ou avançando para desafios complexos, o Sparky oferece 
                       prática e reforço positivo. Introduzimos conceitos importantes de forma acessível, 
                       como reconhecimento de padrões e algoritmos, preparando os jovens para o futuro digital.
                    </p>
                 </div>

                 <div className="bg-violet-600/20 p-4 rounded-xl border border-violet-500/50">
                    <h4 className="font-bold text-violet-300 mb-2 text-xs uppercase tracking-wider">Nossa Missão</h4>
                    <p className="text-violet-200 text-sm">
                       Acreditamos que aprender a programar deve ser tão natural e divertido quanto brincar de blocos.
                       Acompanhe o crescimento do seu pequeno gênio enquanto ele define novos recordes!
                    </p>
                 </div>

                 <div className="flex justify-center pt-4">
                     <a 
                       href="https://instagram.com/sparky.aventura"
                       target="_blank" 
                       rel="noreferrer" 
                       className="inline-flex items-center gap-2 text-cyan-300 font-bold hover:text-cyan-200 transition bg-cyan-500/10 px-6 py-3 rounded-full shadow-sm hover:shadow-md border border-cyan-500/20"
                     >
                        <Instagram size={20} /> Siga @sparky.aventura
                     </a>
                 </div>
              </div>

              <div className="mt-8">
                 <Button onClick={() => setShowAbout(false)} className="w-full" variant="secondary">
                    Voltar
                 </Button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};
