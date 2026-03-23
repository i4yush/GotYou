import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '../storage/mmkv';

interface PersistedState {
  apiKey: string;
  replyLength: 'short' | 'medium' | 'long';
  watchedApps: string[];
}

interface TransientState {
  suggestions: string[];
  activeConvId: number | null;
  isOverlayVisible: boolean;
}

interface Actions {
  setApiKey: (key: string) => void;
  setReplyLength: (length: 'short' | 'medium' | 'long') => void;
  setWatchedApps: (apps: string[]) => void;
  toggleWatchedApp: (app: string) => void;
  setSuggestions: (suggestions: string[]) => void;
  setActiveConv: (convId: number | null) => void;
  setOverlayVisible: (visible: boolean) => void;
  clearSuggestions: () => void;
}

type AppState = PersistedState & TransientState & Actions;

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Persisted
      apiKey: '',
      replyLength: 'medium',
      watchedApps: ['com.whatsapp', 'com.instagram.android', 'org.telegram.messenger', 'com.android.mms'],

      // Transient
      suggestions: [],
      activeConvId: null,
      isOverlayVisible: false,

      // Actions
      setApiKey: (apiKey) => set({ apiKey }),
      setReplyLength: (replyLength) => set({ replyLength }),
      setWatchedApps: (watchedApps) => set({ watchedApps }),
      toggleWatchedApp: (app) =>
        set((state) => ({
          watchedApps: state.watchedApps.includes(app)
            ? state.watchedApps.filter((a) => a !== app)
            : [...state.watchedApps, app],
        })),
      setSuggestions: (suggestions) => set({ suggestions }),
      setActiveConv: (activeConvId) => set({ activeConvId }),
      setOverlayVisible: (isOverlayVisible) => set({ isOverlayVisible }),
      clearSuggestions: () => set({ suggestions: [], isOverlayVisible: false }),
    }),
    {
      name: 'replyai-app-state',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state): PersistedState => ({
        apiKey: state.apiKey,
        replyLength: state.replyLength,
        watchedApps: state.watchedApps,
      }),
    }
  )
);
