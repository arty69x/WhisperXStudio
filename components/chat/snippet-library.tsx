import React from 'react';
import { X, Copy, Trash2, Plus, Code } from 'lucide-react';
import toast from 'react-hot-toast';

export interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  createdAt: number;
}

interface SnippetLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  snippets: Snippet[];
  onDelete: (id: string) => void;
  onInsert: (code: string) => void;
}

export function SnippetLibrary({ isOpen, onClose, snippets, onDelete, onInsert }: SnippetLibraryProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm">
      <div className="w-96 bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-4 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-zinc-700" />
            <h2 className="font-semibold text-zinc-900">Snippet Library</h2>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {snippets.length === 0 ? (
            <div className="text-center text-zinc-500 mt-10">
              <Code className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>No snippets saved yet.</p>
              <p className="text-sm mt-1">Save code blocks from the chat to reuse them later.</p>
            </div>
          ) : (
            snippets.map(snippet => (
              <div key={snippet.id} className="border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50 group">
                <div className="flex items-center justify-between px-3 py-2 bg-zinc-100 border-b border-zinc-200">
                  <span className="text-sm font-medium text-zinc-700 truncate pr-2">{snippet.title}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(snippet.code);
                        toast.success('Copied to clipboard');
                      }}
                      className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 rounded-md"
                      title="Copy"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => onInsert(snippet.code)}
                      className="p-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md"
                      title="Insert into chat"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => onDelete(snippet.id)}
                      className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-zinc-900 text-zinc-300 text-xs font-mono overflow-x-auto max-h-32">
                  <pre>{snippet.code}</pre>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
