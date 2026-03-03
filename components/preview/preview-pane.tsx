'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Code2, Eye, Download, Copy, Check, ChevronDown, RotateCcw, FileCode2, FileJson, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';

// Import Prism languages
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/themes/prism-tomorrow.css';

interface PreviewPaneProps {
  code: string;
  language: string;
  onClose: () => void;
}

export function PreviewPane({ code: initialCode, language: initialLanguage, onClose }: PreviewPaneProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [previewCode, setPreviewCode] = useState(initialCode);
  const [isCopied, setIsCopied] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Sync with initial props when they change
  const [prevInitialCode, setPrevInitialCode] = useState(initialCode);
  if (initialCode !== prevInitialCode) {
    setPrevInitialCode(initialCode);
    setCode(initialCode);
    setLanguage(initialLanguage);
    setPreviewCode(initialCode);
  }

  // Debounce preview update
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewCode(code);
    }, 500);
    return () => clearTimeout(timer);
  }, [code]);

  useEffect(() => {
    let url: string | null = null;
    if (activeTab === 'preview' && iframeRef.current) {
      const isHtml = language === 'html';
      const htmlContent = isHtml 
        ? `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="antialiased bg-white text-zinc-900">
              ${previewCode}
            </body>
          </html>
        `
        : `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <script src="https://cdn.tailwindcss.com"></script>
              <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
              <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
              <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
              <script src="https://unpkg.com/lucide@latest"></script>
            </head>
            <body class="antialiased bg-white text-zinc-900">
              <div id="root"></div>
              <script type="text/babel" data-type="module">
                try {
                  const { useState, useEffect, useRef, useMemo, useCallback } = React;
                  
                  // Mock lucide-react imports
                  const LucideIcons = window.lucide;
                  const createIcon = (name) => {
                    return (props) => {
                      return React.createElement('i', {
                        ...props,
                        'data-lucide': name,
                        dangerouslySetInnerHTML: { __html: '' }
                      });
                    };
                  };
                  
                  // Basic mock for lucide-react
                  const LucideReact = new Proxy({}, {
                    get: function(target, prop) {
                      if (prop === '__esModule') return true;
                      // Convert PascalCase to kebab-case
                      const iconName = prop.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
                      return createIcon(iconName);
                    }
                  });
                  
                  window.LucideReact = LucideReact;

                  // Transform the code to remove imports and exports
                  let codeToRun = \`${previewCode.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
                  
                  // Remove imports
                  codeToRun = codeToRun.replace(/import\\s+.*?\\s+from\\s+['"].*?['"];?/g, '');
                  
                  // Replace anonymous default exports
                  codeToRun = codeToRun.replace(/export\\s+default\\s+function\\s*\\(/g, 'function App(');
                  codeToRun = codeToRun.replace(/export\\s+default\\s+\\(/g, 'const App = (');
                  
                  // Replace named exports
                  codeToRun = codeToRun.replace(/export\\s+default\\s+(function|class|const|let|var)\\s+(\\w+)/g, '$1 $2');
                  codeToRun = codeToRun.replace(/export\\s+(function|class|const|let|var)\\s+(\\w+)/g, '$1 $2');
                  
                  // Find the main component name
                  const match = codeToRun.match(/(?:function|const|let|var)\\s+([A-Z]\\w*)/);
                  const MainComponent = match ? match[1] : 'App';

                  // Add render call
                  codeToRun += \`\\n\\nconst root = ReactDOM.createRoot(document.getElementById('root'));\\nroot.render(<\${MainComponent} />);\`;

                  // Compile and run
                  const compiledCode = Babel.transform(codeToRun, {
                    presets: ['react', 'typescript'],
                    filename: 'app.tsx'
                  }).code;
                  
                  // Execute
                  const script = document.createElement('script');
                  script.type = 'text/javascript';
                  script.innerHTML = compiledCode;
                  document.body.appendChild(script);
                  
                  // Initialize icons
                  setTimeout(() => {
                    if (window.lucide) {
                      window.lucide.createIcons();
                    }
                  }, 100);
                  
                } catch (err) {
                  document.getElementById('root').innerHTML = \`
                    <div style="color: red; padding: 20px; font-family: monospace;">
                      <h3>Error compiling TSX:</h3>
                      <pre>\${err.message}</pre>
                    </div>
                  \`;
                }
              </script>
            </body>
          </html>
        `;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      url = URL.createObjectURL(blob);
      iframeRef.current.src = url;
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [previewCode, language, activeTab]);

  const handleCopy = async (contentToCopy: string = code) => {
    try {
      await navigator.clipboard.writeText(contentToCopy);
      setIsCopied(true);
      toast.success('Code copied to clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  const extractCSS = (htmlCode: string) => {
    const styleMatch = htmlCode.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    return styleMatch ? styleMatch[1].trim() : '';
  };

  const extractHTMLWithoutCSS = (htmlCode: string) => {
    return htmlCode.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').trim();
  };

  const handleExport = (type: 'all' | 'html' | 'css' | 'nextjs') => {
    try {
      let content = code;
      let extension = language === 'html' ? 'html' : 'tsx';
      
      if (language === 'html') {
        if (type === 'css') {
          content = extractCSS(code);
          if (!content) {
            toast.error('No CSS found in the code');
            return;
          }
          extension = 'css';
        } else if (type === 'html') {
          content = extractHTMLWithoutCSS(code);
          extension = 'html';
        } else if (type === 'nextjs') {
          // Convert HTML to a basic Next.js component
          const htmlContent = extractHTMLWithoutCSS(code);
          content = `import React from 'react';\n\nexport default function Component() {\n  return (\n    <>\n      ${htmlContent.replace(/class=/g, 'className=').replace(/<!--/g, '{/*').replace(/-->/g, '*/}')}\n    </>\n  );\n}\n`;
          extension = 'tsx';
        }
      } else if (language === 'tsx') {
         if (type === 'nextjs') {
           content = code;
           extension = 'tsx';
         }
      }

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `component.${extension}`;
      a.click();
      toast.success(`Exported ${extension.toUpperCase()} successfully`);
      setIsExportMenuOpen(false);
    } catch (err) {
      toast.error('Failed to export file');
    }
  };

  const handleReset = () => {
    setCode(initialCode);
    setLanguage(initialLanguage);
    toast.success('Code reset to original');
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const lineNumbers = code.split('\n').map((_, i) => i + 1).join('\n');

  return (
    <div className="flex flex-col h-full bg-white border-l border-zinc-200 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 bg-zinc-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-zinc-200/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'preview' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <Eye className="w-4 h-4" /> Preview
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'code' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <Code2 className="w-4 h-4" /> Code
            </button>
          </div>

          <div className="relative group">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="appearance-none bg-white border border-zinc-200 rounded-md px-3 py-1.5 pr-8 text-sm font-medium text-zinc-700 hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-all cursor-pointer"
            >
              <option value="html">HTML</option>
              <option value="tsx">TSX (React)</option>
            </select>
            <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-all"
            title="Reset to Original"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleCopy(code)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-all"
            title="Copy Code"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {isCopied ? 'Copied' : 'Copy'}
          </button>
          
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-all shadow-sm"
            >
              <Download className="w-4 h-4" /> Export <ChevronDown className="w-3 h-3 opacity-70" />
            </button>
            
            {isExportMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-zinc-200 py-1 z-50">
                <div className="flex items-center justify-between px-2 py-1 hover:bg-zinc-50">
                  <button
                    onClick={() => handleExport('all')}
                    className="flex-1 text-left px-2 py-1.5 text-sm text-zinc-700 flex items-center gap-2"
                  >
                    <FileCode2 className="w-4 h-4 text-zinc-400" />
                    Export All ({language.toUpperCase()})
                  </button>
                  <button
                    onClick={() => { handleCopy(code); setIsExportMenuOpen(false); }}
                    className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-md"
                    title="Copy All"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                {language === 'html' && (
                  <>
                    <div className="flex items-center justify-between px-2 py-1 hover:bg-zinc-50">
                      <button
                        onClick={() => handleExport('html')}
                        className="flex-1 text-left px-2 py-1.5 text-sm text-zinc-700 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4 text-zinc-400" />
                        Export HTML + Tailwind
                      </button>
                      <button
                        onClick={() => { handleCopy(extractHTMLWithoutCSS(code)); setIsExportMenuOpen(false); }}
                        className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-md"
                        title="Copy HTML"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between px-2 py-1 hover:bg-zinc-50">
                      <button
                        onClick={() => handleExport('css')}
                        className="flex-1 text-left px-2 py-1.5 text-sm text-zinc-700 flex items-center gap-2"
                      >
                        <FileJson className="w-4 h-4 text-zinc-400" />
                        Export CSS only
                      </button>
                      <button
                        onClick={() => { 
                          const css = extractCSS(code);
                          if (css) {
                            handleCopy(css);
                          } else {
                            toast.error('No CSS found');
                          }
                          setIsExportMenuOpen(false); 
                        }}
                        className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-md"
                        title="Copy CSS"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between px-2 py-1 hover:bg-zinc-50">
                      <button
                        onClick={() => handleExport('nextjs')}
                        className="flex-1 text-left px-2 py-1.5 text-sm text-zinc-700 flex items-center gap-2"
                      >
                        <Code2 className="w-4 h-4 text-zinc-400" />
                        Export NextJS + Tailwind
                      </button>
                      <button
                        onClick={() => { 
                          const htmlContent = extractHTMLWithoutCSS(code);
                          const nextJsContent = `import React from 'react';\n\nexport default function Component() {\n  return (\n    <>\n      ${htmlContent.replace(/class=/g, 'className=').replace(/<!--/g, '{/*').replace(/-->/g, '*/}')}\n    </>\n  );\n}\n`;
                          handleCopy(nextJsContent);
                          setIsExportMenuOpen(false); 
                        }}
                        className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-md"
                        title="Copy NextJS Component"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="w-px h-4 bg-zinc-200 mx-1" />
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative bg-zinc-50">
        {activeTab === 'preview' ? (
          <iframe
            ref={iframeRef}
            className="w-full h-full border-none bg-white"
            title="Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div className="flex h-full bg-zinc-950 overflow-hidden">
            {/* Line Numbers */}
            <div 
              ref={lineNumbersRef}
              className="py-4 px-3 text-right text-zinc-500 font-mono text-xs bg-zinc-900 border-r border-zinc-800 select-none overflow-hidden"
              style={{ minWidth: '3.5rem' }}
            >
              <pre className="m-0 leading-[1.5] font-mono" style={{ fontSize: '13px' }}>{lineNumbers}</pre>
            </div>
            
            {/* Editor */}
            <div 
              className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-zinc-700"
              onScroll={handleScroll}
            >
              <Editor
                value={code}
                onValueChange={code => setCode(code)}
                highlight={code => Prism.highlight(code, language === 'html' ? Prism.languages.markup : Prism.languages.tsx, language)}
                padding={16}
                className="font-mono text-sm min-h-full"
                style={{
                  fontFamily: '"JetBrains Mono", "Fira Code", "Fira Mono", monospace',
                  fontSize: 13,
                  lineHeight: '1.5',
                  color: '#e4e4e7', // zinc-200
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
