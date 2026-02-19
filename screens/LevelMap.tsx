
import React, { useState, useEffect, useRef } from 'react';
import { Lock, ArrowLeft, Crown, Zap, Check, Star, Play } from 'lucide-react';
import { LEVELS } from '../constants';
import { SubscriptionTier, LevelConfig } from '../types';

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
      onRequestUpgrade();
      return;
    }
    onSelectLevel(level.id as number);
  };

  // Group levels by Tier for display
  const freeLevels = LEVELS.filter(l => l.requiredSubscription === SubscriptionTier.FREE);
  const starterLevels = LEVELS.filter(l => l.requiredSubscription === SubscriptionTier.STARTER);
  const proLevels = LEVELS.filter(l => l.requiredSubscription === SubscriptionTier.PRO);

  const renderLevelGrid = (levels: LevelConfig[], title: string, tierColor: string, icon: React.ReactNode, locked: boolean) => (
      <div className={`mb-12 w-full max-w-5xl ${locked ? 'opacity-80 grayscale-[0.5]' : ''}`}>
          <div className={`flex items-center gap-3 mb-6 p-4 rounded-xl shadow-sm ${locked ? 'bg-slate-200' : 'bg-white/90 backdrop-blur-sm'}`}>
              <div className={`p-2 rounded-full text-white ${tierColor}`}>
                  {icon}
              </div>
              <div>
                  <h3 className="text-xl md:text-2xl font-heading text-slate-800">{title}</h3>
                  {locked && <span className="text-xs font-bold text-red-500 uppercase flex items-center gap-1"><Lock size={12}/> Bloqueado</span>}
              </div>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-8 px-4">
              {levels.map((level, index) => {
                  const levelId = level.id as number;
                  // Lógica de Estado do Nível
                  // Nível Atual: Exatamente o unlockedLevels
                  // Completado: Menor que unlockedLevels
                  // Travado (Progresso): Maior que unlockedLevels
                  
                  const isCurrent = levelId === unlockedLevels;
                  const isCompleted = levelId < unlockedLevels;
                  const isProgressionLocked = levelId > unlockedLevels;
                  
                  // Cannot play if tier is locked OR progression is locked
                  const isPlayable = !locked && !isProgressionLocked;

                  return (
                      <button
                        key={levelId}
                        ref={isCurrent ? currentLevelRef : null}
                        onClick={() => handleLevelClick(level)}
                        disabled={!isPlayable && !locked} // Allow clicking locked tier to see upgrade modal
                        className={`
                          group relative w-20 h-20 md:w-24 md:h-24 rounded-3xl flex flex-col items-center justify-center transition-all duration-300
                          ${locked 
                              ? 'bg-slate-300 cursor-pointer hover:bg-slate-400' 
                              : (isProgressionLocked 
                                  ? 'bg-slate-200 opacity-50 cursor-not-allowed border-2 border-slate-300' 
                                  : (isCurrent 
                                      ? `${tierColor.replace('bg-', 'bg-')} ring-4 ring-white ring-offset-4 ring-offset-green-600 scale-110 shadow-2xl z-10` 
                                      : 'bg-white hover:scale-105 shadow-md border-b-4 border-slate-200 active:border-b-0 active:translate-y-1'))
                          }
                        `}
                      >
                          {locked ? (
                              <Lock size={24} className="text-slate-500" />
                          ) : isCompleted ? (
                              <div className="bg-green-500 rounded-full p-2 shadow-sm">
                                  <Check size={24} className="text-white" strokeWidth={4} />
                              </div>
                          ) : isCurrent ? (
                              <>
                                <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 text-[10px] font-black uppercase px-2 py-1 rounded-full shadow-md animate-bounce">
                                    Aqui
                                </div>
                                <Play size={32} className="text-white fill-current ml-1" />
                                <span className="text-xs font-bold text-white/90 mt-1">Nível {levelId}</span>
                                {/* Pulse Effect */}
                                <span className="absolute inset-0 rounded-3xl bg-white/30 animate-ping opacity-75"></span>
                              </>
                          ) : (
                              // Future levels (locked by progression) or standard styling
                              <span className={`text-2xl font-heading ${isProgressionLocked ? 'text-slate-400' : 'text-slate-600'}`}>
                                  {levelId}
                              </span>
                          )}

                          {/* Level Title Tooltip */}
                          <div className={`
                             absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity 
                             bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap z-20 pointer-events-none shadow-xl
                             ${isCurrent ? '-bottom-12' : ''}
                          `}>
                              {level.title}
                              {/* Seta do tooltip */}
                              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                          </div>

                          {/* Connector Line (Visual only, works best in grid) */}
                          {index < levels.length - 1 && (
                              <div className={`
                                hidden md:block absolute -right-8 top-1/2 -translate-y-1/2 w-8 h-2 rounded-full z-[-1]
                                ${isCompleted && !locked ? 'bg-white/80' : 'bg-black/10'}
                              `} />
                          )}
                      </button>
                  );
              })}
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#65a30d] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] flex flex-col items-center p-4 relative overflow-y-auto">
      
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="fixed top-4 left-4 bg-white rounded-full p-3 shadow-lg hover:scale-110 transition z-50 border-4 border-green-700 text-green-700"
      >
        <ArrowLeft size={24} strokeWidth={3} />
      </button>

      <div className="w-full max-w-5xl mt-20 pb-20 flex flex-col items-center">
        <h2 className="text-4xl md:text-5xl text-white font-heading text-center mb-4 drop-shadow-md">
           Mapa da Aventura
        </h2>
        <p className="text-green-100 font-bold mb-10 text-center max-w-md bg-green-800/30 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
            Viaje pelos mundos do conhecimento. Desbloqueie novos desafios evoluindo seu plano!
        </p>

        {/* FREE WORLD */}
        {renderLevelGrid(
            freeLevels, 
            "Mundo Inicial (Grátis)", 
            "bg-green-500", 
            <Star fill="currentColor" />, 
            false
        )}

        {/* STARTER WORLD */}
        {renderLevelGrid(
            starterLevels, 
            "Mundo da Floresta (Starter)", 
            "bg-blue-500", 
            <Zap fill="currentColor" />, 
            !hasSubscriptionAccess(SubscriptionTier.STARTER)
        )}

        {/* PRO WORLD */}
        {renderLevelGrid(
            proLevels, 
            "Mundo Hacker (Pro)", 
            "bg-purple-600", 
            <Crown fill="currentColor" />, 
            !hasSubscriptionAccess(SubscriptionTier.PRO)
        )}

      </div>
    </div>
  );
};
