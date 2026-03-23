import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal as RNModal,
  StyleSheet,
  Alert,
  type ListRenderItemInfo,
} from 'react-native';
import { getAllConversations, deleteConversation, updateTone, type Conversation } from '../db/queries';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Modal = RNModal as any;


const TONES = ['flirty', 'emotional', 'formal', 'casual', 'playful'];

const APP_EMOJIS: Record<string, string> = {
  'com.whatsapp': '💬',
  'com.instagram.android': '📸',
  'org.telegram.messenger': '✈️',
  'com.android.mms': '💌',
  'com.twitter.android': '🐦',
  'com.linkedin.android': '💼',
};

function formatDate(ts: number): string {
  const d = new Date(ts * 1000);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function MemoryViewerScreen() {
  const [conversations, setConversations] = useState([] as Conversation[]);
  const [selected, setSelected] = useState(null as Conversation | null);
  const [draftTone, setDraftTone] = useState('casual');

  const load = useCallback(() => {
    setConversations(getAllConversations());
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleDelete(conv: Conversation) {
    Alert.alert(
      'Delete Conversation',
      `Remove all memory for ${conv.sender}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteConversation(conv.id);
            load();
          },
        },
      ]
    );
  }

  function handleOpenTone(conv: Conversation) {
    setDraftTone(conv.tone);
    setSelected(conv);
  }

  function handleSaveTone() {
    if (!selected) return;
    updateTone(selected.id, draftTone);
    setSelected(null);
    load();
  }

  return (
    <View style={styles.container}>
      {conversations.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🧠</Text>
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptyHint}>Replies you generate will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item: Conversation) => String(item.id)}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }: ListRenderItemInfo<Conversation>) => (
            <TouchableOpacity style={styles.card} onPress={() => handleOpenTone(item)}>
              <View style={styles.cardLeft}>
                <Text style={styles.appEmoji}>{APP_EMOJIS[item.app] ?? '📱'}</Text>
                <View>
                  <Text style={styles.sender}>{item.sender}</Text>
                  <Text style={styles.app}>{item.app.split('.').slice(-1)[0]}</Text>
                </View>
              </View>
              <View style={styles.cardRight}>
                <View style={styles.toneBadge}>
                  <Text style={styles.toneText}>{item.tone}</Text>
                </View>
                <Text style={styles.date}>{formatDate(item.updated_at)}</Text>
                <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={8}>
                  <Text style={styles.deleteBtn}>🗑</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Tone Editor Modal */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Tone for {selected?.sender}</Text>
            <View style={styles.toneGrid}>
              {TONES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.toneChip, draftTone === t && styles.toneChipActive]}
                  onPress={() => setDraftTone(t)}
                >
                  <Text style={[styles.toneChipText, draftTone === t && styles.toneChipTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelected(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveTone}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1E' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { color: '#E8E8F0', fontSize: 18, fontWeight: '700' },
  emptyHint: { color: '#5050A8', fontSize: 14 },
  card: {
    backgroundColor: '#16162A',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  appEmoji: { fontSize: 28 },
  sender: { color: '#E8E8F0', fontWeight: '600', fontSize: 15 },
  app: { color: '#5050A8', fontSize: 12, marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  toneBadge: {
    backgroundColor: '#2A1A4E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  toneText: { color: '#9C7CEF', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  date: { color: '#5050A8', fontSize: 11 },
  deleteBtn: { fontSize: 18 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#16162A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 20,
  },
  modalTitle: { color: '#E8E8F0', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  toneGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  toneChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#0F0F1E',
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  toneChipActive: { backgroundColor: '#7C5CBF', borderColor: '#7C5CBF' },
  toneChipText: { color: '#9090A8', fontWeight: '600' },
  toneChipTextActive: { color: '#fff' },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#0F0F1E',
    alignItems: 'center',
  },
  cancelBtnText: { color: '#9090A8', fontWeight: '600' },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#7C5CBF',
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700' },
});
