"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, Play, Square, AlertCircle, CheckCircle, RefreshCw, Loader2, Calendar, Target, Bot } from "lucide-react";

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  enabled: boolean;
  lastRunStatus: 'ok' | 'error' | 'unknown' | null;
  lastRunAt: string | null;
  nextRunAt: string | null;
  consecutiveErrors: number;
  lastError: string | null;
  agentId: string;
  target: string;
}

interface CronJobsPanelProps {
  refreshInterval?: number;
}

export default function CronJobsPanel({ refreshInterval = 30000 }: CronJobsPanelProps) {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch('/api/cron');
      if (!response.ok) throw new Error('Failed to fetch cron jobs');
      const data = await response.json();
      setJobs(data.jobs || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cron jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchJobs, refreshInterval]);

  const toggleJob = async (jobId: string, currentEnabled: boolean) => {
    const action = currentEnabled ? 'disable' : 'enable';
    setActionLoading(jobId);
    setMessage(null);

    try {
      const response = await fetch('/api/cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, action }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          text: `${currentEnabled ? 'Disabled' : 'Enabled'} job successfully`, 
          type: 'success' 
        });
        // Refresh jobs list
        await fetchJobs();
      } else {
        setMessage({ text: data.error || 'Failed to update job', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network error', type: 'error' });
    } finally {
      setActionLoading(null);
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const getStatusIcon = (job: CronJob) => {
    if (!job.enabled) {
      return <Square className="w-4 h-4 text-slate-400" />;
    }
    if (job.lastRunStatus === 'error' || job.consecutiveErrors > 0) {
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
    if (job.lastRunStatus === 'ok') {
      return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    }
    return <Clock className="w-4 h-4 text-blue-400" />;
  };

  const getStatusColor = (job: CronJob) => {
    if (!job.enabled) return 'text-slate-400';
    if (job.lastRunStatus === 'error' || job.consecutiveErrors > 0) return 'text-red-400';
    if (job.lastRunStatus === 'ok') return 'text-emerald-400';
    return 'text-blue-400';
  };

  const getStatusBg = (job: CronJob) => {
    if (!job.enabled) return 'bg-slate-500/10 border-slate-500/30';
    if (job.lastRunStatus === 'error' || job.consecutiveErrors > 0) return 'bg-red-500/10 border-red-500/30';
    if (job.lastRunStatus === 'ok') return 'bg-emerald-500/10 border-emerald-500/30';
    return 'bg-blue-500/10 border-blue-500/30';
  };

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (diff < 0) {
      // Future time
      const futureDiff = Math.abs(diff);
      const futureMins = Math.floor(futureDiff / 60000);
      const futureHours = Math.floor(futureDiff / 3600000);
      if (futureMins < 60) return `in ${futureMins}m`;
      if (futureHours < 24) return `in ${futureHours}h`;
      return date.toLocaleDateString();
    }

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const enabledCount = jobs.filter(j => j.enabled).length;
  const errorCount = jobs.filter(j => j.enabled && (j.lastRunStatus === 'error' || j.consecutiveErrors > 0)).length;

  return (
    <div className="dashboard-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-200">Cron Jobs</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchJobs}
            disabled={loading}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            title="Refresh jobs"
          >
            <RefreshCw className={`w-4 h-4 text-slate-300 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-emerald-400">{enabledCount} Active</span>
            {errorCount > 0 && (
              <span className="text-red-400">{errorCount} Errors</span>
            )}
          </div>
        </div>
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

      {loading && jobs.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading cron jobs...
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-48 text-red-400">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-slate-500">
          No cron jobs configured
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className={`p-4 rounded-lg border ${getStatusBg(job)} transition-all hover:border-opacity-50`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(job)}
                    <span className="font-medium text-slate-200 truncate">
                      {job.name}
                    </span>
                    {!job.enabled && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
                        Disabled
                      </span>
                    )}
                    {job.consecutiveErrors > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">
                        {job.consecutiveErrors} errors
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{job.schedule}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bot className="w-3 h-3" />
                      <span>{job.agentId}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      <span>{job.target}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mt-2">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">Last run:</span>
                      <span className={getStatusColor(job)}>
                        {formatTime(job.lastRunAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">Next run:</span>
                      <span className="text-blue-400">
                        {formatTime(job.nextRunAt)}
                      </span>
                    </div>
                  </div>

                  {job.lastError && (
                    <div className="mt-2 p-2 bg-red-500/10 rounded text-xs text-red-300 truncate">
                      <span className="font-medium">Last error:</span> {job.lastError}
                    </div>
                  )}
                </div>

                <div className="ml-4">
                  <button
                    onClick={() => toggleJob(job.id, job.enabled)}
                    disabled={actionLoading === job.id}
                    className={`p-2 rounded-lg transition-colors ${
                      job.enabled
                        ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                        : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400'
                    } disabled:opacity-50`}
                    title={job.enabled ? 'Disable job' : 'Enable job'}
                  >
                    {actionLoading === job.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : job.enabled ? (
                      <Square className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary footer */}
      <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
        <span>Total jobs: {jobs.length}</span>
        <span>Updates every {refreshInterval / 1000}s</span>
      </div>
    </div>
  );
}
