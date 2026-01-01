
export interface Property {
  id: string;
  name: string;
  price: number;
  location: string;
  type: 'House' | 'Apartment' | 'Condo' | 'Penthouse' | 'Villa';
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  amenities: string[];
  description: string;
  imageUrl: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';
  lastContacted: string;
  criteria: LeadCriteria;
}

export interface LeadCriteria {
  budgetMin: number;
  budgetMax: number;
  location: string;
  minBedrooms: number;
  minBathrooms: number;
  preferredType: string;
  lifestyle: string;
  essentialFeatures: string[];
}

export interface Recommendation {
  propertyId: string;
  matchScore: number;
  whyItMatches: string;
  keySellingPoints: string[];
  suggestedPitch: string;
}

export interface RecommendationResponse {
  recommendations: Recommendation[];
  summary: string;
}

export interface StoredDocument {
  id: string;
  name: string;
  content: string;
  type: string;
  size: string;
  uploadDate: string;
}

export type ViewType = 'Dashboard' | 'Leads' | 'Inventory' | 'Documents' | 'Nurturing' | 'Resources';
