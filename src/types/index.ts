export type SyncStatus = 'draft' | 'syncing' | 'synced' | 'failed';

export type OutcomeStatus = 
  | 'interested' 
  | 'follow-up needed' 
  | 'closed-won' 
  | 'closed-lost' 
  | 'not interested';

export interface AISummary {
  meetingSummary: string;
  painPoints: string[];
  actionItems: string[];
  recommendedNextStep: string;
}

export interface Visit {
  id: string;
  userId: string;
  customerName: string;
  contactPerson: string;
  location: string;
  visitDateTime: string; // ISO string
  rawNotes: string;
  outcomeStatus: OutcomeStatus;
  followUpDate?: string; // ISO string, required when outcome = 'follow-up needed'
  aiSummary?: AISummary;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
}
