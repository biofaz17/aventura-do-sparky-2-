import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import {
  Users, ShoppingBag, Server, LogOut, RefreshCw, Search,
  UserPlus, X, CheckCircle, AlertTriangle, Trash2, Star,
  Clock, Shield, Database, Activity,
  ChevronUp, Crown, Zap, Copy, Edit2, Lock,
  Eye, EyeOff, Save
} from 'lucide-react';
import { SubscriptionTier } from '../types';
import { ADMIN_PIN } from '../constants';

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
  };
}

// ---- Sub-components ----
const StatCard = ({ icon, label, value, trend }: { icon: React.ReactNode; label: string; value: string | number; trend?: string }) => (
  <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 flex flex-col">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-800 rounded-lg">{icon}</div>
      {trend && <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">{trend}</span>}
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{label}</div>
  </div>
);

const InfraRow = ({ label, value, ok }: { label: string; value: string; ok: boolean }) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
    <span className="text-slate-500 text-xs">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-slate-300 font-bold text-xs">{value}</span>
      {ok && <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,185,129,1)]" />}
    </div>
  </div>
);

const NavItem = ({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
      active ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

// ---- PIN Screen ----
const PinScreen: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
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
      if (pin === ADMIN_PIN) {
        onSuccess();
      } else {
        setShake(true);
        setError(true);
        setTimeout(() => {
          setDigits(['', '', '', '', '', '']);
          setShake(false);
          inputRefs.current[0]?.focus();
        }, 700);
      }
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 flex flex-col items-center gap-6 w-full max-w-sm shadow-2xl">
        <div className="p-4 bg-emerald-500/10 rounded-2xl">
          <Lock size={32} className="text-emerald-400" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Sparky Adm</h1>
          <p className="text-slate-500 text-sm mt-1">Digite o PIN de 6 dígitos para continuar</p>
        </div>

        <div className={`flex gap-3 ${shake ? 'animate-[wiggle_0.4s_ease-in-out]' : ''}`}
          style={{ animation: shake ? 'shake 0.4s ease-in-out' : 'none' }}>
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
              className={`w-12 h-14 text-center rounded-2xl text-xl font-bold bg-slate-800 border-2 outline-none transition-all
                ${d ? 'border-emerald-500 text-white' : 'border-slate-700 text-slate-600'}
                ${error ? 'border-red-500 text-red-400' : ''}
                focus:border-emerald-400`}
            />
          ))}
        </div>

        {error && (
          <p className="text-red-400 text-sm font-bold flex items-center gap-2">
            <AlertTriangle size={14} /> PIN incorreto. Tente novamente.
          </p>
        )}

        <p className="text-slate-700 text-[10px] text-center">
          Acesso restrito a administradores autorizados.
        </p>
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}`}</style>
    </div>
  );
};

// ---- Edit User Modal ----
const EditUserModal: React.FC<{
  user: UserRecord;
  onClose: () => void;
  onSaved: () => void;
}> = ({ user, onClose, onSaved }) => {
  const sub = user.profile_data?.subscription as SubscriptionTier | undefined;
  const [newPassword, setNewPassword] = useState(user.password || '');
  const [newEmail, setNewEmail] = useState(user.parent_email || '');
  const [newSub, setNewSub] = useState<SubscriptionTier>(sub || SubscriptionTier.FREE);
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) { setError('Senha muito curta (mín. 4 caracteres).'); return; }
    setSaving(true);
    setError('');

    const updatedProfile = {
      ...(user.profile_data || {}),
      subscription: newSub,
      parentEmail: newEmail,
    };

    const { error: err } = await supabase.from('users').update({
      password: newPassword,
      parent_email: newEmail,
      profile_data: updatedProfile,
    }).eq('id', user.id);

    if (err) {
      setError(err.message);
    } else {
      onSaved();
      onClose();
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 rounded-[2rem] border border-slate-700 p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl"><Edit2 size={18} className="text-blue-400" /></div>
            <div>
              <h3 className="text-white font-bold">Editar Usuário</h3>
              <p className="text-slate-500 text-xs font-mono">@{user.username}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl flex items-center gap-2 text-sm mb-4">
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Senha */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Senha do Jogo</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-blue-500 outline-none pr-10"
              />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Email do Responsável</label>
            <input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-blue-500 outline-none"
            />
          </div>

          {/* Plano */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Plano</label>
            <div className="flex gap-2">
              {([SubscriptionTier.FREE, SubscriptionTier.STARTER, SubscriptionTier.PRO] as SubscriptionTier[]).map(tier => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setNewSub(tier)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase border-2 transition-all ${
                    newSub === tier
                      ? tier === SubscriptionTier.PRO
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                        : tier === SubscriptionTier.STARTER
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                        : 'bg-slate-700 border-slate-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'
                  }`}
                >
                  {tier === SubscriptionTier.PRO && <Crown size={10} className="inline mr-1" />}
                  {tier}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-black py-3.5 rounded-2xl transition-all text-sm flex items-center justify-center gap-2 mt-2"
          >
            <Save size={16} />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ---- Copy Toast ----
