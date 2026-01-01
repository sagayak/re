
import { Property, Lead } from './types';

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'l1',
    name: 'John Doe',
    email: 'john@example.com',
    status: 'Qualified',
    lastContacted: '2024-05-20',
    criteria: {
      budgetMin: 1500000,
      budgetMax: 2500000,
      location: 'Malibu',
      minBedrooms: 4,
      minBathrooms: 4,
      preferredType: 'Villa',
      lifestyle: 'Luxury seeker, needs ocean view and privacy.',
      essentialFeatures: ['Ocean View', 'Infinity Pool']
    }
  },
  {
    id: 'l2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    status: 'Contacted',
    lastContacted: '2024-05-22',
    criteria: {
      budgetMin: 800000,
      budgetMax: 1200000,
      location: 'NY Suburbs',
      minBedrooms: 3,
      minBathrooms: 2,
      preferredType: 'House',
      lifestyle: 'Family-oriented, school district is priority.',
      essentialFeatures: ['Large Garden', 'Double Garage']
    }
  },
  {
    id: 'l3',
    name: 'Peter Jones',
    email: 'peter@tech.com',
    status: 'New',
    lastContacted: '2024-05-23',
    criteria: {
      budgetMin: 500000,
      budgetMax: 900000,
      location: 'Austin',
      minBedrooms: 2,
      minBathrooms: 2,
      preferredType: 'Apartment',
      lifestyle: 'Urban professional, loves high-tech amenities.',
      essentialFeatures: ['Smart Home', 'High Ceilings']
    }
  }
];

export const INITIAL_INVENTORY: Property[] = [
  {
    id: '1',
    name: 'Azure Bay Villa',
    price: 2450000,
    location: 'Malibu, CA',
    type: 'Villa',
    bedrooms: 5,
    bathrooms: 4.5,
    sqft: 4200,
    amenities: ['Ocean View', 'Infinity Pool', 'Home Theater', 'Smart Home'],
    description: 'A stunning coastal retreat with floor-to-ceiling windows and direct beach access.',
    imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '2',
    name: 'The Skyline Penthouse',
    price: 1850000,
    location: 'Manhattan, NY',
    type: 'Penthouse',
    bedrooms: 3,
    bathrooms: 3,
    sqft: 2800,
    amenities: ['Private Rooftop', 'Gym', 'Concierge', 'Wine Cellar'],
    description: 'Ultra-modern urban living in the heart of the city with 360-degree views.',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '3',
    name: 'Maplewood Family Estate',
    price: 950000,
    location: 'Scarsdale, NY',
    type: 'House',
    bedrooms: 4,
    bathrooms: 3.5,
    sqft: 3500,
    amenities: ['Large Garden', 'Finished Basement', 'Double Garage'],
    description: 'Charming colonial style home in a top-rated school district, perfect for families.',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '4',
    name: 'Cedar Ridge Lodge',
    price: 1200000,
    location: 'Aspen, CO',
    type: 'House',
    bedrooms: 4,
    bathrooms: 3,
    sqft: 3100,
    amenities: ['Ski-in/Ski-out', 'Hot Tub', 'Stone Fireplace'],
    description: 'Rustic luxury meet modern comfort in this mountain-side retreat.',
    imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '5',
    name: 'Modernist Loft',
    price: 750000,
    location: 'Austin, TX',
    type: 'Apartment',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1500,
    amenities: ['Industrial Finish', 'High Ceilings', 'Solar Panels'],
    description: 'Trendy loft in the creative district with eco-friendly features.',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800'
  }
];

export const SYSTEM_INSTRUCTION = `You are an elite, world-class real estate agent advisor for EstateFlow. 
Analyze the Lead's specific criteria against our Property Inventory. 
Provide the top 3 matches with detailed reasoning and a custom sales pitch for each.
Ensure responses are professional, insightful, and formatted exactly as requested.`;
