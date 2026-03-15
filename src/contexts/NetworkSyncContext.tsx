import React, { createContext, useContext, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { syncService } from '../services/syncService';
import { storageService } from '../services/storageService';
import { useAuth } from './AuthContext';

const NetworkSyncContext = createContext<{ isOnline: boolean }>({ isOnline: true });

export const NetworkSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = React.useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = !!state.isConnected && !!state.isInternetReachable;
      
      // If we just went from offline to online, trigger sync
      if (!isOnline && online && user) {
        console.log('[NetworkSync] Back online! Triggering automatic sync...');
        handleAutomaticSync();
      }
      
      setIsOnline(online);
    });

    return () => unsubscribe();
  }, [isOnline, user]);

  const handleAutomaticSync = async () => {
    try {
      const visits = await storageService.getAllVisits();
      const unsynced = visits.filter(v => v.userId === user?.uid && (v.syncStatus === 'draft' || v.syncStatus === 'failed'));
      
      if (unsynced.length > 0) {
        await syncService.syncAllUnsynced(visits);
        console.log(`[NetworkSync] Successfully attempted sync for ${unsynced.length} items`);
      }
    } catch (error) {
      console.error('[NetworkSync] Error during automatic sync:', error);
    }
  };

  return (
    <NetworkSyncContext.Provider value={{ isOnline }}>
      {children}
    </NetworkSyncContext.Provider>
  );
};

export const useNetworkStatus = () => useContext(NetworkSyncContext);
