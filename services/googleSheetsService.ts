
import { Lead } from '../types';

export async function fetchLeadsFromSheet(sheetId: string): Promise<Lead[]> {
  try {
    // Construct the public CSV export URL
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('Failed to fetch Google Sheet. Ensure it is public or shared with "Anyone with the link".');
    
    const csvText = await response.text();
    const rows = parseCSV(csvText);
    
    // Skip header row
    const dataRows = rows.slice(1);
    
    return dataRows.map((row, index) => ({
      id: `gs-${index}`,
      name: row[0] || 'Unknown Lead',
      email: row[1] || '',
      status: (row[2] as any) || 'New',
      lastContacted: new Date().toISOString().split('T')[0],
      criteria: {
        budgetMin: Number(row[3]) || 0,
        budgetMax: Number(row[4]) || 0,
        location: row[5] || '',
        minBedrooms: Number(row[6]) || 0,
        minBathrooms: Number(row[7]) || 0,
        preferredType: row[8] || 'House',
        lifestyle: row[9] || '',
        essentialFeatures: row[10] ? row[10].split(',').map((s: string) => s.trim()) : []
      }
    }));
  } catch (error) {
    console.error('Error syncing with Google Sheets:', error);
    throw error;
  }
}

// Simple CSV parser to avoid external dependencies for small-scale use
function parseCSV(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let col = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        col += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        col += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(col);
        col = "";
      } else if (char === '\r' || char === '\n') {
        if (col || row.length > 0) {
          row.push(col);
          result.push(row);
        }
        row = [];
        col = "";
        if (char === '\r' && next === '\n') i++;
      } else {
        col += char;
      }
    }
  }
  if (col || row.length > 0) {
    row.push(col);
    result.push(row);
  }
  return result;
}
