
import { BlockType, LevelConfig, SubscriptionTier, BlockCategory } from './types';

// ========================================================================
// CONFIGURAÇÃO DE PAGAMENTO (MERCADO PAGO)
// ========================================================================
// SECURITY WARNING: Em produção, JAMAIS exponha o ACCESS_TOKEN no frontend.
// O correto é o Frontend chamar seu Backend, e o Backend chamar o Mercado Pago.
// Para este ambiente de demonstração, usamos uma variável simulada ou fallback.

const getEnvVar = (key: string, fallback: string) => {
  // @ts-ignore - Em Vite/React moderno usa-se import.meta.env, em Node process.env
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
     // @ts-ignore
     return import.meta.env[key];
  }
  return fallback;
};

export const MERCADO_PAGO_CONFIG = {
  // Access Token deve vir de variáveis de ambiente (.env)
  // Fallback mantido APENAS para funcionamento da demo. 
  // TODO: Remover fallback string em produção.
  ACCESS_TOKEN: getEnvVar("VITE_MP_ACCESS_TOKEN", "APP_USR-8166086179258406-121408-05022e7e0a81de5650dd39b508fe1fc7-92174155"), 
  RECEIVER_NAME: "Sparky Educação Digital Ltda",
  RECEIVER_DOCUMENT: "00.000.000/0001-99", 
  STATEMENT_DESCRIPTOR: "SPARKYAPP", 
  CURRENCY: "BRL"
};

export const PLANS = {
  [SubscriptionTier.STARTER]: {
    id: SubscriptionTier.STARTER,
    title: "Starter",
    price: 19.99,
    priceLabel: "19,99",
    features: [
      "Mundo da Floresta (+15 Níveis)",
      "Desafios de Padrões e Pintura",
      "Sem Anúncios"
    ],
    recommended: false
  },
  [SubscriptionTier.PRO]: {
    id: SubscriptionTier.PRO,
    title: "Pro",
    price: 49.99,
    priceLabel: "49,99",
    features: [
      "Mundo Hacker (+30 Níveis Totais)",
      "Modo Criativo Ilimitado",
      "Certificado de Mestre em Lógica",
      "Lógica Condicional (IA)"
    ],
    recommended: true
  }
};

// ========================================================================
// LISTA DE NÍVEIS COM DIFICULDADE PROGRESSIVA (46 NÍVEIS)
// ========================================================================

