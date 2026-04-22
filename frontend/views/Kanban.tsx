import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, MoreHorizontal, Trash2 } from "lucide-react";
import { AppState, Action, TaskStatus, Task } from "../types";
import { Card, Badge, Button } from "../components/ui";
import { THEME, uid } from "../lib/utils";

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "todo", label: "To Do", color: "rgba(255,255,255,0.5)" },
  { id: "in-progress", label: "In Progress", color: THEME.cyan },
  { id: "review", label: "Review", color: THEME.amber },
  { id: "done", label: "Done", color: THEME.emerald },
];

export const KanbanView: React.FC<{ state: AppState; dispatch: React.Dispatch<Action> }> = ({ state, dispatch }) => {
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTask(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedTask) {
      dispatch({ type: "UPDATE_TASK", id: draggedTask, patch: { status } });
      setDraggedTask(null);
    }
  };

  const addTask = (status: TaskStatus) => {
    const newTask: Task = {
      id: uid("t"),
      title: "New Task",
      status,
      priority: "medium",
      assignee: "Unassigned",
      tags: []
    };
    dispatch({ type: "ADD_TASK", task: newTask });
  };

  return (
    <div className="h-full flex flex-col pb-4">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h1 className="text-2xl font-display font-bold text-white">Project Board</h1>
        <Button variant="primary" onClick={() => addTask("todo")}><Plus size={16}/> New Task</Button>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
        {COLUMNS.map(col => {
          const colTasks = state.tasks.filter(t => t.status === col.id);
          return (
            <div 
              key={col.id}
              className="flex flex-col w-80 shrink-0"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                  <h3 className="font-bold text-sm text-white/80 uppercase tracking-wider">{col.label}</h3>
                  <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{colTasks.length}</span>
                </div>
                <button className="text-white/30 hover:text-white/70"><MoreHorizontal size={16}/></button>
              </div>

              <div className="flex-1 flex flex-col gap-3 bg-white/5 rounded-2xl p-3 border border-white/5">
                {colTasks.map(task => (
                  <motion.div
                    key={task.id}
                    layoutId={task.id}
                    draggable
                    onDragStart={(e: any) => handleDragStart(e, task.id)}
                    className="bg-[#0c0c2d] p-4 rounded-xl border border-white/10 cursor-grab active:cursor-grabbing hover:border-white/30 transition-colors shadow-lg"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <Badge 
                        label={task.priority} 
                        color={task.priority === 'critical' ? THEME.rose : task.priority === 'high' ? THEME.amber : THEME.cyan} 
                      />
                      <button onClick={() => dispatch({ type: "DELETE_TASK", id: task.id })} className="text-white/20 hover:text-red-400 transition-colors">
                        <Trash2 size={14}/>
                      </button>
                    </div>
                    <p className="text-sm font-bold text-white mb-4">{task.title}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-1">
                        {task.tags.map(tag => <span key={tag} className="text-[9px] text-white/40 border border-white/10 px-1.5 py-0.5 rounded">{tag}</span>)}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/50 flex items-center justify-center text-[10px] font-bold text-violet-300">
                          {task.assignee.charAt(0)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                <button 
                  onClick={() => addTask(col.id)}
                  className="w-full py-3 rounded-xl border border-dashed border-white/10 text-white/30 text-sm font-bold hover:bg-white/10 hover:text-white/60 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={14}/> Add
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