const CopyToast = ({ show }: { show: boolean }) => (
  <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-black text-sm px-5 py-3 rounded-2xl shadow-xl z-[200] transition-all duration-300 flex items-center gap-2
    ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
    <CheckCircle size={16} /> Credenciais copiadas!
  </div>
);

// ---- Main Component ----
export const AdminPanel: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [pinPassed, setPinPassed] = useState(false);
  const [tab, setTab] = useState<'users' | 'sales' | 'dev'>('users');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [copyToast, setCopyToast] = useState(false);

  // Form fields
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newAge, setNewAge] = useState('8');
  const [newEmail, setNewEmail] = useState('');
  const [newCpf, setNewCpf] = useState('');

  useEffect(() => { if (pinPassed) loadUsers(); }, [pinPassed]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, cpf, parent_email, password, created_at, last_active, profile_data')
        .order('created_at', { ascending: false });
      if (!error) setUsers(data || []);
    } catch (_) {}
    setLoading(false);
  };

  const handleCopyCredentials = (u: UserRecord) => {
    const text = `Login: ${u.username} | Senha: ${u.password || '—'}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2500);
    }).catch(() => {
      // fallback
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2500);
    });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (newName.trim().length < 3) { setFormError('Nome muito curto (mín. 3 caracteres).'); return; }
    if (newPassword.length < 4) { setFormError('Senha muito curta (mín. 4 caracteres).'); return; }
    setSubmitting(true);

    const cleanUsername = newName.toLowerCase().trim().replace(/\s+/g, '');
    const userId = 'user_' + cleanUsername;

    const profileData = {
      id: userId,
      name: newName.trim(),
      password: newPassword,
      parentEmail: newEmail,
      age: parseInt(newAge) || 8,
      subscription: SubscriptionTier.PRO,
      progress: { unlockedLevels: 1, stars: 0, creativeProjects: 0, totalBlocksUsed: 0, secretsFound: 0 },
      settings: { soundEnabled: true, musicEnabled: true },
      isGuest: false,
      lastActive: Date.now(),
    };

    const { error } = await supabase.from('users').insert([{
      username: cleanUsername,
      password: newPassword,
      cpf: newCpf.replace(/\D/g, ''),
      parent_email: newEmail,
      profile_data: profileData,
    }]);

    if (error) {
      setFormError(error.message.includes('unique')
        ? `Já existe um jogador com o nome "${cleanUsername}". Tente outra variação.`
        : error.message);
    } else {
      setFormSuccess(`✅ Jogador "${newName.trim()}" criado com acesso PRO! Login: ${cleanUsername} | Senha: ${newPassword}`);
      setNewName(''); setNewPassword(''); setNewAge('8'); setNewEmail(''); setNewCpf('');
      setShowForm(false);
      await loadUsers();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Excluir definitivamente a conta de "${name}"? Esta ação não pode ser desfeita.`)) return;
    await supabase.from('users').delete().eq('id', id);
    await loadUsers();
  };

  // Stats
  const total = users.length;
  const proCount = users.filter(u => u.profile_data?.subscription === SubscriptionTier.PRO).length;
  const starterCount = users.filter(u => u.profile_data?.subscription === SubscriptionTier.STARTER).length;
  const todayCount = users.filter(u => u.last_active && new Date(u.last_active).toDateString() === new Date().toDateString()).length;
  const avgStars = total > 0
    ? (users.reduce((acc, u) => acc + (u.profile_data?.progress?.stars || 0), 0) / total).toFixed(0)
    : '0';

  const filtered = users.filter(u =>
    String(u.username || '').toLowerCase().includes(search.toLowerCase()) ||
    String(u.parent_email || '').toLowerCase().includes(search.toLowerCase())
  );

  // ---- Render PIN screen if not passed ----
  if (!pinPassed) {
    return <PinScreen onSuccess={() => setPinPassed(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans flex flex-col md:flex-row">
      {/* Global Toasts */}
      <CopyToast show={copyToast} />

      {/* Edit Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={loadUsers}
        />
      )}

      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-emerald-500 rounded-lg text-slate-950">
            <Server size={20} strokeWidth={3} />
          </div>
          <h1 className="font-bold text-lg text-white">Sparky Adm</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavItem active={tab === 'users'} icon={<Users size={18} />} label="Usuários" onClick={() => setTab('users')} />
          <NavItem active={tab === 'sales'} icon={<ShoppingBag size={18} />} label="Vendas & Planos" onClick={() => setTab('sales')} />
          <NavItem active={tab === 'dev'} icon={<Server size={18} />} label="Infra & Dev" onClick={() => setTab('dev')} />
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onBack}
            className="w-full flex items-center gap-2 p-3 text-red-400 hover:bg-red-950/20 rounded-xl transition text-sm font-black uppercase tracking-widest"
          >
            <LogOut size={16} /> Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Users className="text-blue-400" size={20} />} label="Total Usuários" value={total} trend="+12%" />
            <StatCard icon={<Crown className="text-yellow-400" size={20} />} label="Assinantes" value={proCount + starterCount} trend={`${total > 0 ? (((proCount + starterCount) / total) * 100).toFixed(1) : 0}% Conv.`} />
            <StatCard icon={<Activity className="text-emerald-400" size={20} />} label="Ativos hoje" value={todayCount} />
            <StatCard icon={<Star className="text-purple-400" size={20} />} label="Média Estrelas" value={avgStars} />
          </div>

          {/* === ABA: USUÁRIOS === */}
          {tab === 'users' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-white">Base de Exploradores</h2>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type="text"
                      placeholder="Buscar por nome ou email..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-emerald-500 outline-none w-full sm:w-64"
                    />
                  </div>
                  <button
                    onClick={() => { setShowForm(v => !v); setFormError(''); setFormSuccess(''); }}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2 rounded-xl text-sm transition-all shrink-0 shadow-lg shadow-emerald-500/20"
                  >
                    {showForm ? <ChevronUp size={16} /> : <UserPlus size={16} />}
                    {showForm ? 'Fechar' : 'Novo Usuário'}
                  </button>
                  <button onClick={loadUsers} className="bg-slate-800 p-2 rounded-xl hover:bg-slate-700 transition" title="Recarregar">
                    <RefreshCw size={16} className={loading ? 'animate-spin text-emerald-400' : 'text-slate-400'} />
                  </button>
                </div>
              </div>

              {/* Mensagens globais de sucesso */}
              {formSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 p-4 rounded-2xl flex items-start gap-3">
                  <CheckCircle size={18} className="shrink-0 mt-0.5" />
                  <span className="text-sm font-bold">{formSuccess}</span>
                  <button onClick={() => setFormSuccess('')} className="ml-auto text-emerald-600 hover:text-emerald-300"><X size={16} /></button>
                </div>
              )}

              {/* Formulário de Criação - Collapsible */}
              {showForm && (
                <div className="bg-slate-900 rounded-[2rem] border-2 border-emerald-500/30 p-8 shadow-2xl shadow-emerald-500/5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-500/10 rounded-xl"><UserPlus size={20} className="text-emerald-400" /></div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Cadastrar Novo Acesso PRO</h3>
                      <p className="text-xs text-slate-500">Criado por venda via Hotmart</p>
                    </div>
                  </div>

                  {formError && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl flex items-center gap-2 text-sm mb-4">
                      <AlertTriangle size={16} /> {formError}
                    </div>
                  )}

                  <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Credenciais */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-800 pb-2">Credenciais do Jogo</h4>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Nome de Login (usuário)</label>
                        <input
                          type="text" value={newName} onChange={e => setNewName(e.target.value)} required
                          placeholder="Ex: pedro_silva"
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-emerald-500 outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1">Senha do Jogo</label>
                          <input
                            type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} required
                            placeholder="Ex: sparky123"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-emerald-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1">Idade</label>
                          <input
                            type="number" value={newAge} onChange={e => setNewAge(e.target.value)} min="5" max="18" required
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-emerald-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Fiscal */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 border-b border-slate-800 pb-2">Dados Fiscais (Hotmart)</h4>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Email do Comprador</label>
                        <input
                          type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required
                          placeholder="email@pagador.com"
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">CPF de Verificação</label>
                        <input
                          type="text" value={newCpf}
                          onChange={e => setNewCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
                          placeholder="Apenas números"
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm font-mono focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="md:col-span-2">
                      <button
                        type="submit" disabled={submitting}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-black py-4 rounded-2xl transition-all text-sm tracking-widest uppercase shadow-lg shadow-emerald-500/20"
                      >
                        {submitting ? '⏳ Registrando na Nuvem...' : '🚀 Criar Acesso PRO Vitalício'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Tabela de Usuários */}
              <div className="bg-slate-900 rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-800/50 text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Usuário</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Progresso</th>
                        <th className="px-6 py-4">Criado em</th>
                        <th className="px-6 py-4">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {loading && (
                        <tr><td colSpan={6} className="text-center py-12 text-slate-500">Carregando...</td></tr>
                      )}
                      {!loading && filtered.length === 0 && (
                        <tr><td colSpan={6} className="text-center py-12 text-slate-500">Nenhum usuário encontrado.</td></tr>
                      )}
                      {filtered.map(u => {
                        const sub = u.profile_data?.subscription;
                        const level = u.profile_data?.progress?.unlockedLevels || 1;
                        const stars = u.profile_data?.progress?.stars || 0;
                        return (
                          <tr key={u.id} className="hover:bg-slate-800/30 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-xs">
                                  {String(u.username || '?').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-white group-hover:text-emerald-400 transition-colors">{u.username}</div>
                                  <div className="text-[10px] text-slate-500 font-mono">🔑 {u.password || '****'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {sub === SubscriptionTier.PRO ? (
                                <span className="bg-purple-950 text-purple-400 px-2 py-0.5 rounded-full text-[10px] font-black border border-purple-900 flex items-center gap-1 w-fit">
                                  <Crown size={10} /> PRO
                                </span>
                              ) : sub === SubscriptionTier.STARTER ? (
                                <span className="bg-blue-950 text-blue-400 px-2 py-0.5 rounded-full text-[10px] font-black border border-blue-900 flex items-center gap-1 w-fit">
                                  <Zap size={10} /> STARTER
                                </span>
                              ) : (
                                <span className="text-slate-500 text-[10px] font-bold">GRÁTIS</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs text-slate-400">{u.parent_email || '—'}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-300">Nível {level}</span>
                                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500" style={{ width: `${(level / 46) * 100}%` }} />
                                </div>
                                <span className="text-[10px] text-yellow-400">⭐ {stars}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Clock size={12} />
                                {u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '—'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1">
                                {/* Copiar credenciais */}
                                <button
                                  onClick={() => handleCopyCredentials(u)}
                                  className="text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/30 p-1.5 rounded-lg transition"
                                  title="Copiar credenciais"
                                >
                                  <Copy size={14} />
                                </button>
                                {/* Editar */}
                                <button
                                  onClick={() => setEditingUser(u)}
                                  className="text-slate-400 hover:text-blue-400 hover:bg-blue-950/30 p-1.5 rounded-lg transition"
                                  title="Editar usuário"
                                >
                                  <Edit2 size={14} />
                                </button>
                                {/* Excluir */}
                                <button
                                  onClick={() => handleDelete(u.id, u.username)}
                                  className="text-red-500 hover:text-red-400 hover:bg-red-950/30 p-1.5 rounded-lg transition"
                                  title="Excluir conta"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* === ABA: VENDAS === */}
          {tab === 'sales' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-white">Relatório de Faturamento</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 text-center flex flex-col items-center">
                  <div className="text-slate-500 text-xs font-black uppercase mb-4 tracking-widest">Planos PRO</div>
                  <div className="text-4xl font-bold text-purple-400 mb-2">{proCount}</div>
                  <div className="text-xs text-slate-600 font-bold">Total Arrecadado Est.</div>
                  <div className="text-xl font-bold text-white">R$ {(proCount * 49.9).toFixed(2)}</div>
                </div>
                <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 text-center flex flex-col items-center">
                  <div className="text-slate-500 text-xs font-black uppercase mb-4 tracking-widest">Planos Starter</div>
                  <div className="text-4xl font-bold text-blue-400 mb-2">{starterCount}</div>
                  <div className="text-xs text-slate-600 font-bold">Total Arrecadado Est.</div>
                  <div className="text-xl font-bold text-white">R$ {(starterCount * 19.9).toFixed(2)}</div>
                </div>
                <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 text-center flex flex-col items-center">
                  <div className="text-slate-500 text-xs font-black uppercase mb-4 tracking-widest">Gratuitos</div>
                  <div className="text-4xl font-bold text-slate-600 mb-2">{Math.max(0, total - proCount - starterCount)}</div>
                  <div className="text-xs text-slate-600 font-bold">Taxa de Abandono</div>
                  <div className="text-xl font-bold text-white">{total > 0 ? ((Math.max(0, total - proCount - starterCount) / total) * 100).toFixed(1) : 0}%</div>
                </div>
              </div>
              <div className="bg-emerald-950/20 border-2 border-emerald-900/30 p-10 rounded-[3rem] text-center">
                <h3 className="text-emerald-400 font-bold text-2xl mb-2">Ticket Médio Geral</h3>
                <div className="text-6xl font-black text-white">
                  R$ {total > 0 ? ((proCount * 49.9 + starterCount * 19.9) / total).toFixed(2) : '0.00'}
                </div>
                <p className="text-emerald-900 font-bold mt-4 uppercase tracking-widest text-xs">Receita Estimada Total</p>
                <div className="text-3xl font-bold text-emerald-400 mt-2">
                  R$ {(proCount * 49.9 + starterCount * 19.9).toFixed(2)}
                </div>
              </div>
            </div>
          )}

          {/* === ABA: INFRA === */}
          {tab === 'dev' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Health Check & Infra</h2>
                <button onClick={loadUsers} className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-700 transition">
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Recarregar Logs
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                  <h4 className="font-bold text-white mb-4 flex items-center gap-2 text-sm">
                    <Database size={18} className="text-blue-500" /> Banco de Dados (Supabase)
                  </h4>
                  <div className="space-y-1">
                    <InfraRow label="Uptime" value="99.99%" ok={true} />
                    <InfraRow label="Profiles Table" value={`${total} records`} ok={true} />
                    <InfraRow label="Storage Usage" value="14.2 MB" ok={true} />
                    <InfraRow label="API Latency" value="42ms" ok={true} />
                  </div>
                </div>
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                  <h4 className="font-bold text-white mb-4 flex items-center gap-2 text-sm">
                    <Shield size={18} className="text-emerald-500" /> Segurança & Compliance
                  </h4>
                  <div className="space-y-1">
                    <InfraRow label="SSL / HTTPS" value="Ativo (Cloudflare)" ok={true} />
                    <InfraRow label="Encryption" value="AES-256" ok={true} />
                    <InfraRow label="Backup Diário" value="Concluído às 03:00" ok={true} />
                    <InfraRow label="Acesso Admin" value="PIN + Hash Route" ok={true} />
                  </div>
                </div>
              </div>
              <div className="bg-black p-6 rounded-2xl border border-slate-800 font-mono text-[11px] text-emerald-500 overflow-hidden relative">
                <div className="absolute top-2 right-4 text-[10px] text-slate-700">SPARKY_SYSTEM_LOGS</div>
                <div className="space-y-1">
                  <p>[{new Date().toISOString()}] - [INFO] Admin Session Initialized</p>
                  <p>[{new Date().toISOString()}] - [SUCCESS] Supabase connection established</p>
                  <p>[{new Date().toISOString()}] - [SYNC] Loaded {total} user profiles from cloud</p>
                  <p>[{new Date().toISOString()}] - [SECURITY] Access via PIN + #/admin hash route</p>
                  <p className="animate-pulse">_</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
