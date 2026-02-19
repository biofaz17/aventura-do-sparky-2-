
import React from 'react';

interface SparkyLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const SparkyLogo: React.FC<SparkyLogoProps> = ({ 
  className = "", 
  showText = true,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-20",
    xl: "h-32"
  };

  const textSizes = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl",
    xl: "text-7xl"
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Sparky Icon SVG */}
      <svg 
        viewBox="0 0 100 100" 
        className={`${sizeClasses[size]} w-auto drop-shadow-md`}
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Raio (Antena) */}
        <path 
          d="M55 5 L65 25 L50 25 L60 45" 
          stroke="#FBBF24" 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="animate-pulse"
        />
        
        {/* Cabeça (Capacete) */}
        <rect x="15" y="25" width="70" height="60" rx="15" fill="#1D4ED8" stroke="#1E3A8A" strokeWidth="3" />
        
        {/* Orelhas */}
        <circle cx="10" cy="55" r="8" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
        <circle cx="90" cy="55" r="8" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />

        {/* Rosto (Parte Branca) */}
        <rect x="25" y="35" width="50" height="40" rx="10" fill="#FFFFFF" />

        {/* Olhos */}
        <circle cx="40" cy="50" r="4" fill="#1E3A8A" />
        <circle cx="60" cy="50" r="4" fill="#1E3A8A" />

        {/* Sorriso */}
        <path d="M40 65 Q50 72 60 65" stroke="#1E3A8A" strokeWidth="3" strokeLinecap="round" />
        
        {/* Detalhe peito (apenas se for logo full body, aqui focamos no rosto/ícone) */}
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-heading font-black text-blue-900 leading-none tracking-tight ${textSizes[size]}`}>
            SPARKY
          </span>
          {size !== 'sm' && (
            <span className="font-bold text-blue-500 text-xs md:text-sm uppercase tracking-widest leading-none ml-1">
              Code Adventure
            </span>
          )}
        </div>
      )}
    </div>
  );
};
