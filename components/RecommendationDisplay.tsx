
import React from 'react';
import { RecommendationResponse, Property } from '../types';

interface RecommendationDisplayProps {
  data: RecommendationResponse | null;
  inventory: Property[];
}

const RecommendationDisplay: React.FC<RecommendationDisplayProps> = ({ data, inventory }) => {
  if (!data) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-rose-600';
  };

  return (
    <div className="space-y-8">
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm border-l-4 border-l-blue-600">
        <p className="text-slate-700 text-xs italic leading-relaxed">
          "{data.summary}"
        </p>
      </div>

      <div className="space-y-6">
        {data.recommendations.map((rec, idx) => {
          // Attempt to find structured property, otherwise use recommendation data as source
          const property = inventory.find(p => p.id === rec.propertyId || p.name === rec.propertyId);
          
          const scoreColor = getScoreColor(rec.matchScore);
          const scoreTextColor = getScoreTextColor(rec.matchScore);

          return (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
              <div className="flex gap-4 items-start mb-4">
                <div className="w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {property?.imageUrl ? (
                    <img src={property.imageUrl} className="w-full h-full object-cover" />
                  ) : (
                    <i className="fa-solid fa-house-chimney text-slate-300 text-2xl"></i>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-slate-900 leading-tight truncate">
                      {property?.name || rec.propertyId}
                    </h4>
                    <span className={`text-[10px] font-black uppercase flex-shrink-0 ${scoreTextColor}`}>
                      {rec.matchScore}% Match
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 truncate">
                    {property?.type || 'Listing Match'} • {property?.location || 'Extracted Location'}
                  </p>
                  <div className="h-1 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
                    <div className={`h-full ${scoreColor}`} style={{ width: `${rec.matchScore}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] text-slate-600 leading-relaxed">{rec.whyItMatches}</p>
                
                <div className="flex flex-wrap gap-1.5">
                  {rec.keySellingPoints.slice(0, 3).map((point, i) => (
                    <span key={i} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase border border-slate-200">
                      {point}
                    </span>
                  ))}
                </div>

                <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-1.5 mb-1 opacity-40">
                    <i className="fa-solid fa-comment-dots text-[10px]"></i>
                    <span className="text-[9px] font-black text-blue-900 uppercase">Agent Pitch</span>
                  </div>
                  <p className="text-xs text-blue-900 italic font-medium leading-snug">"{rec.suggestedPitch}"</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendationDisplay;
