"use client";

import { useState, useEffect } from "react";
import { KanbanSquare, Plus, X, Edit2, Check } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  column: "ideas" | "backlog" | "in-progress" | "done";
  createdAt: string;
}

const COLUMNS = [
  { id: "ideas", name: "Ideas", color: "border-purple-500/50" },
  { id: "backlog", name: "Backlog", color: "border-blue-500/50" },
  { id: "in-progress", name: "In Progress", color: "border-amber-500/50" },
  { id: "done", name: "Done", color: "border-emerald-500/50" },
] as const;

export default function WorkBoardPanel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("openclaw-workboard");
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load tasks:", e);
      }
    } else {
      // Default tasks
      setTasks([
        {
          id: "1",
          title: "Build Command Center Dashboard",
          description: "Create the main dashboard with all panels",
          column: "in-progress",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Add real-time data integration",
          description: "Connect to actual OpenClaw CLI commands",
          column: "backlog",
          createdAt: new Date().toISOString(),
        },
        {
          id: "3",
          title: "Dark space theme design",
          description: "Implement the cosmic aesthetic",
          column: "done",
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("openclaw-workboard", JSON.stringify(tasks));
    }
  }, [tasks]);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: newTaskDesc,
      column: "ideas",
      createdAt: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
    setNewTaskDesc("");
    setShowAddForm(false);
  };

  const moveTask = (taskId: string, newColumn: Task["column"]) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, column: newColumn } : t)));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  const startEdit = (task: Task) => {
    setEditingTask(task.id);
    setEditTitle(task.title);
    setEditDesc(task.description);
  };

  const saveEdit = (taskId: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, title: editTitle, description: editDesc } : t
      )
    );
    setEditingTask(null);
  };

  const getTasksForColumn = (columnId: string) =>
    tasks.filter((t) => t.column === columnId);

  return (
    <div className="dashboard-card p-6 md:col-span-2 xl:col-span-3">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <KanbanSquare className="w-5 h-5 text-amber-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-200">Work Board</h2>
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
