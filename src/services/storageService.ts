import AsyncStorage from '@react-native-async-storage/async-storage';
import { Visit } from '../types';

const VISITS_KEY = '@visits';

export const storageService = {
  async getAllVisits(): Promise<Visit[]> {
    try {
      const data = await AsyncStorage.getItem(VISITS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading visits:', error);
      return [];
    }
  },

  async saveVisit(visit: Visit): Promise<void> {
    try {
      const visits = await this.getAllVisits();
      const index = visits.findIndex((v) => v.id === visit.id);
      if (index >= 0) {
        visits[index] = visit;
      } else {
        visits.unshift(visit);
      }
      await AsyncStorage.setItem(VISITS_KEY, JSON.stringify(visits));
    } catch (error) {
      console.error('Error saving visit:', error);
      throw error;
    }
  },

  async deleteVisit(id: string): Promise<void> {
    try {
      const visits = await this.getAllVisits();
      const filtered = visits.filter((v) => v.id !== id);
      await AsyncStorage.setItem(VISITS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting visit:', error);
      throw error;
    }
  },

  async updateVisitSyncStatus(id: string, status: Visit['syncStatus']): Promise<void> {
    try {
      const visits = await this.getAllVisits();
      const index = visits.findIndex((v) => v.id === id);
      if (index >= 0) {
        visits[index].syncStatus = status;
        await AsyncStorage.setItem(VISITS_KEY, JSON.stringify(visits));
      }
    } catch (error) {
      console.error('Error updating sync status:', error);
      throw error;
    }
  },
};
