
import React, { useState, useEffect } from 'react';
import { AuthScreen } from './screens/AuthScreen';
import { LevelMap } from './screens/LevelMap';
import { GameScreen } from './screens/GameScreen';
import { Dashboard } from './screens/Dashboard';
import { ParentPanel } from './screens/ParentPanel';
import { CheckoutScreen } from './screens/CheckoutScreen';
import { PaymentSuccessScreen } from './screens/PaymentSuccessScreen';
// Telas de checkout interno restauradas
import { UserProfile, SubscriptionTier } from './types';
import { LEVELS, MERCADO_PAGO_CONFIG } from './constants';
import { ParentGate } from './components/ParentGate';
import { SubscriptionModal } from './components/SubscriptionModal';
import { MarketingModal } from './components/MarketingModal';
import { Mail, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import SupabaseTest from './components/SupabaseTest';
import { AdminPanel } from './screens/AdminPanel';
import { HomeScreen } from './screens/HomeScreen';
import { supabase } from './services/supabase';

// Enhanced Toast Notification
const NotificationToast = ({ msg, subMsg, show }: { msg: string, subMsg?: string, show: boolean }) => (
  <div className={`fixed top-4 right-4 bg-white border-l-4 border-green-500 text-slate-800 px-6 py-4 rounded-r-xl shadow-2xl z-[100] transition-transform duration-500 ${show ? 'translate-x-0' : 'translate-x-full'}`}>
    <div className="flex items-start gap-3">
      <div className="bg-green-100 p-2 rounded-full text-green-600">
        <Mail size={20} />
      </div>
      <div>
        <div className="font-bold text-sm">{typeof msg === 'string' ? msg : ''}</div>
        {subMsg && typeof subMsg === 'string' && <div className="text-xs text-slate-500 mt-1">{subMsg}</div>}
      </div>
    </div>
  </div>
);

enum Screen {
  HOME,
  AUTH,
  DASHBOARD,
  MAP,
  GAME,
  PARENTS,
  ADMIN,
  CHECKOUT,
  PAYMENT_SUCCESS,
  VERIFYING
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(
    window.location.hash === '#/admin' ? Screen.ADMIN : Screen.HOME
  );

  // User State
  const [user, setUser] = useState<UserProfile | null>(null);

  // UX State
  const [currentLevelId, setCurrentLevelId] = useState<number | string>(1);
  const [showParentGate, setShowParentGate] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showMarketingModal, setShowMarketingModal] = useState(false); // New Marketing Modal State
  const [gateAction, setGateAction] = useState(''); // What triggered the gate?
  const [notification, setNotification] = useState({ title: '', body: '' });
  
  // Payment Flow State
  const [pendingSubscriptionTier, setPendingSubscriptionTier] = useState<SubscriptionTier | null>(null);

  // Listener de URL Hash para acesso direto ao painel admin via /#/admin
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#/admin') {
        setScreen(Screen.ADMIN);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // O Flow de Pagamento foi movido para fora do app (Hotmart)

  // Helper function to show notifications
  const showNotification = (title: string, body: string) => {
    setNotification({ title, body });
    setTimeout(() => {
      setNotification({ title: '', body: '' });
    }, 4000);
  };

  // PERSISTENCE LOGIC: Save user state whenever it changes
  useEffect(() => {
    if (user && !user.isGuest) {
      const storageKey = `sparky_user_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(user));
    }
  }, [user]);

  // Lógica de Retorno do Mercado Pago Removida

  // PAYMENT RETURN HANDLER (Mercado Pago Redirects)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get('payment_id') || params.get('collection_id');
    const status = params.get('collection_status') || params.get('status');

    // Se voltamos do MP, precisamos verificar se o pagamento é real
    if (paymentId && user && screen !== Screen.VERIFYING && screen !== Screen.PAYMENT_SUCCESS) {
        verifyPayment(paymentId);
    } else if ((status === 'failure' || status === 'null') && window.location.search.includes('status')) {
        window.history.replaceState({}, document.title, window.location.pathname);
        showNotification("Pagamento não concluído", "Tente novamente ou escolha outro método.");
    }
  }, [user]);

  const verifyPayment = async (paymentId: string) => {
      setScreen(Screen.VERIFYING);
      
      try {
          // Em vez de chamar a API do Mercado Pago diretamente (que expõe o Token),
          // vamos aguardar o Webhook atualizar o perfil do usuário no Supabase.
          // Fazemos uma consulta ao perfil para ver se o plano já mudou.
          
          let attempts = 0;
          const maxAttempts = 5;
          const delay = 3000; // 3 segundos entre tentativas

          const checkSubscription = async () => {
              const { data, error } = await supabase
                  .from('profiles')
                  .select('subscription')
                  .eq('id', user?.id)
                  .single();

              if (error) throw error;
              return data.subscription !== SubscriptionTier.FREE;
          };

          const poll = async () => {
              const isUpdated = await checkSubscription();
              if (isUpdated) {
                  // Sucesso! O Webhook já processou.
                  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
                  setUser(profile as UserProfile);
                  setScreen(Screen.PAYMENT_SUCCESS);
                  window.history.replaceState({}, document.title, window.location.pathname);
              } else if (attempts < maxAttempts) {
                  attempts++;
                  setTimeout(poll, delay);
              } else {
                  // Tempo esgotado
                  setScreen(Screen.DASHBOARD);
                  showNotification("Processando Pagamento", "Seu pagamento foi recebido e está sendo processado. Seu acesso será liberado em instantes.");
                  window.history.replaceState({}, document.title, window.location.pathname);
              }
          };

          await poll();

      } catch (error) {
          console.error("Erro na verificação de pagamento:", error);
          setScreen(Screen.DASHBOARD);
          alert("Erro técnico ao verificar pagamento. Se você pagou, entre em contato com o suporte.");
          window.history.replaceState({}, document.title, window.location.pathname);
      }
  };

  const handleLogin = (profile: UserProfile) => {
    setUser(profile);
    setScreen(Screen.DASHBOARD);
  };

  const handleLogout = () => {
    setUser(null);
    setScreen(Screen.AUTH);
  };

  const handleUpdateProfile = (updatedUser: UserProfile) => {
    setUser(updatedUser);
  };

  const handleUpdateSkin = (skinId: string) => {
    if (!user) return;
    setUser({
      ...user,
      activeSkin: skinId
    });
    showNotification("Novo Visual!", "Sua skin foi atualizada com sucesso.");
  };

  const handleLevelComplete = (blocksUsed: number) => {
    if (!user) return;

    if (typeof currentLevelId === 'number') {
      // Find current level index in the sorted levels list
      const sortedLevels = [...LEVELS].sort((a, b) => (a.id as number) - (b.id as number));
      const currentIndex = sortedLevels.findIndex(l => l.id === currentLevelId);

      let nextLevelId = currentLevelId; // Default fallback

      if (currentIndex !== -1 && currentIndex < sortedLevels.length - 1) {
        // Avança para o próximo nível na lista ordenada, independente da faixa etária
        // Isso corrige o bug de travamento no nível 7 (fim da faixa 5-7) para o 8
        nextLevelId = sortedLevels[currentIndex + 1].id as number;
      }

      const newProgress = {
        ...user.progress,
        unlockedLevels: Math.max(user.progress.unlockedLevels, (nextLevelId as number)),
        stars: user.progress.stars + 1,
        totalBlocksUsed: user.progress.totalBlocksUsed + blocksUsed
      };

      // Update user state and Last Active timestamp
      const updatedUser = {
        ...user,
        progress: newProgress,
        lastActive: Date.now()
      };
      setUser(updatedUser);

      // --- PARENT NOTIFICATION LOGIC ---
      if (!user.isGuest) {
        console.log(`[SERVICE] Sending progress report to ${user.parentEmail}...`);
        // Only show toast occasionally or for big milestones to not annoy
        if (user.progress.stars % 5 === 0) {
          showNotification(
            `Progresso Salvo!`,
            `Dados sincronizados com o painel do Responsável.`
          );
        }
      }

      const justFinishedLevel = typeof currentLevelId === 'number' ? currentLevelId : 0;

      // PREPARA O PRÓXIMO NÍVEL
      // Atualizamos o state do ID para que, ao fechar o modal ou navegar, já estejamos no próximo.
      if (nextLevelId !== currentLevelId) {
        setCurrentLevelId(nextLevelId);
      }

      // --- MARKETING TRIGGER (FREE USERS) ---
      // Se o usuário for Grátis, mostra o modal de marketing APENAS a cada 3 níveis (3, 6, 9...)
      if (user.subscription === SubscriptionTier.FREE && justFinishedLevel > 0 && justFinishedLevel % 3 === 0) {
        setShowMarketingModal(true);
        // Interrompe o fluxo aqui. O modal cuidará da navegação ao fechar.
        return;
      }

      // FLUXO PADRÃO (Sem Marketing)
      if (nextLevelId !== currentLevelId) {
        // O fluxo padrão leva ao Mapa para mostrar o progresso visual
        setScreen(Screen.MAP);
      } else {
        setScreen(Screen.DASHBOARD);
        alert("Você completou esta etapa! Confira os próximos desafios no mapa.");
      }
    } else {
      // Creative mode done
      const newProgress = {
        ...user.progress,
        creativeProjects: user.progress.creativeProjects + 1,
        totalBlocksUsed: user.progress.totalBlocksUsed + blocksUsed
      };
      setUser({ ...user, progress: newProgress, lastActive: Date.now() });
      setScreen(Screen.DASHBOARD);
    }
  };

  const closeMarketingModal = () => {
    setShowMarketingModal(false);
    // Redireciona DIRETAMENTE para o próximo nível (Screen.GAME), conforme solicitado.
    // O currentLevelId já foi atualizado em handleLevelComplete antes do modal abrir.
    setScreen(Screen.GAME);
  };

  const handleMarketingUpgrade = () => {
    setShowMarketingModal(false);
    setShowSubscriptionModal(true);
  };

  // --- Parent Gate Logic ---
  const triggerParentGate = (action: string) => {
    setGateAction(action);
    setShowParentGate(true);
  };

  const handleGateSuccess = () => {
    setShowParentGate(false);
    if (gateAction === 'upgrade') {
      setShowSubscriptionModal(true);
    } else if (gateAction === 'parents_area') {
      setScreen(Screen.PARENTS);
    }
  };

  // --- Payment Flow Logic ---
  const handleCheckoutStart = (tier: SubscriptionTier) => {
    setPendingSubscriptionTier(tier);
    setShowSubscriptionModal(false);
    setScreen(Screen.CHECKOUT);
  };

  const handlePaymentComplete = () => {
    if (user && pendingSubscriptionTier) {
       const updatedUser = { 
           ...user, 
           subscription: pendingSubscriptionTier,
           isGuest: false,
       };
       setUser(updatedUser);
       setScreen(Screen.PAYMENT_SUCCESS);
    }
  };

  const handlePaymentCancel = () => {
    setPendingSubscriptionTier(null);
    setScreen(Screen.DASHBOARD);
  };

  // Payment Flow Logic Restaurada

  if (screen === Screen.HOME) {
    return (
      <div className="h-full w-full">
        <HomeScreen onStart={() => setScreen(Screen.AUTH)} />
      </div>
    );
  }

  if (screen === Screen.AUTH) {
    return (
      <AuthScreen onLogin={handleLogin} onAdminAccess={() => setScreen(Screen.ADMIN)} />
    );
  }

  // Admin: acessível sem login (rota secreta /#/admin)
  if (screen === Screen.ADMIN) {
    return (
      <div className="h-full w-full">
        <AdminPanel onBack={() => { window.location.hash = ''; setScreen(Screen.AUTH); }} />
      </div>
    );
  }

  // Ensure user exists for other screens
  if (!user) return null;

  return (
    <div className="antialiased text-gray-800 font-sans min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <NotificationToast
        msg={notification.title || ''}
        subMsg={notification.body || ''}
        show={!!notification.title}
      />

      {screen === Screen.DASHBOARD && (
        <div className="min-h-screen w-full scrollable-y">
          <Dashboard
            progress={user.progress}
            onPlayMission={() => setScreen(Screen.MAP)}
            onCreativeMode={() => {
              setCurrentLevelId('creative');
              setScreen(Screen.GAME);
            }}
            onOpenParents={() => triggerParentGate('parents_area')}
          />
        </div>
      )}

      {screen === Screen.MAP && (
        <div className="min-h-screen w-full scrollable-y">
          <LevelMap
            unlockedLevels={user.progress.unlockedLevels}
            userSubscription={user.subscription}
            onSelectLevel={(id) => {
              setCurrentLevelId(id);
              setScreen(Screen.GAME);
            }}
            onBack={() => setScreen(Screen.DASHBOARD)}
            onRequestUpgrade={() => triggerParentGate('upgrade')}
          />
        </div>
      )}

      {screen === Screen.GAME && (
        <GameScreen
          levelId={currentLevelId}
          onBack={() => setScreen(Screen.MAP)}
          onNextLevel={handleLevelComplete}
          user={user}
          onUpdateSkin={handleUpdateSkin}
        />
      )}

      {screen === Screen.PARENTS && (
        <div className="min-h-screen w-full scrollable-y">
          <ParentPanel
            user={user}
            onUpdateUser={handleUpdateProfile}
            onLogout={handleLogout}
            onBack={() => setScreen(Screen.DASHBOARD)}
            onRequestUpgrade={() => {
              setScreen(Screen.DASHBOARD);
              setTimeout(() => setShowSubscriptionModal(true), 100);
            }}
          />
        </div>
      )}

      {/* Admin: tratado acima, antes do guard de usuario */}

      {/* Fluxo de Checkout Removido */}

      {/* Modals */}
      {showMarketingModal && (
        <MarketingModal
          onUpgrade={handleMarketingUpgrade}
          onClose={closeMarketingModal}
        />
      )}

      {showParentGate && (
        <ParentGate
          action={gateAction === 'upgrade' ? 'fazer compras' : 'acessar área dos pais'}
          onSuccess={handleGateSuccess}
          onCancel={() => setShowParentGate(false)}
        />
      )}

      {showSubscriptionModal && (
        <SubscriptionModal
          onCheckoutStart={handleCheckoutStart}
          onClose={() => setShowSubscriptionModal(false)}
        />
      )}

      {/* Payment Screens */}
      {screen === Screen.CHECKOUT && pendingSubscriptionTier && (
         <div className="h-full w-full scrollable-y">
            <CheckoutScreen 
                user={user}
                tier={pendingSubscriptionTier}
                onConfirm={handlePaymentComplete}
                onCancel={handlePaymentCancel}
            />
         </div>
      )}

      {screen === Screen.PAYMENT_SUCCESS && (
         <div className="h-full w-full scrollable-y">
            <PaymentSuccessScreen 
                onContinue={() => setScreen(Screen.DASHBOARD)}
            />
         </div>
      )}

      {screen === Screen.VERIFYING && (
         <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-6 text-center">
             <div className="relative mb-8">
                 <div className="absolute inset-0 animate-ping bg-blue-100 rounded-full"></div>
                 <div className="relative bg-white p-4 rounded-full shadow-lg border-2 border-blue-100 italic">
                    <Loader2 size={64} className="text-blue-500 animate-spin" />
                 </div>
             </div>
             
             <div className="max-w-xs space-y-4">
                 <h2 className="text-2xl font-black text-slate-800 tracking-tight">Validando Pagamento</h2>
                 <p className="text-slate-500 font-medium">Estamos confirmando os dados com o Mercado Pago. Isso leva apenas alguns segundos...</p>
                 
                 <div className="flex items-center justify-center gap-2 text-blue-600 bg-blue-50 py-2 px-4 rounded-full text-sm font-bold border border-blue-100">
                    <ShieldCheck size={18} />
                    <span>Conexão Segura</span>
                 </div>
             </div>
         </div>
      )}
    </div>
  );
}
