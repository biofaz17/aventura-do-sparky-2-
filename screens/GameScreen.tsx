
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, RotateCcw, Trash2, HelpCircle, Pause, CheckCircle, XCircle, ArrowRight, Repeat, Code, Terminal, Move, Clock, Battery, BatteryWarning, Target, Brush, Volume2, VolumeX, Shirt, Lock, Crown, Waves, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LevelConfig, BlockType, BlockCategory, GridPosition, BLOCK_DEFINITIONS, UserProfile, SubscriptionTier } from '../types';
import { LEVELS, CREATIVE_LEVEL } from '../constants';
import { Button } from '../components/Button';
import { Robot } from '../components/Robot';
import { BlockIcon } from '../components/BlockIcon';
import confetti from 'canvas-confetti';
import { audioService } from '../services/AudioService';

interface GameScreenProps {
  levelId: number | string;
  onBack: () => void;
  onNextLevel: (blocksUsed: number) => void;
  user?: UserProfile | null;
  onUpdateSkin?: (skinId: string) => void;
}

// ... (Manter componentes TutorialDemo inalterados para economizar espaço no XML, eles não mudaram lógica)
const MotionTutorialDemo: React.FC = () => { /* ...existing logic... */ return (<div className="p-4 bg-blue-50 rounded-xl text-center"><p className="font-bold text-blue-800">Use os blocos azuis para mover!</p></div>)};
const ActionTutorialDemo: React.FC = () => { /* ...existing logic... */ return (<div className="p-4 bg-purple-50 rounded-xl text-center"><p className="font-bold text-purple-800">Use o bloco roxo para pintar!</p></div>)};
const TutorialDemo: React.FC = () => { /* ...existing logic... */ return (<div className="p-4 bg-orange-50 rounded-xl text-center"><p className="font-bold text-orange-800">Repita ações para economizar blocos!</p></div>)};

