import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { runMigrations } from './src/db/migrations';
import { createNotificationEmitter } from './src/services/notificationHandler';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  useEffect(() => {
    // Initialize DB schema
    try {
      runMigrations();
    } catch (err) {
      console.warn('[App] DB migration error:', err);
    }

    // Register native notification event listener
    const unsubscribe = createNotificationEmitter();
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}
