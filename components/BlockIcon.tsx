
import React from 'react';
import { ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Repeat, Play, Brush, Split, CornerDownRight, GitBranch, GitMerge, Flag } from 'lucide-react';
import { BlockType, BlockCategory, BLOCK_DEFINITIONS } from '../types';

interface BlockIconProps {
  type: BlockType;
  className?: string;
  showLabel?: boolean;
}

export const BlockIcon: React.FC<BlockIconProps> = ({ type, className = "", showLabel = true }) => {
  const def = BLOCK_DEFINITIONS[type];
  
  // Colors based on category (Scratch-inspired)
  const categoryColors = {
    [BlockCategory.MOTION]: "bg-blue-500 border-blue-700 shadow-blue-900",
    [BlockCategory.CONTROL]: "bg-orange-500 border-orange-700 shadow-orange-900",
    [BlockCategory.ACTION]: "bg-purple-500 border-purple-700 shadow-purple-900",
    [BlockCategory.EVENT]: "bg-yellow-400 border-yellow-600 shadow-yellow-800 text-yellow-900",
    [BlockCategory.DECISION]: "bg-teal-500 border-teal-700 shadow-teal-900",
  };

  const colorClass = categoryColors[def.category] || "bg-gray-500";
  const textColor = def.category === BlockCategory.EVENT ? "text-yellow-900" : "text-white";

  const renderIcon = () => {
    const size = 18;
    switch (type) {
      case BlockType.MOVE_RIGHT: return <ArrowRight size={size} strokeWidth={3} />;
      case BlockType.MOVE_LEFT: return <ArrowLeft size={size} strokeWidth={3} />;
      case BlockType.MOVE_UP: return <ArrowUp size={size} strokeWidth={3} />;
      case BlockType.MOVE_DOWN: return <ArrowDown size={size} strokeWidth={3} />;
      case BlockType.REPEAT_2: return <Repeat size={size} strokeWidth={3} />;
      case BlockType.REPEAT_3: return <Repeat size={size} strokeWidth={3} />;
      case BlockType.REPEAT_UNTIL: return <Flag size={size} strokeWidth={3} />;
      case BlockType.PAINT: return <Brush size={size} strokeWidth={3} />;
      case BlockType.START: return <Play size={size} strokeWidth={3} fill="currentColor" />;
      case BlockType.IF_OBSTACLE: return <Split size={size} strokeWidth={3} />;
      case BlockType.IF_PATH: return <GitBranch size={size} strokeWidth={3} />;
      case BlockType.ELSE_IF: return <GitMerge size={size} strokeWidth={3} />;
      case BlockType.ELSE: return <CornerDownRight size={size} strokeWidth={3} />;
      default: return null;
    }
  };

  return (
    <div className={`
      relative flex items-center gap-2 px-3 py-2 rounded-lg font-bold select-none
      border-b-4 active:border-b-0 active:translate-y-1 transition-all
      ${colorClass} ${textColor} ${className}
    `}>
      {/* Puzzle piece notch visual trick (CSS) */}
      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-3 bg-inherit rounded-r-full md:block hidden" />
      <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-3 bg-white/20 rounded-l-full md:block hidden" />

      <span className="shrink-0">{renderIcon()}</span>
      {showLabel && <span className="text-sm whitespace-nowrap">{def.label}</span>}
    </div>
  );
};