'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Settings, Code, Image as ImageIcon, Video, Loader2, X, FileText, Trash2, Layers, PlusCircle, ChevronLeft, ChevronRight, CheckSquare, Bookmark, User, LogOut } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { PreviewPane } from '@/components/preview/preview-pane';
import { SettingsDialog } from '@/components/settings/settings-dialog';
import { ChatMessage } from '@/components/chat/chat-message';
import { TaskList, Task } from '@/components/chat/task-list';
import { SnippetLibrary, Snippet } from '@/components/chat/snippet-library';
import { AuthModal } from '@/components/auth/auth-modal';
import { generateChatResponse, generateVideo, ULTRA_PIXEL_PERFECT_IMAGE_TO_TAILWIND_PROMPT } from '@/lib/gemini';
import { cn } from '@/lib/utils';

import { ApiKeyModal } from '@/components/settings/api-key-modal';

export type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
  images?: string[];
  attachments?: { name: string; content: string }[];
  videoUrl?: string;
};

type SelectedFile = {
  id: string;
  name: string;
  isImage: boolean;
  url?: string;
  base64?: string;
  mimeType?: string;
  textContent?: string;
  language?: string;
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(ULTRA_PIXEL_PERFECT_IMAGE_TO_TAILWIND_PROMPT);
  const [useThinking, setUseThinking] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [activeCode, setActiveCode] = useState<{ code: string; language: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isMultiPage, setIsMultiPage] = useState(false);
  const [splitWidth, setSplitWidth] = useState(50); // percentage
  const [isResizing, setIsResizing] = useState(false);

  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTaskListOpen, setIsTaskListOpen] = useState(false);
  
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [isSnippetLibraryOpen, setIsSnippetLibraryOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    } else {
      setIsApiKeyModalOpen(true);
    }
    
    const savedUser = localStorage.getItem('devchat_current_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
    
    const savedSnippets = localStorage.getItem('devchat_snippets');
    if (savedSnippets) {
      try {
        setSnippets(JSON.parse(savedSnippets));
      } catch (e) {
        console.error('Failed to parse snippets', e);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, mounted]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth > 20 && newWidth < 80) {
        setSplitWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  if (!mounted) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const processFiles = async (files: File[]) => {
    if (!files.length) return;

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const ALLOWED_TEXT_TYPES = ['text/plain', 'text/html', 'text/css', 'application/json', 'text/javascript', 'application/typescript'];
    const ALLOWED_AUDIO_VIDEO_TYPES = ['audio/mpeg', 'audio/wav', 'video/mp4', 'video/webm'];

    setUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Simulate upload progress
      setUploadProgress(Math.round(((i + 0.5) / files.length) * 100));

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File ${file.name} is too large (max 10MB)`);
        continue;
      }

      const isImage = file.type.startsWith('image/');
      const isAudioVideo = file.type.startsWith('audio/') || file.type.startsWith('video/');
      const isText = file.type.startsWith('text/') || file.type === 'application/json' || file.type === 'application/javascript' || file.type === 'application/typescript' || file.name.match(/\.(ts|tsx|js|jsx|json|html|css|md)$/);

      if (!isImage && !isText && !isAudioVideo) {
        toast.error(`File type ${file.type || 'unknown'} for ${file.name} is not supported`);
        continue;
      }

      const id = Math.random().toString(36).substring(7);

      if (isImage || isAudioVideo) {
        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            const base64 = result.split(',')[1];
            setSelectedFiles(prev => [...prev, {
              id,
              name: file.name,
              isImage: isImage,
              url: result,
              base64,
              mimeType: file.type
            }]);
            toast.success(`${isImage ? 'Image' : 'Media'} ${file.name} added`);
            resolve();
          };
          reader.onerror = () => {
            toast.error(`Failed to read ${file.name}`);
            resolve();
          };
          reader.readAsDataURL(file);
        });
      } else {
        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const text = event.target?.result as string;
            
            let language = 'text';
            if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) language = 'typescript';
            else if (file.name.endsWith('.js') || file.name.endsWith('.jsx')) language = 'javascript';
            else if (file.name.endsWith('.css')) language = 'css';
            else if (file.name.endsWith('.html')) language = 'html';
            else if (file.name.endsWith('.json')) language = 'json';
            else if (file.name.endsWith('.md')) language = 'markdown';

            setSelectedFiles(prev => [...prev, {
              id,
              name: file.name,
              isImage: false,
              textContent: text,
              language
            }]);
            toast.success(`File ${file.name} added`);
            resolve();
          };
          reader.onerror = () => {
            toast.error(`Failed to read ${file.name}`);
            resolve();
          };
          reader.readAsText(file);
        });
      }
    }
    
    setUploadProgress(100);
    setTimeout(() => setUploadProgress(null), 500);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleExplainCode = async (code: string, language: string) => {
    const prompt = `Please explain the following ${language} code in detail:\n\n\`\`\`${language}\n${code}\n\`\`\``;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const history = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));
      history.push({ role: 'user', parts: [{ text: prompt }] });

      const responseText = await generateChatResponse(history, systemPrompt, useThinking);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText || 'No response generated.'
      }]);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate explanation');
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: 'Sorry, an error occurred while explaining the code.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSnippet = (code: string, language: string) => {
    const title = prompt('Enter a title for this snippet:');
    if (!title) return;
    
    const newSnippet: Snippet = {
      id: Date.now().toString(),
      title,
      code,
      language,
      createdAt: Date.now()
    };
    
    const updatedSnippets = [newSnippet, ...snippets];
    setSnippets(updatedSnippets);
    localStorage.setItem('devchat_snippets', JSON.stringify(updatedSnippets));
    toast.success('Snippet saved to library');
  };

  const handleDeleteSnippet = (id: string) => {
    const updatedSnippets = snippets.filter(s => s.id !== id);
    setSnippets(updatedSnippets);
    localStorage.setItem('devchat_snippets', JSON.stringify(updatedSnippets));
    toast.success('Snippet deleted');
  };

  const handleInsertSnippet = (code: string) => {
    setInput(prev => prev + (prev ? '\n\n' : '') + code);
    setIsSnippetLibraryOpen(false);
    toast.success('Snippet inserted');
  };

  const handleGenerateCaption = async (imageUrl: string) => {
    const prompt = "Please provide a detailed, descriptive caption for this image that could be used as alt text.";
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      images: [imageUrl]
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const history: { role: "user" | "model"; parts: { text?: string; inlineData?: { data: string; mimeType: string } }[] }[] = messages.map(msg => ({
        role: msg.role as "user" | "model",
        parts: [{ text: msg.content }]
      }));
      
      let mimeType = imageUrl.split(';')[0].split(':')[1];
      if (mimeType === "application/octet-stream" || !mimeType) mimeType = "image/jpeg";
      
      history.push({ 
        role: 'user', 
        parts: [
          { text: prompt },
          { inlineData: { data: imageUrl.split(',')[1], mimeType } }
        ] 
      });

      const responseText = await generateChatResponse(history, systemPrompt, useThinking);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText || 'No caption generated.'
      }]);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate caption');
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: 'Sorry, an error occurred while generating the caption.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && selectedFiles.length === 0) return;

    let finalInput = input;
    const textFiles = selectedFiles.filter(f => !f.isImage);
    const imageFiles = selectedFiles.filter(f => f.isImage);

    if (textFiles.length > 0) {
      finalInput += "\n\nAttached Files:\n";
      textFiles.forEach(f => {
        finalInput += `\n--- ${f.name} ---\n\`\`\`${f.language || ''}\n${f.textContent}\n\`\`\`\n`;
      });
    }

    if (imageFiles.length > 0 && !input.trim() && textFiles.length === 0) {
      finalInput = isMultiPage 
        ? "Please analyze these images as a multi-page document. Generate a cohesive UI that handles all these pages/views. Perform detailed visual element extraction, OCR, and object detection to ensure accuracy."
        : "Please analyze these images in detail and provide a comprehensive description of all visual elements, text (OCR), object detection, and context.";
    } else if (imageFiles.length > 0) {
      finalInput += isMultiPage 
        ? "\n\n(Please treat the attached images as a multi-page document structure. Perform detailed visual element extraction, OCR, and object detection.)"
        : "\n\n(Please also analyze the attached images in detail regarding my request, including visual element extraction, OCR, and object detection.)";
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: finalInput,
      images: imageFiles.map(img => img.url!),
      attachments: textFiles.map(f => ({ name: f.name, content: f.textContent! }))
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    const currentFiles = [...selectedFiles];
    setSelectedFiles([]);
    setIsLoading(true);

    try {
      // Check if user is asking for a video
      const isVideoRequest = finalInput.toLowerCase().includes('generate video') || finalInput.toLowerCase().includes('create video');
      
      if (isVideoRequest) {
        const videoUrl = await generateVideo(finalInput, imageFiles[0]?.base64, imageFiles[0]?.mimeType);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: 'Here is the generated video:',
          videoUrl
        }]);
      } else {
        // Prepare history for API
        const history = messages.map(msg => {
          const parts: { text?: string; inlineData?: { data: string; mimeType: string } }[] = [{ text: msg.content }];
          if (msg.attachments) {
            msg.attachments.forEach(att => {
              parts.push({ text: `\n--- ${att.name} ---\n\`\`\`\n${att.content}\n\`\`\`\n` });
            });
          }
          if (msg.images) {
            msg.images.forEach(img => {
              let mimeType = img.split(';')[0].split(':')[1];
              if (mimeType === "application/octet-stream" || !mimeType) mimeType = "image/jpeg";
              parts.push({
                inlineData: { data: img.split(',')[1], mimeType }
              });
            });
          }
          return { role: msg.role, parts };
        });

        // Add current message
        const currentParts: { text?: string; inlineData?: { data: string; mimeType: string } }[] = [{ text: finalInput }];
        textFiles.forEach(f => {
          currentParts.push({ text: `\n--- ${f.name} ---\n\`\`\`${f.language || ''}\n${f.textContent}\n\`\`\`\n` });
        });
        imageFiles.forEach(img => {
          let mimeType = img.mimeType!;
          if (mimeType === "application/octet-stream" || !mimeType) mimeType = "image/jpeg";
          currentParts.push({
            inlineData: { data: img.base64!, mimeType }
          });
        });
        history.push({ role: 'user', parts: currentParts });

        const responseText = await generateChatResponse(history, systemPrompt, useThinking);
        
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: responseText || 'No response generated.'
        }]);

        // Extract code block if any
        const codeMatch = responseText?.match(/```(html|tsx|jsx|typescript|javascript)\n([\s\S]*?)```/);
        if (codeMatch) {
          setActiveCode({ language: codeMatch[1], code: codeMatch[2] });
        }

        // Extract tasks if AI generated a list
        const taskMatches = responseText?.match(/^- \[ \] (.*)$/gm);
        if (taskMatches && taskMatches.length > 0) {
          const newTasks = taskMatches.map(match => ({
            id: Math.random().toString(36).substring(7),
            text: match.replace(/^- \[ \] /, '').trim(),
            completed: false
          }));
          setTasks(prev => [...prev, ...newTasks]);
          setIsTaskListOpen(true);
          toast.success(`Extracted ${newTasks.length} tasks from response`);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: 'Sorry, an error occurred while processing your request.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full h-full overflow-hidden bg-white">
      <Toaster position="top-right" />
      
      <div className="flex w-full h-full relative">
        {/* Chat Area */}
        <div 
          className="flex flex-col h-full border-r border-zinc-200 bg-white overflow-hidden"
          style={{ width: activeCode ? `${splitWidth}%` : '100%' }}
        >
          {/* Header */}
          <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center">
                <Code className="w-4 h-4 text-white" />
              </div>
              <h1 className="font-semibold text-zinc-900">DevChat AI</h1>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsSnippetLibraryOpen(!isSnippetLibraryOpen)}
                className={cn(
                  "p-2 rounded-full transition-colors relative",
                  isSnippetLibraryOpen ? "bg-indigo-100 text-indigo-600" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                )}
                title="Snippet Library"
              >
                <Bookmark className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsTaskListOpen(!isTaskListOpen)}
                className={cn(
                  "p-2 rounded-full transition-colors relative",
                  isTaskListOpen ? "bg-indigo-100 text-indigo-600" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                )}
                title="Tasks"
              >
                <CheckSquare className="w-5 h-5" />
                {tasks.filter(t => !t.completed).length > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white" />
                )}
              </button>
              {messages.length > 0 && (
                <button 
                  onClick={() => {
                    if (confirm('Are you sure you want to clear the chat?')) {
                      setMessages([]);
                      setActiveCode(null);
                    }
                  }}
                  className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Clear Chat"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              {currentUser ? (
                <div className="flex items-center gap-2 ml-2 pl-2 border-l border-zinc-200">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('devchat_current_user');
                      setCurrentUser(null);
                      toast.success('Logged out');
                    }}
                    className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 ml-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </button>
              )}
            </div>
          </header>

          {/* Messages */}
          <div 
            className={cn(
              "flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth transition-colors",
              isDragging ? "bg-indigo-50/50 border-2 border-dashed border-indigo-300 m-4 rounded-xl" : ""
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDragging && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-indigo-50/90 backdrop-blur-sm rounded-xl m-4 border-2 border-dashed border-indigo-500 transition-all">
                <div className="flex flex-col items-center text-indigo-600 bg-white p-6 rounded-2xl shadow-xl">
                  <ImageIcon className="w-12 h-12 mb-4 animate-bounce" />
                  <p className="text-lg font-bold">Drop files here</p>
                  <p className="text-sm text-indigo-400 mt-1">Supports images, text, code, audio, and video</p>
                </div>
              </div>
            )}
            {uploadProgress !== null && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-white px-4 py-2 rounded-full shadow-lg border border-zinc-200 flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                <span className="text-sm font-medium text-zinc-700">Processing files... {uploadProgress}%</span>
                <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center">
                  <Code className="w-8 h-8 text-zinc-300" />
                </div>
                <p className="text-sm">Start a conversation or generate some code.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <ChatMessage 
                  key={msg.id} 
                  message={msg} 
                  onCodeExtract={(code, lang) => setActiveCode({ code, language: lang })} 
                  onExplainCode={handleExplainCode}
                  onSaveSnippet={handleSaveSnippet}
                  onGenerateCaption={handleGenerateCaption}
                />
              ))
            )}
            {isLoading && (
              <div className="flex items-center gap-3 text-zinc-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">AI is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-zinc-200 shrink-0">
            {selectedFiles.length > 0 && (
              <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
                {selectedFiles.map((file) => (
                  <div key={file.id} className="relative inline-block shrink-0">
                    {file.isImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={file.url} alt={file.name} className="h-20 w-20 rounded-lg border border-zinc-200 object-cover" />
                    ) : (
                      <div className="h-20 w-20 rounded-lg border border-zinc-200 bg-zinc-100 flex flex-col items-center justify-center p-2 text-center">
                        <FileText className="w-6 h-6 text-zinc-500 mb-1" />
                        <span className="text-[10px] text-zinc-600 truncate w-full">{file.name}</span>
                      </div>
                    )}
                    <button 
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-zinc-900 text-white rounded-full flex items-center justify-center text-xs hover:bg-zinc-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4 px-2 mb-1">
                <button
                  type="button"
                  onClick={() => setIsMultiPage(!isMultiPage)}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-medium transition-colors px-2 py-1 rounded-md",
                    isMultiPage ? "bg-indigo-100 text-indigo-700" : "text-zinc-500 hover:bg-zinc-100"
                  )}
                  title="Treat multiple images as a multi-page document"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Multi-page Mode
                </button>
              </div>
              <form onSubmit={handleSubmit} className="flex items-end gap-2 bg-zinc-50 p-2 rounded-2xl border border-zinc-200 focus-within:border-zinc-400 focus-within:ring-1 focus-within:ring-zinc-400 transition-all">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 text-zinc-400 hover:text-zinc-700 transition-colors rounded-xl hover:bg-zinc-200"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  className="hidden" 
                  multiple
                />
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything or request code..."
                  className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none py-3 px-2 text-zinc-900 placeholder:text-zinc-400"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={(!input.trim() && selectedFiles.length === 0) || isLoading}
                  className="p-3 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Resizer */}
        {activeCode && (
          <div 
            className={cn(
              "w-1 h-full cursor-col-resize hover:bg-indigo-500 transition-colors z-10",
              isResizing ? "bg-indigo-500" : "bg-zinc-200"
            )}
            onMouseDown={handleMouseDown}
          />
        )}

        {/* Preview Area */}
        {activeCode && (
          <div 
            className="h-full bg-zinc-50 flex flex-col overflow-hidden"
            style={{ width: `${100 - splitWidth}%` }}
          >
            <PreviewPane 
              code={activeCode.code} 
              language={activeCode.language} 
              onClose={() => setActiveCode(null)} 
            />
          </div>
        )}

        {/* Task List Slide-over */}
        {isTaskListOpen && (
          <TaskList 
            tasks={tasks} 
            setTasks={setTasks} 
            isOpen={isTaskListOpen} 
            onClose={() => setIsTaskListOpen(false)} 
          />
        )}

        {/* Snippet Library Slide-over */}
        <SnippetLibrary
          isOpen={isSnippetLibraryOpen}
          onClose={() => setIsSnippetLibraryOpen(false)}
          snippets={snippets}
          onDelete={handleDeleteSnippet}
          onInsert={handleInsertSnippet}
        />
      </div>

      <SettingsDialog 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
        useThinking={useThinking}
        setUseThinking={setUseThinking}
        onOpenApiKey={() => {
          setIsSettingsOpen(false);
          setIsApiKeyModalOpen(true);
        }}
      />

        <ApiKeyModal 
          isOpen={isApiKeyModalOpen}
          onClose={() => setIsApiKeyModalOpen(false)}
          onSave={(key) => {
            setApiKey(key);
            setIsApiKeyModalOpen(false);
          }}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={(user) => setCurrentUser(user)}
        />
      </div>
  );
}
