"use client";

import { Shield, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

interface SecurityPanelProps {
  data: {
    score: number;
    issues: Array<{ severity: "high" | "medium" | "low"; message: string } >;
    lastScan: string;
  };
}

export default function SecurityPanel({ data }: SecurityPanelProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500/20";
    if (score >= 60) return "bg-amber-500/20";
    return "bg-red-500/20";
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case "medium":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <CheckCircle className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="dashboard-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-200">Security Score</h2>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className={`text-5xl font-bold ${getScoreColor(data.score)}`}>
          {data.score}
        </div>
        <div className="flex-1">
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                data.score >= 80
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                  : data.score >= 60
                  ? "bg-gradient-to-r from-amber-500 to-amber-400"
                  : "bg-gradient-to-r from-red-500 to-red-400"
              }`}
              style={{ width: `${data.score}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Last scan: {new Date(data.lastScan).toLocaleString()}
          </p>
        </div>
      </div>

      {data.issues.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3">Issues Found</h3>
          <div className="space-y-2">
            {data.issues.map((issue, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
              >
                {getSeverityIcon(issue.severity)}
                <div className="flex-1">
                  <p className="text-sm text-slate-300">{issue.message}</p>
                  <span
                    className={`text-xs capitalize ${
                      issue.severity === "high"
                        ? "text-red-400"
                        : issue.severity === "medium"
                        ? "text-amber-400"
                        : "text-blue-400"
                    }`}
                  >
                    {issue.severity} priority
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.issues.length === 0 && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm text-emerald-400">No security issues detected</span>
        </div>
      )}
    </div>
  );
}
