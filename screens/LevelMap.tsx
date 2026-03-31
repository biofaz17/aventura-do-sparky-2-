
import React, { useState, useEffect, useRef } from 'react';
import { Lock, ArrowLeft, Crown, Zap, Check, Star, Play, Gift } from 'lucide-react';
import { LEVELS } from '../constants';
import { SubscriptionTier, LevelConfig } from '../types';
import { Robot } from '../components/Robot';
import { ParentalGate } from '../components/ParentalGate';

interface LevelMapProps {
  unlockedLevels: number;
  userSubscription: SubscriptionTier;
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
  onRequestUpgrade: () => void;
}

export const LevelMap: React.FC<LevelMapProps> = ({ 
  unlockedLevels, 
  userSubscription,
  onSelectLevel, 
  onBack,
  onRequestUpgrade
}) => {
  
  const currentLevelRef = useRef<HTMLButtonElement>(null);
  const [parentalGateOpen, setParentalGateOpen] = useState(false);

  // Auto-scroll to current level on mount
  useEffect(() => {
    if (currentLevelRef.current) {
        currentLevelRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'center'
        });
    }
  }, []);

  // Helper function to check if user has access to a specific tier
  const hasSubscriptionAccess = (requiredTier: SubscriptionTier): boolean => {
    if (requiredTier === SubscriptionTier.FREE) return true;
    if (requiredTier === SubscriptionTier.STARTER) {
      return userSubscription === SubscriptionTier.STARTER || userSubscription === SubscriptionTier.PRO;
    }
    if (requiredTier === SubscriptionTier.PRO) {
      return userSubscription === SubscriptionTier.PRO;
    }
    return false;
  };

  const handleLevelClick = (level: LevelConfig) => {
    if (!hasSubscriptionAccess(level.requiredSubscription)) {
      setParentalGateOpen(true);
      return;
    }
    onSelectLevel(level.id as number);
  };

  const handleParentalSuccess = () => {
    setParentalGateOpen(false);
    onRequestUpgrade();
  };

  // Group levels by Tier for display
  const freeLevels = LEVELS.filter(l => l.requiredSubscription === SubscriptionTier.FREE);
  const starterLevels = LEVELS.filter(l => l.requiredSubscription === SubscriptionTier.STARTER);
  const proLevels = LEVELS.filter(l => l.requiredSubscription === SubscriptionTier.PRO);

  const renderLevelGrid = (levels: LevelConfig[], title: string, tierColor: string, icon: React.ReactNode, locked: boolean, description: string) => (
      <div className={`mb-16 w-full max-w-5xl relative ${locked ? 'opacity-90' : ''}`}>
          
          {/* Mascot Nudge for Locked Worlds */}
          {locked && (
             <div className="absolute -top-12 -right-4 md:right-10 z-20 flex items-end gap-3 animate-bounce-slow pointer-events-none">
                <div className="bg-white px-4 py-2 rounded-2xl shadow-xl border-2 border-slate-100 text-xs font-bold text-slate-600 relative after:content-[''] after:absolute after:bottom-[-8px] after:right-6 after:w-4 after:h-4 after:bg-white after:border-r-2 after:border-b-2 after:border-slate-100 after:rotate-45">
                   Quer ver o que tem aqui? ✨
                </div>
                <div className="w-16 h-16 transform -scale-x-100">
                    <Robot x={0} y={0} cellSize={64} direction="right" isTalking={true} />
                </div>
             </div>
          )}

          <div className={`
            flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 p-6 rounded-[2rem] shadow-lg transition-all duration-500
            ${locked 
                ? 'bg-slate-800/40 border border-white/10 backdrop-blur-md' 
                : `${tierColor} border-b-8 border-black/10 shadow-xl shadow-black/5`
            }
          `}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl text-white shadow-inner bg-white/20 backdrop-blur-sm`}>
                    {locked ? <Gift size={28} className="text-yellow-300" fill="currentColor" /> : icon}
                </div>
                <div>
                    <h3 className="text-2xl md:text-3xl font-heading text-white drop-shadow-sm">{title}</h3>
                    <p className="text-white/70 text-sm font-bold">{description}</p>
                </div>
              </div>

              {locked && (
                <button 
                  onClick={() => setParentalGateOpen(true)}
                  className="bg-yellow-400 text-yellow-900 font-black text-xs uppercase tracking-widest px-6 py-3 rounded-2xl shadow-lg shadow-yellow-900/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Liberar Acesso
                </button>
              )}
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-6 px-4">
              {levels.map((level, index) => {
                  const levelId = level.id as number;
                  const isCurrent = levelId === unlockedLevels;
                  const isCompleted = levelId < unlockedLevels;
                  const isProgressionLocked = levelId > unlockedLevels;
                  const isPlayable = !locked && !isProgressionLocked;

                  return (
                      <button
                        key={levelId}
                        ref={isCurrent ? currentLevelRef : null}
                        onClick={() => handleLevelClick(level)}
                        disabled={!isPlayable && !locked}
                        className={`
                          group relative w-20 h-20 md:w-24 md:h-24 rounded-[1.75rem] flex flex-col items-center justify-center transition-all duration-300
                          ${locked 
                              ? 'bg-slate-800/30 border-2 border-dashed border-white/10 cursor-pointer hover:bg-slate-800/50' 
                              : (isProgressionLocked 
                                  ? 'bg-white/10 opacity-40 cursor-not-allowed border-2 border-white/10' 
                                  : (isCurrent 
                                      ? `bg-white ring-8 ring-white/20 scale-110 shadow-2xl z-10` 
                                      : 'bg-white/90 hover:bg-white hover:scale-105 shadow-md border-b-4 border-black/10 active:border-b-0 active:translate-y-1'))
                          }
                        `}
                      >
                          {locked ? (
                              <Gift size={20} className="text-yellow-400 opacity-60" />
                          ) : isCompleted ? (
                              <div className="bg-green-500 rounded-full p-2 shadow-sm animate-popIn">
                                  <Check size={24} className="text-white" strokeWidth={4} />
                              </div>
                          ) : isCurrent ? (
                              <div className="flex flex-col items-center">
                                <Play size={32} className={`${tierColor.replace('bg-', 'text-')} fill-current ml-1`} />
                                <span className={`text-[10px] font-black uppercase mt-1 ${tierColor.replace('bg-', 'text-')}`}>Nível {levelId}</span>
                                <span className="absolute inset-0 rounded-[1.75rem] ring-4 ring-white animate-pulse"></span>
                              </div>
                          ) : (
                              <span className={`text-2xl font-heading ${isProgressionLocked ? 'text-white/20' : 'text-slate-600'}`}>
                                  {levelId}
                              </span>
                          )}

                          {/* Level Title Tooltip */}
                          {!locked && (
                            <div className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-black tracking-wider px-3 py-1.5 rounded-xl whitespace-nowrap z-20 pointer-events-none shadow-xl">
                                {level.title.toUpperCase()}
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                            </div>
                          )}
                      </button>
                  );
              })}
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-4 relative overflow-y-auto">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <ParentalGate 
        isOpen={parentalGateOpen} 
        onSuccess={handleParentalSuccess} 
        onCancel={() => setParentalGateOpen(false)} 
      />

      {/* Back Button */}
      <button 
        onClick={onBack}
        className="fixed top-6 left-6 bg-white/10 backdrop-blur-md rounded-2xl p-3 shadow-lg hover:scale-110 transition z-50 border border-white/20 text-white"
      >
        <ArrowLeft size={24} strokeWidth={3} />
      </button>

      <div className="w-full max-w-5xl mt-16 pb-20 flex flex-col items-center relative z-10">
        
        <div className="text-center mb-16 animate-fadeIn">
            <h2 className="text-5xl md:text-7xl text-white font-heading mb-4 drop-shadow-xl tracking-tight">
                Mapa da <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">Jornada</span>
            </h2>
            <div className="inline-block bg-white/5 backdrop-blur-sm px-6 py-2 rounded-full border border-white/10">
                <p className="text-sm font-bold text-green-300 tracking-widest uppercase">
                    Evolua sua lógica em mundos mágicos
                </p>
            </div>
        </div>

        {/* FREE WORLD */}
        {renderLevelGrid(
            freeLevels, 
            "Mundo Inicial", 
            "bg-gradient-to-r from-emerald-500 to-green-500", 
            <Star size={28} fill="currentColor" />, 
            false,
            "A base do conhecimento"
        )}

        {/* STARTER WORLD */}
        {renderLevelGrid(
            starterLevels, 
            "Mundo da Floresta", 
            "bg-gradient-to-r from-blue-500 to-cyan-500", 
            <Zap size={28} fill="currentColor" />, 
            !hasSubscriptionAccess(SubscriptionTier.STARTER),
            "Pinturas e novos padrões"
        )}

        {/* PRO WORLD */}
        {renderLevelGrid(
            proLevels, 
            "Mundo Hacker", 
            "bg-gradient-to-r from-violet-600 to-purple-600", 
            <Crown size={28} fill="currentColor" />, 
            !hasSubscriptionAccess(SubscriptionTier.PRO),
            "A era da Inteligência Artificial"
        )}

      </div>
    </div>
  );
};
