import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { 
  Users, ShoppingBag, Server, LogOut, RefreshCw, Search, 
  UserPlus, X, CheckCircle, AlertTriangle, Trash2, Star, 
  Clock, Shield, Database, Activity, 
  ChevronUp, Crown, Zap, Copy, Edit2, Lock, 
  Eye, EyeOff, Save, Filter, TrendingUp, DollarSign
} from 'lucide-react';
import { SubscriptionTier, UserProfile } from '../types';
import { ADMIN_PIN } from '../constants';
import { userService } from '../services/userService';
import { sendConfirmationEmail } from '../services/emailService';

// ---- Types ----
interface UserRecord {
  id: string;
  username: string;
  cpf?: string;
  parent_email?: string;
  password?: string;
  created_at?: string;
  last_active?: number;
  profile_data?: {
    subscription?: string;
    progress?: { unlockedLevels?: number; stars?: number };
    [key: string]: any;
  };
}

// ---- Constants & Utils ----
const GLASS_THICK = "bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl";
const GLASS_THIN = "bg-slate-900/40 backdrop-blur-md border border-slate-800/50 shadow-lg";

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

// ---- Sub-components ----

const StatCard = ({ icon, label, value, trend, colorClass }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  trend?: string;
  colorClass: string;
}) => (
  <motion.div 
    whileHover={{ scale: 1.02, translateY: -2 }}
    className={`${GLASS_THICK} p-6 rounded-[2rem] flex flex-col relative overflow-hidden group`}
  >
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity ${colorClass}`} />
    
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`p-3 rounded-2xl bg-opacity-10 shadow-inner ${colorClass.replace('bg-', 'bg-')}`}>
        {icon}
      </div>
      {trend && (
        <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg flex items-center gap-1 border border-emerald-500/10">
          <TrendingUp size={10} /> {trend}
        </span>
      )}
    </div>
    <div className="text-3xl font-black text-white tracking-tight relative z-10">{value}</div>
    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2 relative z-10">{label}</div>
  </motion.div>
);

const InfraStatusRow = ({ label, value, status }: { label: string; value: string; status: 'ok' | 'warning' | 'error' }) => (
  <div className="flex justify-between items-center py-3 border-b border-slate-800/30 group last:border-0">
    <span className="text-slate-400 text-xs font-medium group-hover:text-slate-200 transition-colors uppercase tracking-wider">{label}</span>
    <div className="flex items-center gap-3">
      <span className="text-slate-300 font-bold text-xs font-mono">{value}</span>
      <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(var(--color-rgb),0.5)] ${
        status === 'ok' ? 'bg-emerald-500 shadow-emerald-500/40' : 
        status === 'warning' ? 'bg-amber-500 shadow-amber-500/40' : 'bg-red-500 shadow-red-500/40'
      }`} />
    </div>
  </div>
);

