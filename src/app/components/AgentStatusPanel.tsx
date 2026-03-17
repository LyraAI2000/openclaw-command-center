"use client";

import { useState } from "react";
import { Users, Bot, Clock, ChevronRight, Play, Square, RotateCw, Loader2 } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  status: "active" | "idle" | "offline";
  currentTask: string;
  lastCheckIn: string;
  role: string;
}

interface AgentStatusPanelProps {
  agents: Agent[];
}

export default function AgentStatusPanel({ agents }: AgentStatusPanelProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-emerald-400";
      case "idle":
        return "text-amber-400";
      case "offline":
        return "text-slate-400";
      default:
        return "text-slate-400";
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-400";
      case "idle":
        return "bg-amber-400";
      case "offline":
        return "bg-slate-400";
      default:
        return "bg-slate-400";
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const controlAgent = async (agentId: string, action: "start" | "stop" | "restart") => {
    setLoading(`${agentId}-${action}`);
    setMessage(null);

    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: data.message, type: "success" });
        // Refresh page after 1 second to show updated status
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setMessage({ text: data.error || "Failed to control agent", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Network error", type: "error" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="dashboard-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-200">Agent Status</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{agents.filter((a) => a.status === "active").length} Active</span>
        </div>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border border-red-500/30 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-3">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                  >
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-800 ${getStatusDot(
                      agent.status
                    )}`}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-200">{agent.name}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full bg-slate-700 ${getStatusColor(
                        agent.status
                      )}`}
                    >
                      {agent.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{agent.role}</p>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center gap-1">
                {agent.status !== "active" && (
                  <button
                    onClick={() => controlAgent(agent.id, "start")}
                    disabled={loading === `${agent.id}-start`}
                    className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 rounded-lg transition-colors disabled:opacity-50"
                    title="Start agent"
                  >
                    {loading === `${agent.id}-start` ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                )}
                {agent.status === "active" && (
                  <button
                    onClick={() => controlAgent(agent.id, "stop")}
                    disabled={loading === `${agent.id}-stop`}
                    className="p-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                    title="Stop agent"
                  >
                    {loading === `${agent.id}-stop` ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                )}
                <button
                  onClick={() => controlAgent(agent.id, "restart")}
                  disabled={loading === `${agent.id}-restart`}
                  className="p-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-colors disabled:opacity-50"
                  title="Restart agent"
                >
                  {loading === `${agent.id}-restart` ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RotateCw className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="mt-2 pl-13">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <ChevronRight className="w-3 h-3" />
                <span className="text-slate-300">{agent.currentTask}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                <Clock className="w-3 h-3" />
                <span>{formatTime(agent.lastCheckIn)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-slate-800/30 rounded-lg">
        <h3 className="text-xs font-medium text-slate-400 mb-2">Organization</h3>
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-purple-400 font-medium">Lyra</span>
            <span className="text-slate-500">(CEO)</span>
          </div>
          <span className="text-slate-600">→</span>
          <div className="flex items-center gap-1">
            <span className="text-blue-400">Cygnus</span>
            <span className="text-slate-500">(Vibe-Architect)</span>
          </div>
          <span className="text-slate-600">→</span>
          <div className="flex items-center gap-1">
            <span className="text-cyan-400">Orion</span>
            <span className="text-slate-500">(Researcher)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
