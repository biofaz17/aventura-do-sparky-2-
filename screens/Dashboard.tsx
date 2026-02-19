
import React from 'react';
import { Button } from '../components/Button';
import { Map, Palette, UserCircle, Star, Lock, Trophy, Zap, Crown, Instagram, ShieldCheck, Mail } from 'lucide-react';
import { UserProgress } from '../types';
import { SparkyLogo } from '../components/SparkyLogo';

interface DashboardProps {
  progress: UserProgress;
  onPlayMission: () => void;
  onCreativeMode: () => void;
  onOpenParents: () => void;
}

type AchievementTier = 'common' | 'rare' | 'epic' | 'legendary' | 'secret';

interface Achievement {
  id: string;
  label: string;
  icon: React.ReactNode;
  tier: AchievementTier;
  unlocked: boolean;
  desc: string;
  hint?: string; // Hint for locked state
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  progress, 
  onPlayMission, 
  onCreativeMode, 
  onOpenParents 
}) => {
  
  const currentYear = new Date().getFullYear();

  // Lógica AUMENTADA de Dificuldade
  const achievements: Achievement[] = [
    // TIER: COMMON (Fácil de entrar, mas requer esforço)
    { 
      id: 'a1', label: "O Início", icon: "🌱", tier: 'common', 
      unlocked: progress.unlockedLevels > 5, 
      desc: "Complete os primeiros 5 níveis.",
      hint: "Dê seus primeiros passos no mapa."
    },
    { 
      id: 'a2', label: "Estudioso", icon: "📚", tier: 'common', 
      unlocked: progress.totalBlocksUsed >= 50, 
      desc: "Use 50 blocos de código.",
      hint: "Programe bastante."
    },

    // TIER: RARE (Requer dedicação)
    { 
      id: 'a3', label: "Explorador Nato", icon: "🧭", tier: 'rare', 
      unlocked: progress.unlockedLevels > 20, 
      desc: "Complete 20 níveis.",
      hint: "Explore profundamente a floresta e além."
    },
    { 
      id: 'a4', label: "Colecionador", icon: "⭐", tier: 'rare', 
      unlocked: progress.stars >= 25, 
      desc: "Colete 25 estrelas.",
      hint: "Seja brilhante em muitas missões."
    },
    { 
      id: 'a5', label: "Construtor", icon: "🧱", tier: 'rare', 
      unlocked: progress.totalBlocksUsed >= 500, 
      desc: "Use 500 blocos no total.",
      hint: "Construa lógicas complexas repetidas vezes."
    },

    // TIER: EPIC (Difícil)
    { 
      id: 'a6', label: "Mestre da Lógica", icon: "🧠", tier: 'epic', 
      unlocked: progress.unlockedLevels > 40, 
      desc: "Domine 40 níveis.",
      hint: "Torne-se um expert completando quase tudo."
    },
    { 
      id: 'a7', label: "Perfeccionista", icon: "💎", tier: 'epic', 
      unlocked: progress.stars >= 75, 
      desc: "Acumule 75 estrelas.",
      hint: "A perfeição exige consistência estelar."
    },
    { 
      id: 'a8', label: "Arquiteto Sênior", icon: "🏗️", tier: 'epic', 
      unlocked: progress.totalBlocksUsed >= 2000, 
      desc: "Use 2.000 blocos.",
      hint: "Uma montanha de código foi escrita por você."
    },

    // TIER: LEGENDARY (Muito Difícil)
    { 
      id: 'a9', label: "O Visionário", icon: "🎨", tier: 'legendary', 
      unlocked: progress.creativeProjects >= 10, 
      desc: "Crie 10 projetos no modo livre.",
      hint: "Sua imaginação não tem limites criativos."
    },
    { 
      id: 'a10', label: "Lenda Viva", icon: "👑", tier: 'legendary', 
      unlocked: progress.unlockedLevels >= 60 && progress.stars >= 100, 
      desc: "Complete 60 níveis e 100 estrelas.",
      hint: "Apenas para os verdadeiros mestres do Sparky."
    },

    // TIER: SECRET (Oculto)
    { 
      id: 'a11', label: "Hacker do Sistema", icon: "🕵️", tier: 'secret', 
      unlocked: progress.unlockedLevels >= 320, // Nível secreto do Hacker
      desc: "Encontre e vença o Nível 320.",
      hint: "Existe uma falha na matrix..."
    },
    { 
      id: 'a12', label: "Curioso", icon: "❓", tier: 'secret', 
      unlocked: progress.secretsFound > 0, 
      desc: "Encontre um segredo escondido no menu.",
      hint: "Você clicou onde não devia?"
    },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const percentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-indigo-600 to-indigo-800 -z-10 rounded-b-[4rem] shadow-2xl" />
      
      {/* Header */}
      <header className="p-6 flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto w-full gap-4 z-10">
        
        {/* Brand Logo */}
        <div className="bg-white px-6 py-2 rounded-full border-4 border-white shadow-xl transform hover:scale-105 transition cursor-pointer" onClick={() => alert("Você encontrou um segredo? (WIP)")}>
           <SparkyLogo size="sm" showText={true} />
        </div>

        {/* User Stats Bar */}
        <div className="flex gap-3 bg-indigo-900/40 backdrop-blur-md p-2 rounded-full pr-2 border border-white/10 shadow-lg">
           <div className="bg-white px-5 py-2 rounded-full flex items-center gap-2 shadow-inner border-2 border-slate-100">
              <Star className="text-yellow-500 fill-yellow-500 filter drop-shadow-sm" size={20} />
              <span className="font-black text-slate-800 text-xl">{progress.stars}</span>
           </div>
           
           <div className="flex items-center gap-4 px-3 text-white">
              <div className="text-right leading-tight hidden md:block">
                  <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Nível Atual</div>
                  <div className="font-heading text-lg">{Math.ceil(progress.stars / 3) + 1}</div>
              </div>
              <button 
                onClick={onOpenParents}
                className="w-12 h-12 bg-white text-indigo-900 rounded-full flex items-center justify-center hover:bg-indigo-50 transition border-4 border-indigo-200 shadow-md"
                title="Área dos Pais"
              >
                <UserCircle size={28} />
              </button>
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 flex flex-col gap-10 mt-4 z-10">
        
        {/* Actions Row */}
        <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-[2] bg-white rounded-[2.5rem] p-8 shadow-xl shadow-indigo-900/10 border-4 border-white relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-100/50 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl" />
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4">
                        <Map size={14} /> Modo História
                    </div>
                    <h2 className="text-4xl font-heading text-slate-800 mb-2">Continuar Jornada</h2>
                    <p className="text-slate-500 font-bold text-lg max-w-md mb-8">
                    Nível {progress.unlockedLevels}: O próximo desafio aguarda sua lógica.
                    </p>
                    <Button onClick={onPlayMission} size="lg" variant="primary" className="shadow-blue-300/50 shadow-lg w-full md:w-auto">
                    <Map className="mr-2" /> Jogar Agora
                    </Button>
                </div>
            </div>

            <div className="flex-1 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-[2.5rem] p-8 shadow-xl shadow-purple-500/20 border-4 border-white/20 relative overflow-hidden group hover:scale-[1.02] transition-transform text-white">
                <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4 border border-white/20">
                            <Palette size={14} /> Sandbox
                        </div>
                        <h2 className="text-3xl font-heading mb-2">Criar</h2>
                        <p className="text-purple-100 font-medium">Construa sem limites.</p>
                    </div>
                    <Button onClick={onCreativeMode} className="w-full mt-6 bg-white text-purple-700 hover:bg-purple-50 border-white shadow-lg">
                    <Palette className="mr-2" /> Modo Livre
                    </Button>
                </div>
                <Palette size={180} className="absolute -bottom-10 -right-10 text-white opacity-10 rotate-12" />
            </div>
        </div>

        {/* Hardcore Achievements Section */}
        <div className="bg-slate-100 rounded-[3rem] p-8 md:p-10 border-4 border-slate-200">
             <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-4">
                 <div>
                    <h3 className="text-2xl font-heading text-slate-800 flex items-center gap-3">
                        <Trophy className="text-yellow-500 fill-yellow-500" size={32} /> 
                        Sala de Troféus
                    </h3>
                    <p className="text-slate-500 font-bold mt-1">Colecione todas as {totalCount} medalhas. A jornada é longa.</p>
                 </div>
                 
                 {/* Global Progress Bar */}
                 <div className="w-full md:w-64">
                    <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                        <span>Progresso Total</span>
                        <span>{percentage}%</span>
                    </div>
                    <div className="h-4 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                        <div 
                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000 ease-out"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                 </div>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {achievements.map((badge) => (
                    <Badge key={badge.id} item={badge} />
                ))}
             </div>
        </div>
      </main>

      {/* Footer - Abaixo da Sala de Troféus */}
      <footer className="w-full py-8 mt-12 bg-slate-900 text-slate-400 text-center z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-y-3 gap-x-6 text-[11px] md:text-xs font-bold px-4">
           
           <div className="flex items-center gap-1">
             <span>© {currentYear} TekTok TI.</span>
           </div>
           
           <span className="hidden md:inline text-slate-700">|</span>

           <div className="flex items-center gap-1">
             <span>Criado por: Prof. Fabio Gouvêa Cabral T.</span>
           </div>

           <span className="hidden md:inline text-slate-700">|</span>
           
           <a 
             href="https://instagram.com/sparky.aventura" 
             target="_blank" 
             rel="noreferrer"
             className="flex items-center gap-1.5 hover:text-white transition cursor-pointer"
           >
             <Instagram size={14} className="text-pink-500" />
             <span>@sparky.aventura</span>
           </a>

           <span className="hidden md:inline text-slate-700">|</span>

           <div className="flex items-center gap-1.5">
             <ShieldCheck size={14} className="text-blue-500" />
             <span>CNPJ 14.773.860/0001-72</span>
           </div>
           
           <span className="hidden md:inline text-slate-700">|</span>
           
           <a 
             href="mailto:robotix28@gmail.com?subject=Suporte%20Sparky" 
             className="flex items-center gap-1.5 hover:text-white transition cursor-pointer"
           >
             <Mail size={14} className="text-indigo-400" />
             <span>Suporte</span>
           </a>
        </div>
      </footer>

    </div>
  );
};