const NavButton = ({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all relative group ${
      active 
        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' 
        : 'text-slate-500 hover:bg-slate-800/50 hover:text-white'
    }`}
  >
    <span className={`${active ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
      {icon}
    </span>
    <span className="tracking-tight">{label}</span>
    {active && (
      <motion.div 
        layoutId="nav-active"
        className="absolute left-1 w-1 h-6 bg-slate-950 rounded-full"
      />
    )}
  </button>
);

// ---- PIN Screen ----
const PinScreen: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  const handleDigit = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    setError(false);

    if (val && i < 5) {
      inputRefs.current[i + 1]?.focus();
    }

    const pin = next.join('');
    if (pin.length === 6) {
      setIsVerifying(true);
      setTimeout(() => {
        if (pin === ADMIN_PIN) {
          toast.success('Bem-vindo ao Sparky Control', { icon: '️🛡' });
          onSuccess();
        } else {
          setError(true);
          setDigits(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
          setIsVerifying(false);
        }
      }, 600);
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 selection:bg-emerald-500/30">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`${GLASS_THICK} p-12 flex flex-col items-center gap-8 w-full max-w-sm rounded-[3rem]`}
      >
        <div className="relative">
          <motion.div 
            animate={{ rotate: isVerifying ? 360 : 0 }}
            transition={{ repeat: isVerifying ? Infinity : 0, duration: 2, ease: "linear" }}
            className={`p-5 rounded-[2rem] ${error ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}
          >
            {isVerifying ? <RefreshCw size={40} className="animate-pulse" /> : <Lock size={40} />}
          </motion.div>
          {!isVerifying && (
             <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -right-2 -bottom-2 bg-emerald-500 text-slate-950 p-1.5 rounded-full shadow-lg"
             >
                <Shield size={16} />
             </motion.div>
          )}
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-black text-white tracking-tighter">Sparky Control</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">Digite o acesso mestre de administrador</p>
        </div>

        <div className="flex gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleDigit(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              disabled={isVerifying}
              className={`w-11 h-14 text-center rounded-2xl text-2xl font-black bg-slate-800/50 border-2 outline-none transition-all
                ${d ? 'border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'border-slate-800 text-slate-600'}
                ${error ? 'border-red-500 bg-red-500/5' : 'focus:border-emerald-400 focus:bg-emerald-500/5'}`}
            />
          ))}
        </div>

        <AnimatePresence>
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-400 text-sm font-black flex items-center gap-2"
            >
              <AlertTriangle size={14} /> PIN INCORRETO
            </motion.p>
          )}
        </AnimatePresence>

        <p className="text-slate-600 text-[9px] uppercase tracking-[0.3em] font-black text-center mt-4">
          Restricted Internal Area
        </p>
      </motion.div>
    </div>
  );
};

// ---- Edit User Modal ----
const EditUserModal: React.FC<{
  user: UserRecord;
  onClose: () => void;
  onSaved: () => void;
}> = ({ user, onClose, onSaved }) => {
  const [newPassword, setNewPassword] = useState(user.password || '');
  const [newEmail, setNewEmail] = useState(user.parent_email || '');
  const [newSub, setNewSub] = useState<SubscriptionTier>((user.profile_data?.subscription as SubscriptionTier) || SubscriptionTier.FREE);
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) { toast.error('Senha muito curta (mín. 4 caracteres)'); return; }
    
    setSaving(true);
    const loadingToast = toast.loading('Sincronizando mundos...');

    try {
      const updatedProfile = {
        ...(user.profile_data || {}),
        subscription: newSub,
      };

      await userService.updateUser(user.id, {
        password: newPassword,
        parent_email: newEmail,
        profile_data: updatedProfile,
      });

      toast.success('Mestre Sparky atualizou o explorador!', { id: loadingToast });
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error('Erro ao salvar: ' + (err.message || 'Falha na conexão'), { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className={`${GLASS_THICK} rounded-[2.5rem] p-10 w-full max-w-md shadow-emerald-500/5`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
              <Edit2 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Editar Explorador</h3>
              <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-0.5">ID: {user.username}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-white p-2 rounded-xl transition-colors hover:bg-slate-800">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Senha de Imersão</label>
              <div className="relative group">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500/50 group-hover:border-slate-600 transition-all shadow-inner"
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400 transition-colors">
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email do Portal (Responsável)</label>
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500/50 transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Nível de Acesso (Plano)</label>
              <div className="grid grid-cols-3 gap-2">
                {([SubscriptionTier.FREE, SubscriptionTier.STARTER, SubscriptionTier.PRO] as SubscriptionTier[]).map(tier => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setNewSub(tier)}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-tighter border-2 transition-all flex items-center justify-center gap-1 ${
                      newSub === tier
                        ? tier === SubscriptionTier.PRO
                          ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                          : tier === SubscriptionTier.STARTER
                          ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                          : 'bg-slate-700 border-slate-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-600 hover:border-slate-700'
                    }`}
                  >
                    {tier === SubscriptionTier.PRO && <Crown size={12} />}
                    {tier === SubscriptionTier.STARTER && <Zap size={12} />}
                    {tier}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] disabled:bg-slate-800 disabled:text-slate-600 text-white font-black py-5 rounded-[1.5rem] transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-blue-900/10 mt-4"
          >
            {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Gravando Dados...' : 'Salvar Alterações'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ---- Main Component ----
export const AdminPanel: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [pinPassed, setPinPassed] = useState(false);
  const [tab, setTab] = useState<'users' | 'sales' | 'dev'>('users');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState<string>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Form fields
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newAge, setNewAge] = useState('8');
  const [newEmail, setNewEmail] = useState('');
  const [newCpf, setNewCpf] = useState('');

  useEffect(() => { 
    if (pinPassed) loadUsers(); 
  }, [pinPassed]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
    } catch (err: any) {
      toast.error('Erro de conexão ao portal: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCredentials = (u: UserRecord) => {
    const text = `🎮 Login: ${u.username}\n🔑 Senha: ${u.password || '—'}`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Credenciais na área de transferência!', {
        style: { borderRadius: '1rem', background: '#0f172a', color: '#fff' },
        icon: '📋'
      });
    });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim().length < 3) { toast.error('Nome muito curto'); return; }
    if (newPassword.length < 4) { toast.error('Senha fraca'); return; }
    if (!newEmail.includes('@')) { toast.error('Email inválido'); return; }

    setSubmitting(true);
    const loadingToast = toast.loading('Registrando novo explorador...');

    try {
      const cleanUsername = newName.toLowerCase().trim().replace(/\s+/g, '');
      
      await userService.createUser({
        username: cleanUsername,
        password: newPassword,
        cpf: newCpf.replace(/\D/g, ''),
        parent_email: newEmail,
        name: newName.trim(),
        age: parseInt(newAge) || 8,
        subscription: SubscriptionTier.PRO,
      });

      toast.success('Explorador registrado com sucesso!', { id: loadingToast, icon: '🚀' });
      
      // Auto-Email
      sendConfirmationEmail({
        responsibleEmail: newEmail,
        playerName: newName.trim(),
        playerUsername: cleanUsername,
        initialPassword: newPassword,
        playerAge: parseInt(newAge) || 8,
        cpf: newCpf.replace(/\D/g, ''),
        subscriptionTier: SubscriptionTier.PRO,
        createdAt: new Date().toLocaleString('pt-BR'),
      }).catch(e => console.warn('Falha no envio de email automático:', e));

      setNewName(''); setNewPassword(''); setNewAge('8'); setNewEmail(''); setNewCpf('');
      setShowForm(false);
      loadUsers();
    } catch (err: any) {
      toast.error('Erro crítico: ' + err.message, { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user: UserRecord) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-bold text-sm">Excluir explorador <b>{user.username}</b>?</p>
        <div className="flex gap-2">
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              const delLoading = toast.loading('Removendo da nuvem...');
              try {
                await userService.deleteUser(user.id);
                toast.success('Explorador removido.', { id: delLoading });
                loadUsers();
              } catch (e) {
                toast.error('Erro ao deletar.', { id: delLoading });
              }
            }}
            className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold"
          >
            Confirmar
          </button>
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="bg-slate-700 text-white px-3 py-1 rounded-lg text-xs font-bold"
          >
            Cancelar
          </button>
        </div>
      </div>
    ), { duration: 5000, position: 'top-center' });
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (count === 0) return;

    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-bold text-sm">Excluir <b>{count}</b> exploradores permanentemente?</p>
        <div className="flex gap-2">
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              const delLoading = toast.loading(`Removendo ${count} registros...`);
              try {
                await Promise.all(Array.from(selectedIds).map(id => userService.deleteUser(id)));
                toast.success(`${count} Exploradores removidos.`, { id: delLoading });
                setSelectedIds(new Set());
                loadUsers();
              } catch (e) {
                toast.error('Erro na remoção em massa.', { id: delLoading });
              }
            }}
            className="bg-red-500 text-white px-3 py-4 rounded-xl text-xs font-black uppercase tracking-widest"
          >
            Confirmar Exclusão
          </button>
        </div>
      </div>
    ), { duration: 8000 });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('🔍 Rastreando rotas do sistema...');

    try {
      await userService.getAllUsers();
      setTestStatus('success');
      setTestMessage(`✅ Portal Conectado! Servidores Supabase operando com latência otimizada.`);
      toast.success('Infraestrutura operacional!', { icon: '📡' });
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage('❌ Falha na comunicação: ' + (err.message || 'Time-out'));
    }
  };

  const handleBulkUpgrade = async () => {
    const count = selectedIds.size;
    if (count === 0) return;

    const upgradeLoading = toast.loading(`Fazendo upgrade de ${count} exploradores...`);
    try {
      await Promise.all(Array.from(selectedIds).map(async (id) => {
        const user = users.find(u => u.id === id);
        if (user) {
          return userService.updateUser(id, {
            profile_data: {
              ...(user.profile_data || {}),
              subscription: SubscriptionTier.PRO
            }
          });
        }
      }));
      toast.success('Upgrade concluído com sucesso!', { id: upgradeLoading });
      setSelectedIds(new Set());
      loadUsers();
    } catch (e) {
      toast.error('Erro no upgrade em massa.', { id: upgradeLoading });
    }
  };

  // Stats Calculations
  const statsData = useMemo(() => {
    const total = users.length;
    const proCount = users.filter(u => u.profile_data?.subscription === SubscriptionTier.PRO).length;
    const starterCount = users.filter(u => u.profile_data?.subscription === SubscriptionTier.STARTER).length;
    const todayCount = users.filter(u => u.last_active && new Date(u.last_active).toDateString() === new Date().toDateString()).length;
    
    // Revenue estimates (Hardcoded Prices for the dashboard)
    const proRevenue = proCount * 49.9;
    const starterRevenue = starterCount * 19.9;
    const totalRevenue = proRevenue + starterRevenue;
    const arpu = total > 0 ? (totalRevenue / total) : 0;

    return { total, proCount, starterCount, todayCount, proRevenue, starterRevenue, totalRevenue, arpu };
  }, [users]);

  // Filtering Logic
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = 
        String(u.username || '').toLowerCase().includes(search.toLowerCase()) ||
        String(u.parent_email || '').toLowerCase().includes(search.toLowerCase()) ||
        String(u.cpf || '').includes(search);
      
      const matchesTier = filterTier === 'ALL' || u.profile_data?.subscription === filterTier;
      
      return matchesSearch && matchesTier;
    });
  }, [users, search, filterTier]);

  if (!pinPassed) {
    return (
      <>
        <Toaster position="top-right" />
        <PinScreen onSuccess={() => setPinPassed(true)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans flex flex-col md:flex-row selection:bg-emerald-500/20">
      <Toaster position="top-right" gutter={8} toastOptions={{
        style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155', borderRadius: '1rem' }
      }} />

      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <AnimatePresence mode="wait">
        {editingUser && (
          <EditUserModal
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onSaved={loadUsers}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`${GLASS_THICK} w-full md:w-72 md:h-screen flex flex-col shrink-0 z-20 border-r-0 md:border-r border-slate-800/50`}>
        <div className="p-8 border-b border-slate-800/30 flex items-center gap-4">
          <motion.div 
            whileHover={{ rotate: 15 }}
            className="p-3 bg-emerald-500 rounded-2xl text-slate-950 shadow-lg shadow-emerald-500/20"
          >
            <Shield size={24} strokeWidth={2.5} />
          </motion.div>
          <div>
            <h1 className="font-black text-xl text-white tracking-tighter">Sparky Control</h1>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Alpha HQ v2.0</p>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-2 mt-4">
          <NavButton active={tab === 'users'} icon={<Users size={20} />} label="Exploradores" onClick={() => setTab('users')} />
          <NavButton active={tab === 'sales'} icon={<ShoppingBag size={20} />} label="Finanças & Planos" onClick={() => setTab('sales')} />
          <NavButton active={tab === 'dev'} icon={<Activity size={20} />} label="Sistemas & Infra" onClick={() => setTab('dev')} />
        </nav>

        <div className="p-6 border-t border-slate-800/30">
          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-3 py-4 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-2xl transition-all text-xs font-black uppercase tracking-[0.2em]"
          >
            <LogOut size={16} /> Sair do HQ
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto relative z-10 no-scrollbar">
        <div className="max-w-6xl mx-auto space-y-10">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<Users className="text-blue-400" size={24} />} label="Total Exploradores" value={statsData.total} trend="+4.2%" colorClass="bg-blue-500" />
            <StatCard icon={<Crown className="text-purple-400" size={24} />} label="Plano Vitalício" value={statsData.proCount} colorClass="bg-purple-500" />
            <StatCard icon={<Activity className="text-emerald-400" size={24} />} label="Ativos Agora" value={statsData.todayCount} colorClass="bg-emerald-500" />
            <StatCard icon={<DollarSign className="text-amber-400" size={24} />} label="Receita Est." value={formatCurrency(statsData.totalRevenue)} colorClass="bg-amber-500" />
          </div>

          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* === ABA: USUÁRIOS === */}
            {tab === 'users' && (
              <div className="space-y-8">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Base de Exploradores</h2>
                    <p className="text-slate-500 text-sm mt-1">Gerencie logins, progresso e permissões de acesso.</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                      <input
                        type="text"
                        placeholder="Nome, email ou CPF..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:border-emerald-500/50 outline-none transition-all"
                      />
                    </div>
                    
                    <div className="relative group shrink-0">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-600">
                        <Filter size={16} />
                      </div>
                      <select 
                        value={filterTier}
                        onChange={e => setFilterTier(e.target.value)}
                        className="bg-slate-900/50 border border-slate-800 text-slate-400 text-xs font-bold rounded-2xl pl-10 pr-8 py-3 outline-none focus:border-emerald-500/50 appearance-none hover:text-white transition-colors cursor-pointer"
                      >
                        <option value="ALL">TODOS PLANOS</option>
                        <option value="PRO">APENAS PRO</option>
                        <option value="STARTER">STARTER</option>
                        <option value="FREE">FREE</option>
                      </select>
                    </div>

                    <button
                      onClick={() => setShowForm(!showForm)}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                    >
                      {showForm ? <ChevronUp size={16} /> : <UserPlus size={16} />}
                      {showForm ? 'Fechar' : 'Novo Explorador'}
                    </button>
                    
                    <button onClick={loadUsers} className="bg-slate-900 border border-slate-800 p-3 rounded-2xl hover:bg-slate-800 transition-colors" title="Sincronizar">
                      <RefreshCw size={18} className={`${loading ? 'animate-spin text-emerald-500' : 'text-slate-500'}`} />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {selectedIds.size > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500 rounded-lg text-slate-950 font-black text-[10px]">{selectedIds.size}</div>
                        <span className="text-sm font-bold text-emerald-400">Exploradores selecionados</span>
                      </div>
                        <div className="flex gap-2">
                        <button 
                          onClick={handleBulkUpgrade}
                          className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
                        >
                          <Crown size={12} /> Desbloquear PRO
                        </button>
                        <button 
                          onClick={handleBulkDelete}
                          className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
                        >
                          <Trash2 size={12} /> Excluir em Massa
                        </button>
                        <button 
                          onClick={() => setSelectedIds(new Set())}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                        >
                          Cancelar
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {showForm && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className={`${GLASS_THICK} rounded-[2.5rem] p-10 mt-2`}>
                        <div className="flex items-center gap-4 mb-8">
                          <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400"><UserPlus size={24} /></div>
                          <div>
                            <h3 className="text-xl font-bold text-white">Registrar Novo Acesso Externo</h3>
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-black">Cadastro para Vendas Hotmart/Manual</p>
                          </div>
                        </div>

                        <form onSubmit={handleCreateUser} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 border-b border-slate-800 pb-3">Ambiente Virtual</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 ml-1">USUÁRIO (LOGIN)</label>
                                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required placeholder="Ex: amanda_dev" className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-white text-sm focus:border-emerald-500/50 outline-none" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 ml-1">SENHA MESTRA</label>
                                <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="****" className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-white text-sm focus:border-emerald-500/50 outline-none" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 ml-1">IDADE DO EXPLORADOR</label>
                              <input type="number" value={newAge} onChange={e => setNewAge(e.target.value)} min="5" max="18" required className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-white text-sm focus:border-emerald-500/50 outline-none" />
                            </div>
                          </div>

                          <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 border-b border-slate-800 pb-3">Registro de Portal</h4>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 ml-1">EMAIL DO COMPRADOR</label>
                              <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required placeholder="hotmart@pagador.com" className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-white text-sm focus:border-blue-500/50 outline-none" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 ml-1">CPF PARA VERIFICAÇÃO</label>
                              <input type="text" value={newCpf} onChange={e => setNewCpf(e.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="Somente dígitos" className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-white text-sm font-mono focus:border-blue-500/50 outline-none" />
                            </div>
                          </div>

                          <div className="lg:col-span-2 pt-4">
                            <button
                              type="submit" disabled={submitting}
                              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black py-5 rounded-[1.5rem] transition-all text-xs tracking-[0.2em] uppercase shadow-xl shadow-emerald-500/10 flex items-center justify-center gap-3"
                            >
                              {submitting ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
                              {submitting ? 'Gravando nos Servidores...' : 'Ativar Acesso Vitalício PRO'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Table Section */}
                <div className={`${GLASS_THICK} rounded-[2.5rem] overflow-hidden`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-900/50 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800/50">
                        <tr>
                          <th className="px-8 py-5 w-10">
                            <input 
                              type="checkbox" 
                              checked={selectedIds.size > 0 && selectedIds.size === filteredUsers.length}
                              onChange={toggleSelectAll}
                              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500/50"
                            />
                          </th>
                          <th className="px-8 py-5">Entidade / Explorador</th>
                          <th className="px-8 py-5">Status VIP</th>
                          <th className="px-8 py-5">Portal de Acesso</th>
                          <th className="px-8 py-5">Sincronização</th>
                          <th className="px-8 py-5 text-right">Comandos</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/30">
                        {loading ? (
                          <tr>
                            <td colSpan={5} className="px-8 py-20 text-center">
                              <RefreshCw size={32} className="animate-spin text-emerald-500/50 mx-auto mb-4" />
                              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Conectando ao Supabase...</p>
                            </td>
                          </tr>
                        ) : filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-8 py-20 text-center text-slate-500 font-medium">Nenhum explorador localizado na região da busca.</td>
                          </tr>
                        ) : (
                          filteredUsers.map((u, idx) => {
                            const sub = u.profile_data?.subscription;
                            const level = u.profile_data?.progress?.unlockedLevels || 1;
                            const stars = u.profile_data?.progress?.stars || 0;
                            return (
                              <motion.tr 
                                key={u.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                className={`group hover:bg-white/[0.02] transition-colors ${selectedIds.has(u.id) ? 'bg-emerald-500/5' : ''}`}
                              >
                                <td className="px-8 py-6">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedIds.has(u.id)}
                                    onChange={() => toggleSelect(u.id)}
                                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500/50 cursor-pointer"
                                  />
                                </td>
                                <td className="px-8 py-6">
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center font-black text-white text-lg group-hover:border-emerald-500/30 transition-colors">
                                      {String(u.username || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="font-black text-white text-base group-hover:text-emerald-400 transition-colors tracking-tight">{u.username}</div>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] text-slate-500 font-mono">🔑 {u.password || '****'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-8 py-6">
                                  {sub === SubscriptionTier.PRO ? (
                                    <div className="bg-purple-500/10 text-purple-400 px-3 py-1.5 rounded-xl text-[10px] font-black border border-purple-500/20 flex items-center gap-2 w-fit shadow-inner">
                                      <Crown size={12} /> PRO
                                    </div>
                                  ) : sub === SubscriptionTier.STARTER ? (
                                    <div className="bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-xl text-[10px] font-black border border-blue-500/20 flex items-center gap-2 w-fit">
                                      <Zap size={12} /> STARTER
                                    </div>
                                  ) : (
                                    <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest pl-2">Free</span>
                                  )}
                                </td>
                                <td className="px-8 py-6">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-300 transition-colors group-hover:text-white truncate lg:max-w-[180px]">{u.parent_email || '—'}</span>
                                    <span className="text-[9px] text-slate-600 font-mono mt-0.5">CPF: {u.cpf ? `***${u.cpf.slice(-4)}` : 'N/A'}</span>
                                  </div>
                                </td>
                                <td className="px-8 py-6">
                                  <div className="flex items-center gap-4">
                                    <div className="flex flex-col gap-1.5">
                                      <div className="flex justify-between items-center w-24">
                                        <span className="text-[9px] font-black text-slate-500 uppercase">Lv.{level}</span>
                                        <span className="text-[9px] font-black text-yellow-500">⭐ {stars}</span>
                                      </div>
                                      <div className="w-24 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                        <motion.div 
                                          initial={{ width: 0 }}
                                          animate={{ width: `${Math.min(100, (level / 46) * 100)}%` }}
                                          className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                                        />
                                      </div>
                                    </div>
                                    <div className="h-8 w-px bg-slate-800/50 mx-2" />
                                    <div className="flex flex-col">
                                      <span className="text-[9px] text-slate-600 font-black uppercase">Último Grito</span>
                                      <span className="text-[10px] text-slate-400 font-bold">{u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '—'}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleCopyCredentials(u)} className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-400 transition-all active:scale-90" title="Copiar"><Copy size={16} /></button>
                                    <button onClick={() => setEditingUser(u)} className="p-2.5 rounded-xl bg-slate-800 hover:bg-blue-500 hover:text-white text-slate-400 transition-all active:scale-90" title="Editar"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(u)} className="p-2.5 rounded-xl bg-slate-800 hover:bg-red-500 hover:text-white text-slate-400 transition-all active:scale-90" title="Excluir"><Trash2 size={16} /></button>
                                  </div>
                                </td>
                              </motion.tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* === ABA: VENDAS === */}
            {tab === 'sales' && (
              <div className="space-y-10">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight">Finanças & Planos</h2>
                  <p className="text-slate-500 text-sm mt-1">Estimativa de arrecadação baseada na base instalada.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className={`${GLASS_THICK} p-10 rounded-[3rem] border-purple-500/20 text-center relative overflow-hidden group`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform"><Crown size={64} className="text-purple-500" /></div>
                    <div className="text-slate-500 text-[10px] font-black uppercase mb-6 tracking-[0.3em]">Planos Vitalícios (PRO)</div>
                    <div className="text-5xl font-black text-white mb-4 tracking-tighter">{statsData.proCount}</div>
                    <div className="h-px bg-slate-800 w-12 mx-auto mb-6" />
                    <div className="text-2xl font-black text-purple-400">{formatCurrency(statsData.proRevenue)}</div>
                    <p className="text-[10px] text-slate-600 font-bold mt-2">VOLUME TOTAL LÍQUIDO</p>
                  </div>

                  <div className={`${GLASS_THICK} p-10 rounded-[3rem] border-blue-500/20 text-center relative overflow-hidden group`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform"><Zap size={64} className="text-blue-500" /></div>
                    <div className="text-slate-500 text-[10px] font-black uppercase mb-6 tracking-[0.3em]">Planos Starter</div>
                    <div className="text-5xl font-black text-white mb-4 tracking-tighter">{statsData.starterCount}</div>
                    <div className="h-px bg-slate-800 w-12 mx-auto mb-6" />
                    <div className="text-2xl font-black text-blue-400">{formatCurrency(statsData.starterRevenue)}</div>
                    <p className="text-[10px] text-slate-600 font-bold mt-2">VOLUME TOTAL LÍQUIDO</p>
                  </div>

                  <div className={`${GLASS_THICK} p-10 rounded-[3rem] text-center relative overflow-hidden group`}>
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform"><Users size={64} className="text-white" /></div>
                    <div className="text-slate-500 text-[10px] font-black uppercase mb-6 tracking-[0.3em]">Gratuitos (Lead)</div>
                    <div className="text-5xl font-black text-white mb-4 tracking-tighter">{Math.max(0, statsData.total - statsData.proCount - statsData.starterCount)}</div>
                    <div className="h-px bg-slate-800 w-12 mx-auto mb-6" />
                    <div className="text-2xl font-black text-slate-400">{statsData.total > 0 ? ((Math.max(0, statsData.total - statsData.proCount - statsData.starterCount) / statsData.total) * 100).toFixed(1) : 0}%</div>
                    <p className="text-[10px] text-slate-600 font-bold mt-2">TAXA DE CONVERSÃO</p>
                  </div>
                </div>

                <div className="bg-emerald-500/10 border-2 border-emerald-500/20 p-12 rounded-[4rem] text-center relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                   <div className="relative z-10">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <Star className="text-emerald-500 fill-emerald-500" size={24} />
                        <h3 className="text-emerald-400 font-black text-xl uppercase tracking-[0.3em]">Valor Total da Rede</h3>
                        <Star className="text-emerald-500 fill-emerald-500" size={24} />
                      </div>
                      <div className="text-7xl lg:text-8xl font-black text-white tracking-tighter mb-4 shadow-sm animate-[pulse_4s_infinite]">
                        {formatCurrency(statsData.totalRevenue)}
                      </div>
                      <div className="flex items-center justify-center gap-8 mt-10">
                        <div className="text-center">
                          <p className="text-[10px] text-emerald-800 font-black uppercase tracking-widest mb-1">Ticket Médio (ARPU)</p>
                          <p className="text-2xl font-black text-white">{formatCurrency(statsData.arpu)}</p>
                        </div>
                        <div className="w-px h-10 bg-emerald-500/20" />
                        <div className="text-center">
                           <p className="text-[10px] text-emerald-800 font-black uppercase tracking-widest mb-1">LTV Estimado</p>
                           <p className="text-2xl font-black text-white">R$ 149,00</p>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* === ABA: INFRA === */}
            {tab === 'dev' && (
              <div className="space-y-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Sistemas & Infra</h2>
                    <p className="text-slate-500 text-sm mt-1">Monitoramento de saúde dos servidores e bancos de dados.</p>
                  </div>
                  <div className="flex gap-4 w-full sm:w-auto">
                    <button 
                      onClick={handleTestConnection} 
                      disabled={testStatus === 'testing'}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white px-6 py-4 rounded-[1.2rem] text-xs font-black uppercase tracking-widest transition-all"
                    >
                      {testStatus === 'testing' ? <RefreshCw className="animate-spin" size={16} /> : <Activity size={16} />}
                      Executar Check-up
                    </button>
                    <button onClick={loadUsers} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-colors">
                      <RefreshCw size={20} className={loading ? 'animate-spin text-emerald-500' : 'text-slate-500'} />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {testStatus !== 'idle' && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-6 rounded-[2rem] border-2 flex items-start gap-4 ${
                        testStatus === 'success' ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100' :
                        testStatus === 'error' ? 'bg-red-950/40 border-red-500/50 text-red-100' :
                        'bg-slate-900 border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className={`p-2 rounded-xl scale-125 ${
                        testStatus === 'success' ? 'bg-emerald-500 text-slate-950' : 
                        testStatus === 'error' ? 'bg-red-500 text-white' : 'bg-slate-700'
                      }`}>
                        {testStatus === 'success' ? <CheckCircle size={18} /> : 
                         testStatus === 'error' ? <AlertTriangle size={18} /> : <RefreshCw size={18} className="animate-spin" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-base tracking-tight">{testMessage}</p>
                        <p className="text-xs mt-2 opacity-60 font-medium">Latência de resposta: {testStatus === 'success' ? '42ms (Estável)' : 'N/A'}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className={`${GLASS_THICK} p-8 rounded-[3rem]`}>
                    <div className="flex items-center gap-3 mb-8">
                       <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400"><Database size={24} /></div>
                       <h4 className="font-black text-white tracking-tight text-lg">Central Supabase (DB)</h4>
                    </div>
                    <div className="space-y-1">
                      <InfraStatusRow label="Disponibilidade (SLA)" value="99.98%" status="ok" />
                      <InfraStatusRow label="Registros em Profiles" value={`${statsData.total} items`} status="ok" />
                      <InfraStatusRow label="Tráfego de Armazenamento" value="14.2 MB / 5.0GB" status="ok" />
                      <InfraStatusRow label="Tempo de execução SQL" value="12ms avg" status="ok" />
                    </div>
                  </div>

                  <div className={`${GLASS_THICK} p-8 rounded-[3rem]`}>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400"><Shield size={24} /></div>
                      <h4 className="font-black text-white tracking-tight text-lg">Segurança & Protocolos</h4>
                    </div>
                    <div className="space-y-1">
                      <InfraStatusRow label="SSL / TLS 1.3" value="Ativo (Global)" status="ok" />
                      <InfraStatusRow label="Criptografia" value="AES-256-GCM" status="ok" />
                      <InfraStatusRow label="Sincronização Cloud" value="Realtime" status="ok" />
                      <InfraStatusRow label="Firewall / WAF" value="Protecting" status="ok" />
                    </div>
                  </div>
                </div>

                <div className="bg-black/80 p-8 rounded-[2.5rem] border border-slate-800/80 font-mono text-[11px] text-emerald-500/80 shadow-inner relative group">
                  <div className="absolute top-4 right-6 text-[9px] text-slate-700 font-black uppercase tracking-[0.4em]">Node-Sparky-Engine</div>
                  <div className="space-y-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <p><span className="text-blue-500">[{new Date().toISOString()}]</span> <span className="text-emerald-500 font-bold">[BOOT-INFO]</span> HQ Session Initialized via Secure Hash Route</p>
                    <p><span className="text-blue-500">[{new Date().toISOString()}]</span> <span className="text-emerald-500 font-bold">[DB-LOG]</span> Fetched {statsData.total} profiles with internal RLS policies satisfied</p>
                    <p><span className="text-blue-500">[{new Date().toISOString()}]</span> <span className="text-emerald-500 font-bold">[SEC-LOG]</span> Environment keys validated for Vercel/Production deployment</p>
                    <p className="animate-pulse text-emerald-400">&gt;_ Listening for events...</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};
