
import React from 'react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onDelete, compact }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow ${compact ? 'flex' : ''}`}>
      <img 
        src={property.imageUrl} 
        alt={property.name} 
        className={`${compact ? 'w-32 h-32' : 'w-full h-48'} object-cover bg-slate-100`}
      />
      <div className="p-4 flex-1">
        <div className="flex justify-between items-start mb-1">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{property.type}</span>
          {onDelete && (
            <button 
              onClick={() => onDelete(property.id)}
              className="text-slate-400 hover:text-red-500 transition-colors"
            >
              <i className="fa-solid fa-trash-can"></i>
            </button>
          )}
        </div>
        <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">{property.name}</h3>
        <p className="text-sm text-slate-500 mb-2 flex items-center">
          <i className="fa-solid fa-location-dot mr-1.5 text-xs"></i>
          {property.location}
        </p>
        <div className="flex items-center gap-3 text-sm text-slate-600 mb-3">
          <span className="flex items-center"><i className="fa-solid fa-bed mr-1 text-slate-400"></i>{property.bedrooms}</span>
          <span className="flex items-center"><i className="fa-solid fa-bath mr-1 text-slate-400"></i>{property.bathrooms}</span>
          <span className="flex items-center"><i className="fa-solid fa-ruler-combined mr-1 text-slate-400"></i>{property.sqft} ft²</span>
        </div>
        <div className="text-xl font-bold text-slate-900">
          ${property.price.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
