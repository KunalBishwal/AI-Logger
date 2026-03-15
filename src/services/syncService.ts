import { doc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Visit } from '../types';
import { storageService } from './storageService';

export const syncService = {
  async syncVisit(visit: Visit): Promise<boolean> {
    try {
      // Update local status to syncing
      await storageService.updateVisitSyncStatus(visit.id, 'syncing');

      // Push to Firestore
      const visitRef = doc(db, 'users', visit.userId, 'visits', visit.id);
      const { syncStatus, ...visitData } = visit;
      await setDoc(visitRef, {
        ...visitData,
        syncStatus: 'synced',
        syncedAt: new Date().toISOString(),
      });

      // Update local status to synced
      await storageService.updateVisitSyncStatus(visit.id, 'synced');
      return true;
    } catch (error) {
      console.error('Error syncing visit:', error);
      // Mark as failed
      await storageService.updateVisitSyncStatus(visit.id, 'failed');
      return false;
    }
  },

  async syncAllUnsynced(visits: Visit[]): Promise<{ synced: number; failed: number }> {
    const unsynced = visits.filter(
      (v) => v.syncStatus === 'draft' || v.syncStatus === 'failed'
    );

    let synced = 0;
    let failed = 0;

    for (const visit of unsynced) {
      const success = await this.syncVisit(visit);
      if (success) synced++;
      else failed++;
    }

    return { synced, failed };
  },

  async fetchRemoteVisits(userId: string): Promise<Visit[]> {
    try {
      const visitsRef = collection(db, 'users', userId, 'visits');
      const snapshot = await getDocs(visitsRef);
      return snapshot.docs.map((doc) => ({
        ...doc.data(),
        syncStatus: 'synced',
      })) as Visit[];
    } catch (error) {
      console.error('Error fetching remote visits:', error);
      return [];
    }
  },
};
