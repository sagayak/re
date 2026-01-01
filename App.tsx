
import React, { useState, useEffect } from 'react';
import { ViewType, Lead, Property, StoredDocument } from './types';
import { INITIAL_LEADS, INITIAL_INVENTORY } from './constants';
import DashboardView from './views/DashboardView';
import LeadsView from './views/LeadsView';
import DocumentsView from './views/DocumentsView';
import NurturingView from './views/NurturingView';
import ResourcesView from './views/ResourcesView';
import InventoryManager from './components/InventoryManager';
import { fetchLeadsFromSheet } from './services/googleSheetsService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('Dashboard');
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [inventory, setInventory] = useState<Property[]>(INITIAL_INVENTORY);
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [articles, setArticles] = useState<StoredDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  // Load leads from Google Sheets if ID exists in storage
  useEffect(() => {
    const savedSheetId = localStorage.getItem('estateflow_sheet_id');
    if (savedSheetId) {
      syncLeads(savedSheetId);
    }
  }, []);

  const syncLeads = async (sheetId: string) => {
    setIsSyncing(true);
    try {
      const freshLeads = await fetchLeadsFromSheet(sheetId);
      setLeads(freshLeads);
      setLastSynced(new Date().toLocaleTimeString());
      localStorage.setItem('estateflow_sheet_id', sheetId);
    } catch (err) {
      alert("Failed to sync leads. Check if your Google Sheet is public (Anyone with link).");
    } finally {
      setIsSyncing(false);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'Dashboard': return <DashboardView />;
      case 'Leads': return (
        <LeadsView 
          leads={leads} 
          isSyncing={isSyncing} 
          onSync={syncLeads} 
          lastSynced={lastSynced}
        />
      );
      case 'Inventory': return (
        <div className="animate-in fade-in duration-500">
          <InventoryManager inventory={inventory} setInventory={setInventory} />
        </div>
      );
      case 'Documents': return <DocumentsView documents={documents} setDocuments={setDocuments} />;
      case 'Nurturing': return <NurturingView leads={leads} inventory={inventory} storedDocuments={documents} />;
      case 'Resources': return <ResourcesView articles={articles} setArticles={setArticles} />;
      default: return <DashboardView />;
    }
  };

  const navItems: { label: ViewType; icon: string }[] = [
    { label: 'Dashboard', icon: 'fa-table-columns' },
    { label: 'Leads', icon: 'fa-users' },
    { label: 'Inventory', icon: 'fa-house-chimney' },
    { label: 'Documents', icon: 'fa-file-lines' },
    { label: 'Resources', icon: 'fa-book-open' },
    { label: 'Nurturing', icon: 'fa-robot' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f172a] text-slate-300 flex flex-col fixed h-full z-50 shadow-2xl">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <i className="fa-solid fa-building"></i>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">EstateFlow</span>
        </div>

        <nav className="flex-1 mt-4">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setCurrentView(item.label)}
              className={`w-full flex items-center gap-4 px-6 py-3.5 transition-all ${
                currentView === item.label
                  ? 'bg-blue-600/10 text-white border-r-4 border-blue-600'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
              <span className="text-sm font-medium">{item.label}</span>
              {item.label === 'Documents' && documents.length > 0 && (
                <span className="ml-auto bg-blue-600 text-[10px] px-1.5 py-0.5 rounded-full text-white">{documents.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden border border-slate-600">
            <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">Admin User</span>
            <span className="text-[10px] text-slate-500 font-medium">admin@estateflow.com</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col relative">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40 backdrop-blur-md bg-white/80">
          <h2 className="text-xl font-bold text-slate-800">{currentView}</h2>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <input
                type="text"
                placeholder="Search leads or properties..."
                className="bg-slate-100 border-none rounded-lg py-2 pl-10 pr-4 text-sm w-64 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {isSyncing && (
              <div className="flex items-center gap-2 text-blue-600 text-xs font-bold animate-pulse">
                <i className="fa-solid fa-arrows-rotate fa-spin"></i>
                Syncing Leads...
              </div>
            )}
            <button className="text-slate-500 hover:text-blue-600 transition-colors relative">
              <i className="fa-regular fa-bell text-lg"></i>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500/20 transition-all">
              <img src="https://i.pravatar.cc/150?u=admin" alt="Avatar" />
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="p-8 flex-1">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
