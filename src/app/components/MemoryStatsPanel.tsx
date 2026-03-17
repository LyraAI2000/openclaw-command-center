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
h2 className="text-lg font-semibold text-slate-200">Work Board</h2>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <input
            type="text"
            placeholder="Task title..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 mb-2"
          />
          <textarea
            placeholder="Description (optional)..."
            value={newTaskDesc}
            onChange={(e) => setNewTaskDesc(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 mb-3 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={addTask}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((column) => (
          <div
            key={column.id}
            className={`kanban-column p-3 border-t-2 ${column.color}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-slate-300">{column.name}</span>
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                {getTasksForColumn(column.id).length}
              </span>
            </div>

            <div className="space-y-2">
              {getTasksForColumn(column.id).map((task) => (
                <div key={task.id} className="kanban-card p-3 group">
                  {editingTask === task.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-sm text-slate-200"
                      />
                      <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={2}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-sm text-slate-200 resize-none"
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() => saveEdit(task.id)}
                          className="p-1 hover:bg-slate-700 rounded"
                        >
                          <Check className="w-4 h-4 text-emerald-400" />
                        </button>
                        <button
                          onClick={() => setEditingTask(null)}
                          className="p-1 hover:bg-slate-700 rounded"
                        >
                          <X className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-medium text-slate-200">{task.title}</h4>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(task)}
                            className="p-1 hover:bg-slate-700 rounded"
                          >
                            <Edit2 className="w-3 h-3 text-slate-400" />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1 hover:bg-slate-700 rounded"
                          >
                            <X className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                      </div>
                      {task.description && (
                        <p className="text-xs text-slate-500 mt-1">{task.description}</p>
                      )}
                      <div className="flex gap-1 mt-2">
                        {column.id !== "ideas" && (
                          <button
                            onClick={() => {
                              const cols = ["ideas", "backlog", "in-progress", "done"];
                              const idx = cols.indexOf(column.id);
                              moveTask(task.id, cols[idx - 1] as Task["column"]);
                            }}
                            className="text-xs px-2 py-0.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-300"
                          >
                            ←
                          </button>
                        )}
                        {column.id !== "done" && (
                          <button
                            onClick={() => {
                              const cols = ["ideas", "backlog", "in-progress", "done"];
                              const idx = cols.indexOf(column.id);
                              moveTask(task.id, cols[idx + 1] as Task["column"]);
                            }}
                            className="text-xs px-2 py-0.5 bg-blue-600/50 hover:bg-blue-500/50 rounded text-blue-200"
                          >
                            →
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
