"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Activity, 
  Clock, 
  User, 
  MessageSquare, 
  RefreshCw, 
  Loader2, 
  AlertCircle,
  Radio,
  Zap,
  Power,
  Trash2,
  ExternalLink,
  ChevronRight,
  X
} from "lucide-react";

interface Session {
  key: string;
  agentName: string;
  channel: string;
  status: 'active' | 'idle';
  lastActivity: string;
  createdAt: string;
  type: string;
}

interface SessionsPanelProps {
  refreshInterval?: number;
}

export default function SessionsPanel({ refreshInterval = 30000 }: SessionsPanelProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'idle'>('all');

  const fetchSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/sessions');
      if (!response.ok) throw new Error('Failed to fetch sessions');
      const data = await response.json();
      setSessions(data.sessions || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchSessions, refreshInterval]);

  const terminateSession = async (sessionKey: string) => {
    setActionLoading(sessionKey);
    setMessage(null);

    try {
      const response = await fetch(`/api/sessions?key=${encodeURIComponent(sessionKey)}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: data.message, type: 'success' });
        setSelectedSession(null);
        await fetchSessions();
      } else {
        setMessage({ text: data.error || 'Failed to terminate session', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network error', type: 'error' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Zap className="w-4 h-4 text-emerald-400" />;
      case 'idle':
        return <Clock className="w-4 h-4 text-amber-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'idle':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (filter === 'active') return session.status === 'active';
    if (filter === 'idle') return session.status === 'idle';
    return true;
  });

  const activeCount = sessions.filter(s => s.status === 'active').length;
  const idleCount = sessions.filter(s => s.status === 'idle').length;

  return (
    <div className="dashboard-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Radio className="w-5 h-5 text-cyan-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-200">Active Sessions</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSessions}
            disabled={loading}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            title="Refresh sessions"
          >
            <RefreshCw className={`w-4 h-4 text-slate-300 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-emerald-400">{activeCount} Active</span>
            <span className="text-slate-500">|</span>
            <span className="text-amber-400">{idleCount} Idle</span>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'active', 'idle'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === f
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'all' && ` (${sessions.length})`}
            {f === 'active' && ` (${activeCount})`}
            {f === 'idle' && ` (${idleCount})`}
          </button>
        ))}
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {loading && sessions.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading sessions...
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-48 text-red-400">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-slate-500">
          No {filter !== 'all' ? filter : ''} sessions found
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
          {filteredSessions.map((session) => (
            <div
              key={session.key}
              onClick={() => setSelectedSession(session)}
              className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-opacity-50 ${getStatusColor(session.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getStatusIcon(session.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-200 truncate">
                        {session.agentName}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        session.status === 'active' 
                          ? 'bg-emerald-500/20 text-emerald-300' 
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span className="truncate max-w-[120px]">{session.channel}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(session.lastActivity)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  selectedSession.status === 'active' 
                    ? 'bg-emerald-500/20' 
                    : 'bg-amber-500/20'
                }`}>
                  {selectedSession.status === 'active' ? (
                    <Zap className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-200">
                    {selectedSession.agentName}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedSession.status === 'active' 
                      ? 'bg-emerald-500/20 text-emerald-300' 
                      : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {selectedSession.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <User className="w-4 h-4" />
                  <span>Session Key</span>
                </div>
                <p className="text-slate-200 font-mono text-sm break-all">
                  {selectedSession.key}
                </p>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>Channel</span>
                </div>
                <p className="text-slate-200 text-sm">{selectedSession.channel}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Clock className="w-4 h-4" />
                    <span>Last Activity</span>
                  </div>
                  <p className="text-slate-200 text-sm">{formatTime(selectedSession.lastActivity)}</p>
                </div>

                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Power className="w-4 h-4" />
                    <span>Created</span>
                  </div>
                  <p className="text-slate-200 text-sm">{formatTime(selectedSession.createdAt)}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <Activity className="w-4 h-4" />
                  <span>Type</span>
                </div>
                <p className="text-slate-200 text-sm capitalize">{selectedSession.type}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => terminateSession(selectedSession.key)}
                disabled={actionLoading === selectedSession.key}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading === selectedSession.key ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Terminate Session
              </button>
              <button
                onClick={() => setSelectedSession(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary footer */}
      <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
        <span>Total sessions: {sessions.length}</span>
        <span>Updates every {refreshInterval / 1000}s</span>
      </div>
    </div>
  );
}