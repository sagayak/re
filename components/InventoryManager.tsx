
import React, { useState } from 'react';
import { Property } from '../types';
import PropertyCard from './PropertyCard';

interface InventoryManagerProps {
  inventory: Property[];
  setInventory: React.Dispatch<React.SetStateAction<Property[]>>;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ inventory, setInventory }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newProp, setNewProp] = useState<Partial<Property>>({
    type: 'House',
    amenities: []
  });

  const handleDelete = (id: string) => {
    const propToDelete = inventory.find(p => p.id === id);
    if (window.confirm(`Are you sure you want to remove "${propToDelete?.name || 'this property'}" from the inventory? This action cannot be undone.`)) {
      setInventory(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const property: Property = {
      ...newProp,
      id: Math.random().toString(36).substr(2, 9),
      imageUrl: `https://picsum.photos/seed/${Math.random()}/800/600`
    } as Property;
    setInventory(prev => [property, ...prev]);
    setIsAdding(false);
    setNewProp({ type: 'House', amenities: [] });
  };

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Property Inventory</h2>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">
            Active Listings: <span className="text-blue-600 font-black">{inventory.length}</span>
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg active:scale-95 ${
            isAdding 
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-none' 
              : 'bg-blue-900 text-white hover:bg-slate-800 shadow-blue-900/10'
          }`}
        >
          <i className={`fa-solid ${isAdding ? 'fa-xmark' : 'fa-plus'}`}></i>
          {isAdding ? 'Cancel' : 'Add Property'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Property Name</label>
              <input 
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                value={newProp.name || ''}
                onChange={e => setNewProp({...newProp, name: e.target.value})}
                placeholder="e.g. Azure Bay Villa"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</label>
              <input 
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                value={newProp.location || ''}
                onChange={e => setNewProp({...newProp, location: e.target.value})}
                placeholder="Malibu, CA"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price ($)</label>
              <input 
                required
                type="number"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                value={newProp.price || ''}
                onChange={e => setNewProp({...newProp, price: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</label>
              <select 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                value={newProp.type}
                onChange={e => setNewProp({...newProp, type: e.target.value as any})}
              >
                <option>House</option>
                <option>Apartment</option>
                <option>Condo</option>
                <option>Penthouse</option>
                <option>Villa</option>
              </select>
            </div>
          </div>
          <button className="mt-8 w-full bg-blue-900 text-white py-4 rounded-xl font-bold text-sm shadow-xl shadow-blue-900/10 hover:bg-slate-800 transition-all active:scale-[0.98]">
            Add to Inventory
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {inventory.map(prop => (
          <PropertyCard key={prop.id} property={prop} onDelete={handleDelete} />
        ))}
      </div>
    </section>
  );
};

export default InventoryManager;
