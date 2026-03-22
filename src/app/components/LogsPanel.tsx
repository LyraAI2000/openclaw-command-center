"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FileText, Filter, Clock, AlertCircle, Info, AlertTriangle, Bug, X, RefreshCw } from "lucide-react";

interface LogEntry {
  timestamp: string;
  source: string;
  message: string;
  severity: 'info' | 'warn' | 'error' | 'debug';
}

interface LogsPanelProps {
  refreshInterval?: number;
}

export default function LogsPanel({ refreshInterval = 5000 }: LogsPanelProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);
  const [sources, setSources] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      const response = await fetch('/api/logs?limit=100');
      if (!response.ok) throw new Error('Failed to fetch logs');
      const data = await response.json();
      
      setLogs(data.logs || []);
      
      // Extract unique sources
      const uniqueSources = [...new Set((data.logs || []).map((l: LogEntry) => l.source))] as string[];
      setSources(uniqueSources);
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchLogs, refreshInterval]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter(log => {
    const matchesSource = !filter || log.source.toLowerCase().includes(filter.toLowerCase());
    const matchesSeverity = !severityFilter || log.severity === severityFilter;
    return matchesSource && matchesSeverity;
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warn':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'debug':
        return <Bug className="w-4 h-4 text-purple-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'warn':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'debug':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      default:
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setAutoScroll(isAtBottom);
    }
  };

  return (
    <div className="dashboard-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <FileText className="w-5 h-5 text-cyan-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-200">Real-time Logs</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 text-slate-300 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="status-dot status-online animate-pulse" />
            <span>Live</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Filter by source..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
          />
          {filter && (
            <button
              onClick={() => setFilter('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-slate-500 hover:text-slate-300" />
            </button>
          )}
        </div>
        
        <select
          value={severityFilter || ''}
          onChange={(e) => setSeverityFilter(e.target.value || null)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
        >
          <option value="">All Severities</option>
          <option value="error">Error</option>
          <option value="warn">Warning</option>
          <option value="info">Info</option>
          <option value="debug">Debug</option>
        </select>

        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
            autoScroll 
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
              : 'bg-slate-700 text-slate-400 border border-slate-600'
          }`}
        >
          Auto-scroll
        </button>
      </div>

      {/* Sources quick filter */}
      {sources.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {sources.slice(0, 5).map(source => (
            <button
              key={source}
              onClick={() => setFilter(source)}
              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                filter === source
                  ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
              }`}
            >
              {source}
            </button>
          ))}
        </div>
      )}

      {/* Logs display */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-80 overflow-y-auto space-y-2 pr-2"
      >
        {loading && logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            Loading logs...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-400">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            No logs match your filters
          </div>
        ) : (
          filteredLogs.map((log, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${getSeverityColor(log.severity)}`}
            >
              <div className="flex items-start gap-3">
                {getSeverityIcon(log.severity)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-400">
                      {formatTime(log.timestamp)}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-300">
                      {log.source}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full uppercase ${
                      log.severity === 'error' ? 'bg-red-500/20 text-red-300' :
                      log.severity === 'warn' ? 'bg-amber-500/20 text-amber-300' :
                      log.severity === 'debug' ? 'bg-purple-500/20 text-purple-300' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>
                      {log.severity}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 break-words">
                    {log.message}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats footer */}
      <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span>Total: {logs.length}</span>
          <span>Showing: {filteredLogs.length}</span>
          {logs.filter(l => l.severity === 'error').length > 0 && (
            <span className="text-red-400">
              Errors: {logs.filter(l => l.severity === 'error').length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Updates every {refreshInterval / 1000}s</span>
        </div>
      </div>
    </div>
  );
}
