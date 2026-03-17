"use client";

import { Github, GitCommit, GitPullRequest, AlertCircle } from "lucide-react";

interface GitHubStatsPanelProps {
  data: {
    repoCount: number;
    recentCommits: number;
    openIssues: number;
    contributionData: number[];
  };
}

export default function GitHubStatsPanel({ data }: GitHubStatsPanelProps) {
  const maxContrib = Math.max(...data.contributionData);

  const getBarColor = (value: number) => {
    const intensity = value / maxContrib;
    if (intensity > 0.7) return "bg-emerald-400";
    if (intensity > 0.4) return "bg-emerald-500";
    if (intensity > 0.1) return "bg-emerald-600";
    return "bg-slate-700";
  };

  return (
    <div className="dashboard-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-700/50 rounded-lg">
            <Github className="w-5 h-5 text-slate-200" />
          </div>
          <h2 className="text-lg font-semibold text-slate-200">GitHub Stats</h2>
        </div>
        <a
          href="https://github.com/LyraAI2000"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          View Profile →
        </a>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 bg-slate-800/50 rounded-lg text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Github className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-slate-200">{data.repoCount}</p>
          <p className="text-xs text-slate-400">Repos</p>
        </div>

        <div className="p-3 bg-slate-800/50 rounded-lg text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <GitCommit className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-slate-200">{data.recentCommits}</p>
          <p className="text-xs text-slate-400">Commits</p>
        </div>

        <div className="p-3 bg-slate-800/50 rounded-lg text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-slate-200">{data.openIssues}</p>
          <p className="text-xs text-slate-400">Issues</p>
        </div>
      </div>

      <div className="p-3 bg-slate-800/30 rounded-lg">
        <h3 className="text-xs font-medium text-slate-400 mb-3">Contribution Activity (30 days)</h3>
        <div className="flex items-end gap-1 h-16">
          {data.contributionData.map((value, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t ${getBarColor(value)} transition-all hover:opacity-80`}
              style={{ height: `${(value / maxContrib) * 100}%` }}
              title={`${value} contributions`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-slate-800/30 rounded-lg">
        <h3 className="text-xs font-medium text-slate-400 mb-2">Recent Repositories</h3>
        <div className="space-y-2">
          {[
            { name: "openclaw-command-center", lang: "TypeScript", stars: 0 },
            { name: "workspace", lang: "Markdown", stars: 2 },
            { name: "dotfiles", lang: "Shell", stars: 1 },
          ].map((repo) => (
            <div
              key={repo.name}
              className="flex items-center justify-between p-2 bg-slate-800/50 rounded hover:bg-slate-700/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-blue-400">{repo.name}</span>
                <span className="text-xs text-slate-500">{repo.lang}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <span>★ {repo.stars}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
