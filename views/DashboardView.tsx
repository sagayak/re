
import React from 'react';

const DashboardView: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Leads', val: '7', change: '+2 from last month', icon: 'fa-users' },
          { label: 'Conversion Rate', val: '14.3%', change: '+5.2% from last month', icon: 'fa-chart-pie' },
          { label: 'New Leads (Month)', val: '+2', change: 'in May 2024', icon: 'fa-arrow-trend-up' },
          { label: 'Engagement Rate', val: '76%', change: 'Emails opened, calls answered', icon: 'fa-chart-simple' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-sm font-bold text-blue-900/60 uppercase tracking-tight">{stat.label}</h4>
              <i className={`fa-solid ${stat.icon} text-slate-400`}></i>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">{stat.val}</div>
            <p className="text-xs text-slate-500">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Engagement Chart Mockup */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-1">Engagement Over Time</h3>
          <p className="text-sm text-slate-500 mb-8">Monthly lead engagement metrics.</p>
          <div className="h-64 flex items-end justify-between gap-2 px-4 relative">
             {/* Simple lines/grid mock */}
             <div className="absolute inset-0 border-b border-l border-slate-100 mb-8 ml-8"></div>
             {[20, 45, 30, 60, 55, 80, 75].map((h, i) => (
               <div key={i} className="flex-1 flex flex-col items-center group">
                 <div className="w-full bg-blue-100 rounded-t-sm transition-all group-hover:bg-blue-200" style={{ height: `${h}%` }}></div>
                 <span className="text-[10px] mt-2 text-slate-400 uppercase font-bold">M-{i+1}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Lead Source Mockup */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-1">Lead Source Breakdown</h3>
          <p className="text-sm text-slate-500 mb-8">Number of leads from each source.</p>
          <div className="space-y-6">
            {[
              { label: 'Referral', val: 45, color: 'bg-blue-900' },
              { label: 'Ads', val: 30, color: 'bg-cyan-500' },
              { label: 'Social', val: 20, color: 'bg-slate-500' },
              { label: 'Other', val: 10, color: 'bg-amber-500' },
            ].map((source, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-600 uppercase">
                  <span>{source.label}</span>
                  <span>{source.val}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${source.color}`} style={{ width: `${source.val}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
