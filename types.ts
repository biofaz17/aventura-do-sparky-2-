
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export enum BlockCategory {
  MOTION = 'MOTION', 
  CONTROL = 'CONTROL', 
  ACTION = 'ACTION', 
  EVENT = 'EVENT', 
  DECISION = 'DECISION',
}

export enum BlockType {
  MOVE_UP = 'MOVE_UP',
  MOVE_DOWN = 'MOVE_DOWN',
  MOVE_LEFT = 'MOVE_LEFT',
  MOVE_RIGHT = 'MOVE_RIGHT',
  REPEAT_2 = 'REPEAT_2',
  REPEAT_3 = 'REPEAT_3',
  REPEAT_UNTIL = 'REPEAT_UNTIL', // Novo: Repetir até o Objetivo
  PAINT = 'PAINT',
  START = 'START',
  IF_OBSTACLE = 'IF_OBSTACLE',
  IF_PATH = 'IF_PATH', // Novo: Se Caminho Livre
  ELSE_IF = 'ELSE_IF', // Novo: Senão Se
  ELSE = 'ELSE',
}

export type AgeGroup = '5-7' | '8-10' | '11-14';

export enum SubscriptionTier {
  FREE = 'FREE',
  STARTER = 'STARTER', // R$ 19,99
  PRO = 'PRO',         // R$ 49,99
}

export interface GridPosition {
  x: number;
  y: number;
}

export interface LevelConfig {
  id: number | string;
  title: string;
  mission?: string; // NOVO: Descrição persistente do problema a resolver
  gridSize: number;
  startPos: GridPosition;
  goalPos?: GridPosition;
  obstacles: GridPosition[];
  maxBlocks: number;
  availableBlocks: BlockType[];
  tutorialMessage?: string;
  explanation?: string;
  isCreative?: boolean;
  ageGroup: AgeGroup; // BNCC Alignment
  requiredSubscription: SubscriptionTier;
  bnccCode?: string; // e.g., EF01MA04
  timeLimit?: number; // Tempo em segundos (opcional, para níveis pagos)
  introData?: {
    title: string;
    description: string;
    category: BlockCategory;
  };
}

export interface UserSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  password?: string; // NOVO: Senha para login
  parentEmail: string;
  age: number;
  subscription: SubscriptionTier;
  progress: UserProgress;
  settings: UserSettings;
  activeSkin?: string; // NOVO: Skin selecionada (default, ninja, fairy, dino)
  isGuest?: boolean;
  lastActive?: number;
}

export interface UserProgress {
  unlockedLevels: number;
  stars: number;
  creativeProjects: number;
  totalBlocksUsed: number;
  secretsFound: number;
}

export interface CodeBlock {
  id: string; 
  type: BlockType;
  category: BlockCategory;
}

export interface SavedProject {
  id: string;
  name: string;
  createdAt: number;
  blocks: CodeBlock[];
}

export const BLOCK_DEFINITIONS: Record<BlockType, { category: BlockCategory, label: string, icon: string }> = {
  [BlockType.MOVE_UP]: { category: BlockCategory.MOTION, label: 'Andar Cima', icon: 'arrow-up' },
  [BlockType.MOVE_DOWN]: { category: BlockCategory.MOTION, label: 'Andar Baixo', icon: 'arrow-down' },
  [BlockType.MOVE_LEFT]: { category: BlockCategory.MOTION, label: 'Andar Esq.', icon: 'arrow-left' },
  [BlockType.MOVE_RIGHT]: { category: BlockCategory.MOTION, label: 'Andar Dir.', icon: 'arrow-right' },
  [BlockType.REPEAT_2]: { category: BlockCategory.CONTROL, label: 'Repetir 2x', icon: 'repeat' },
  [BlockType.REPEAT_3]: { category: BlockCategory.CONTROL, label: 'Repetir 3x', icon: 'repeat' },
  [BlockType.REPEAT_UNTIL]: { category: BlockCategory.CONTROL, label: 'Até Chegar', icon: 'infinity' },
  [BlockType.PAINT]: { category: BlockCategory.ACTION, label: 'Pintar Chão', icon: 'brush' },
  [BlockType.START]: { category: BlockCategory.EVENT, label: 'Ao Iniciar', icon: 'play' },
  [BlockType.IF_OBSTACLE]: { category: BlockCategory.DECISION, label: 'Se Obstáculo', icon: 'split' },
  [BlockType.IF_PATH]: { category: BlockCategory.DECISION, label: 'Se Caminho', icon: 'git-branch' },
  [BlockType.ELSE_IF]: { category: BlockCategory.DECISION, label: 'Senão Se', icon: 'git-merge' },
  [BlockType.ELSE]: { category: BlockCategory.DECISION, label: 'Senão', icon: 'corner-down-right' },
};
