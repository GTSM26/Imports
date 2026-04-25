import { TransportOp } from '@/src/types';

export interface EnrichedTransportOp extends TransportOp {
  co2Emissions: number; // kg
  isConformant: boolean;
  hasIncident: boolean;
  deliveryDelay: number; // days
  distanceEstimated: number; // km
}

// Rough estimates for simulation
const DISTANCE_MAP: Record<string, number> = {
  'France': 1800,
  'Espagne': 1000,
  'Portugal': 1200,
  'Belgique': 2200,
  'Germany': 2400,
  'Italie': 2000,
  'UK': 2500,
  'Maroc': 300,
  'DEFAULT': 1500
};

// CO2 kg per km
const CO2_FACTOR: Record<string, number> = {
  'Complet': 1.1,
  'Groupage': 0.6,
  'Express': 0.8,
  'DEFAULT': 1.0
};

export const enrichData = (data: TransportOp[]): EnrichedTransportOp[] => {
  return data.map(op => {
    // 1. Estimate distance
    const baseDistance = DISTANCE_MAP[op.pays] || DISTANCE_MAP['DEFAULT'];
    // Add some random variation based on reference to keep it deterministic per row
    const hash = op.refDossier.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const distance = baseDistance + (hash % 400);

    // 2. Estimate CO2
    const factor = CO2_FACTOR[op.type] || CO2_FACTOR['DEFAULT'];
    const co2Emissions = distance * factor;

    // 3. Conformity & Incidents
    let hasIncident = false;
    
    // Check dedicated incident column first
    if (op.incident && op.incident.toLowerCase() !== 'non' && op.incident.toLowerCase() !== 'ras') {
      hasIncident = true;
    } else if (!op.incident) {
      // Fallback: Simulate based on observations if no incident column is provided
      const obsLower = (op.observations || '').toLowerCase();
      hasIncident = obsLower.includes('retard') || obsLower.includes('problème') || obsLower.includes('casse') || obsLower.includes('accident') || obsLower.includes('panne');
    }
    
    // Status conformity
    const isConformant = !hasIncident && !['Inconnu', 'Annulé'].includes(op.status);

    // 4. Delivery Delay (Simulation based on dates if available, or random fallback)
    let delay = 0;
    if (op.dateDepart && op.dateChargement) {
       // Just a simulated metric for the dashboard
       delay = (hash % 5) - 1; // -1 to 3 days
    }

    return {
      ...op,
      distanceEstimated: distance,
      co2Emissions,
      hasIncident,
      isConformant,
      deliveryDelay: delay
    };
  });
};
