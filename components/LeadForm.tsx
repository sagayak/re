
import React from 'react';
import { LeadCriteria } from '../types';

interface LeadFormProps {
  lead: LeadCriteria;
  setLead: React.Dispatch<React.SetStateAction<LeadCriteria>>;
  onAnalyze: () => void;
  isLoading: boolean;
}

const LeadForm: React.FC<LeadFormProps> = ({ lead, setLead, onAnalyze, isLoading }) => {
  const toggleFeature = (feature: string) => {
    setLead(prev => ({
      ...prev,
      essentialFeatures: prev.essentialFeatures.includes(feature)
        ? prev.essentialFeatures.filter(f => f !== feature)
        : [...prev.essentialFeatures, feature]
    }));
  };

  const features = ['Pool', 'Garden', 'Smart Home', 'Home Gym', 'Wine Cellar', 'Ocean View', 'Mountain View', 'Modern Kitchen'];

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg sticky top-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
          <i className="fa-solid fa-user-tie"></i>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 serif">Buyer Profiling</h2>
          <p className="text-slate-500 text-xs">Define what your client is looking for</p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Min Budget</label>
            <input 
              type="number"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={lead.budgetMin}
              onChange={e => setLead({...lead, budgetMin: Number(e.target.value)})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Max Budget</label>
            <input 
              type="number"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={lead.budgetMax}
              onChange={e => setLead({...lead, budgetMax: Number(e.target.value)})}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Preferred Location</label>
          <input 
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. coastal area, city center"
            value={lead.location}
            onChange={e => setLead({...lead, location: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Min Beds</label>
            <input 
              type="number"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={lead.minBedrooms}
              onChange={e => setLead({...lead, minBedrooms: Number(e.target.value)})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Min Baths</label>
            <input 
              type="number"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={lead.minBathrooms}
              onChange={e => setLead({...lead, minBathrooms: Number(e.target.value)})}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Lifestyle Preference</label>
          <textarea 
            rows={2}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            placeholder="e.g. Looking for a quiet place to raise a family, near parks and schools."
            value={lead.lifestyle}
            onChange={e => setLead({...lead, lifestyle: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Must-Have Features</label>
          <div className="flex flex-wrap gap-2">
            {features.map(f => (
              <button
                key={f}
                onClick={() => toggleFeature(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  lead.essentialFeatures.includes(f)
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={onAnalyze}
          disabled={isLoading}
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-sm shadow-xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <i className="fa-solid fa-circle-notch fa-spin"></i>
              Analyzing Inventory...
            </>
          ) : (
            <>
              <i className="fa-solid fa-wand-magic-sparkles"></i>
              Get AI Recommendations
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default LeadForm;
