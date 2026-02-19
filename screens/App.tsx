
import React, { useState, useEffect } from 'react';
import { AuthScreen } from './screens/AuthScreen';
import { LevelMap } from './screens/LevelMap';
import { GameScreen } from './screens/GameScreen';
import { Dashboard } from './screens/Dashboard';
import { ParentPanel } from './screens/ParentPanel';
import { CheckoutScreen } from './screens/CheckoutScreen';
import { PaymentSuccessScreen } from './screens/PaymentSuccessScreen';
import { UserProfile, SubscriptionTier } from './types';
import { LEVELS } from './constants';
import { ParentGate } from './components/ParentGate';
import { SubscriptionModal } from './components/SubscriptionModal';
import { MarketingModal } from './components/MarketingModal';
import { Mail } from 'lucide-react';

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
  AUTH,
  DASHBOARD,
  MAP,
  GAME,
  PARENTS,
  CHECKOUT,
  PAYMENT_SUCCESS
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(Screen.AUTH);
  
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

  // PAYMENT RETURN HANDLER (Mercado Pago Redirects)
  useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const status = params.get('collection_status') || params.get('status');
      
      // Se voltamos do MP com sucesso
      if (status === 'approved' && user) {
          // Limpa URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Atualiza usuário
          const updatedUser = { 
              ...user, 
              subscription: pendingSubscriptionTier || SubscriptionTier.PRO, // Default fallback if state lost
              isGuest: false,
          };
          setUser(updatedUser);
          setScreen(Screen.PAYMENT_SUCCESS);
      } else if (status === 'failure' || status === 'null') {
           window.history.replaceState({}, document.title, window.location.pathname);
           alert("O pagamento não foi concluído ou foi cancelado.");
      }
  }, [user]); // Depende do user estar carregado (poderia precisar de logica melhor de re-hydrate se fosse reload real da pagina)

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
        const sortedLevels = [...LEVELS].sort((a,b) => (a.id as number) - (b.id as number));
        const currentIndex = sortedLevels.findIndex(l => l.id === currentLevelId);
        
        let nextLevelId = currentLevelId; // Default fallback
        
        if (currentIndex !== -1 && currentIndex < sortedLevels.length - 1) {
            // Try to find the next level in the SAME age group first
            const currentLevel = sortedLevels[currentIndex];
            const nextPotential = sortedLevels[currentIndex + 1];
            
            if (nextPotential.ageGroup === currentLevel.ageGroup) {
                 nextLevelId = nextPotential.id as number;
            }
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

  // Callback manual (usado pelo modo demo fallback no checkout screen)
  const handlePaymentComplete = () => {
     if (user && pendingSubscriptionTier) {
        // Update user: remove guest status if successful (assuming data collection in checkout handles implicit registration logic for this demo)
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

  if (screen === Screen.AUTH) {
    return (
      <div className="h-full w-full scrollable-y bg-indigo-500">
         <AuthScreen onLogin={handleLogin} />
      </div>
    );
  }

  // Ensure user exists for other screens
  if (!user) return null; 

  return (
    <div className="antialiased text-slate-800 font-sans h-full w-full">
      <NotificationToast 
        msg={notification.title || ''} 
        subMsg={notification.body || ''} 
        show={!!notification.title} 
      />

      {screen === Screen.DASHBOARD && (
        <div className="h-full w-full scrollable-y">
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
        <div className="h-full w-full scrollable-y">
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
         <div className="h-full w-full scrollable-y">
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
    </div>
  );
}
