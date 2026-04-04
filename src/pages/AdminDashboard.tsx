import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Shield, Users, Clock, Mic, Activity, Search, Power,
  Ban, Trash2, Plus, RotateCcw, AlertTriangle,
  CheckCircle2, XCircle, Settings, LogOut, Zap, ArrowLeft,
  Bell, FileText, TrendingUp, Eye, Sparkles
} from 'lucide-react';
import { Infinity as InfinityIcon } from 'lucide-react';
import OnlineIndicator from '@/components/OnlineIndicator';

// Animated counter hook
const useAnimatedCounter = (target: number, duration = 800) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return count;
};

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.06 } } },
  item: { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } },
};

const AdminDashboard = () => {
  const { users, updateUser, deleteUser, systemState, setSystemState, setAdminLoggedIn, activityLogs, addActivityLog } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'voice' | 'blocked' | 'pending'>('all');
  const [quickUser, setQuickUser] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'controls' | 'logs'>('overview');
  const [showLogs, setShowLogs] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [activeControl, setActiveControl] = useState<'status' | 'pending' | null>(null);

  const pendingRequests = users.filter(u => u.voiceAccess === 'pending');
  const stats = useMemo(() => ({
    total: users.length,
    activeToday: users.filter(u => u.usageToday > 0).length,
    pending: pendingRequests.length,
    voiceEnabled: users.filter(u => u.voiceAccess === 'approved').length,
  }), [users, pendingRequests.length]);

  const onlineUsers = users.filter(u => {
    const diff = Date.now() - new Date(u.lastSeen).getTime();
    return diff < 5 * 60 * 1000 && u.status === 'active';
  });

  const filteredUsers = useMemo(() => {
    let list = users;
    if (search) list = list.filter(u => u.username.toLowerCase().includes(search.toLowerCase()));
    if (filter === 'voice') list = list.filter(u => u.voiceAccess === 'approved');
    if (filter === 'blocked') list = list.filter(u => u.status === 'blocked');
    if (filter === 'pending') list = list.filter(u => u.voiceAccess === 'pending');
    return list;
  }, [users, search, filter]);

  const systemStatus = systemState.maintenanceMode ? 'Maintenance' :
    !systemState.voiceEnabled ? 'Voice Disabled' : 'Active';

  const statusColor = systemState.maintenanceMode ? 'text-destructive' :
    !systemState.voiceEnabled ? 'text-warning' : 'text-success';

  const tabItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'controls', label: 'Controls' },
    { id: 'logs', label: 'Logs' },
  ] as const;

  const handleTabChange = (tab: typeof tabItems[number]['id']) => {
    setActiveTab(tab);
    setShowLogs(tab === 'logs');
    setShowNotifs(false);
  };

  const statusGlow = systemState.maintenanceMode ? 'glow-destructive' :
    !systemState.voiceEnabled ? 'glow-warning' : 'glow-primary';

  const formatExpiry = (date: Date | null) => {
    if (!date) return '—';
    const diff = date.getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  const formatRelativeTime = (date: Date) => {
    const diff = Date.now() - new Date(date).getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const handleLogout = () => { setAdminLoggedIn(false); navigate('/admin'); };

  const handleApprove = (userId: string, username: string) => {
    updateUser(userId, { voiceAccess: 'approved', accessExpiry: new Date(Date.now() + 3600000) });
    addActivityLog('Approved voice access', username, 'success');
    toast.success(`${username} approved`);
  };

  const handleReject = (userId: string, username: string) => {
    updateUser(userId, { voiceAccess: 'denied' });
    addActivityLog('Rejected voice request', username, 'danger');
    toast.success(`${username} rejected`);
  };

  const usageData = users.filter(u => u.status === 'active').map(u => ({
    name: u.username,
    usage: u.usageToday,
    limit: u.dailyLimit,
    pct: Math.min(100, Math.round((u.usageToday / u.dailyLimit) * 100)),
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background relative"
    >
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/[0.02] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/[0.02] rounded-full blur-[150px]" />
      </div>

      {/* Top Nav */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 glass-strong border-b border-border/30 bg-background/95"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="h-8 w-8 rounded-lg bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </motion.button>
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Shield className="w-5 h-5 text-primary" />
              </motion.div>
              <span className="font-bold text-foreground">Admin Panel</span>
            </div>
            <motion.span
              className={`text-xs font-mono px-2.5 py-1 rounded-full border ${statusColor} border-current/20 ${statusGlow}`}
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {systemStatus}
            </motion.span>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/30"
            >
              <OnlineIndicator isOnline={true} />
              <span>{onlineUsers.length} online</span>
            </motion.div>

            {/* Notification bell */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setShowNotifs(!showNotifs); setShowLogs(false); }}
                className="h-8 w-8 rounded-lg bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors relative"
              >
                <Bell className="w-4 h-4 text-muted-foreground" />
                {pendingRequests.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center"
                  >
                    {pendingRequests.length}
                  </motion.span>
                )}
              </motion.button>
              <AnimatePresence>
                {showNotifs && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-11 w-80 glass-strong rounded-2xl shadow-2xl z-50 overflow-hidden border border-border/30"
                  >
                    <div className="p-3 border-b border-border/30 flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">Notifications</p>
                      <span className="text-[10px] text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {pendingRequests.length > 0 ? pendingRequests.map((u, i) => (
                        <motion.div
                          key={u.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="p-3 border-b border-border/20 flex items-center justify-between hover:bg-secondary/30 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-md bg-warning/10 flex items-center justify-center text-warning text-xs font-bold">
                              {u.username[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm text-foreground font-medium">{u.username}</p>
                              <p className="text-[10px] text-muted-foreground">Voice request • {formatRelativeTime(u.requestTime!)}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleApprove(u.id, u.username)} className="text-success text-xs hover:bg-success/15 px-2 py-1 rounded-md font-medium">✓</motion.button>
                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleReject(u.id, u.username)} className="text-destructive text-xs hover:bg-destructive/15 px-2 py-1 rounded-md font-medium">✗</motion.button>
                          </div>
                        </motion.div>
                      )) : (
                        <div className="p-6 text-center">
                          <p className="text-xs text-muted-foreground">No pending notifications</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setShowLogs(!showLogs); setShowNotifs(false); }}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${showLogs ? 'bg-accent/15 text-accent' : 'bg-secondary/80 text-muted-foreground hover:bg-secondary'}`}
              title="Activity Log"
            >
              <FileText className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 relative z-10">
        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="glass-strong rounded-3xl p-6 border border-border/30 bg-white/90 shadow-lg shadow-slate-200/20">
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-2xl bg-blue-600/10 px-3 py-2 text-sm font-semibold text-blue-700">
                  <Shield className="w-4 h-4" /> jarvis Admin
                </div>
                <p className="text-sm text-muted-foreground">Blue-white dashboard with all existing panel features unified and easy to access.</p>
              </div>
              <div className="grid gap-3">
                {tabItems.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full text-left rounded-2xl px-4 py-3 text-sm font-medium transition-all border ${activeTab === tab.id ? 'bg-blue-600/10 border-blue-200 text-blue-700 shadow-sm' : 'bg-white/80 border-border text-foreground hover:bg-blue-50'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="space-y-3 bg-slate-50 rounded-3xl p-4 border border-border/60">
                <h3 className="text-sm font-semibold text-foreground">Quick stats</h3>
                <div className="grid gap-2">
                  <SidebarStat label="Users" value={stats.total} />
                  <SidebarStat label="Pending" value={stats.pending} />
                  <SidebarStat label="Voice" value={stats.voiceEnabled} />
                  <SidebarStat label="Status" value={systemStatus} />
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            <div className="glass-strong rounded-3xl p-5 border border-border/30 bg-white/90 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Admin panel</p>
                  <h1 className="text-2xl font-semibold text-foreground">jarvis Control Center</h1>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tabItems.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-foreground hover:bg-slate-200'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Manage system controls, configure voice settings, and handle quick user actions right here.</p>
            </div>

            {/* Overview */}
        {activeTab === 'overview' && (
          <>
            <motion.div
              variants={stagger.container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <StatCard icon={<Users className="w-5 h-5" />} label="Total Users" value={stats.total} delay={0} />
              <StatCard icon={<Activity className="w-5 h-5" />} label="Active Today" value={stats.activeToday} color="text-success" delay={0.1} />
              <StatCard icon={<Clock className="w-5 h-5" />} label="Pending" value={stats.pending} color="text-warning" delay={0.2} />
              <StatCard icon={<Mic className="w-5 h-5" />} label="Voice Enabled" value={stats.voiceEnabled} color="text-accent" delay={0.3} />
            </motion.div>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-strong rounded-2xl p-6 space-y-4 noise-bg"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Usage Overview</h2>
                <span className="text-sm text-muted-foreground">Live usage and limits for active members</span>
              </div>
              <div className="space-y-4">
                {usageData.map((d, i) => (
                  <motion.div
                    key={d.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700 group-hover:bg-blue-200 transition-colors">
                          {d.name[0].toUpperCase()}
                        </div>
                        <span className="text-foreground font-medium">{d.name}</span>
                      </div>
                      <span className="text-muted-foreground font-mono text-xs">{d.usage}m / {d.limit}m</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${d.pct}%` }}
                        transition={{ duration: 1.2, delay: 0.5 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className={`h-full rounded-full ${d.pct > 90 ? 'bg-red-400' : d.pct > 60 ? 'bg-yellow-400' : 'bg-blue-500'}`}
                      >
                        <div className="absolute inset-0 shimmer" />
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <>
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="glass-strong rounded-2xl p-6 space-y-5 noise-bg"
            >
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> User Management</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by username..."
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-border/40 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-200 transition-all"
                  />
                </div>
                <select
                  value={filter}
                  onChange={e => setFilter(e.target.value as any)}
                  className="h-10 px-3 rounded-xl bg-slate-50 border border-border/40 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-blue-200"
                >
                  <option value="all">All Users</option>
                  <option value="voice">Voice Enabled</option>
                  <option value="blocked">Blocked</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground/60 border-b border-border/30">
                      <th className="pb-3 font-medium">User</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Voice</th>
                      <th className="pb-3 font-medium">Usage</th>
                      <th className="pb-3 font-medium">Limit</th>
                      <th className="pb-3 font-medium">Expiry</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredUsers.map((u, idx) => {
                        const isOnline = Date.now() - new Date(u.lastSeen).getTime() < 5 * 60 * 1000;
                        const isExpanded = expandedUserId === u.id;
                        return (
                          <motion.tr
                            key={u.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: idx * 0.03 }}
                            onClick={() => setExpandedUserId(isExpanded ? null : u.id)}
                            className={`border-b border-border/20 transition-all cursor-pointer ${isExpanded ? 'bg-slate-50' : 'hover:bg-slate-100'}`}
                          >
                            <td className="py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="relative">
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${u.status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}
                                  >
                                    {u.username[0].toUpperCase()}
                                  </motion.div>
                                  <span className="absolute -bottom-0.5 -right-0.5">
                                    <OnlineIndicator isOnline={isOnline} />
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-foreground">{u.username}</span>
                                  <p className="text-[10px] text-muted-foreground/50">{isOnline ? 'Online now' : formatRelativeTime(u.lastSeen)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${u.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                {u.status}
                              </span>
                            </td>
                            <td className="py-3.5">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${u.voiceAccess === 'approved' ? 'bg-blue-100 text-blue-700 border-blue-200' : u.voiceAccess === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-slate-100 text-muted-foreground border-border/40'}`}>
                                {u.voiceAccess === 'approved' ? (u.voiceUnlimited ? '∞ Unlimited' : 'Yes') : u.voiceAccess}
                              </span>
                            </td>
                            <td className="py-3.5 font-mono text-muted-foreground text-xs">{u.usageToday}m</td>
                            <td className="py-3.5 font-mono text-muted-foreground text-xs">{u.dailyLimit}m</td>
                            <td className="py-3.5 text-xs text-muted-foreground">{u.voiceUnlimited ? '∞' : formatExpiry(u.accessExpiry)}</td>
                            <td className="py-3.5" onClick={e => e.stopPropagation()}>
                              <div className="flex flex-wrap justify-end gap-1">
                                {u.voiceAccess !== 'approved' && <TinyBtn label="Approve" color="success" onClick={() => handleApprove(u.id, u.username)} />}
                                {u.voiceAccess === 'approved' && <TinyBtn label="Revoke" color="warning" onClick={() => { updateUser(u.id, { voiceAccess: 'none', voiceUnlimited: false, accessExpiry: null }); addActivityLog('Revoked voice access', u.username, 'warning'); toast.success('Revoked'); }} />}
                                <TinyBtn label="+5m" color="accent" onClick={() => { const newExp = u.accessExpiry ? new Date(Math.max(u.accessExpiry.getTime(), Date.now()) + 5 * 60000) : new Date(Date.now() + 5 * 60000); updateUser(u.id, { voiceAccess: 'approved', accessExpiry: newExp }); addActivityLog('Added +5 minutes', u.username, 'info'); toast.success('+5 min added'); }} />
                                <TinyBtn label={u.voiceUnlimited ? 'Ltd' : '∞'} color="accent" onClick={() => { updateUser(u.id, { voiceUnlimited: !u.voiceUnlimited, voiceAccess: 'approved' }); addActivityLog(u.voiceUnlimited ? 'Set limited' : 'Set unlimited', u.username, 'info'); toast.success(u.voiceUnlimited ? 'Limited' : 'Unlimited'); }} />
                                <TinyBtn label={u.status === 'blocked' ? 'Unblock' : 'Block'} color="destructive" onClick={() => { updateUser(u.id, { status: u.status === 'blocked' ? 'active' : 'blocked' }); addActivityLog(u.status === 'blocked' ? 'Unblocked' : 'Blocked', u.username, u.status === 'blocked' ? 'info' : 'danger'); toast.success(u.status === 'blocked' ? 'Unblocked' : 'Blocked'); }} />
                                <TinyBtn label="Ban IP" color="destructive" onClick={() => { updateUser(u.id, { blockedIp: true }); addActivityLog('Banned IP', u.username, 'danger'); toast.success('IP blocked'); }} />
                                <TinyBtn label="Reset" color="muted" onClick={() => { updateUser(u.id, { usageToday: 0 }); addActivityLog('Reset usage', u.username, 'info'); toast.success('Reset'); }} />
                                <TinyBtn label="Delete" color="destructive" onClick={() => { addActivityLog('Deleted', u.username, 'danger'); deleteUser(u.id); }} />
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </motion.section>
          </>
        )}

        {/* Controls */}
        {activeTab === 'controls' && (
          <>
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="glass-strong rounded-2xl p-6 space-y-4 noise-bg"
            >
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-700" /> Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveControl(activeControl === 'status' ? null : 'status')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                    activeControl === 'status'
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-slate-100 text-foreground hover:bg-slate-200 border-border/40'
                  }`}
                >
                  <Eye className="w-4 h-4" /> System Status
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveControl(activeControl === 'pending' ? null : 'pending')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                    activeControl === 'pending'
                      ? 'bg-warning/10 text-warning border-warning/20'
                      : 'bg-slate-100 text-foreground hover:bg-slate-200 border-border/40'
                  }`}
                >
                  <Clock className="w-4 h-4" /> Pending Voice Requests
                </motion.button>
              </div>
            </motion.section>

            {/* System Status Section */}
            {activeControl === 'status' && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="glass-strong rounded-2xl p-6 space-y-4 noise-bg"
              >
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Eye className="w-5 h-5 text-primary" /> System Status</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-xl bg-slate-50 border border-border/30">
                    <p className="text-sm font-medium text-foreground">AI System</p>
                    <p className="text-xs text-muted-foreground/70">{systemState.aiEnabled ? 'Enabled and operational' : 'Disabled'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-border/30">
                    <p className="text-sm font-medium text-foreground">Voice System</p>
                    <p className="text-xs text-muted-foreground/70">{systemState.voiceEnabled ? 'Enabled and operational' : 'Disabled'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-border/30">
                    <p className="text-sm font-medium text-foreground">Maintenance Mode</p>
                    <p className="text-xs text-muted-foreground/70">{systemState.maintenanceMode ? 'Active' : 'Inactive'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-border/30">
                    <p className="text-sm font-medium text-foreground">Online Users</p>
                    <p className="text-xs text-muted-foreground/70">{onlineUsers.length} currently online</p>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Pending Voice Requests Section */}
            {activeControl === 'pending' && pendingRequests.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="glass-strong rounded-2xl p-6 space-y-4 noise-bg relative overflow-hidden"
              >
                <motion.div
                  className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent"
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Clock className="w-5 h-5 text-blue-700" /> Pending Voice Requests</h2>
                <div className="space-y-2">
                  {pendingRequests.map((u, i) => (
                    <motion.div
                      key={u.id}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-border/30 hover:bg-slate-100 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          whileHover={{ rotate: 10 }}
                          className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-bold ring-1 ring-blue-200"
                        >
                          {u.username[0].toUpperCase()}
                        </motion.div>
                        <div>
                          <p className="font-medium text-foreground">{u.username}</p>
                          <p className="text-xs text-muted-foreground/60">Requested {u.requestTime ? formatRelativeTime(u.requestTime) : '—'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleApprove(u.id, u.username)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors border border-emerald-200">Approve</motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleReject(u.id, u.username)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors border border-red-200">Reject</motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {activeControl === 'pending' && pendingRequests.length === 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="glass-strong rounded-2xl p-6 space-y-4 noise-bg text-center"
              >
                <p className="text-sm text-muted-foreground">No pending voice requests</p>
              </motion.section>
            )}

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-strong rounded-2xl p-6 space-y-5 noise-bg"
            >
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Settings className="w-5 h-5 text-primary" /> System Controls</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-border/30"
                >
                  <div>
                    <p className="font-medium text-foreground">Maintenance Mode</p>
                    <p className="text-xs text-muted-foreground/70">Takes the system offline for all users</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      const newState = !systemState.maintenanceMode;
                      setSystemState(s => ({ ...s, maintenanceMode: newState }));
                      addActivityLog(newState ? 'Enabled maintenance mode' : 'Disabled maintenance mode', 'System', newState ? 'warning' : 'info');
                      toast.success(newState ? 'Maintenance ON' : 'Maintenance OFF');
                    }}
                    className={`relative w-14 h-8 rounded-full transition-all duration-300 ${systemState.maintenanceMode ? 'bg-red-500/10 text-red-600' : 'bg-border'}`}
                  >
                    <motion.span
                      layout
                      className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg ${systemState.maintenanceMode ? 'left-7' : 'left-1'}`}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </motion.button>
                </motion.div>

                <div className="p-4 rounded-xl bg-slate-50 space-y-2 border border-border/30">
                  <p className="text-sm font-medium text-foreground">Maintenance Message</p>
                  <textarea
                    value={systemState.maintenanceMessage}
                    onChange={e => setSystemState(s => ({ ...s, maintenanceMessage: e.target.value }))}
                    rows={2}
                    className="w-full text-sm bg-white border border-border/40 rounded-lg p-2.5 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-blue-200 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <ActionBtn icon={<Zap className="w-4 h-4" />} label={systemState.aiEnabled ? 'Disable AI' : 'Enable AI'} variant={systemState.aiEnabled ? 'danger' : 'success'} onClick={() => { setSystemState(s => ({ ...s, aiEnabled: !s.aiEnabled })); addActivityLog(systemState.aiEnabled ? 'Disabled AI' : 'Enabled AI', 'System', systemState.aiEnabled ? 'danger' : 'success'); toast.success(systemState.aiEnabled ? 'AI Disabled' : 'AI Enabled'); }} />
                <ActionBtn icon={<Mic className="w-4 h-4" />} label={systemState.voiceEnabled ? 'Disable Voice' : 'Enable Voice'} variant={systemState.voiceEnabled ? 'danger' : 'success'} onClick={() => { setSystemState(s => ({ ...s, voiceEnabled: !s.voiceEnabled })); addActivityLog(systemState.voiceEnabled ? 'Disabled voice' : 'Enabled voice', 'System', systemState.voiceEnabled ? 'danger' : 'success'); toast.success(systemState.voiceEnabled ? 'Voice Disabled' : 'Voice Enabled'); }} />
                <ActionBtn icon={<Power className="w-4 h-4" />} label="Enable All Systems" variant="primary" onClick={() => { setSystemState(s => ({ ...s, aiEnabled: true, voiceEnabled: true, maintenanceMode: false })); addActivityLog('Enabled all systems', 'System', 'success'); toast.success('All systems enabled'); }} />
              </div>
            </motion.section>
          </>
        )}

        {/* Logs */}
        {activeTab === 'logs' && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-strong rounded-2xl p-6 space-y-4 noise-bg">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Activity Log</h2>
                <button onClick={() => setShowNotifs(!showNotifs)} className="rounded-full bg-blue-600/10 px-3 py-2 text-sm text-blue-700 hover:bg-blue-600/15">Toggle Notifications</button>
              </div>
              <motion.div variants={stagger.container} initial="hidden" animate="show" className="space-y-2 max-h-64 overflow-y-auto">
                {activityLogs.map(log => (
                  <motion.div
                    key={log.id}
                    variants={stagger.item}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-sm hover:bg-slate-100 transition-colors border border-border/30"
                  >
                    <div className="flex items-center gap-2.5">
                      <motion.span
                        className={`w-2 h-2 rounded-full ${log.type === 'success' ? 'bg-emerald-500' : log.type === 'danger' ? 'bg-red-500' : log.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <span className="text-foreground">{log.action}</span>
                      <span className="text-muted-foreground/60">→</span>
                      <span className="text-muted-foreground font-medium">{log.target}</span>
                    </div>
                    <span className="text-xs text-muted-foreground/50 font-mono">{formatRelativeTime(log.timestamp)}</span>
                  </motion.div>
                ))}
              </motion.div>
              {showNotifs && (
                <div className="rounded-2xl bg-slate-100 border border-border/40 p-4 space-y-3">
                  <div className="text-sm font-medium text-foreground">Pending Notifications</div>
                  {pendingRequests.length > 0 ? pendingRequests.map((u) => (
                    <div key={u.id} className="flex items-center justify-between rounded-xl bg-white p-3 border border-border/20">
                      <div>
                        <p className="font-medium text-foreground">{u.username}</p>
                        <p className="text-xs text-muted-foreground/60">Voice request • {formatRelativeTime(u.requestTime!)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(u.id, u.username)} className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs text-emerald-700">Approve</button>
                        <button onClick={() => handleReject(u.id, u.username)} className="rounded-lg bg-red-100 px-3 py-1.5 text-xs text-red-700">Reject</button>
                      </div>
                    </div>
                  )) : <p className="text-sm text-muted-foreground">No pending notifications</p>}
                </div>
              )}
            </div>
          </motion.section>
        )}
          </div>
        </div>
      </main>
    </motion.div>
  );
};

const SidebarStat = ({ label, value }: { label: string; value: number | string }) => (
  <div className="rounded-2xl bg-white p-3 border border-border/50 text-sm text-foreground">
    <p className="text-muted-foreground text-xs">{label}</p>
    <p className="font-semibold mt-1">{value}</p>
  </div>
);

const StatCard = ({ icon, label, value, color = 'text-foreground', delay = 0 }: { icon: React.ReactNode; label: string; value: number; color?: string; delay?: number }) => {
  const animatedValue = useAnimatedCounter(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px -15px hsla(var(--primary), 0.1)' }}
      className="glass-strong rounded-2xl p-5 space-y-2 cursor-default noise-bg border border-border/20"
    >
      <div className="flex items-center gap-2 text-muted-foreground/60">{icon}<span className="text-xs">{label}</span></div>
      <p className={`text-3xl font-black tracking-tight ${color}`}>{animatedValue}</p>
    </motion.div>
  );
};

const ActionBtn = ({ icon, label, variant, onClick }: { icon: React.ReactNode; label: string; variant: string; onClick: () => void }) => {
  const colors: Record<string, string> = {
    primary: 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20',
    accent: 'bg-accent/10 text-accent hover:bg-accent/20 border-accent/20',
    success: 'bg-success/10 text-success hover:bg-success/20 border-success/20',
    danger: 'bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20',
  };
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${colors[variant] || colors.primary}`}
    >
      {icon} {label}
    </motion.button>
  );
};

const TinyBtn = ({ label, color, onClick }: { label: string; color: string; onClick: () => void }) => {
  const colors: Record<string, string> = {
    success: 'text-success hover:bg-success/10',
    warning: 'text-warning hover:bg-warning/10',
    accent: 'text-accent hover:bg-accent/10',
    destructive: 'text-destructive hover:bg-destructive/10',
    muted: 'text-muted-foreground hover:bg-muted/50',
  };
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`px-2 py-1 text-xs font-medium rounded-lg transition-all ${colors[color] || colors.muted}`}
    >
      {label}
    </motion.button>
  );
};

export default AdminDashboard;
