import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
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
import { AdminPanel } from './screens/AdminPanel';
import { HomeScreen } from './screens/HomeScreen';
import { userService } from './services/userService';

// Protected Route Component
const PrivateRoute = ({ children, user }: { children: React.ReactNode, user: UserProfile | null }) => {
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

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


export default function App() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

  // Listener de hash removido - usando rotas reais agora

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
    // Novo formato de URL: ?payment_status=success|failure|pending
    const paymentStatus = searchParams.get('payment_status');
    
    // Formato antigo do Mercado Pago (mantido por compatibilidade)
    let paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');
    let status = searchParams.get('collection_status') || searchParams.get('status');
    if (paymentId === 'null') paymentId = null;
    if (status === 'null') status = null;

    // Limpar URL via React Router se necessário
    const hasPaymentParams = paymentStatus || paymentId || 
                             window.location.search.includes('preference_id');

    // Pagamento aprovado (novo formato)
    if (paymentStatus === 'success') {
      if (user) {
        verifyPayment('mp_approved');
      } else {
        // Usuário ainda não logado: salva flag e redireciona para login
        sessionStorage.setItem('pending_payment_confirmation', 'true');
        navigate('/auth');
        showNotification("Pagamento Aprovado! 🎉", "Faça login para ativar seu plano.");
      }
      return;
    }

    // Pagamento com falha (novo formato)
    if (paymentStatus === 'failure' || paymentStatus === 'pending') {
      showNotification(
        paymentStatus === 'pending' ? "Pagamento Pendente" : "Pagamento não concluído",
        "Se desejar, você pode tentar o checkout novamente."
      );
      if (user) navigate('/dashboard');
      return;
    }

    // Formato antigo: pagamento com ID real
    if (paymentId && user) {
      verifyPayment(paymentId);
    }
  }, [user, searchParams]);

  const verifyPayment = async (paymentId: string) => {
      navigate('/verifying');
      
      try {
          // Em vez de chamar a API do Mercado Pago diretamente (que expõe o Token),
          // vamos aguardar o Webhook atualizar o perfil do usuário no Supabase.
          // Fazemos uma consulta ao perfil para ver se o plano já mudou.
          
          let attempts = 0;
          const maxAttempts = 5;
          const delay = 3000; // 3 segundos entre tentativas

          const checkSubscription = async () => {
              const subStatus = await userService.checkSubscription(user?.id || '');
              return subStatus !== SubscriptionTier.FREE;
          };

          const poll = async () => {
              const isUpdated = await checkSubscription();
              if (isUpdated) {
                  // Sucesso! O Webhook já processou.
                  const data = await userService.getUserByUsername(user?.username || '');
                  const profile = data?.profile_data as UserProfile;
                  if (profile) setUser(profile);
                  navigate('/success');
              } else if (attempts < maxAttempts) {
                  attempts++;
                  setTimeout(poll, delay);
              } else {
                  // Tempo esgotado
                  navigate('/dashboard');
                  showNotification("Processando Pagamento", "Seu pagamento foi recebido e está sendo processado. Seu acesso será liberado em instantes.");
              }
          };

          await poll();

      } catch (error) {
          console.error("Erro na verificação de pagamento:", error);
          navigate('/dashboard');
          alert("Erro técnico ao verificar pagamento. Se você pagou, entre em contato com o suporte.");
      }
  };

  const handleLogin = (profile: UserProfile) => {
    setUser(profile);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/auth');
  };

  const handleUpdateProfile = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    if (updatedUser && !updatedUser.isGuest) {
      userService.updateUser(updatedUser.id, { profile_data: updatedUser })
        .then(() => showNotification("Perfil Atualizado", "As alterações foram salvas na nuvem."))
        .catch(err => console.error("Erro ao salvar perfil:", err));
    }
  };

  const handleUpdateSkin = (skinId: string) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      activeSkin: skinId
    };
    handleUpdateProfile(updatedUser);
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

      // --- PERSISTENCE LOGIC (Cloud) ---
      if (!user.isGuest) {
        console.log(`[SERVICE] Persisting progress for ${user.id} to cloud...`);
        userService.updateUser(user.id, { profile_data: updatedUser })
          .catch(err => console.error('Failed to persist progress:', err));
        
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
        navigate('/mapa');
      } else {
        navigate('/dashboard');
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
      navigate('/dashboard');
    }
  };

  const closeMarketingModal = () => {
    setShowMarketingModal(false);
    // Redireciona DIRETAMENTE para o próximo nível (Screen.GAME), conforme solicitado.
    // O currentLevelId já foi atualizado em handleLevelComplete antes do modal abrir.
    navigate('/jogo');
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
      navigate('/parents');
    }
  };

  // --- Payment Flow Logic ---
  const handleCheckoutStart = (tier: SubscriptionTier) => {
    setPendingSubscriptionTier(tier);
    setShowSubscriptionModal(false);
    navigate('/checkout');
  };

  const handlePaymentComplete = () => {
    if (user && pendingSubscriptionTier) {
       const updatedUser = { 
           ...user, 
           subscription: pendingSubscriptionTier,
           isGuest: false,
       };
       setUser(updatedUser);
       navigate('/success');
    }
  };

  const handlePaymentCancel = () => {
    setPendingSubscriptionTier(null);
    navigate('/dashboard');
  };

  // Payment Flow Logic Restaurada

  return (
    <div className="antialiased text-gray-800 font-sans min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <NotificationToast
        msg={notification.title || ''}
        subMsg={notification.body || ''}
        show={!!notification.title}
      />

      <Routes>
        <Route path="/" element={<HomeScreen onStart={() => navigate('/auth')} />} />
        
        <Route path="/auth" element={
          <AuthScreen onLogin={handleLogin} onAdminAccess={() => navigate('/admin')} />
        } />

        <Route path="/admin" element={
          <div className="h-full w-full">
            <AdminPanel onBack={() => navigate('/auth')} />
          </div>
        } />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          user ? (
            <div className="min-h-screen w-full scrollable-y">
              <Dashboard
                progress={user.progress}
                onPlayMission={() => navigate('/mapa')}
                onCreativeMode={() => {
                  setCurrentLevelId('creative');
                  navigate('/jogo');
                }}
                onOpenParents={() => triggerParentGate('parents_area')}
              />
            </div>
          ) : <Navigate to="/auth" replace />
        } />

        <Route path="/mapa" element={
          user ? (
            <div className="min-h-screen w-full scrollable-y">
              <LevelMap
                unlockedLevels={user.progress.unlockedLevels}
                userSubscription={user.subscription}
                onSelectLevel={(id) => {
                  setCurrentLevelId(id);
                  navigate('/jogo');
                }}
                onBack={() => navigate('/dashboard')}
                onRequestUpgrade={() => triggerParentGate('upgrade')}
              />
            </div>
          ) : <Navigate to="/auth" replace />
        } />

        <Route path="/jogo" element={
          user ? (
            <GameScreen
              levelId={currentLevelId}
              onBack={() => navigate('/mapa')}
              onNextLevel={handleLevelComplete}
              user={user}
              onUpdateSkin={handleUpdateSkin}
            />
          ) : <Navigate to="/auth" replace />
        } />

        <Route path="/parents" element={
          user ? (
            <div className="min-h-screen w-full scrollable-y">
              <ParentPanel
                user={user}
                onUpdateUser={handleUpdateProfile}
                onLogout={handleLogout}
                onBack={() => navigate('/dashboard')}
                onRequestUpgrade={() => {
                  navigate('/dashboard');
                  setTimeout(() => setShowSubscriptionModal(true), 100);
                }}
              />
            </div>
          ) : <Navigate to="/auth" replace />
        } />

        <Route path="/checkout" element={
          user && pendingSubscriptionTier ? (
            <div className="h-full w-full scrollable-y">
              <CheckoutScreen 
                user={user}
                tier={pendingSubscriptionTier}
                onConfirm={handlePaymentComplete}
                onCancel={handlePaymentCancel}
              />
            </div>
          ) : <Navigate to={user ? '/dashboard' : '/auth'} replace />
        } />

        <Route path="/success" element={
          user ? (
            <div className="h-full w-full scrollable-y">
              <PaymentSuccessScreen 
                onContinue={() => navigate('/dashboard')}
              />
            </div>
          ) : <Navigate to="/auth" replace />
        } />

        <Route path="/verifying" element={
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
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Modals - Kept outside Routes as requested */}
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
          userTier={user?.subscription || SubscriptionTier.FREE}
          onCheckoutStart={handleCheckoutStart}
          onClose={() => setShowSubscriptionModal(false)}
        />
      )}
    </div>
  );
}
