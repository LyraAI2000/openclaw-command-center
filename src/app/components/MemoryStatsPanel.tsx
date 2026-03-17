"use client";

import { Database, Search, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface MemoryStatsPanelProps {
  data: {
    indexedFiles: number;
    lastUpdate: string;
    indexStatus: "ready" | "indexing" | "error";
    searchPerformance: number;
  };
}

export default function MemoryStatsPanel({ data }: MemoryStatsPanelProps) {
  const getStatusIcon = () => {
    switch (data.indexStatus) {
      case "ready":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case "indexing":
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusText = () => {
    switch (data.indexStatus) {
      case "ready":
        return "Index Ready";
      case "indexing":
        return "Indexing...";
      case "error":
        return "Index Error";
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div className="dashboard-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Database className="w-5 h-5 text-cyan-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-200">Memory Index</h2>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span
            className={`text-sm ${
              data.indexStatus === "ready"
                ? "text-emerald-400"
                : data.indexStatus === "indexing"
                ? "text-blue-400"
                : "text-red-400"
            }`}
          >
            {getStatusText()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-slate-800/50 rounded-lg text-center">
          <p className="text-3xl font-bold text-cyan-400">{formatNumber(data.indexedFiles)}</p>
          <p className="text-xs text-slate-400 mt-1">Files Indexed</p>
        </div>
        <div className="p-4 bg-slate-800/50 rounded-lg text-center">
          <p className="text-3xl font-bold text-purple-400">{data.searchPerformance.toFixed(3)}s</p>
          <p className="text-xs text-slate-400 mt-1">Avg Search Time</p>
        </div>
      </div>

      <div className="p-3 bg-slate-800/30 rounded-lg">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <Clock className="w-4 h-4" />
          <span className="text-xs">Last Updated</span>
        </div>
        <p className="text-sm text-slate-300">
          {new Date(data.lastUpdate).toLocaleString()}
        </p>
      </div>

      <div className="mt-4 p-3 bg-slate-800/30 rounded-lg">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <Search className="w-4 h-4" />
          <span className="text-xs">Recent Searches</span>
        </div>
        <div className="space-y-1">
          {["weather forecast", "github repos", "agent status"].map((query, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-sm p-2 bg-slate-800/50 rounded"
            >
              <span className="text-slate-300">"{query}"</span>
              <span className="text-xs text-slate-500">{(0.02 + i * 0.01).toFixed(3)}s</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
