
import React, { useState } from 'react';
import { Lead, Property, RecommendationResponse, StoredDocument } from '../types';
import { getPropertyRecommendations } from '../services/geminiService';
import RecommendationDisplay from '../components/RecommendationDisplay';

interface NurturingViewProps {
  leads: Lead[];
  inventory: Property[];
  storedDocuments: StoredDocument[];
}

const NurturingView: React.FC<NurturingViewProps> = ({ leads, inventory, storedDocuments }) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [manualCriteria, setManualCriteria] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RecommendationResponse | null>(null);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  
  // Nurturing source states
  const [inventorySource, setInventorySource] = useState<'standard' | 'knowledge_base'>('standard');
  const [selectedDocId, setSelectedDocId] = useState<string>('');

  const selectedLead = leads.find(l => l.id === selectedLeadId);
  const selectedDoc = storedDocuments.find(d => d.id === selectedDocId);

  const handleSelectLead = (id: string) => {
    setSelectedLeadId(id);
    const lead = leads.find(l => l.id === id);
    if (lead) {
      setManualCriteria(lead.lifestyle + ` Seeking ${lead.criteria.preferredType} in ${lead.criteria.location}. Budget: $${lead.criteria.budgetMin}-$${lead.criteria.budgetMax}. Needs ${lead.criteria.minBedrooms} beds, ${lead.criteria.minBathrooms} baths.`);
    }
  };

  const handleGetSuggestions = async () => {
    if (!selectedLead) return;
    
    setLoading(true);
    try {
      // Use structured inventory OR the content of the selected document
      const source = inventorySource === 'standard' 
        ? inventory 
        : (selectedDoc?.content || '');
      
      const recommendation = await getPropertyRecommendations(source, selectedLead.criteria);
      setResults(recommendation);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sortedRecommendations = results ? [...results.recommendations].sort((a, b) => {
    return sortOrder === 'desc' ? b.matchScore - a.matchScore : a.matchScore - b.matchScore;
  }) : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-2xl font-black text-blue-900">AI Nurture & Match</h2>
          <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
            <button 
              onClick={() => setInventorySource('standard')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${inventorySource === 'standard' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500'}`}
            >
              Inventory DB
            </button>
            <button 
              onClick={() => setInventorySource('knowledge_base')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${inventorySource === 'knowledge_base' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500'}`}
            >
              Knowledge Base
            </button>
          </div>
        </div>
        <p className="text-slate-500 mb-8">
          {inventorySource === 'standard' 
            ? 'Running match against verified properties in the internal database.' 
            : 'Using uploaded listing sheets and market brochures from your knowledge base.'}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form Side */}
          <div className="space-y-6">
            
            {/* Context Source Selector */}
            {inventorySource === 'knowledge_base' && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-sm font-bold text-slate-700">Source Document</label>
                {storedDocuments.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-xs flex gap-3 items-center">
                    <i className="fa-solid fa-triangle-exclamation text-lg"></i>
                    <div>
                      <p className="font-bold">No documents available.</p>
                      <p>Go to the <strong>Documents</strong> tab to upload listing data first.</p>
                    </div>
                  </div>
                ) : (
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-600/20 outline-none"
                    value={selectedDocId}
                    onChange={(e) => setSelectedDocId(e.target.value)}
                  >
                    <option value="">Select an uploaded document...</option>
                    {storedDocuments.map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.name} ({doc.size})</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Select Lead</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-600/20 outline-none"
                value={selectedLeadId}
                onChange={(e) => handleSelectLead(e.target.value)}
              >
                <option value="">Select target buyer...</option>
                {leads.map(lead => (
                  <option key={lead.id} value={lead.id}>{lead.name} — {lead.email}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Lead Requirements</label>
              <textarea 
                rows={5}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm focus:ring-2 focus:ring-blue-600/20 outline-none resize-none"
                placeholder="What exactly is the buyer looking for?"
                value={manualCriteria}
                onChange={(e) => setManualCriteria(e.target.value)}
              />
            </div>

            <button 
              disabled={!selectedLeadId || loading || (inventorySource === 'knowledge_base' && !selectedDocId)}
              onClick={handleGetSuggestions}
              className="bg-blue-900 text-white w-full py-4 rounded-xl font-bold text-sm shadow-xl shadow-blue-900/20 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><i className="fa-solid fa-circle-notch fa-spin"></i> Running AI Analysis...</>
              ) : (
                <>Generate Recommendations</>
              )}
            </button>
          </div>

          {/* Result Side */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 min-h-[500px] flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-blue-900/60 uppercase tracking-widest">Match Results</h3>
              {results && (
                <button 
                  onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                  className="text-[10px] font-black uppercase text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
                >
                  <i className={`fa-solid ${sortOrder === 'desc' ? 'fa-sort-amount-down' : 'fa-sort-amount-up'}`}></i>
                  Score: {sortOrder === 'desc' ? 'H-L' : 'L-H'}
                </button>
              )}
            </div>
            
            {results ? (
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <RecommendationDisplay 
                  data={{ ...results, recommendations: sortedRecommendations }} 
                  inventory={inventory} 
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-blue-100/50 text-blue-600 rounded-full flex items-center justify-center text-3xl animate-pulse">
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-xs shadow-sm">
                    <i className="fa-solid fa-bolt text-amber-500"></i>
                  </div>
                </div>
                <div>
                  <p className="text-slate-900 font-bold">Awaiting Analysis</p>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Select a source and a lead. Our AI agent will scan the content to find properties that perfectly align with your client's lifestyle.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurturingView;
