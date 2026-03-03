import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Task = {
  id: string;
  text: string;
  completed: boolean;
};

interface TaskListProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskList({ tasks, setTasks, isOpen, onClose }: TaskListProps) {
  const [newTask, setNewTask] = useState('');

  if (!isOpen) return null;

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks(prev => [...prev, { id: Date.now().toString(), text: newTask.trim(), completed: false }]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="w-80 border-l border-zinc-200 bg-zinc-50 flex flex-col h-full shrink-0 shadow-xl z-20 absolute right-0 top-0 bottom-0 sm:relative">
      <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-white">
        <h2 className="font-semibold text-zinc-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-indigo-500" />
          Tasks
        </h2>
        <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-900 rounded-md hover:bg-zinc-100">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center text-zinc-500 text-sm mt-8">
            No tasks yet. Add one below or ask AI to generate tasks.
          </div>
        ) : (
          tasks.map(task => (
            <div 
              key={task.id} 
              className={cn(
                "group flex items-start gap-3 p-3 bg-white rounded-xl border transition-all",
                task.completed ? "border-zinc-100 bg-zinc-50/50" : "border-zinc-200 shadow-sm hover:border-indigo-200"
              )}
            >
              <button 
                onClick={() => toggleTask(task.id)}
                className="mt-0.5 shrink-0 text-zinc-400 hover:text-indigo-500 transition-colors"
              >
                {task.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>
              <span className={cn(
                "flex-1 text-sm transition-all",
                task.completed ? "text-zinc-400 line-through" : "text-zinc-700"
              )}>
                {task.text}
              </span>
              <button 
                onClick={() => removeTask(task.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-all shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-white border-t border-zinc-200">
        <form onSubmit={addTask} className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a task..."
            className="flex-1 text-sm px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button 
            type="submit"
            disabled={!newTask.trim()}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
