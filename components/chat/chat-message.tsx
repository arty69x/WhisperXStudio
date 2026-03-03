'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { User, Bot, Play, Download, FileText, ExternalLink, MessageSquare, BookmarkPlus, Sparkles } from 'lucide-react';
import { Message } from './chat-interface';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ChatMessageProps {
  message: Message;
  onCodeExtract: (code: string, language: string) => void;
  onExplainCode?: (code: string, language: string) => void;
  onSaveSnippet?: (code: string, language: string) => void;
  onGenerateCaption?: (imageUrl: string) => void;
}

export function ChatMessage({ message, onCodeExtract, onExplainCode, onSaveSnippet, onGenerateCaption }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      
      <div className={`flex flex-col gap-2 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {message.attachments.map((att, idx) => (
              <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-zinc-100 rounded-lg border border-zinc-200">
                <FileText className="w-4 h-4 text-zinc-500" />
                <span className="text-xs font-medium text-zinc-700">{att.name}</span>
              </div>
            ))}
          </div>
        )}
        
        {message.images && message.images.length > 0 && (
          <div className={cn(
            "grid gap-2 mb-2",
            message.images.length === 1 ? "grid-cols-1" : 
            message.images.length === 2 ? "grid-cols-2" : 
            "grid-cols-2 sm:grid-cols-3"
          )}>
            {message.images.map((img, idx) => (
              <div key={idx} className="relative group aspect-square overflow-hidden rounded-xl border border-zinc-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={img} 
                  alt={`Uploaded ${idx}`} 
                  className="w-full h-full object-cover cursor-zoom-in transition-transform group-hover:scale-105" 
                  onClick={() => window.open(img, '_blank')}
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                  <button 
                    onClick={() => window.open(img, '_blank')}
                    className="bg-black/50 hover:bg-black/70 p-1.5 rounded-full text-white transition-colors"
                    title="Open full size"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  {onGenerateCaption && (
                    <button 
                      onClick={() => onGenerateCaption(img)}
                      className="bg-indigo-600/80 hover:bg-indigo-600 p-1.5 rounded-full text-white transition-colors"
                      title="Generate AI Caption"
                    >
                      <Sparkles className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {message.videoUrl && (
          <video src={message.videoUrl} controls className="max-w-sm rounded-xl border border-zinc-200" />
        )}

        <div className={`px-4 py-3 rounded-2xl ${isUser ? 'bg-zinc-900 text-white' : 'bg-white border border-zinc-200 text-zinc-900'}`}>
          <div className="prose prose-sm dark:prose-invert max-w-none break-words">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children, ...props }: React.ComponentPropsWithoutRef<'code'> & { inline?: boolean }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';
                  const code = String(children).replace(/\n$/, '');
                  
                  if (!inline && match) {
                    return (
                      <div className="relative group mt-4 mb-4 rounded-lg bg-zinc-950 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 text-zinc-400 text-xs font-mono">
                          <span>{language}</span>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                const blob = new Blob([code], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `code.${language === 'html' ? 'html' : 'tsx'}`;
                                a.click();
                                toast.success('Code exported');
                              }}
                              className="flex items-center gap-1 hover:text-white px-2 py-1 rounded transition-colors"
                              title="Export Code"
                            >
                              <Download className="w-3 h-3" /> Export
                            </button>
                            {onSaveSnippet && (
                              <button 
                                onClick={() => onSaveSnippet(code, language)}
                                className="flex items-center gap-1 hover:text-white px-2 py-1 rounded transition-colors"
                                title="Save Snippet"
                              >
                                <BookmarkPlus className="w-3 h-3" /> Save
                              </button>
                            )}
                            {onExplainCode && (
                              <button 
                                onClick={() => onExplainCode(code, language)}
                                className="flex items-center gap-1 hover:text-white px-2 py-1 rounded transition-colors"
                                title="Explain Code"
                              >
                                <MessageSquare className="w-3 h-3" /> Explain
                              </button>
                            )}
                            <button 
                              onClick={() => onCodeExtract(code, language)}
                              className="flex items-center gap-1 hover:text-white bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded transition-colors"
                              title="Preview Code"
                            >
                              <Play className="w-3 h-3" /> Preview
                            </button>
                          </div>
                        </div>
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={language}
                          PreTag="div"
                          customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
                        >
                          {code}
                        </SyntaxHighlighter>
                      </div>
                    );
                  }
                  return (
                    <code className="bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
