
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
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('Dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [inventory, setInventory] = useState<Property[]>([]);
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [articles, setArticles] = useState<StoredDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [persistedSheetId, setPersistedSheetId] = useState<string | null>(null);

  // Load initial data from Supabase
  useEffect(() => {
    const loadAllData = async () => {
      try {
        // 1. Fetch Properties
        const { data: propData } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
        if (propData && propData.length > 0) {
          setInventory(propData.map(p => ({ ...p, imageUrl: p.image_url })));
        } else {
          setInventory(INITIAL_INVENTORY);
        }

        // 2. Fetch Leads
        const { data: leadData } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (leadData && leadData.length > 0) {
          setLeads(leadData.map(l => ({
            id: l.id,
            name: l.name,
            email: l.email,
            status: l.status,
            lastContacted: l.last_contacted,
            criteria: l.criteria
          })));
        } else {
          setLeads(INITIAL_LEADS);
        }

        // 3. Fetch Persistent Settings (Google Sheet ID)
        const { data: settingsData } = await supabase.from('settings').select('*').eq('key', 'google_sheet_id').single();
        if (settingsData) {
          setPersistedSheetId(settingsData.value);
          syncLeads(settingsData.value, true); // Silent sync on load
        } else {
          // Fallback to localStorage if cloud setting isn't found yet
          const localId = localStorage.getItem('estateflow_sheet_id');
          if (localId) syncLeads(localId);
        }

        // 4. Fetch Documents
        const { data: docData } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
        if (docData) {
          const mappedDocs = docData.map(d => ({
            id: d.id,
            name: d.name,
            content: d.content,
            type: d.file_type,
            size: d.file_size,
            uploadDate: d.upload_date,
            category: d.category
          }));
          setDocuments(mappedDocs.filter(d => d.category === 'Listing'));
          setArticles(mappedDocs.filter(d => d.category === 'Resource'));
        }

        setIsCloudConnected(true);
      } catch (err) {
        console.error("Cloud connection failed:", err);
        setIsCloudConnected(false);
        setLeads(INITIAL_LEADS);
        setInventory(INITIAL_INVENTORY);
      }
    };

    loadAllData();
  }, []);

  const syncLeads = async (sheetId: string, silent = false) => {
    if (!silent) setIsSyncing(true);
    try {
      const freshLeads = await fetchLeadsFromSheet(sheetId);
      setLeads(freshLeads);
      
      // Save leads to Supabase
      for (const lead of freshLeads) {
        await supabase.from('leads').upsert({
          id: lead.id.includes('gs-') ? undefined : lead.id,
          name: lead.name,
          email: lead.email,
          status: lead.status,
          last_contacted: lead.lastContacted,
          criteria: lead.criteria
        });
      }

      // Persist the Sheet ID to Cloud Settings
      await supabase.from('settings').upsert({ key: 'google_sheet_id', value: sheetId });
      setPersistedSheetId(sheetId);
      
      setLastSynced(new Date().toLocaleTimeString());
      localStorage.setItem('estateflow_sheet_id', sheetId);
    } catch (err) {
      console.error(err);
      if (!silent) alert("Failed to sync leads. Check if your Google Sheet is public.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSetInventory = async (updater: any) => {
    const newInventory = typeof updater === 'function' ? updater(inventory) : updater;
    setInventory(newInventory);
    if (newInventory.length > inventory.length) {
      const added = newInventory[0];
      await supabase.from('properties').insert({
        name: added.name,
        price: added.price,
        location: added.location,
        type: added.type,
        bedrooms: added.bedrooms,
        bathrooms: added.bathrooms,
        sqft: added.sqft,
        amenities: added.amenities,
        description: added.description,
        image_url: added.imageUrl
      });
    } else if (newInventory.length < inventory.length) {
      const removedId = inventory.find(p => !newInventory.some((np: any) => np.id === p.id))?.id;
      if (removedId) await supabase.from('properties').delete().eq('id', removedId);
    }
  };

  const handleSetDocuments = async (updater: any) => {
    const newDocs = typeof updater === 'function' ? updater(documents) : updater;
    setDocuments(newDocs);
    if (newDocs.length > documents.length) {
      const added = newDocs[0];
      await supabase.from('documents').insert({
        name: added.name, content: added.content, file_type: added.type, file_size: added.size, upload_date: added.uploadDate, category: 'Listing'
      });
    } else if (newDocs.length < documents.length) {
      const removedId = documents.find(d => !newDocs.some((nd: any) => nd.id === d.id))?.id;
      if (removedId) await supabase.from('documents').delete().eq('id', removedId);
    }
  };

  const handleSetArticles = async (updater: any) => {
    const newArticles = typeof updater === 'function' ? updater(articles) : updater;
    setArticles(newArticles);
    if (newArticles.length > articles.length) {
      const added = newArticles[0];
      await supabase.from('documents').insert({
        name: added.name, content: added.content, file_type: added.type, file_size: added.size, upload_date: added.uploadDate, category: 'Resource'
      });
    } else if (newArticles.length < articles.length) {
      const removedId = articles.find(a => !newArticles.some((na: any) => na.id === a.id))?.id;
      if (removedId) await supabase.from('documents').delete().eq('id', removedId);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'Dashboard': return <DashboardView />;
      case 'Leads': return <LeadsView leads={leads} isSyncing={isSyncing} onSync={syncLeads} lastSynced={lastSynced} persistedSheetId={persistedSheetId} />;
      case 'Inventory': return <div className="animate-in fade-in duration-500"><InventoryManager inventory={inventory} setInventory={handleSetInventory} /></div>;
      case 'Documents': return <DocumentsView documents={documents} setDocuments={handleSetDocuments} />;
      case 'Nurturing': return <NurturingView leads={leads} inventory={inventory} storedDocuments={documents} />;
      case 'Resources': return <ResourcesView articles={articles} setArticles={handleSetArticles} />;
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
      <aside className="w-64 bg-[#0f172a] text-slate-300 flex flex-col fixed h-full z-50 shadow-2xl">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <i className="fa-solid fa-building"></i>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">EstateFlow</span>
          </div>
          {isCloudConnected && (
            <div className="group relative">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">Cloud Active</div>
            </div>
          )}
        </div>
        <nav className="flex-1 mt-4">
          {navItems.map((item) => (
            <button key={item.label} onClick={() => setCurrentView(item.label)} className={`w-full flex items-center gap-4 px-6 py-3.5 transition-all ${currentView === item.label ? 'bg-blue-600/10 text-white border-r-4 border-blue-600' : 'hover:bg-slate-800 hover:text-white'}`}>
              <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
              <span className="text-sm font-medium">{item.label}</span>
              {item.label === 'Documents' && documents.length > 0 && <span className="ml-auto bg-blue-600 text-[10px] px-1.5 py-0.5 rounded-full text-white">{documents.length}</span>}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden border border-slate-600"><img src="https://i.pravatar.cc/150?u=admin" alt="Admin" /></div>
          <div className="flex flex-col"><span className="text-sm font-bold text-white">Admin User</span><span className="text-[10px] text-slate-500 font-medium">admin@estateflow.com</span></div>
        </div>
      </aside>
      <main className="flex-1 ml-64 min-h-screen flex flex-col relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40 backdrop-blur-md bg-white/80">
          <h2 className="text-xl font-bold text-slate-800">{currentView}</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <input type="text" placeholder="Search leads or properties..." className="bg-slate-100 border-none rounded-lg py-2 pl-10 pr-4 text-sm w-64 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            {isSyncing && <div className="flex items-center gap-2 text-blue-600 text-xs font-bold animate-pulse"><i className="fa-solid fa-arrows-rotate fa-spin"></i>Syncing...</div>}
            <button className="text-slate-500 hover:text-blue-600 transition-colors relative"><i className="fa-regular fa-bell text-lg"></i><span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span></button>
            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500/20 transition-all"><img src="https://i.pravatar.cc/150?u=admin" alt="Avatar" /></div>
          </div>
        </header>
        <div className="p-8 flex-1">{renderView()}</div>
      </main>
    </div>
  );
};

export default App;
