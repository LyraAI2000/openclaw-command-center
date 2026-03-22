"use client";

import { useState, useEffect, useCallback } from "react";
import SecurityPanel from "./components/SecurityPanel";
import SystemHealthPanel from "./components/SystemHealthPanel";
import AgentStatusPanel from "./components/AgentStatusPanel";
import MemoryStatsPanel from "./components/MemoryStatsPanel";
import GitHubStatsPanel from "./components/GitHubStatsPanel";
import WorkBoardPanel from "./components/WorkBoardPanel";
import LogsPanel from "./components/LogsPanel";
import CronJobsPanel from "./components/CronJobsPanel";
import SessionsPanel from "./components/SessionsPanel";
import QuickActionsPanel from "./components/QuickActionsPanel";
import { RefreshCw, Zap, Activity } from "lucide-react";

export interface DashboardData {
  security: {
    score: number;
    issues: Array<{ severity: "high" | "medium" | "low"; message: string }>;
    lastScan: string;
  };
  system: {
    status: "running" | "stopped" | "error";
    uptime: string;
    version: string;
    lastError: string | null;
    sessions?: number;
    memoryFiles?: number;
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
    recentRepos: Array<{ name: string; lang: string; stars: number }>;
    username: string;
  };
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch real data from API routes
      const [systemRes, agentsRes, memoryRes, githubRes] = await Promise.all([
        fetch('/api/system').catch(() => null),
        fetch('/api/agents').catch(() => null),
        fetch('/api/memory').catch(() => null),
        fetch('/api/github').catch(() => null),
      ]);

      const systemData = systemRes?.ok ? await systemRes.json() : { status: 'error', version: 'unknown', uptime: 'unknown', lastError: 'API unavailable' };
      const agentsData = agentsRes?.ok ? await agentsRes.json() : { agents: [] };
      const memoryData = memoryRes?.ok ? await memoryRes.json() : { indexedFiles: 0, indexStatus: 'error', searchPerformance: 0 };
      const githubData = githubRes?.ok ? await githubRes.json() : { repoCount: 0, recentCommits: 0, openIssues: 0, contributionData: [], recentRepos: [], username: 'LyraAI2000' };

      const dashboardData: DashboardData = {
        security: {
          score: 87,
          issues: [
            { severity: "medium", message: "SSH key older than 90 days" },
            { severity: "low", message: "Unattended upgrades not configured" },
          ],
          lastScan: new Date().toISOString(),
        },
        system: {
          status: systemData.status || 'error',
          uptime: systemData.uptime || 'unknown',
          version: systemData.version || 'unknown',
          lastError: systemData.lastError || null,
          sessions: systemData.sessions || 0,
          memoryFiles: systemData.memoryFiles || 0,
        },
        agents: agentsData.agents || [],
        memory: {
          indexedFiles: memoryData.indexedFiles || 0,
          lastUpdate: memoryData.lastUpdate || new Date().toISOString(),
          indexStatus: memoryData.indexStatus || 'error',
          searchPerformance: memoryData.searchPerformance || 0,
        },
        github: {
          repoCount: githubData.repoCount || 0,
          recentCommits: githubData.recentCommits || 0,
          openIssues: githubData.openIssues || 0,
          contributionData: githubData.contributionData || Array(30).fill(0),
          recentRepos: githubData.recentRepos || [],
          username: githubData.username || 'LyraAI2000',
        },
      };

      setData(dashboardData);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
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
        
        {error && (
          <p className="text-xs text-red-400 mt-2">
            Error: {error}
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
          <SessionsPanel refreshInterval={30000} />
          <QuickActionsPanel />
          <LogsPanel refreshInterval={5000} />
          <CronJobsPanel refreshInterval={30000} />
        </div>
      )}
    </div>
  );
}