export const LEVELS: LevelConfig[] = [
  // ========================================================================
  // MUNDO 1: A BASE LÓGICA (GRÁTIS) - Níveis 1 a 16
  // Foco: Sequência, Orientação Espacial e Loops Simples
  // ========================================================================
  {
    id: 1,
    title: "Olá Mundo",
    mission: "Vamos começar! Leve o Sparky até a bandeira verde.",
    gridSize: 3,
    startPos: { x: 0, y: 1 },
    goalPos: { x: 2, y: 1 },
    obstacles: [],
    maxBlocks: 3,
    availableBlocks: [BlockType.MOVE_RIGHT],
    tutorialMessage: "Arraste 'Andar Dir.' e aperte Executar.",
    explanation: "Perfeito! Todo programa começa com um primeiro passo.",
    ageGroup: '5-7',
    requiredSubscription: SubscriptionTier.FREE,
    introData: { title: "Sequência", description: "O computador segue suas ordens exatamente na ordem.", category: BlockCategory.MOTION }
  },
  {
    id: 2,
    title: "Virando a Esquina",
    mission: "O caminho não é reto. Precisamos descer!",
    gridSize: 4,
    startPos: { x: 0, y: 0 },
    goalPos: { x: 2, y: 2 },
    obstacles: [{x:1, y:0}, {x:2, y:0}, {x:0, y:2}, {x:1, y:2}],
    maxBlocks: 5,
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.MOVE_DOWN],
    tutorialMessage: "Combine Direita e Baixo.",
    explanation: "Muito bem! Você já domina o espaço 2D.",
    ageGroup: '5-7',
    requiredSubscription: SubscriptionTier.FREE
  },
  {
    id: 3,
    title: "O Muro",
    mission: "Um obstáculo! Dê a volta por cima.",
    gridSize: 4,
    startPos: { x: 0, y: 2 },
    goalPos: { x: 3, y: 2 },
    obstacles: [{ x: 1, y: 2 }, { x: 2, y: 2 }],
    maxBlocks: 6,
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.MOVE_UP, BlockType.MOVE_DOWN],
    tutorialMessage: "Cima, Direita, Direita, Baixo...",
    explanation: "Isso é 'Desvio Condicional' manual. Ótimo raciocínio!",
    ageGroup: '5-7',
    requiredSubscription: SubscriptionTier.FREE
  },
  {
    id: 4,
    title: "Super Poder: Loop",
    mission: "Muitos passos iguais? Use a Repetição!",
    gridSize: 5,
    startPos: { x: 0, y: 2 },
    goalPos: { x: 3, y: 2 }, 
    obstacles: [],
    maxBlocks: 2,
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.REPEAT_3, BlockType.REPEAT_2],
    tutorialMessage: "Arraste 'Andar Dir.' para dentro ou logo abaixo do 'Repetir 3x'.",
    explanation: "Loops economizam tempo e energia!",
    ageGroup: '5-7',
    requiredSubscription: SubscriptionTier.FREE,
    introData: { title: "Loops", description: "Repetir tarefas é especialidade dos robôs.", category: BlockCategory.CONTROL }
  },
  {
    id: 5,
    title: "Caminho em L",
    mission: "Ande bastante para a direita, depois suba.",
    gridSize: 5,
    startPos: { x: 0, y: 4 },
    goalPos: { x: 3, y: 2 },
    obstacles: [{x:0, y:3}, {x:1, y:3}, {x:2, y:3}], 
    maxBlocks: 5, 
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.MOVE_UP, BlockType.REPEAT_3, BlockType.REPEAT_2],
    tutorialMessage: "Use um 'Repetir 3x' para Direita, e DEPOIS um 'Repetir 2x' para Cima.",
    explanation: "Você combinou dois loops! Isso é algoritmos em ação.",
    ageGroup: '5-7',
    requiredSubscription: SubscriptionTier.FREE
  },
  {
    id: 6,
    title: "Labirinto em U",
    mission: "Faça o contorno sem bater nas paredes.",
    gridSize: 5,
    startPos: { x: 0, y: 0 },
    goalPos: { x: 4, y: 0 },
    obstacles: [{x:1,y:0}, {x:2,y:0}, {x:3,y:0}, {x:1,y:1}, {x:2,y:1}, {x:3,y:1}, {x:1,y:2}, {x:2,y:2}, {x:3,y:2}],
    maxBlocks: 8,
    availableBlocks: [BlockType.MOVE_DOWN, BlockType.MOVE_RIGHT, BlockType.MOVE_UP, BlockType.REPEAT_3],
    tutorialMessage: "Desça tudo, vá para a direita, suba tudo.",
    explanation: "Sua orientação espacial está ficando afiada!",
    ageGroup: '5-7',
    requiredSubscription: SubscriptionTier.FREE
  },
  {
    id: 7,
    title: "Matemática",
    mission: "Chegue lá. Distância = 5. (Dica: 3 + 2)",
    gridSize: 6,
    startPos: { x: 0, y: 2 },
    goalPos: { x: 5, y: 2 },
    obstacles: [],
    maxBlocks: 4, 
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.REPEAT_3, BlockType.REPEAT_2],
    tutorialMessage: "Combine 'Repetir 3' e 'Repetir 2' para andar 5 casas.",
    explanation: "Eficiência máxima! 3 + 2 = 5.",
    ageGroup: '5-7',
    requiredSubscription: SubscriptionTier.FREE
  },
  // --- NÍVEL 8 CORRIGIDO: CAMINHO LIVRE PARA ZIGZAGUE ---
  {
    id: 8,
    title: "Ziguezague Longo",
    mission: "Desvie dos obstáculos: Direita, Baixo, Direita, Baixo...",
    gridSize: 6,
    startPos: { x: 0, y: 0 },
    goalPos: { x: 4, y: 4 },
    // Obstáculos forçando um ziguezague (Escadinha)
    obstacles: [
       {x:1,y:0}, {x:2,y:0}, {x:3,y:0}, {x:4,y:0}, // Bloqueia topo direto
       {x:0,y:2}, {x:2,y:2}, {x:3,y:2}, {x:4,y:2}, // Bloqueia meio
       {x:0,y:4}, {x:1,y:4}, {x:3,y:4}             // Bloqueia fim
    ],
    maxBlocks: 10,
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.MOVE_DOWN, BlockType.REPEAT_2],
    explanation: "Cuidado com a cabeça! Passamos raspando.",
    ageGroup: '8-10',
    requiredSubscription: SubscriptionTier.FREE
  },
  // --- NÍVEL 9 CORRIGIDO: CAMINHO CIRCULAR SIMPLES ---
  {
    id: 9,
    title: "Patrulha Quadrada",
    mission: "Faça um quadrado para voltar ao início.",
    gridSize: 5,
    startPos: { x: 1, y: 1 },
    goalPos: { x: 1, y: 1 },
    obstacles: [{x:2,y:2}], // Obstáculo no centro
    maxBlocks: 10,
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.MOVE_DOWN, BlockType.MOVE_LEFT, BlockType.MOVE_UP, BlockType.REPEAT_2],
    tutorialMessage: "Direita 2x, Baixo 2x, Esquerda 2x, Cima 2x.",
    explanation: "Ir e voltar é um conceito importante em funções!",
    ageGroup: '8-10',
    requiredSubscription: SubscriptionTier.FREE
  },
  // --- NÍVEL 10 CORRIGIDO: ENTRADA LIBERADA ---
  {
    id: 10,
    title: "Caracol Quadrado",
    mission: "Entre na espiral até o centro.",
    gridSize: 5,
    startPos: { x: 0, y: 0 },
    goalPos: { x: 2, y: 2 },
    obstacles: [
       {x:1,y:1}, {x:2,y:1}, {x:3,y:1}, // Parede interna Cima
       {x:3,y:2},                       // Parede interna Dir
       {x:1,y:3}, {x:2,y:3}, {x:3,y:3}, // Parede interna Baixo
       {x:1,y:2}                        // Parede interna Esq
       // A entrada deve ser feita contornando tudo
    ],
    maxBlocks: 12,
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.MOVE_DOWN, BlockType.MOVE_LEFT, BlockType.MOVE_UP],
    explanation: "Que tontura! Mas chegamos ao centro.",
    ageGroup: '8-10',
    requiredSubscription: SubscriptionTier.FREE
  },
  // --- NÍVEL 11 CORRIGIDO: CAMINHO LIVRE PARA PULO ---
  {
    id: 11,
    title: "Pulo Longo",
    mission: "Use loops para cruzar o vazio rapidamente.",
    gridSize: 7,
    startPos: { x: 0, y: 3 },
    goalPos: { x: 6, y: 3 },
    obstacles: [{x:1,y:2}, {x:1,y:4}, {x:5,y:2}, {x:5,y:4}], // Obstáculos nas laterais, corredor livre
    maxBlocks: 6, 
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.REPEAT_3],
    tutorialMessage: "Dois grandes saltos de 3 passos cada.",
    explanation: "Você cobriu uma grande distância com pouco código.",
    ageGroup: '8-10',
    requiredSubscription: SubscriptionTier.FREE
  },
  {
    id: 12,
    title: "Otimização II",
    mission: "Otimize! Chegue em X=5 usando apenas loops.",
    gridSize: 6,
    startPos: { x: 0, y: 0 },
    goalPos: { x: 5, y: 0 }, 
    obstacles: [],
    maxBlocks: 4, 
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.REPEAT_3, BlockType.REPEAT_2],
    tutorialMessage: "Matemática: 3 + 2 = 5 passos.",
    explanation: "Matemática aplicada é programação eficiente.",
    ageGroup: '8-10',
    requiredSubscription: SubscriptionTier.FREE
  },
  {
    id: 13,
    title: "A Cruz",
    mission: "Contorne a cruz central.",
    gridSize: 5,
    startPos: { x: 2, y: 0 },
    goalPos: { x: 2, y: 4 },
    obstacles: [{x:2,y:1}, {x:2,y:2}, {x:2,y:3}, {x:1,y:2}, {x:3,y:2}],
    maxBlocks: 10,
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.MOVE_DOWN, BlockType.MOVE_LEFT],
    explanation: "Navegação precisa.",
    ageGroup: '8-10',
    requiredSubscription: SubscriptionTier.FREE
  },
  // --- NÍVEL 14 CORRIGIDO: OBSTÁCULOS COERENTES ---
  {
    id: 14,
    title: "Desafio da Memória",
    mission: "Caminho: Dir, Baixo, Dir, Cima, Dir.",
    gridSize: 6,
    startPos: { x: 0, y: 1 }, // Começa em Y=1
    goalPos: { x: 3, y: 1 },
    // Caminho desejado: (0,1) -> (1,1) -> (1,2) -> (2,2) -> (2,1) -> (3,1)
    // Obstáculos para forçar esse caminho:
    obstacles: [
        {x:1,y:0}, {x:2,y:0}, // Bloqueia cima
        {x:2,y:1},            // Bloqueia direto (1,1)->(2,1)
        {x:0,y:2},            // Bloqueia descer cedo demais? nao
        {x:3,y:2}, {x:4,y:2}
    ],
    maxBlocks: 10,
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.MOVE_UP, BlockType.MOVE_DOWN],
    explanation: "Memória sequencial é vital para programar.",
    ageGroup: '8-10',
    requiredSubscription: SubscriptionTier.FREE
  },
  {
    id: 15,
    title: "Formatura do Mundo 1",
    mission: "Use tudo o que aprendeu para atravessar o labirinto final.",
    gridSize: 7,
    startPos: { x: 0, y: 0 },
    goalPos: { x: 6, y: 6 },
    obstacles: [
        {x:1,y:0}, {x:2,y:0}, {x:3,y:0},
        {x:5,y:1}, {x:5,y:2}, {x:5,y:3},
        {x:1,y:3}, {x:2,y:3}, {x:3,y:3},
        {x:3,y:5}, {x:4,y:5}, {x:5,y:5}
    ],
    maxBlocks: 15,
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.MOVE_DOWN, BlockType.MOVE_LEFT, BlockType.REPEAT_3, BlockType.REPEAT_2],
    explanation: "PARABÉNS! Você completou o treinamento básico. O mundo Starter aguarda!",
    ageGroup: '8-10',
    requiredSubscription: SubscriptionTier.FREE
  },
  // --- NÍVEL 16 CORRIGIDO: PINTAR O CAMINHO ---
  {
    id: 16,
    title: "Caminho Colorido",
    mission: "Pinte o caminho seguro entre as águas.",
    gridSize: 5,
    startPos: { x: 0, y: 2 },
    goalPos: { x: 4, y: 2 },
    // Obstáculos (Água) ao redor do caminho
    obstacles: [
        {x:0,y:1}, {x:1,y:1}, {x:2,y:1}, {x:3,y:1}, {x:4,y:1}, // Água cima
        {x:0,y:3}, {x:1,y:3}, {x:2,y:3}, {x:3,y:3}, {x:4,y:3}  // Água baixo
    ],
    maxBlocks: 8,
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.PAINT, BlockType.REPEAT_3],
    tutorialMessage: "Use 'Pintar' a cada passo para marcar o chão seguro.",
    explanation: "Você criou uma trilha segura!",
    ageGroup: '5-7',
    requiredSubscription: SubscriptionTier.FREE
  },

  // ========================================================================
  // MUNDO 2: A FLORESTA DE CORES (STARTER) - Níveis 17 a 31
  // Foco: Ação (Pintar), Reconhecimento de Padrões e Debugging
  // ========================================================================
  {
    id: 17,
    title: "O Pincel Mágico",
    mission: "Bem-vindo à Floresta! Pinte o chão marcado.",
    gridSize: 4,
    startPos: { x: 0, y: 2 },
    goalPos: { x: 3, y: 2 },
    obstacles: [],
    maxBlocks: 5,
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.PAINT],
    tutorialMessage: "Use o bloco Roxo para pintar onde tem um 'X' (ou onde você quiser marcar).",
    explanation: "Agora você interage com o mundo, não apenas anda nele!",
    ageGroup: '8-10',
    requiredSubscription: SubscriptionTier.STARTER,
    introData: { title: "Ação", description: "Programas executam tarefas, como pintar, apagar ou enviar mensagens.", category: BlockCategory.ACTION }
  },
  {
    id: 18,
    title: "Marcando Território",
    mission: "Pinte os dois cantos da sala.",
    gridSize: 5,
    startPos: { x: 2, y: 2 },
    goalPos: { x: 4, y: 2 }, // Apenas chegar a um fim
    obstacles: [],
    maxBlocks: 10,
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.MOVE_LEFT, BlockType.MOVE_UP, BlockType.MOVE_DOWN, BlockType.PAINT],
    tutorialMessage: "Vá para um canto, pinte. Vá para o outro, pinte.",
    explanation: "Multitarefa executada com sucesso.",
    ageGroup: '8-10',
    requiredSubscription: SubscriptionTier.STARTER
  },
  {
    id: 19,
    title: "Linha de Montagem",
    mission: "Pinte 3 blocos em sequência usando um loop.",
    gridSize: 6,
    startPos: { x: 0, y: 2 },
    goalPos: { x: 4, y: 2 },
    obstacles: [],
    maxBlocks: 5,
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.PAINT, BlockType.REPEAT_3],
    tutorialMessage: "Dentro do loop: Pintar -> Andar.",
    explanation: "Você criou uma máquina de pintura automática!",
    ageGroup: '8-10',
    requiredSubscription: SubscriptionTier.STARTER
  },
  {
    id: 20,
    title: "Padrão Tracejado",
    mission: "Pinte um, pule um. Repita.",
    gridSize: 7,
    startPos: { x: 0, y: 3 },
    goalPos: { x: 6, y: 3 },
    obstacles: [],
    maxBlocks: 6,
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.PAINT, BlockType.REPEAT_3, BlockType.REPEAT_2],
    tutorialMessage: "Pintar -> Andar -> Andar. Repita esse padrão.",
    explanation: "Reconhecer padrões é essencial para criptografia e arte.",
    ageGroup: '8-10',
    requiredSubscription: SubscriptionTier.STARTER
  },
  {
    id: 21,
    title: "O Jardineiro",
    mission: "Plante (pinte) flores em volta da pedra central.",
    gridSize: 5,
    startPos: { x: 1, y: 1 },
    goalPos: { x: 1, y: 1 }, // Volta ao inicio
    obstacles: [{x:2, y:2}], // Pedra no meio
    maxBlocks: 12,
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.MOVE_DOWN, BlockType.MOVE_LEFT, BlockType.MOVE_UP, BlockType.PAINT],
    tutorialMessage: "Ande em quadrado em volta da pedra, pintando cada passo.",
    explanation: "Belo jardim digital!",
    ageGroup: '8-10',
    requiredSubscription: SubscriptionTier.STARTER
  },
  {
    id: 22,
    title: "Labirinto Invisível",
    mission: "Pinte o caminho correto para não se perder na volta.",
    gridSize: 6,
    startPos: { x: 0, y: 0 },
    goalPos: { x: 5, y: 5 },
    obstacles: [{x:1,y:0}, {x:2,y:0}, {x:3,y:0}, {x:4,y:1}, {x:4,y:2}, {x:4,y:3}, {x:2,y:4}, {x:2,y:5}],
    maxBlocks: 15,
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.MOVE_DOWN, BlockType.PAINT],
    tutorialMessage: "Marque os pontos de virada com tinta.",
    explanation: "Como João e Maria, você deixou migalhas (tinta)!",
    ageGroup: '8-10',
    requiredSubscription: SubscriptionTier.STARTER
  },
  {
    id: 23,
    title: "Padrão Xadrez",
    mission: "Pinte como um tabuleiro de xadrez numa linha.",
    gridSize: 6,
    startPos: { x: 0, y: 2 },
    goalPos: { x: 5, y: 2 },
    obstacles: [],
    maxBlocks: 6,
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.PAINT, BlockType.REPEAT_3],
    tutorialMessage: "Pinta, Anda, Anda. Espere, isso é tracejado. Tente: Pinta, Anda. Repita.",
    explanation: "Padrões binários (1, 0, 1, 0) são a linguagem dos computadores.",
    ageGroup: '8-10',
    requiredSubscription: SubscriptionTier.STARTER
  },
  {
    id: 24,
    title: "Contornando o Lago",
    mission: "Dê a volta no lago e pinte os 4 cantos.",
    gridSize: 6,
    startPos: { x: 1, y: 1 },
    goalPos: { x: 1, y: 1 },
    obstacles: [{x:2,y:2}, {x:2,y:3}, {x:3,y:2}, {x:3,y:3}], // Lago central
    maxBlocks: 16,
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.MOVE_DOWN, BlockType.MOVE_LEFT, BlockType.MOVE_UP, BlockType.PAINT, BlockType.REPEAT_2],
    explanation: "Geometria aplicada!",
    ageGroup: '8-10',
    requiredSubscription: SubscriptionTier.STARTER
  },
  {
    id: 25,
    title: "A Ponte de Cores",
    mission: "Construa uma ponte (pinte) para atravessar o abismo imaginário.",
    gridSize: 7,
    startPos: { x: 0, y: 3 },
    goalPos: { x: 6, y: 3 },
    obstacles: [],
    maxBlocks: 8,
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.PAINT, BlockType.REPEAT_3],
    explanation: "Sua ponte de dados está sólida.",
    ageGroup: '8-10',
    requiredSubscription: SubscriptionTier.STARTER
  },
  {
    id: 26,
    title: "Slalom Gigante",
    mission: "Desvie das árvores e pinte a neve ao passar.",
    gridSize: 8,
    startPos: { x: 0, y: 0 },
    goalPos: { x: 7, y: 7 },
    obstacles: [{x:1,y:1}, {x:3,y:3}, {x:5,y:5}],
    maxBlocks: 15,
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.MOVE_DOWN, BlockType.PAINT, BlockType.REPEAT_3],
    explanation: "Estilo e precisão!",
    ageGroup: '11-14',
    requiredSubscription: SubscriptionTier.STARTER
  },
  {
    id: 27,
    title: "Depuração (Debug)",
    mission: "O caminho parece óbvio, mas tem uma pegadinha. Atenção!",
    gridSize: 6,
    startPos: { x: 0, y: 0 },
    goalPos: { x: 5, y: 5 },
    obstacles: [{x:5,y:4}, {x:4,y:5}], // Bloqueiam a chegada direta
    maxBlocks: 10,
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.MOVE_DOWN, BlockType.MOVE_LEFT],
    tutorialMessage: "Você terá que fazer um movimento 'estranho' no final.",
    explanation: "Debug é encontrar e corrigir erros de lógica. Você conseguiu!",
    ageGroup: '11-14',
    requiredSubscription: SubscriptionTier.STARTER
  },
  {
    id: 28,
    title: "A Espiral Pintada",
    mission: "Entre na espiral pintando o caminho.",
    gridSize: 7,
    startPos: { x: 0, y: 0 },
    goalPos: { x: 3, y: 3 },
    obstacles: [
        {x:1,y:1}, {x:2,y:1}, {x:3,y:1}, {x:4,y:1}, {x:5,y:1},
        {x:5,y:2}, {x:5,y:3}, {x:5,y:4}, {x:5,y:5},
        {x:4,y:5}, {x:3,y:5}, {x:2,y:5}, {x:1,y:5},
        {x:1,y:4}, {x:1,y:3}, {x:1,y:2}
    ],
    maxBlocks: 20,
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.MOVE_DOWN, BlockType.MOVE_LEFT, BlockType.MOVE_UP, BlockType.PAINT],
    explanation: "Arte algorítmica!",
    ageGroup: '11-14',
    requiredSubscription: SubscriptionTier.STARTER
  },
  {
    id: 29,
    title: "Economia de Tinta",
    mission: "Chegue ao fim, mas você só pode usar o bloco 'Pintar' 2 vezes.",
    gridSize: 6,
    startPos: { x: 0, y: 2 },
    goalPos: { x: 5, y: 2 },
    obstacles: [],
    maxBlocks: 8,
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.PAINT, BlockType.REPEAT_3],
    tutorialMessage: "Pinte apenas pontos estratégicos (início e fim?).",
    explanation: "Gestão de recursos é crucial em projetos grandes.",
    ageGroup: '11-14',
    requiredSubscription: SubscriptionTier.STARTER
  },
  {
    id: 30,
    title: "Labirinto Espelhado",
    mission: "O mapa é simétrico. Use isso a seu favor.",
    gridSize: 7,
    startPos: { x: 3, y: 0 },
    goalPos: { x: 3, y: 6 },
    obstacles: [
       {x:2,y:1}, {x:4,y:1},
       {x:1,y:2}, {x:5,y:2},
       {x:2,y:3}, {x:4,y:3},
       {x:1,y:4}, {x:5,y:4},
       {x:2,y:5}, {x:4,y:5}
    ],
    maxBlocks: 15,
    availableBlocks: [BlockType.MOVE_DOWN, BlockType.MOVE_RIGHT, BlockType.MOVE_LEFT],
    explanation: "Simetria simplifica o código.",
    ageGroup: '11-14',
    requiredSubscription: SubscriptionTier.STARTER
  },
  {
    id: 31,
    title: "Desafio Final Starter",
    mission: "Atravesse, pinte o centro, e saia pelo outro lado.",
    gridSize: 9,
    startPos: { x: 0, y: 4 },
    goalPos: { x: 8, y: 4 },
    obstacles: [
       {x:4,y:0}, {x:4,y:1}, {x:4,y:2}, {x:4,y:3}, // Parede vertical cima
       {x:4,y:5}, {x:4,y:6}, {x:4,y:7}, {x:4,y:8}  // Parede vertical baixo
    ],
    maxBlocks: 15,
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.MOVE_UP, BlockType.MOVE_DOWN, BlockType.PAINT, BlockType.REPEAT_3],
    tutorialMessage: "Só há uma passagem estreita no meio (4,4). Pinte-a ao passar!",
    explanation: "VOCÊ É UM EXPERT! O mundo Pro e seus algoritmos complexos te aguardam.",
    ageGroup: '11-14',
    requiredSubscription: SubscriptionTier.STARTER
  },

  // ========================================================================
  // MUNDO 3: O HACKER (PRO) - Níveis 32 a 46
  // Foco: Lógica Condicional (IA), Abstração e Algoritmos Complexos
  // ========================================================================
  {
    id: 32,
    title: "O Sensor Inteligente",
    mission: "Use o 'Se Obstáculo' para não bater na parede invisível.",
    gridSize: 5,
    startPos: { x: 0, y: 2 },
    goalPos: { x: 4, y: 2 },
    obstacles: [{ x: 2, y: 2 }],
    maxBlocks: 6,
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.IF_OBSTACLE, BlockType.MOVE_UP, BlockType.MOVE_DOWN, BlockType.ELSE],
    tutorialMessage: "O robô deve 'sentir' a parede e pular.",
    explanation: "Bem-vindo à Lógica Condicional. Seu robô agora toma decisões!",
    ageGroup: '11-14',
    requiredSubscription: SubscriptionTier.PRO,
    introData: { title: "Condicionais", description: "O código se adapta ao mundo: SE algo acontecer, FAÇA isso.", category: BlockCategory.DECISION }
  },
  {
    id: 33,
    title: "Decisão Binária",
    mission: "Se tiver parede, vá para cima. Senão, vá para a direita.",
    gridSize: 6,
    startPos: { x: 0, y: 4 },
    goalPos: { x: 5, y: 0 },
    obstacles: [{x:1,y:4}, {x:3,y:2}],
    maxBlocks: 10,
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.MOVE_UP, BlockType.IF_OBSTACLE, BlockType.ELSE, BlockType.REPEAT_3],
    tutorialMessage: "Crie um padrão que se repete e se adapta.",
    explanation: "Isso é um algoritmo adaptativo!",
    ageGroup: '11-14',
    requiredSubscription: SubscriptionTier.PRO
  },
  {
    id: 34,
    title: "Corredor Incerto",
    mission: "O caminho muda toda vez (na lógica). Crie um código genérico.",
    gridSize: 6,
    startPos: { x: 0, y: 2 },
    goalPos: { x: 5, y: 2 },
    obstacles: [{x:2,y:2}, {x:4,y:2}],
    maxBlocks: 8,
    availableBlocks: [BlockType.MOVE_RIGHT, BlockType.IF_OBSTACLE, BlockType.MOVE_UP, BlockType.MOVE_DOWN, BlockType.REPEAT_3],
    explanation: "Código genérico funciona em qualquer situação!",
    ageGroup: '11-14',
    requiredSubscription: SubscriptionTier.PRO
  },
  {
    id: 35,
    title: "Até Chegar",
    mission: "Use o loop 'Até Chegar' para andar até a bandeira.",
    gridSize: 5,
    startPos: { x: 0, y: 2 },
    goalPos: { x: 4, y: 2 },
    obstacles: [],
    maxBlocks: 3,
    availableBlocks: [BlockType.REPEAT_UNTIL, BlockType.MOVE_RIGHT],
    tutorialMessage: "Este bloco repete o comando até o objetivo ser alcançado.",
    explanation: "Isso é um loop While!",
    ageGroup: '11-14',
    requiredSubscription: SubscriptionTier.PRO
  },
  {
    id: 36,
    title: "Desvio Automático",
    mission: "Avance e desvie automaticamente dos obstáculos.",
    gridSize: 6,
    startPos: { x: 0, y: 2 },
    goalPos: { x: 5, y: 2 },
    obstacles: [{x:2,y:2}, {x:3,y:2}],
    maxBlocks: 6,
    availableBlocks: [BlockType.REPEAT_UNTIL, BlockType.MOVE_RIGHT, BlockType.IF_OBSTACLE, BlockType.MOVE_UP, BlockType.MOVE_DOWN],
    explanation: "Sensor de obstáculos ativado.",
    ageGroup: '11-14',
    requiredSubscription: SubscriptionTier.PRO
  },
  {
    id: 45,
    title: "Desafio Hacker",
    mission: "Um labirinto complexo que exige condicionais e loops.",
    gridSize: 8,
    startPos: {x:0,y:0},
    goalPos: {x:7,y:7},
    obstacles: [{x:1,y:0}, {x:3,y:2}, {x:5,y:4}, {x:6,y:6}],
    maxBlocks: 15,
    availableBlocks: [BlockType.REPEAT_UNTIL, BlockType.IF_OBSTACLE, BlockType.MOVE_RIGHT, BlockType.MOVE_DOWN, BlockType.ELSE],
    explanation: "Você dominou a lógica de programação!",
    ageGroup: '11-14',
    requiredSubscription: SubscriptionTier.PRO
  },
  {
    id: 46,
    title: "Mestre da Lógica",
    mission: "Use tudo o que aprendeu para vencer o nível final.",
    gridSize: 8,
    startPos: {x: 0, y: 0},
    goalPos: {x: 7, y: 7},
    obstacles: [{x:1,y:1}, {x:2,y:2}, {x:3,y:3}, {x:4,y:4}, {x:5,y:5}, {x:6,y:6}],
    maxBlocks: 20,
    availableBlocks: [BlockType.REPEAT_UNTIL, BlockType.IF_OBSTACLE, BlockType.MOVE_RIGHT, BlockType.MOVE_DOWN, BlockType.ELSE, BlockType.MOVE_UP, BlockType.MOVE_LEFT],
    explanation: "Parabéns! Você é um verdadeiro mestre.",
    ageGroup: '11-14',
    requiredSubscription: SubscriptionTier.PRO
  }
];

export const CREATIVE_LEVEL: LevelConfig = {
  id: 'creative',
  title: 'Modo Criativo',
  mission: 'Crie sua própria arte ou caminho!',
  gridSize: 10,
  startPos: { x: 0, y: 0 },
  obstacles: [],
  maxBlocks: 100,
  availableBlocks: [
    BlockType.MOVE_UP, BlockType.MOVE_DOWN, BlockType.MOVE_LEFT, BlockType.MOVE_RIGHT,
    BlockType.PAINT, BlockType.REPEAT_2, BlockType.REPEAT_3, BlockType.REPEAT_UNTIL,
    BlockType.IF_OBSTACLE, BlockType.IF_PATH, BlockType.ELSE_IF, BlockType.ELSE
  ],
  isCreative: true,
  ageGroup: '5-7',
  requiredSubscription: SubscriptionTier.STARTER,
  explanation: "Sua imaginação é o limite."
};
