"use client";

import { useState, useEffect, useCallback } from "react";
import SecurityPanel from "./components/SecurityPanel";
import SystemHealthPanel from "./components/SystemHealthPanel";
import AgentStatusPanel from "./components/AgentStatusPanel";
import MemoryStatsPanel from "./components/MemoryStatsPanel";
import GitHubStatsPanel from "./components/GitHubStatsPanel";
import WorkBoardPanel from "./components/WorkBoardPanel";
import { RefreshCw, Zap, Activity } from "lucide-react";

export interface DashboardData {
  security: {
    score: number;
    issues: Array<{ severity: "high" | "medium" | "low"; message: string } >;
    lastScan: string;
  };
  system: {
    status: "running" | "stopped" | "error";
    uptime: string;
    version: string;
    lastError: string | null;
  };
  agents: Array<{
    id: string;
    name: string;
    status: "active" | "idle" | "offline";
    currentTask: string;
    lastCheckIn: string;
    role: string;
  }>;
  memory: {
    indexedFiles: number;
    lastUpdate: string;
    indexStatus: "ready" | "indexing" | "error";
    searchPerformance: number;
  };
  github: {
    repoCount: number;
    recentCommits: number;
    openIssues: number;
    contributionData: number[];
  };
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API calls - in production these would be real OpenClaw CLI calls
      const mockData: DashboardData = {
        security: {
          score: 87,
          issues: [
            { severity: "medium", message: "SSH key older than 90 days" },
            { severity: "low", message: "Unattended upgrades not configured" },
          ],
          lastScan: new Date().toISOString(),
        },
        system: {
          status: "running",
          uptime: "3d 12h 45m",
          version: "2.1.4",
          lastError: null,
        },
        agents: [
          {
            id: "1",
            name: "Lyra",
            status: "active",
            currentTask: "Monitoring dashboard",
            lastCheckIn: new Date().toISOString(),
            role: "CEO",
          },
          {
            id: "2",
            name: "Cygnus",
            status: "active",
            currentTask: "Building Command Center",
            lastCheckIn: new Date().toISOString(),
            role: "Senior Vibe-Architect",
          },
          {
            id: "3",
            name: "Orion",
            status: "idle",
            currentTask: "Awaiting assignment",
            lastCheckIn: new Date(Date.now() - 3600000).toISOString(),
            role: "Lead Researcher",
          },
        ],
        memory: {
          indexedFiles: 1247,
          lastUpdate: new Date().toISOString(),
          indexStatus: "ready",
          searchPerformance: 0.045,
        },
        github: {
          repoCount: 12,
          recentCommits: 47,
          openIssues: 8,
          contributionData: [3, 5, 2, 7, 4, 6, 8, 5, 3, 4, 6, 7, 5, 4, 6, 8, 7, 5, 4, 6, 7, 8, 6, 5, 4, 6, 7, 5, 8, 6],
        },
      };

      // In production, these would be actual API calls:
      // const agents = await fetch('/api/agents').then(r => r.json());
      // const system = await fetch('/api/system').then(r => r.json());
      // etc.

      setData(mockData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 45000); // 45 seconds
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  return (
    <div className="min-h-screen p-6 relative z-10">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-pulse-glow">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                OpenClaw Command Center
              </h1>
              <p className="text-slate-400 text-sm">
                System Overview & Operations Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Activity className="w-4 h-4" />
              <span>{autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}</span>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`w-10 h-5 rounded-full transition-colors ${
                  autoRefresh ? "bg-blue-500" : "bg-slate-600"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    autoRefresh ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {lastRefresh && (
          <p className="text-xs text-slate-500 mt-2">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        )}
      </header>

      {/* Dashboard Grid */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <SecurityPanel data={data.security} />
          <SystemHealthPanel data={data.system} />
          <AgentStatusPanel agents={data.agents} />
          <MemoryStatsPanel data={data.memory} />
          <GitHubStatsPanel data={data.github} />
          <WorkBoardPanel />
        </div>
      )}
    </div>
  );
}
