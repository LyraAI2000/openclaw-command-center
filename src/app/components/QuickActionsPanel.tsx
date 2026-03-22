"use client";

import { useState } from "react";
import { 
  Zap, 
  Database, 
  Activity, 
  FileText, 
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Terminal,
  Server,
  RotateCcw,
  AlertTriangle
} from "lucide-react";

interface ActionResult {
  success: boolean;
  message: string;
  output?: string;
}

interface QuickAction {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  destructive?: boolean;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'restartGateway',
    name: 'Restart Gateway',
    description: 'Restart the OpenClaw gateway service',
    icon: <RotateCcw className="w-5 h-5" />,
    action: 'restartGateway',
    requiresConfirmation: true,
    confirmationMessage: 'This will temporarily interrupt active sessions. Are you sure?',
  },
  {
    id: 'reindexMemory',
    name: 'Reindex Memory',
    description: 'Update memory index (qmd update)',
    icon: <Database className="w-5 h-5" />,
    action: 'reindexMemory',
  },
  {
    id: 'checkSystemStatus',
    name: 'Check System Status',
    description: 'Run openclaw status command',
    icon: <Activity className="w-5 h-5" />,
    action: 'checkSystemStatus',
  },
  {
    id: 'viewAgentLogs',
    name: 'View Agent Logs',
    description: 'Fetch recent agent logs',
    icon: <FileText className="w-5 h-5" />,
    action: 'viewAgentLogs',
  },
  {
    id: 'clearOldSessions',
    name: 'Clear Old Sessions',
    description: 'Remove idle sessions',
    icon: <Trash2 className="w-5 h-5" />,
    action: 'clearOldSessions',
    destructive: true,
    requiresConfirmation: true,
    confirmationMessage: 'This will terminate all idle sessions. This action cannot be undone.',
  },
];

export default function QuickActionsPanel() {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [showOutput, setShowOutput] = useState(false);
  const [confirmAction, setConfirmAction] = useState<QuickAction | null>(null);

  const executeAction = async (action: QuickAction, agentId?: string) => {
    setLoading(action.id);
    setResult(null);
    setShowOutput(false);

    try {
      const response = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: action.action,
          agentId: agentId || 'all',
          lines: 50
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          output: data.output,
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Action failed',
          output: data.output,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      });
    } finally {
      setLoading(null);
      setConfirmAction(null);
    }
  };

  const handleActionClick = (action: QuickAction) => {
    if (action.requiresConfirmation) {
      setConfirmAction(action);
    } else {
      executeAction(action);
    }
  };

  const getActionColor = (action: QuickAction) => {
    if (action.destructive) {
      return 'hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300';
    }
    return 'hover:bg-blue-500/20 hover:border-blue-500/40 hover:text-blue-300';
  };

  const getActionIconColor = (action: QuickAction) => {
    if (action.destructive) return 'text-red-400';
    return 'text-blue-400';
  };

  return (
    <div className="dashboard-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Zap className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-200">Quick Actions</h2>
        </div>
      </div>

      {/* Result notification */}
      {result && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            result.success
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}
        >
          <div className="flex items-start gap-2">
            {result.success ? (
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p>{result.message}</p>
              {result.output && (
                <button
                  onClick={() => setShowOutput(!showOutput)}
                  className="mt-2 text-xs underline hover:no-underline opacity-80"
                >
                  {showOutput ? 'Hide output' : 'Show output'}
                </button>
              )}
            </div>
            <button
              onClick={() => setResult(null)}
              className="p-1 hover:bg-slate-700/50 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {showOutput && result.output && (
            <div className="mt-3 p-3 bg-slate-900/80 rounded-lg overflow-x-auto">
              <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap">
                {result.output}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Action buttons grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action)}
            disabled={loading === action.id}
            className={`p-4 bg-slate-800/50 border border-slate-700 rounded-lg text-left transition-all ${getActionColor(action)} disabled:opacity-50 disabled:cursor-not-allowed group`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-slate-700/50 ${getActionIconColor(action)} group-hover:bg-slate-700 transition-colors`}>
                {loading === action.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  action.icon
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-200 group-hover:text-white transition-colors">
                    {action.name}
                  </span>
                  {action.destructive && (
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 group-hover:text-slate-300 transition-colors">
                  {action.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${
                confirmAction.destructive ? 'bg-red-500/20' : 'bg-amber-500/20'
              }`}>
                {confirmAction.destructive ? (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-slate-200">
                Confirm Action
              </h3>
            </div>

            <p className="text-slate-300 mb-6">
              {confirmAction.confirmationMessage}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => executeAction(confirmAction)}
                disabled={loading === confirmAction.id}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                  confirmAction.destructive
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {loading === confirmAction.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {confirmAction.destructive ? (
                      <Trash2 className="w-4 h-4" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Confirm
                  </>
                )}
              </button>
              <button
                onClick={() => setConfirmAction(null)}
                disabled={loading === confirmAction.id}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status summary */}
      <div className="mt-4 pt-3 border-t border-slate-700/50">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Server className="w-3 h-3" />
          <span>OpenClaw CLI Actions</span>
          <span className="text-slate-600">•</span>
          <Terminal className="w-3 h-3" />
          <span>Direct execution</span>
        </div>
      </div>
    </div>
  );
}