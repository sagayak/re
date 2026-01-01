
import React, { useState } from 'react';
import { Lead } from '../types';

interface LeadsViewProps {
  leads: Lead[];
  isSyncing: boolean;
  onSync: (sheetId: string) => void;
  lastSynced: string | null;
  persistedSheetId: string | null;
}

const LeadsView: React.FC<LeadsViewProps> = ({ leads, isSyncing, onSync, lastSynced, persistedSheetId }) => {
  const [sheetIdInput, setSheetIdInput] = useState(persistedSheetId || localStorage.getItem('estateflow_sheet_id') || '');
  const [showSyncConfig, setShowSyncConfig] = useState(false);

  const getStatusStyle = (status: Lead['status']) => {
    switch (status) {
      case 'Qualified': return 'bg-blue-100 text-blue-700';
      case 'Contacted': return 'bg-slate-100 text-slate-700';
      case 'New': return 'bg-indigo-900 text-white';
      case 'Converted': return 'bg-emerald-100 text-emerald-700';
      case 'Lost': return 'bg-slate-200 text-slate-500';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusDescription = (status: Lead['status']) => {
    switch (status) {
      case 'New': return 'Fresh lead awaiting initial discovery and outreach.';
      case 'Contacted': return 'Initial outreach performed. Awaiting further response.';
      case 'Qualified': return 'High-intent lead with verified budget and specific needs.';
      case 'Converted': return 'Deal successfully closed. Lead is now a client.';
      case 'Lost': return 'Lead is no longer active or chose another provider.';
      default: return '';
    }
  };

  const downloadTemplate = () => {
    const headers = "Name,Email,Status,BudgetMin,BudgetMax,Location,Beds,Baths,Type,Lifestyle,Features";
    const example = "Robert Fox,robert@example.com,New,1200000,1800000,Beverly Hills,4,3,House,\"Quiet neighborhood, near schools\",\"Pool, Garden, Smart Home\"";
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + example;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "estateflow_leads_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    "A: Name", "B: Email", "C: Status", "D: Budget Min", "E: Budget Max", 
    "F: Location", "G: Beds", "H: Baths", "I: Property Type", "J: Lifestyle/Notes", "K: Features"
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <i className="fa-solid fa-table-list text-blue-600"></i>
              Lead Management
              {persistedSheetId && (
                <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ml-2">
                  <i className="fa-solid fa-cloud"></i>
                  Linked to Cloud
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">
              {lastSynced ? `Last synced from Google Sheets at ${lastSynced}` : 'Local data currently in use.'}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={downloadTemplate} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-all"><i className="fa-solid fa-file-csv text-emerald-600"></i>Template</button>
            <button onClick={() => setShowSyncConfig(!showSyncConfig)} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border ${showSyncConfig ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}><i className="fa-solid fa-gear text-xs"></i>Sync Settings</button>
            <button className="bg-blue-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-blue-900/10 active:scale-95"><i className="fa-solid fa-plus text-xs"></i>Add Lead</button>
          </div>
        </div>

        {showSyncConfig && (
          <div className="p-6 border-t border-slate-100 bg-blue-50/30 animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-xs font-black text-blue-900/60 uppercase tracking-widest">Google Sheets Integration</h4>
                <p className="text-xs text-slate-600 leading-relaxed">Connect a public Google Sheet. Once linked, the app will remember this ID across all your devices via Supabase.</p>
                <div className="flex gap-2">
                  <input type="text" placeholder="Paste Google Sheet ID..." className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-600/20 outline-none" value={sheetIdInput} onChange={(e) => setSheetIdInput(e.target.value)} />
                  <button disabled={isSyncing || !sheetIdInput} onClick={() => onSync(sheetIdInput)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20">
                    {isSyncing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-rotate"></i>}
                    {persistedSheetId ? 'Update Link' : 'Sync & Save'}
                  </button>
                </div>
              </div>
              <div className="bg-white/50 p-4 rounded-xl border border-blue-100">
                <h5 className="text-[10px] font-black text-blue-900/40 uppercase mb-3">Expected Column Order (A to K)</h5>
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
                  {columns.map((col, i) => (<div key={i} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div><span className="text-[10px] font-bold text-slate-600">{col}</span></div>))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-t border-slate-100">
            <thead>
              <tr className="text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/20">
                <th className="px-8 py-4">Lead Name</th>
                <th className="px-8 py-4">Profile</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Budget Range</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs">{lead.name.charAt(0)}</div>
                      <div className="flex flex-col"><span className="text-sm font-bold text-slate-900">{lead.name}</span><span className="text-[10px] text-slate-400 font-medium">{lead.email}</span></div>
                    </div>
                  </td>
                  <td className="px-8 py-5"><div className="flex flex-col gap-1 max-w-[200px]"><span className="text-xs text-slate-600 truncate font-medium">{lead.criteria.lifestyle}</span><span className="text-[10px] text-slate-400 font-bold uppercase">{lead.criteria.preferredType} in {lead.criteria.location}</span></div></td>
                  <td className="px-8 py-5"><div className="relative inline-block group/tooltip"><span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-tight cursor-help transition-all hover:ring-2 hover:ring-offset-2 ${getStatusStyle(lead.status)}`}>{lead.status}</span><div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block w-48 bg-slate-900 text-white text-[10px] p-2 rounded-lg shadow-xl z-50 pointer-events-none"><p className="font-bold border-b border-slate-700 pb-1 mb-1 text-blue-400">{lead.status}</p><p className="leading-relaxed opacity-90">{getStatusDescription(lead.status)}</p><div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div></div></div></td>
                  <td className="px-8 py-5"><span className="text-sm font-bold text-slate-700">${lead.criteria.budgetMin.toLocaleString()} - ${lead.criteria.budgetMax.toLocaleString()}</span></td>
                  <td className="px-8 py-5 text-right"><button className="text-slate-300 hover:text-blue-600 transition-colors p-2"><i className="fa-solid fa-ellipsis-vertical"></i></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeadsView;
