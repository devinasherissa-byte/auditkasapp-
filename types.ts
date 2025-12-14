export type ViewState = 'DASHBOARD' | 'PLANNING' | 'INTERNAL_CONTROL' | 'EXECUTION' | 'FIELD_WORK' | 'REPORTING';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  source: 'LEDGER' | 'BANK';
  status: 'PENDING' | 'MATCHED' | 'UNMATCHED' | 'FLAGGED';
  flagReason?: string;
  timestamp?: string; // For immutable log simulation
  user?: string;
}

export interface RiskProfile {
  category: string;
  inherentRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  controlRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  detectionRisk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface InternalControlItem {
  id: string;
  controlObjective: string;
  controlActivity: string;
  testProcedure: string;
  result: 'PASS' | 'FAIL' | 'EXCEPTION' | 'NOT_TESTED';
  notes: string;
}

export interface FieldEvidence {
  id: string;
  description: string;
  imageUrl: string;
  timestamp: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  auditor: string;
}

export interface ReconResult {
  matchedCount: number;
  unmatchedCount: number;
  totalVariance: number;
}
