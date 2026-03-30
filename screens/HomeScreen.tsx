
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
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300 flex flex-col items-center justify-center p-4 text-center relative scrollable-y">
      
      {/* Background Patterns */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-10 left-10 text-cyan-400/40 animate-bounce delay-700 opacity-40"><Code size={48} /></div>
      <div className="absolute bottom-20 right-10 text-violet-400/30 animate-pulse delay-300 opacity-40"><Star size={64} /></div>
      <div className="absolute top-1/3 right-10 text-cyan-300/20 animate-spin-slow opacity-20"><Sparkles size={80} /></div>

      <div className="bg-white rounded-3xl p-8 md:p-16 shadow-2xl border-0 max-w-2xl w-full relative z-10 transform hover:scale-[1.02] transition-transform duration-500 mb-20 md:mb-10">
        
        {/* Logo Section */}
        <div className="mb-8 animate-float flex justify-center">
            <SparkyLogo size="lg" />
        </div>

        <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-black uppercase tracking-widest">
              Jogos Educativos Incríveis
            </h2>

            <p className="text-lg md:text-lg text-gray-700 font-semibold leading-relaxed max-w-md mx-auto">
              Transforme o tempo de tela em aprendizado! Junte-se ao <strong className="text-purple-600">Sparky</strong> nessa aventura para dominar a lógica e a programação de forma divertida.
            </p>

            <div className="pt-4 flex flex-col items-center gap-4">
              <Button onClick={onStart} size="lg" variant="primary" className="w-full md:w-auto px-12 py-4 text-base">
                <Play fill="currentColor" className="mr-2" /> JOGAR AGORA
              </Button>
              
              <div className="flex gap-4 items-center">
                 <button 
                   onClick={() => setShowAbout(true)}
                   className="text-purple-600 font-bold text-sm hover:text-purple-700 flex items-center gap-1 transition"
                 >
                    <Info size={16} /> Saiba Mais
                 </button>
              </div>
            </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="absolute bottom-6 w-full px-4 flex justify-center z-50 pointer-events-none">
        <div className="pointer-events-auto flex flex-col md:flex-row items-center justify-center gap-y-2 gap-x-6 text-[11px] md:text-xs font-black text-white bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-3 rounded-full shadow-2xl border-0 text-center hover:from-blue-600 hover:to-purple-700 transition-all">
           
           <div className="flex items-center gap-1">
             <span>© {currentYear} TekTok TI.</span>
           </div>
           
           <span className="hidden md:inline opacity-50">•</span>

           <div className="flex items-center gap-1">
             <span>Prof. Fabio Gouvêa Cabral</span>
           </div>

           <span className="hidden md:inline opacity-50">•</span>
           
           <a 
             href="https://instagram.com/sparky.aventura" 
             target="_blank" 
             rel="noreferrer"
             className="flex items-center gap-1.5 text-white hover:text-yellow-100 hover:scale-110 transition cursor-pointer group">
             <Instagram size={14} className="group-hover:rotate-12 transition" />
             <span>@sparky.aventura</span>
           </a>

           <span className="hidden md:inline opacity-50">•</span>

           <a 
             href="mailto:robotix28@gmail.com?subject=Contato%20Sparky%20App" 
             className="flex items-center gap-1 hover:text-yellow-100 hover:underline transition cursor-pointer text-white">
             <Mail size={12} />
             <span>Suporte</span>
           </a>
        </div>
      </footer>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
           <div className="bg-white rounded-3xl p-8 max-w-lg w-full relative shadow-2xl border-0 max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setShowAbout(false)}
                className="absolute top-4 right-4 p-2 bg-gray-200 rounded-full hover:bg-gray-300 text-gray-600 transition"
              >
                 <X size={24} />
              </button>

              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6 flex items-center gap-2">
                 <Sparkles className="text-purple-600" size={28} /> Sobre o Sparky
              </h2>

              <div className="space-y-5 text-gray-800 leading-relaxed text-sm md:text-base">
                 <div>
                    <h3 className="font-bold text-lg text-blue-600 mb-2">🎮 Jogos Educacionais que Empolgam</h3>
                    <p>
                       Motive seus alunos e filhos com nossa coleção de desafios pedagógicos. 
                       Com atividades ideais para o ensino fundamental, construímos habilidades fundamentais 
                       em raciocínio lógico, sequenciamento e programação básica. 
                       Abandone as lições secas e deixe que os jogos transformem o estudo em uma aventura 
                       que as crianças vão querer repetir!
                    </p>
                 </div>

                 <div>
                    <h3 className="font-bold text-lg text-purple-600 mb-2">✨ Aprendizado Interativo</h3>
                    <p>
                       Com nossa variedade de fases, seu filho se diverte enquanto desenvolve competências essenciais.
                       Seja iniciando a jornada educacional ou avançando para desafios complexos, o Sparky oferece 
                       prática e reforço positivo. Introduzimos conceitos importantes de forma acessível, 
                       como reconhecimento de padrões e algoritmos, preparando os jovens para o futuro digital.
                    </p>
                 </div>

                 <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-4 rounded-2xl border-3 border-pink-300">
                    <h4 className="font-black text-pink-700 mb-2 text-xs uppercase tracking-wider">🎯 Nossa Missão</h4>
                    <p className="text-gray-800 font-semibold text-sm">
                       Acreditamos que aprender a programar deve ser tão natural e divertido quanto brincar de blocos.
                       Acompanhe o crescimento do seu pequeno gênio enquanto ele define novos recordes!
                    </p>
                 </div>

                 <div className="flex justify-center pt-3">
                     <a 
                       href="https://instagram.com/sparky.aventura"
                       target="_blank" 
                       rel="noreferrer" 
                       className="inline-flex items-center gap-2 text-purple-600 font-black hover:text-purple-700 transition text-base"
                     >
                        <Instagram size={20} /> Siga @sparky.aventura
                     </a>
                 </div>
              </div>

              <div className="mt-6">
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
