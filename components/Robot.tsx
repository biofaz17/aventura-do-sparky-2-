
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RobotProps {
  x: number;
  y: number;
  cellSize: number;
  gap?: number;
  isHappy?: boolean;
  isSad?: boolean;
  isPainting?: boolean;
  isTalking?: boolean;
  direction?: 'left' | 'right' | 'up' | 'down';
  skinId?: string; // default, ninja, fairy, dino
}

export const Robot: React.FC<RobotProps> = ({ 
  x, 
  y, 
  cellSize, 
  gap = 0,
  isHappy, 
  isSad, 
  isPainting, 
  isTalking,
  direction = 'right',
  skinId = 'default'
}) => {
  const stride = cellSize + gap;
  
  let rotation = 0;
  let scaleX = 1;

  // Se estiver triste (erro), ignoramos a rotação de direção para focar na animação de batida
  if (!isSad) {
    switch (direction) {
        case 'up': rotation = -15; break; 
        case 'down': rotation = 15; break; 
        case 'left': scaleX = -1; rotation = 0; break; 
        case 'right': scaleX = 1; rotation = 0; break;
        default: rotation = 0;
    }
  }

  // --- SKIN RENDERING LOGIC ---

  const renderSkin = () => {
    switch (skinId) {
      case 'ninja':
        return (
          <div className="relative w-full h-full">
            {/* Faixa da Cabeça (Bandana) */}
            <motion.div 
              animate={isSad ? { rotate: [0, 20, -20, 0] } : { rotate: [0, 5, 0, -5, 0] }}
              transition={{ duration: isSad ? 0.2 : 0.5, repeat: Infinity, repeatDelay: isSad ? 0 : 0.5 }}
              className={`absolute -right-4 top-2 w-6 h-2 rounded-r-lg z-0 origin-left ${isSad ? 'bg-slate-500 top-4 rotate-45' : 'bg-red-600'}`} 
            />
            {/* Corpo Ninja */}
            <div className={`absolute inset-0 bg-slate-800 rounded-2xl border-2 border-slate-950 shadow-lg overflow-hidden flex flex-col items-center transition-colors ${isSad ? 'bg-slate-700' : ''}`}>
               {/* Olhos Ninja */}
               <div className={`w-full h-1/3 mt-2 flex items-center justify-center gap-3 relative z-10 ${isSad ? 'bg-slate-900' : 'bg-red-600'}`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  {isSad ? (
                      <>
                        <div className="text-white font-bold text-xs">X</div>
                        <div className="text-white font-bold text-xs">X</div>
                      </>
                  ) : (
                      <>
                        <div className="w-3 h-3 bg-white rounded-full animate-blink shadow-sm" />
                        <div className="w-3 h-3 bg-white rounded-full animate-blink shadow-sm" />
                      </>
                  )}
               </div>
               {/* Símbolo */}
               <div className="mt-2 text-slate-600 font-black text-xs">忍</div>
               {/* Cinto */}
               <div className={`absolute bottom-3 w-full h-2 ${isSad ? 'bg-slate-600' : 'bg-red-700'}`} />
            </div>
            {/* Espada nas costas */}
            <div className={`absolute -z-10 w-1 h-16 bg-slate-400 -right-1 -top-4 border border-slate-600 rounded-full ${isSad ? 'rotate-45 top-0' : 'rotate-12'}`}></div>
          </div>
        );

      case 'fairy':
        return (
          <div className="relative w-full h-full">
             {/* Asas - Caem quando triste */}
             <motion.div 
               animate={isSad ? { rotate: 45, opacity: 0.5, y: 10 } : { scaleX: [1, 0.8, 1], opacity: [0.6, 0.9, 0.6] }}
               transition={{ duration: 0.5 }}
               className="absolute top-2 -left-4 w-6 h-8 bg-blue-200 rounded-full border border-white z-[-1]"
             />
             <motion.div 
               animate={isSad ? { rotate: -45, opacity: 0.5, y: 10 } : { scaleX: [1, 0.8, 1], opacity: [0.6, 0.9, 0.6] }}
               transition={{ duration: 0.5, delay: 0.1 }}
               className="absolute top-2 -right-4 w-6 h-8 bg-blue-200 rounded-full border border-white z-[-1]"
             />
             
             {/* Corpo Fada */}
             <div className="absolute inset-0 bg-pink-400 rounded-full border-2 border-pink-600 shadow-lg flex flex-col items-center justify-center overflow-visible">
                {/* Coroa */}
                <motion.div 
                    animate={isSad ? { y: 5, rotate: 20 } : { y: 0 }}
                    className="absolute -top-4 text-yellow-400 drop-shadow-sm"
                >
                   <svg width="24" height="20" viewBox="0 0 24 20" fill="currentColor">
                      <path d="M2 18H22L19 10L16 16L12 4L8 16L5 10L2 18Z" stroke="#B45309" strokeWidth="1" />
                   </svg>
                </motion.div>
                {/* Rosto */}
                <div className="w-3/4 h-1/2 bg-pink-100 rounded-full flex items-center justify-center gap-2 mt-2">
                   {isSad ? (
                       <div className="flex gap-2 text-[10px] text-slate-800 font-bold items-center">
                           <span>&gt;</span><span>&lt;</span>
                       </div>
                   ) : (
                       <>
                        <div className="w-2 h-3 bg-slate-800 rounded-full" />
                        <div className="w-2 h-3 bg-slate-800 rounded-full" />
                       </>
                   )}
                   <div className="absolute bottom-2 w-2 h-1 bg-pink-300 rounded-full opacity-50" /> {/* Blush */}
                </div>
                {/* Vestido */}
                <div className="absolute bottom-0 w-full h-1/3 bg-pink-500 rounded-b-full border-t border-pink-600" />
             </div>
             {/* Varinha - Quebrada ou caída */}
             <motion.div 
                animate={isSad ? { rotate: 90, y: 10, x: 10 } : { rotate: 12 }}
                className="absolute -right-2 top-0"
             >
                <div className="w-1 h-8 bg-yellow-700 mx-auto" />
                <div className={`w-3 h-3 bg-yellow-400 rotate-45 -mt-1 ${isSad ? 'bg-slate-400' : ''}`} />
             </motion.div>
          </div>
        );

      case 'dino':
        return (
          <div className="relative w-full h-full">
             {/* Cauda */}
             <div className="absolute bottom-0 -left-3 w-6 h-4 bg-green-500 rounded-full z-[-1] rotate-12" />
             
             {/* Espinhos nas costas */}
             <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex gap-1 -mt-1">
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-orange-500"></div>
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-orange-500 -mt-1"></div>
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-orange-500"></div>
             </div>

             {/* Corpo Dino */}
             <div className="absolute inset-0 bg-green-500 rounded-2xl rounded-tr-[2rem] border-2 border-green-700 shadow-lg flex flex-col items-center">
                 {/* Focinho e Curativo */}
                 <div className="w-full h-1/2 mt-2 flex justify-center items-center gap-4 pl-4 relative">
                     {isSad ? (
                         <>
                            <div className="w-3 h-1 bg-slate-900 rotate-45 rounded-full" /> {/* Olho fechado */}
                            <div className="absolute -top-2 right-2 bg-amber-200 w-4 h-4 opacity-90 rotate-12 border border-amber-400 text-[8px] flex items-center justify-center text-amber-700">#</div> {/* Curativo */}
                         </>
                     ) : (
                         <div className="w-3 h-3 bg-slate-900 rounded-full border border-white" />
                     )}
                     <div className="w-1 h-1 bg-green-800 rounded-full mt-2" /> {/* Narina */}
                 </div>
                 {/* Barriga */}
                 <div className="absolute bottom-1 w-3/4 h-1/3 bg-yellow-200 rounded-xl" />
             </div>
          </div>
        );

      default: // Sparky Clássico
        return (
          <motion.div 
              className={`absolute inset-0 bg-blue-600 rounded-2xl shadow-[0_4px_0_#1e40af] border-2 border-blue-800 flex flex-col items-center justify-center overflow-hidden ${isSad ? 'bg-blue-700' : ''}`}
              animate={isTalking ? { scaleY: [1, 1.05, 0.95, 1], rotate: [0, -1, 1, 0] } : {}}
              transition={{ repeat: Infinity, duration: 0.4 }}
          >
             {/* Tela do Rosto */}
             <div className={`bg-white w-[85%] h-[60%] rounded-xl mb-1 flex flex-col items-center justify-center relative overflow-hidden border-2 ${isSad ? 'border-red-200 bg-slate-100' : 'border-blue-100'} shadow-inner`}>
                <div className="flex gap-3 z-10 mt-1">
                  {isSad ? (
                      // Olhos de Erro (X X)
                      <>
                        <div className="w-3 h-3 relative">
                            <div className="absolute inset-0 bg-slate-800 rotate-45 w-full h-[2px] top-1.5"></div>
                            <div className="absolute inset-0 bg-slate-800 -rotate-45 w-full h-[2px] top-1.5"></div>
                        </div>
                        <div className="w-3 h-3 relative">
                            <div className="absolute inset-0 bg-slate-800 rotate-45 w-full h-[2px] top-1.5"></div>
                            <div className="absolute inset-0 bg-slate-800 -rotate-45 w-full h-[2px] top-1.5"></div>
                        </div>
                      </>
                  ) : (
                      // Olhos Normais
                      <>
                        <motion.div 
                            animate={isTalking ? { height: ["0.5rem", "0.75rem", "0.5rem"] } : { scaleY: [1, 0.1, 1] }} 
                            transition={isTalking ? { repeat: Infinity, duration: 0.2 } : { repeat: Infinity, duration: 3, delay: 1 }}
                            className="w-3 h-4 bg-blue-900 rounded-full" 
                        />
                        <motion.div 
                            animate={isTalking ? { height: ["0.5rem", "0.75rem", "0.5rem"] } : { scaleY: [1, 0.1, 1] }} 
                            transition={isTalking ? { repeat: Infinity, duration: 0.2 } : { repeat: Infinity, duration: 3, delay: 1 }}
                            className="w-3 h-4 bg-blue-900 rounded-full" 
                        />
                      </>
                  )}
                </div>
                
                {/* Boca */}
                <motion.div 
                   className="mt-1"
                   animate={isTalking ? { scaleX: [1, 0.8, 1] } : {}}
                >
                    {isSad ? (
                        <div className="w-4 h-2 border-t-2 border-red-500 rounded-t-full mt-2" />
                    ) : (
                        <div className="w-6 h-3 border-b-4 border-blue-900 rounded-full" />
                    )}
                </motion.div>
             </div>
             
             {/* Peito */}
             <div className={`w-1/2 h-2 rounded-full mt-1 opacity-80 ${isSad ? 'bg-red-500 animate-pulse' : 'bg-yellow-400'}`} />
          </motion.div>
        );
    }
  };

  // Variantes de Animação Principal do Robô
  const robotVariants = {
      idle: { rotate: rotation, scaleX: scaleX },
      happy: { y: [0, -10, 0], rotate: rotation, scaleX: scaleX, transition: { repeat: Infinity, duration: 0.5 } },
      // Animação de Batida/Erro: Treme horizontalmente e rotaciona levemente
      sad: { 
          x: [-2, 2, -2, 2, 0], 
          rotate: [rotation - 5, rotation + 5, rotation - 5, rotation + 5, rotation],
          scale: [1, 0.9, 1],
          transition: { duration: 0.4 } 
      }
  };

  return (
    <motion.div
      className="absolute z-20 flex items-center justify-center pointer-events-none"
      initial={{ x: x * stride, y: y * stride }}
      animate={{ x: x * stride, y: y * stride }}
      transition={{ 
        x: { type: "spring", stiffness: 300, damping: 28, mass: 0.8 },
        y: { type: "spring", stiffness: 300, damping: 28, mass: 0.8 }
      }}
      style={{ width: cellSize, height: cellSize }}
    >
      <motion.div 
        className={`relative w-4/5 h-4/5`}
        variants={robotVariants}
        animate={isSad ? "sad" : (isHappy ? "happy" : "idle")}
      >
        {isPainting && (
           <motion.div 
             initial={{ scale: 0, opacity: 0 }}
             animate={{ scale: 1.5, opacity: 1 }}
             exit={{ opacity: 0 }}
             transition={{ duration: 0.3 }}
             className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-full h-4 bg-purple-400 rounded-full blur-md z-[-1]"
           />
        )}

        {/* Antena (Comum a todos, exceto Fada/Dino) */}
        {skinId === 'default' && (
          <motion.div 
             className="absolute -top-6 left-1/2 -translate-x-1/2 z-10"
             animate={isHappy || isTalking ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : (isSad ? { rotate: [0, 20, -20, 0], x: [0, 2, -2, 0] } : {})}
          >
              <svg width="20" height="30" viewBox="0 0 20 30" fill="none">
                 <path d="M10 0L14 12H8L12 24" stroke={isSad ? "#EF4444" : "#FBBF24"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm" />
                 <circle cx="10" cy="24" r="2" fill={isSad ? "#EF4444" : "#FBBF24"} />
              </svg>
          </motion.div>
        )}

        {/* EFEITOS DE ERRO (OVERLAY) */}
        <AnimatePresence>
            {isSad && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.5, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: -10 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap"
                >
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="text-2xl drop-shadow-md"
                    >
                        💫
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* RENDER SKIN */}
        {renderSkin()}
        
        {/* Rodas/Pés (Genéricos) */}
        {skinId !== 'fairy' && (
          <>
            <div className={`absolute -bottom-2 left-1 w-4 h-3 bg-slate-800 rounded-b-lg border-2 border-slate-600 ${isSad ? 'translate-y-[-2px]' : ''}`} />
            <div className={`absolute -bottom-2 right-1 w-4 h-3 bg-slate-800 rounded-b-lg border-2 border-slate-600 ${isSad ? 'translate-y-[-2px]' : ''}`} />
          </>
        )}
      </motion.div>
    </motion.div>
  );
};
