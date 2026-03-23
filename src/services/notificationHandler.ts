import { NativeEventEmitter, NativeModules } from 'react-native';
import {
  upsertConversation,
  insertMessage,
  getRecentMessages,
  updateTone,
  cacheSuggestions,
} from '../db/queries';
import { generateReplies, classifyTone } from './claudeApi';
import { useAppStore } from '../store/useAppStore';
import NativeReplyAIModule from '../specs/NativeReplyAIModule';

interface NotificationPayload {
  app: string;
  sender: string;
  text: string;
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export async function handleNotification(payload: NotificationPayload): Promise<void> {
  const { app, sender, text } = payload;
  const store = useAppStore.getState();
  const { watchedApps, replyLength, apiKey } = store;

  // Filter: only watched apps
  if (!watchedApps.includes(app)) return;

  // Debounce: cancel previous timer, set new one
  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(async () => {
    try {
      // Persist to DB
      const convId = upsertConversation(app, sender);
      insertMessage(convId, 'incoming', text);
      const messages = getRecentMessages(convId, 20);

      // Periodically reclassify tone every 5 messages
      let tone = 'casual';
      const conv = await import('../db/queries').then((m) => m.getConversationById(convId));
      if (conv) {
        tone = conv.tone;
        if (messages.length % 5 === 0) {
          const newTone = await classifyTone(messages, apiKey);
          updateTone(convId, newTone);
          tone = newTone;
        }
      }

      // Skip if no API key
      if (!apiKey) return;

      // Generate replies
      const suggestions = await generateReplies(messages, tone, replyLength, apiKey);

      // Cache and show
      cacheSuggestions(convId, suggestions);
      useAppStore.getState().setSuggestions(suggestions);
      useAppStore.getState().setActiveConv(convId);
      useAppStore.getState().setOverlayVisible(true);
      NativeReplyAIModule.showOverlay(suggestions);
    } catch (err) {
      console.warn('[notificationHandler] Error:', err);
    }
  }, 2000);
}

export function createNotificationEmitter() {
  const emitter = new NativeEventEmitter(NativeModules.NativeReplyAIModule);
  const subscription = emitter.addListener(
    'onNotificationReceived',
    (payload: NotificationPayload) => handleNotification(payload)
  );
  return () => subscription.remove();
}
