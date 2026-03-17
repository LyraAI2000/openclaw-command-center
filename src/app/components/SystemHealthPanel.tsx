"use client";

import { Server, Clock, AlertCircle, CheckCircle, XCircle, Activity } from "lucide-react";

interface SystemHealthPanelProps {
  data: {
    status: "running" | "stopped" | "error";
    uptime: string;
    version: string;
    lastError: string | null;
    sessions?: number;
    memoryFiles?: number;
  };
}

export default function SystemHealthPanel({ data }: SystemHealthPanelProps) {
  const getStatusIcon = () => {
    switch (data.status) {
      case "running":
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case "stopped":
        return <XCircle className="w-5 h-5 text-slate-400" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const getStatusColor = () => {
    switch (data.status) {
      case "running":
        return "text-emerald-400";
      case "stopped":
        return "text-slate-400";
      case "error":
        return "text-red-400";
    }
  };

  return (
    <div className="dashboard-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Server className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-200">System Health</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="status-dot status-online animate-pulse" />
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Status</span>
            </div>
            <p className="text-lg font-semibold text-slate-200">{data.uptime}</p>
          </div>

          <div className="p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Server className="w-4 h-4" />
              <span className="text-xs">Version</span>
            </div>
            <p className="text-lg font-semibold text-slate-200">{data.version !== 'unknown' ? `v${data.version}` : 'unknown'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-xs">Sessions</span>
            </div>
            <p className="text-lg font-semibold text-cyan-400">{data.sessions ?? 0}</p>
          </div>

          <div className="p-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Server className="w-4 h-4" />
              <span className="text-xs">Memory Files</span>
            </div>
            <p className="text-lg font-semibold text-purple-400">{data.memoryFiles ?? 0}</p>
          </div>
        </div>

        {data.lastError ? (
          <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
              <div>
                <p className="text-sm text-red-400 font-medium">Last Error</p>
                <p className="text-sm text-slate-400">{data.lastError}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400">No recent errors</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
