
import React, { useRef } from 'react';
import { StoredDocument } from '../types';

interface DocumentsViewProps {
  documents: StoredDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<StoredDocument[]>>;
}

const DocumentsView: React.FC<DocumentsViewProps> = ({ documents, setDocuments }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const newDoc: StoredDocument = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          content: content,
          type: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
          size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
          uploadDate: new Date().toISOString().split('T')[0],
        };
        setDocuments(prev => [newDoc, ...prev]);
      }
    };
    reader.readAsText(file);
  };

  const removeDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Knowledge Base</h3>
            <p className="text-xs text-slate-500">Upload property listings or market reports for AI analysis.</p>
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-blue-900/10 active:scale-95"
          >
            <i className="fa-solid fa-cloud-arrow-up text-xs"></i> 
            Upload Listing
            <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept=".txt,.md,.csv,.json" />
          </button>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/30">
              <th className="px-8 py-4">Document Name</th>
              <th className="px-8 py-4">Format</th>
              <th className="px-8 py-4">Size</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <i className="fa-regular fa-folder-open text-4xl mb-2 opacity-20"></i>
                    <p className="font-medium">No documents uploaded yet.</p>
                    <p className="text-xs">Upload a property list to use it in Nurturing.</p>
                  </div>
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600">
                         <i className="fa-regular fa-file-lines"></i>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-900 text-white">
                      {doc.type}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-500 font-medium">{doc.size}</td>
                  <td className="px-8 py-5">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Ready for AI
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => removeDoc(doc.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-2"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Helper info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-xl shadow-blue-500/20">
            <h4 className="font-bold mb-1 flex items-center gap-2">
              <i className="fa-solid fa-circle-info"></i>
              AI Indexing
            </h4>
            <p className="text-xs opacity-80 leading-relaxed">
              Documents are automatically indexed. Gemini reads the content to extract pricing, location, and key features for intelligent matching.
            </p>
         </div>
      </div>
    </div>
  );
};

export default DocumentsView;