const Badge: React.FC<{ item: Achievement }> = ({ item }) => {
    // Tier Styles
    const tierStyles = {
        common: "border-slate-300 bg-slate-100",
        rare: "border-blue-300 bg-blue-50",
        epic: "border-purple-400 bg-purple-50 ring-2 ring-purple-100",
        legendary: "border-yellow-400 bg-yellow-50 ring-4 ring-yellow-200 shadow-xl",
        secret: "border-slate-800 bg-slate-900 text-slate-400 border-dashed"
    };

    const isLocked = !item.unlocked;

    return (
      <div className={`
        relative flex flex-col items-center justify-center p-4 rounded-3xl border-b-8 transition-all duration-300
        ${item.tier === 'secret' && isLocked ? 'bg-slate-800 border-slate-900' : tierStyles[item.tier]}
        ${isLocked && item.tier !== 'secret' ? 'opacity-60 grayscale filter' : 'hover:-translate-y-2 hover:shadow-2xl'}
        min-h-[160px] text-center group
      `}>
        {/* Rarity Label */}
        <div className={`
            absolute top-3 right-3 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full
            ${item.tier === 'legendary' ? 'bg-yellow-400 text-yellow-900' : 'bg-black/5 text-black/40'}
        `}>
            {item.tier === 'secret' ? '???' : item.tier}
        </div>

        {/* Icon Area */}
        <div className="mb-3 transform transition-transform group-hover:scale-110">
            {isLocked ? (
                <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center">
                    <Lock size={20} className="text-black/30" />
                </div>
            ) : (
                <span className="text-4xl drop-shadow-md">{item.icon}</span>
            )}
        </div>

        {/* Text Area */}
        <div className="w-full">
            <h4 className={`font-heading text-sm mb-1 leading-tight ${isLocked ? 'text-slate-500' : 'text-slate-800'}`}>
                {isLocked && item.tier === 'secret' ? 'Segredo Oculto' : item.label}
            </h4>
            <p className="text-[10px] font-bold leading-relaxed text-slate-400">
                {isLocked ? (
                    <span className="italic">{item.hint || "Continue jogando para descobrir."}</span>
                ) : (
                    <span className={item.tier === 'legendary' ? 'text-yellow-700' : ''}>{item.desc}</span>
                )}
            </p>
        </div>

        {/* Unlocked Visual Check */}
        {item.unlocked && (
            <div className="absolute -bottom-3 bg-green-500 text-white rounded-full p-1 border-2 border-white shadow-sm">
                <Zap size={10} fill="currentColor" />
            </div>
        )}
      </div>
    );
};