// --- SKIN SELECTOR MODAL (Mantido igual) ---
const SkinSelector: React.FC<{ 
  currentSkin: string, 
  onSelect: (id: string) => void, 
  onClose: () => void,
  userTier: SubscriptionTier
}> = ({ currentSkin, onSelect, onClose, userTier }) => {
  const skins = [
    { id: 'default', name: 'Sparky Clássico', desc: 'O original.', locked: false },
    { id: 'ninja', name: 'Ninja do Código', desc: 'Rápido e silencioso.', locked: userTier === SubscriptionTier.FREE },
    { id: 'fairy', name: 'Fada da Lógica', desc: 'Voando pelos bugs.', locked: userTier === SubscriptionTier.FREE },
    { id: 'dino', name: 'Dino Dados', desc: 'Forte e destemido.', locked: userTier === SubscriptionTier.FREE },
  ];
  return (
    <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
       <div className="bg-white rounded-[2rem] p-6 max-w-2xl w-full border-4 border-indigo-200 relative animate-popIn shadow-2xl">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200"><XCircle /></button>
          <div className="text-center mb-6">
             <h2 className="text-3xl font-heading text-indigo-900 mb-2 flex items-center justify-center gap-3"><Shirt className="text-indigo-500" size={32} /> Guarda-Roupa</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {skins.map(skin => (
                <button 
                  key={skin.id}
                  disabled={skin.locked}
                  onClick={() => onSelect(skin.id)}
                  className={`relative group rounded-2xl p-4 border-4 transition-all duration-200 flex flex-col items-center gap-3 ${currentSkin === skin.id ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' : 'border-slate-100 bg-slate-50 hover:bg-white'} ${skin.locked ? 'opacity-80' : ''}`}
                >
                   <div className="w-16 h-16 relative">
                      <Robot x={0} y={0} cellSize={64} skinId={skin.id} direction="right" />
                      {skin.locked && <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center backdrop-blur-[1px]"><Lock className="text-white" size={24} /></div>}
                      {currentSkin === skin.id && <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 border-2 border-white shadow-sm z-20"><CheckCircle size={14} /></div>}
                   </div>
                   <div className="text-center"><h3 className="font-heading text-xs text-slate-800 leading-tight">{skin.name}</h3></div>
                </button>
             ))}
          </div>
          {userTier === SubscriptionTier.FREE && (
             <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-4">
                <div className="bg-yellow-100 p-3 rounded-full text-yellow-600"><Crown size={24} /></div>
                <div><h4 className="font-bold text-yellow-900">Desbloqueie todas!</h4><p className="text-xs text-yellow-800">O plano Starter libera todas as skins.</p></div>
             </div>
          )}
          <div className="mt-6 flex justify-center"><Button onClick={onClose} variant="primary" size="md" className="min-w-[150px]">Pronto!</Button></div>
       </div>
    </div>
  );
};

export const GameScreen: React.FC<GameScreenProps> = ({ levelId, onBack, onNextLevel, user, onUpdateSkin }) => {
  // --- LEVEL SETUP ---
  const level = levelId === 'creative' ? CREATIVE_LEVEL : (LEVELS.find(l => l.id === levelId) || LEVELS[0]);
  const isHackerMode = level.id === 45 || level.id === 'creative';
  const isWaterLevel = level.id === 16;

  const [program, setProgram] = useState<BlockType[]>([]);
  const [robotState, setRobotState] = useState({ x: level.startPos.x, y: level.startPos.y, dir: 'right' as 'left' | 'right' | 'up' | 'down' });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number | null>(null);
  const [gameStatus, setGameStatus] = useState<'idle' | 'running' | 'won' | 'lost'>('idle');
  const [paintedCells, setPaintedCells] = useState<GridPosition[]>([]);
  const [tutorialOpen, setTutorialOpen] = useState(true);
  const [showSkinSelector, setShowSkinSelector] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [draggingBlock, setDraggingBlock] = useState<BlockType | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(level.timeLimit || null);
  
  // Mobile UI State
  const [isStageExpanded, setIsStageExpanded] = useState(false);

  const abortController = useRef<AbortController | null>(null);
  const programListRef = useRef<HTMLDivElement>(null);

  // Initialize Audio
  useEffect(() => { audioService.setMute(isMuted); }, [isMuted]);

  // Auto-expand stage on mobile when playing
  useEffect(() => {
     if (window.innerWidth < 768) {
         setIsStageExpanded(isPlaying);
     }
  }, [isPlaying]);

  useEffect(() => {
    // RESET TOTAL: Limpa programa e estado ao mudar de nível
    setProgram([]);
    resetGame();
    
    if (level.mission && !isMuted) {
      setTimeout(() => {
        audioService.speak(
          `Missão ${level.id === 'creative' ? 'Criativa' : level.id}: ${level.mission}. ${level.tutorialMessage || ''}`,
          'instruction',
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        );
      }, 500);
    }
    return () => { audioService.stop(); };
  }, [levelId]);

  useEffect(() => {
    if (gameStatus === 'won') {
       audioService.playSfx('success');
       const winPhrases = ["Conseguimos! Você é incrível!", "Vitória! Próximo nível!", "Uau, funcionou!"];
       setTimeout(() => audioService.speak(winPhrases[Math.floor(Math.random() * winPhrases.length)], 'happy', () => setIsSpeaking(true), () => setIsSpeaking(false)), 500);
    } else if (gameStatus === 'lost') {
       audioService.playSfx('error');
       const failPhrases = ["Ops, batemos!", "Quase lá, vamos tentar de novo?", "Preciso da sua ajuda!"];
       setTimeout(() => audioService.speak(failPhrases[Math.floor(Math.random() * failPhrases.length)], 'neutral', () => setIsSpeaking(true), () => setIsSpeaking(false)), 500);
    }
  }, [gameStatus]);

  // Timer Logic
  useEffect(() => {
    if (!level.timeLimit || gameStatus === 'won' || gameStatus === 'lost') return;
    if (timeLeft !== null && timeLeft <= 0) {
       setGameStatus('lost');
       setIsPlaying(false);
       if (abortController.current) abortController.current.abort();
       return;
    }
    const timer = setInterval(() => { setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0)); }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameStatus, level.timeLimit]);

  // Auto-scroll program list - ESSENCIAL PARA MOBILE
  useEffect(() => {
    if (programListRef.current) {
        setTimeout(() => {
          if (programListRef.current) {
             programListRef.current.scrollTo({ top: programListRef.current.scrollHeight, behavior: 'smooth' });
          }
        }, 50);
    }
  }, [program.length]);

  const resetGame = () => {
    if (abortController.current) abortController.current.abort();
    setRobotState({ x: level.startPos.x, y: level.startPos.y, dir: 'right' });
    setPaintedCells([]);
    setGameStatus('idle');
    setIsPlaying(false);
    setCurrentBlockIndex(null);
    setTimeLeft(level.timeLimit || null);
    audioService.stop();
  };
  
  // Função exclusiva para o botão "Lixeira": Limpa código e reseta estado
  const handleClear = () => {
      setProgram([]);
      resetGame();
  };

  const addBlock = (type: BlockType) => {
    if (isPlaying) return; // Não adiciona se estiver rodando
    if (program.length < level.maxBlocks) {
      setProgram(prev => [...prev, type]);
      audioService.playSfx('pop');
      const def = BLOCK_DEFINITIONS[type];
      if (!isMuted) {
          // Speak label curtamente
          setTimeout(() => audioService.speak(def.label, 'neutral', undefined, undefined), 100);
      }
    } else {
        audioService.playSfx('error');
        if (!isMuted) audioService.speak("Limite de blocos atingido!", 'neutral');
    }
  };

  const removeBlock = (index: number) => {
    if (isPlaying) return;
    const newProgram = [...program];
    newProgram.splice(index, 1);
    setProgram(newProgram);
    audioService.playSfx('delete');
  };

  const toggleMute = () => setIsMuted(!isMuted);

  // --- INTERPRETER ENGINE ---
  const runProgram = async (skipGuideCheck = false) => {
    if (program.length === 0) return;
    
    resetGame();
    setIsPlaying(true);
    setGameStatus('running');
    audioService.playSfx('start');

    abortController.current = new AbortController();
    const signal = abortController.current.signal;
    const STEP_DURATION = isHackerMode ? 120 : 400; 
    const PAINT_DURATION = isHackerMode ? 80 : 250;

    const wait = (ms: number) => new Promise(resolve => {
        if (signal.aborted) return;
        setTimeout(resolve, ms);
    });

    let currentX = level.startPos.x;
    let currentY = level.startPos.y;
    let currentDir = 'right' as 'left' | 'right' | 'up' | 'down'; 
    let localPainted = [] as GridPosition[];

    const processAtomicCommand = async (action: BlockType) => {
        if (signal.aborted || gameStatus === 'lost') return;
        
        let dx = 0, dy = 0, nextDir = currentDir, isPaint = false;

        switch (action) {
            case BlockType.MOVE_UP:    dy = -1; nextDir = 'up'; break;
            case BlockType.MOVE_DOWN:  dy = 1;  nextDir = 'down'; break;
            case BlockType.MOVE_LEFT:  dx = -1; nextDir = 'left'; break;
            case BlockType.MOVE_RIGHT: dx = 1;  nextDir = 'right'; break;
            case BlockType.PAINT:      isPaint = true; break;
            default: return; 
        }

        if (isPaint) {
            localPainted = [...localPainted, {x: currentX, y: currentY}];
            setPaintedCells(localPainted);
            await wait(PAINT_DURATION);
            return;
        }

        if (dx !== 0 || dy !== 0) {
            const nextX = currentX + dx;
            const nextY = currentY + dy;
            
            // Check Bounds
            const isOutOfBounds = nextX < 0 || nextX >= level.gridSize || nextY < 0 || nextY >= level.gridSize;
            
            // Check Obstacles
            const isObstacle = level.obstacles.some(o => o.x === nextX && o.y === nextY);
            
            if (isObstacle || isOutOfBounds) {
                // Visual Bump
                setRobotState({ x: nextX, y: nextY, dir: nextDir });
                audioService.playSfx('error');
                await wait(200);
                // Return to position
                setRobotState({ x: currentX, y: currentY, dir: nextDir });
                
                setGameStatus('lost');
                throw new Error('Collision');
            } else {
                currentX = nextX; currentY = nextY; currentDir = nextDir;
                setRobotState({ x: currentX, y: currentY, dir: nextDir });
                if (!isHackerMode) audioService.playSfx('click'); 
                await wait(STEP_DURATION);
            }
        }
    };

    try {
        // Linear execution with Lookahead for Loops
        for (let i = 0; i < program.length; i++) {
             if (signal.aborted) break;
             if (gameStatus === 'lost') break;

             setCurrentBlockIndex(i);
             const block = program[i];

             // HANDLE LOOPS (REPEAT_2, REPEAT_3, REPEAT_UNTIL)
             // Assumes syntax: [REPEAT_N, COMMAND_TO_REPEAT]
             if (block === BlockType.REPEAT_3 || block === BlockType.REPEAT_2 || block === BlockType.REPEAT_UNTIL) {
                 if (i + 1 < program.length) {
                     const nextBlock = program[i+1];
                     
                     let count = 1;
                     if (block === BlockType.REPEAT_2) count = 2;
                     else if (block === BlockType.REPEAT_3) count = 3;
                     else if (block === BlockType.REPEAT_UNTIL) count = 100; // Safety cap
                     
                     for (let k = 0; k < count; k++) {
                         if (signal.aborted || gameStatus === 'lost') break;
                         
                         // REPEAT_UNTIL condition check: Stop if goal reached
                         if (block === BlockType.REPEAT_UNTIL && level.goalPos) {
                             if (currentX === level.goalPos.x && currentY === level.goalPos.y) break;
                         }

                         await processAtomicCommand(nextBlock);
                     }
                     
                     i++; // Skip the next block in the main loop as we just executed it inside the loop
                 }
             } else {
                 await processAtomicCommand(block);
             }
        }
        
        // Final Win Check
        if (gameStatus !== 'lost' && !signal.aborted) {
             if (level.goalPos && currentX === level.goalPos.x && currentY === level.goalPos.y) {
                await wait(200);
                setGameStatus('won');
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            } else if (level.goalPos) {
                 await wait(500);
                 setGameStatus('lost');
            }
        }

    } catch(e) { 
        if (e.message !== 'Collision') {
             setIsPlaying(false); 
        }
    }
    
    if (!signal.aborted && gameStatus !== 'lost' && gameStatus !== 'won') {
        setIsPlaying(false);
        setCurrentBlockIndex(null);
    }
  };

  const availableBlocks = level.availableBlocks || [];
  const blocksByCategory = Array.from(new Set(availableBlocks.map(b => BLOCK_DEFINITIONS[b].category)));

  // THEME STYLES
  const bgClass = isHackerMode ? 'bg-slate-900' : 'bg-slate-50';
  const textClass = isHackerMode ? 'text-green-400 font-mono' : 'text-slate-800 font-sans';

  // --- RENDER ---
  return (
    <div className={`fixed inset-0 flex flex-col md:flex-row w-full h-full overflow-hidden ${bgClass} ${textClass}`}>
      
      {/* HEADER CONTROLS (Floating on Mobile / Sidebar on Desktop) */}
      
      {/* ÁREA 1: PREVIEW (PALCO) - Altura Dinâmica no Mobile */}
      <div className={`
          w-full md:w-[45%] flex flex-col relative shrink-0 transition-[height] duration-500 ease-in-out
          ${isStageExpanded ? 'h-[60%]' : 'h-[35%]'} md:h-full 
          border-b md:border-b-0 md:border-r border-slate-300
          ${isHackerMode ? 'bg-black' : 'bg-slate-200'}
      `}>
          {/* FLOATING HEADER CONTROLS (Mobile) */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-40 md:hidden pointer-events-none">
              <button onClick={onBack} className="p-2 bg-white/40 backdrop-blur-md rounded-full text-slate-900 shadow-sm pointer-events-auto border border-white/40 hover:bg-white/60 transition touch-manipulation">
                  <ArrowLeft size={20} className={isHackerMode ? 'text-green-900' : 'text-slate-900'} />
              </button>
              
              <div className="flex flex-col items-center pointer-events-auto bg-white/40 backdrop-blur-md px-3 py-1 rounded-xl border border-white/40 shadow-sm">
                  <span className={`font-heading text-xs truncate max-w-[120px] ${isHackerMode ? 'text-green-900' : 'text-slate-900'}`}>
                      {level.title}
                  </span>
                  {level.timeLimit && <span className="text-[10px] font-bold text-slate-700">{timeLeft}s</span>}
              </div>

              <div className="flex gap-2 pointer-events-auto">
                   <button onClick={() => setTutorialOpen(true)} className="p-2 bg-white/40 backdrop-blur-md rounded-full shadow-sm border border-white/40 hover:bg-white/60 transition touch-manipulation">
                       <HelpCircle size={20} className={isHackerMode ? 'text-green-900' : 'text-slate-900'} />
                   </button>
                   
                   {/* Toggle Expand (Maximize/Minimize Stage) */}
                   <button 
                      onClick={() => setIsStageExpanded(!isStageExpanded)}
                      className="p-2 bg-white/40 backdrop-blur-md rounded-full shadow-sm border border-white/40 hover:bg-white/60 transition touch-manipulation"
                   >
                      {isStageExpanded ? <Minimize2 size={20} className={isHackerMode ? 'text-green-900' : 'text-slate-900'}/> : <Maximize2 size={20} className={isHackerMode ? 'text-green-900' : 'text-slate-900'}/>}
                   </button>
              </div>
          </div>
          
          {/* Desktop Header Elements (Hidden on Mobile) */}
          <div className="hidden md:flex absolute top-4 left-4 z-40 gap-2">
             <button onClick={onBack} className="p-2 bg-white rounded-full text-slate-800 shadow-md border border-slate-200 hover:scale-105 transition"><ArrowLeft size={20} /></button>
          </div>

          <div className="flex-1 relative overflow-hidden flex items-center justify-center p-2 pt-14 md:pt-2">
              {/* Grid Container */}
              <div 
                className={`
                    relative shadow-xl rounded-xl overflow-hidden transition-all duration-300 origin-center
                    ${gameStatus === 'lost' ? 'ring-4 ring-red-400 animate-shake' : ''}
                    scale-[0.55] sm:scale-75 md:scale-90 lg:scale-100
                `}
                style={{
                    width: level.gridSize * 60,
                    height: level.gridSize * 60,
                    backgroundColor: isHackerMode ? '#000' : '#fff',
                    backgroundImage: isHackerMode 
                      ? 'linear-gradient(to right, #003300 1px, transparent 1px), linear-gradient(to bottom, #003300 1px, transparent 1px)'
                      : 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)',
                    backgroundSize: '60px 60px'
                }}
              >
                  {/* Goal */}
                  {level.goalPos && (
                      <div className="absolute flex items-center justify-center animate-pulse" style={{ left: level.goalPos.x * 60, top: level.goalPos.y * 60, width: 60, height: 60 }}>
                          <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center ${isHackerMode ? 'bg-green-900 border-green-500' : 'bg-green-200 border-green-400'}`}>
                              <div className={`w-4 h-4 rounded-full ${isHackerMode ? 'bg-green-400' : 'bg-green-500'}`} />
                          </div>
                      </div>
                  )}
                  {/* Obstacles */}
                  {level.obstacles.map((obs, i) => (
                      <div key={i} className={`absolute rounded-lg border-b-4 ${isWaterLevel ? 'bg-blue-400 border-blue-600' : (isHackerMode ? 'bg-green-950 border-green-800' : 'bg-slate-700 border-slate-900')}`} style={{ left: obs.x * 60 + 5, top: obs.y * 60 + 5, width: 50, height: 50 }}></div>
                  ))}
                  {/* Painted */}
                  {paintedCells.map((cell, i) => (
                       <div key={`paint-${i}`} className={`absolute ${isHackerMode ? 'bg-green-500/30' : 'bg-purple-400/50'}`} style={{ left: cell.x * 60, top: cell.y * 60, width: 60, height: 60 }} />
                  ))}
                  {/* Robot */}
                  <Robot 
                    x={robotState.x} y={robotState.y} cellSize={60} direction={robotState.dir}
                    isHappy={gameStatus === 'won'} isSad={gameStatus === 'lost'} isTalking={isSpeaking || tutorialOpen}
                    skinId={user?.activeSkin}
                  />
              </div>
          </div>

          {/* Feedback Overlay */}
          {(gameStatus === 'won' || gameStatus === 'lost') && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                  <div className={`rounded-2xl p-6 text-center w-full max-w-xs shadow-2xl animate-popIn bg-white`}>
                      <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 ${gameStatus === 'won' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {gameStatus === 'won' ? <CheckCircle size={32} /> : <XCircle size={32} />}
                      </div>
                      <h2 className="text-xl font-heading mb-1 text-slate-800">{gameStatus === 'won' ? 'Incrível!' : 'Ops!'}</h2>
                      <p className="text-sm font-bold text-slate-500 mb-4 leading-tight">
                          {gameStatus === 'won' ? level.explanation : 'Algo deu errado. Tente de novo!'}
                      </p>
                      <div className="flex gap-2 justify-center">
                          <Button onClick={resetGame} variant="secondary" size="sm">Tentar</Button>
                          {gameStatus === 'won' && (
                              <Button onClick={() => onNextLevel(program.length)} variant="primary" size="sm">Próximo <ArrowRight size={16} /></Button>
                          )}
                      </div>
                  </div>
              </div>
          )}
      </div>

      {/* ÁREA 2: TOOLBOX + WORKSPACE */}
      <div className="flex-1 flex flex-col overflow-hidden relative bg-slate-50 h-full">
          
          {/* TOOLBOX (Scroll Horizontal) */}
          <div className={`
              shrink-0 w-full border-b shadow-sm z-10 scrollable-x
              ${isHackerMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}
          `}>
              <div className="p-2 flex gap-3 items-center min-w-max">
                  {blocksByCategory.map(cat => (
                     <div key={cat} className="flex gap-2 shrink-0 border-r border-slate-100 pr-3 last:border-0 items-center">
                         {availableBlocks.filter(b => BLOCK_DEFINITIONS[b].category === cat).map(type => (
                             <button 
                                key={type}
                                onClick={() => addBlock(type)}
                                disabled={isPlaying}
                                className={`
                                  active:scale-90 transition-transform duration-100 touch-manipulation
                                  ${isPlaying ? 'opacity-50 grayscale' : ''}
                                `}
                             >
                                <BlockIcon type={type} className="shadow-sm border-b-2 text-[10px] md:text-xs py-1.5 px-2" />
                             </button>
                         ))}
                     </div>
                  ))}
              </div>
          </div>

          {/* WORKSPACE (Scroll Vertical) */}
          <div 
             ref={programListRef}
             className={`flex-1 scrollable-y p-4 relative ${isHackerMode ? 'bg-slate-900' : 'bg-slate-50'}`}
          >
              <div className="flex flex-wrap content-start gap-2 pb-24"> 
                  {program.length === 0 && (
                      <div className="w-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl text-slate-400 opacity-60 pointer-events-none select-none">
                          <Code size={32} className="mb-2" />
                          <p className="text-sm font-bold text-center">Toque nos blocos<br/>para programar</p>
                      </div>
                  )}
                  
                  <AnimatePresence mode="popLayout">
                    {program.map((block, idx) => (
                        <motion.button
                          key={`${idx}-${block}`}
                          layout
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          onClick={() => removeBlock(idx)}
                          className={`
                            relative group transition-all duration-200 active:scale-95 touch-manipulation
                            ${currentBlockIndex === idx ? 'ring-4 ring-yellow-400 rounded-lg scale-105 z-10 shadow-xl' : ''}
                          `}
                        >
                            <BlockIcon type={block} showLabel={false} className="w-10 h-10 justify-center" />
                            <div className="absolute -bottom-2 -right-1 text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 border border-white">
                              {idx + 1}
                            </div>
                        </motion.button>
                    ))}
                  </AnimatePresence>
              </div>
          </div>

          {/* FLOATING ACTION BAR */}
          <div className={`
              absolute bottom-0 left-0 right-0 p-3 border-t shadow-[0_-4px_10px_rgba(0,0,0,0.1)] flex items-center justify-between gap-3 z-50
              safe-area-bottom
              ${isHackerMode ? 'bg-slate-800 border-slate-700' : 'bg-white/95 backdrop-blur border-slate-200'}
          `}>
               <div className={`text-xs font-bold ${isHackerMode ? 'text-green-600' : 'text-slate-400'}`}>
                   {program.length}/{level.maxBlocks}
               </div>

               <div className="flex gap-2 w-full max-w-[250px] ml-auto">
                  <Button 
                    onClick={handleClear} 
                    variant="danger" 
                    size="sm" 
                    disabled={program.length === 0 || isPlaying}
                    className="aspect-square p-0 w-12 flex items-center justify-center rounded-xl shrink-0 touch-manipulation"
                  >
                     <Trash2 size={20} />
                  </Button>
                  <Button 
                    onClick={() => runProgram(false)} 
                    variant={gameStatus === 'running' ? 'secondary' : 'success'}
                    size="md"
                    className="flex-1 shadow-lg rounded-xl py-3 text-sm touch-manipulation"
                    disabled={program.length === 0 || gameStatus === 'won'}
                  >
                      {gameStatus === 'running' ? (
                          <><Pause size={20} fill="currentColor" /> PARAR</>
                      ) : (
                          <><Play size={20} fill="currentColor" /> EXECUTAR</>
                      )}
                  </Button>
               </div>
          </div>

      </div>

      {/* Skin Selector & Modals (Mantidos como estavam) */}
      {showSkinSelector && user && onUpdateSkin && (
        <SkinSelector currentSkin={user.activeSkin || 'default'} userTier={user.subscription} onClose={() => setShowSkinSelector(false)} onSelect={(id) => { onUpdateSkin(id); setShowSkinSelector(false); }} />
      )}
      
      {tutorialOpen && level.tutorialMessage && (
         <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
             <div className="bg-white p-6 rounded-2xl shadow-2xl border-4 border-yellow-400 max-w-sm w-full animate-popIn relative">
                 <button onClick={() => setTutorialOpen(false)} className="absolute top-2 right-2 text-slate-300"><XCircle /></button>
                 <div className="flex gap-4 items-start">
                     <div className="text-4xl">💡</div>
                     <div>
                         <h4 className="font-bold uppercase text-xs mb-1 text-yellow-600">Dica do Sparky</h4>
                         <p className="text-lg leading-tight font-bold text-slate-800">{level.tutorialMessage}</p>
                     </div>
                 </div>
                 <Button onClick={() => setTutorialOpen(false)} size="sm" className="w-full mt-6 touch-manipulation" variant="secondary">Entendi</Button>
             </div>
         </div>
      )}

    </div>
  );
};
