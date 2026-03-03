'use client';

import React, { useState, useEffect } from 'react';
import { Key, X, ExternalLink, CheckCircle2, AlertCircle, Loader2, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
}

export function ApiKeyModal({ isOpen, onClose, onSave }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClear = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setStatus('idle');
    onSave('');
    toast.success('API Key cleared');
  };

  const handleValidateAndSave = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    setIsValidating(true);
    setStatus('idle');

    try {
      // Simple validation by calling a lightweight model info or just checking format
      const { GoogleGenAI } = await import('@google/genai');
      const genAI = new GoogleGenAI({ apiKey: apiKey.trim() });
      
      // Use the correct method to validate the key
      await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ parts: [{ text: "Hi" }] }]
      });
      
      localStorage.setItem('gemini_api_key', apiKey.trim());
      setStatus('success');
      toast.success('API Key saved and connected successfully!');
      onSave(apiKey.trim());
      setTimeout(onClose, 1500);
    } catch (error: any) {
      console.error('API Key validation failed:', error);
      setStatus('error');
      toast.error('Invalid API Key or connection failed');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="relative h-32 bg-zinc-900 flex items-center justify-center">
          <div className="absolute top-4 right-4">
            <button
              onClick={onClose}
              className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Key className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-zinc-900">Gemini API Key</h2>
            <p className="text-sm text-zinc-500">
              Enter your API key to connect to Google&apos;s most capable AI models.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 ml-1">
                Your API Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key here..."
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all pr-10"
                />
                {status === 'success' && (
                  <CheckCircle2 className="absolute right-3 top-3.5 w-5 h-5 text-emerald-500" />
                )}
                {status === 'error' && (
                  <AlertCircle className="absolute right-3 top-3.5 w-5 h-5 text-red-500" />
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors py-2"
              >
                Get a free API key from Google AI Studio
                <ExternalLink className="w-4 h-4" />
              </a>

              <div className="flex gap-2">
                <button
                  onClick={handleClear}
                  className="px-4 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-semibold hover:bg-zinc-200 transition-all flex items-center justify-center"
                  title="Clear Key"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={handleValidateAndSave}
                  disabled={isValidating || !apiKey.trim()}
                  className="flex-1 py-4 bg-zinc-900 text-white rounded-2xl font-semibold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save & Connect
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-4 bg-zinc-50 border-t border-zinc-100">
          <p className="text-[10px] text-center text-zinc-400 uppercase tracking-widest font-bold">
            Securely stored in your browser
          </p>
        </div>
      </div>
    </div>
  );
}
