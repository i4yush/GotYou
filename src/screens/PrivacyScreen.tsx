import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { nukeAll } from '../db/queries';
import { useAppStore } from '../store/useAppStore';
import { storage } from '../storage/mmkv';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Privacy'>;

const STORED_ITEMS = [
  { icon: '💬', label: 'Conversation history', detail: 'App name + sender name + messages' },
  { icon: '🎭', label: 'Tone data', detail: 'Detected communication style per contact' },
  { icon: '📋', label: 'Reply suggestions cache', detail: 'Last 3 suggestions per conversation' },
  { icon: '⚙️', label: 'Settings', detail: 'API key, preferences, watched apps list' },
];

export default function PrivacyScreen() {
  const navigation = useNavigation<Nav>();

  function handleWipe() {
    Alert.alert(
      'Wipe All Data',
      'This will permanently delete all conversations, messages, tone data, and your API key. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Wipe Everything',
          style: 'destructive',
          onPress: () => {
            nukeAll();
            storage.clearAll();
            useAppStore.getState().clearSuggestions();
            navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* What We Store */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What's Stored Locally</Text>
        {STORED_ITEMS.map((item) => (
          <View key={item.label} style={styles.item}>
            <Text style={styles.itemIcon}>{item.icon}</Text>
            <View style={styles.itemText}>
              <Text style={styles.itemLabel}>{item.label}</Text>
              <Text style={styles.itemDetail}>{item.detail}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Privacy Statement */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy Statement</Text>
        <Text style={styles.statement}>
          ✅ All conversation data is stored{' '}
          <Text style={styles.bold}>only on your device</Text> using SQLite.
        </Text>
        <Text style={styles.statement}>
          ✅ Nothing is transmitted to external servers except{' '}
          <Text style={styles.bold}>the Groq API for reply generation</Text>.
        </Text>
        <Text style={styles.statement}>
          ✅ You can delete all data at any time using the button below.
        </Text>
        <Text style={styles.statement}>
          ✅ The Groq API only receives recent message context — not your contacts or account info.
        </Text>
      </View>

      {/* Wipe Button */}
      <TouchableOpacity style={styles.wipeBtn} onPress={handleWipe}>
        <Text style={styles.wipeBtnText}>🗑 Wipe All Data</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        ReplyAI v1.0.0 · Open source · No telemetry
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1E' },
  content: { padding: 20, gap: 8, paddingBottom: 48 },
  section: {
    backgroundColor: '#16162A',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7C5CBF',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  itemIcon: { fontSize: 22 },
  itemText: { flex: 1, gap: 3 },
  itemLabel: { color: '#E8E8F0', fontWeight: '600', fontSize: 14 },
  itemDetail: { color: '#5050A8', fontSize: 12 },
  statement: { color: '#C8C8D8', fontSize: 14, lineHeight: 20 },
  bold: { color: '#E8E8F0', fontWeight: '700' },
  wipeBtn: {
    backgroundColor: '#3A1A1A',
    borderWidth: 1,
    borderColor: '#7A3A3A',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  wipeBtnText: { color: '#FF6B6B', fontWeight: '700', fontSize: 16 },
  footer: { color: '#333360', fontSize: 12, textAlign: 'center' },
});
