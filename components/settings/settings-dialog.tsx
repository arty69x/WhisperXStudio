'use client';

import React from 'react';
import { X, Settings2, BrainCircuit, Key } from 'lucide-react';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  useThinking: boolean;
  setUseThinking: (use: boolean) => void;
  onOpenApiKey: () => void;
}

export function SettingsDialog({
  isOpen,
  onClose,
  systemPrompt,
  setSystemPrompt,
  useThinking,
  setUseThinking,
  onOpenApiKey,
}: SettingsDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-zinc-900" />
            <h2 className="text-lg font-semibold text-zinc-900">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-900 flex items-center gap-2">
              System Prompt (Secret Flag)
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full h-32 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:ring-2 focus:ring-zinc-900 focus:border-transparent resize-none transition-all"
              placeholder="Enter system instructions..."
            />
            <p className="text-xs text-zinc-500">
              This prompt guides the AI&apos;s behavior and output format.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-900">Thinking Mode</h3>
                  <p className="text-xs text-zinc-500">Use gemini-3.1-pro-preview</p>
                </div>
              </div>
              <button
                onClick={() => setUseThinking(!useThinking)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  useThinking ? 'bg-indigo-600' : 'bg-zinc-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    useThinking ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={onOpenApiKey}
              className="w-full flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-200 hover:bg-zinc-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                  <Key className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-medium text-zinc-900">API Configuration</h3>
                  <p className="text-xs text-zinc-500">Manage your Gemini API Key</p>
                </div>
              </div>
              <div className="text-xs font-medium text-zinc-400 group-hover:text-zinc-900 transition-colors">
                Configure →
              </div>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors shadow-sm"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
