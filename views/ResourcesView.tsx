
import React, { useState, useRef } from 'react';
import { StoredDocument } from '../types';
import { askQuestionAboutResources } from '../services/geminiService';

interface ResourcesViewProps {
  articles: StoredDocument[];
  setArticles: React.Dispatch<React.SetStateAction<StoredDocument[]>>;
}

const ResourcesView: React.FC<ResourcesViewProps> = ({ articles, setArticles }) => {
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // FIX: Cast Array.from result to File[] to ensure the compiler recognizes the objects as Files
    const files = Array.from(e.target.files || []) as File[];
    if (articles.length + files.length > 50) {
      alert("Maximum 50 articles allowed in the knowledge base.");
      return;
    }

    // FIX: Add explicit type 'File' to the parameter to avoid 'unknown' type errors on properties like name and size
    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
          const newDoc: StoredDocument = {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            content: content,
            type: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
            size: (file.size / 1024).toFixed(1) + ' KB',
            uploadDate: new Date().toISOString().split('T')[0],
          };
          setArticles(prev => [newDoc, ...prev]);
        }
      };
      // FIX: Ensure file is treated as a Blob for readAsText
      reader.readAsText(file);
    });
  };

  const removeArticle = (id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  const handleAsk = async () => {
    if (!question.trim() || articles.length === 0) return;
    setIsAsking(true);
    setAnswer(null);
    try {
      const result = await askQuestionAboutResources(articles, question);
      setAnswer(result);
    } catch (err) {
      setAnswer("Error: Could not retrieve advice.");
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      {/* Left: Article Management */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Article Library</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{articles.length} / 50 Articles</p>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
              <i className="fa-solid fa-plus"></i>
              <input type="file" multiple ref={fileInputRef} onChange={handleUpload} className="hidden" accept=".txt,.md,.json" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {articles.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 opacity-60">
                <i className="fa-solid fa-book-open-reader text-4xl mb-3"></i>
                <p className="text-xs font-bold">Your library is empty.</p>
                <p className="text-[10px] mt-1">Upload comparative articles or buyer checklists to train the AI.</p>
              </div>
            ) : (
              articles.map((art) => (
                <div key={art.id} className="group bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center gap-3 hover:bg-white hover:shadow-sm transition-all">
                  <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-600 text-xs">
                    <i className="fa-regular fa-file-lines"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{art.name}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">{art.size} • {art.type}</p>
                  </div>
                  <button 
                    onClick={() => removeArticle(id => art.id === id ? removeArticle(art.id) : null)}
                    className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all p-1"
                  >
                    <i className="fa-solid fa-trash-can text-xs"></i>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right: AI Advisory Panel */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#0f172a] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[700px] border border-slate-800">
          <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
              <i className="fa-solid fa-robot"></i>
            </div>
            <div>
              <h3 className="text-white font-bold">AI Advisory Agent</h3>
              <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Knowledge Base Mode Active</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
            {articles.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center text-3xl mb-4">
                  <i className="fa-solid fa-lock opacity-20"></i>
                </div>
                <p className="text-sm font-bold">Agent Locked</p>
                <p className="text-xs max-w-xs mt-2">Please upload at least one article to your library to begin receiving AI-powered advice.</p>
              </div>
            ) : answer ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-slate-800/50 p-4 rounded-2xl rounded-bl-none text-slate-300 text-sm italic max-w-[80%]">
                  "{question}"
                </div>
                <div className="bg-blue-600 p-6 rounded-2xl rounded-br-none text-white text-sm leading-relaxed shadow-xl shadow-blue-500/10 self-end">
                  <div className="flex items-center gap-2 mb-3 border-b border-blue-400/50 pb-2">
                    <i className="fa-solid fa-wand-magic-sparkles text-xs"></i>
                    <span className="text-[10px] font-black uppercase tracking-widest">AI Synthesis</span>
                  </div>
                  {answer}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 opacity-50">
                <i className="fa-solid fa-message text-4xl mb-4"></i>
                <p className="text-sm font-bold">Ask anything about your library</p>
                <p className="text-xs mt-1">e.g. "What are the common mistakes buyers make in high-interest environments?"</p>
              </div>
            )}
          </div>

          <div className="p-6 bg-slate-900 border-t border-slate-800">
            <div className="relative flex items-center gap-2">
              <input 
                type="text"
                disabled={articles.length === 0 || isAsking}
                placeholder={articles.length > 0 ? "Ask your question..." : "Upload articles first..."}
                className="w-full bg-slate-800 border-none rounded-xl py-4 pl-4 pr-12 text-white text-sm focus:ring-2 focus:ring-blue-600 outline-none disabled:opacity-50 transition-all shadow-inner"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              />
              <button 
                onClick={handleAsk}
                disabled={!question.trim() || isAsking || articles.length === 0}
                className="absolute right-2 w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
              >
                {isAsking ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesView;
