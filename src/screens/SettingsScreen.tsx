import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppStore } from '../store/useAppStore';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

const WATCHED_APPS = [
  { label: '💬 WhatsApp', pkg: 'com.whatsapp' },
  { label: '📸 Instagram', pkg: 'com.instagram.android' },
  { label: '✈️ Telegram', pkg: 'org.telegram.messenger' },
  { label: '💌 SMS', pkg: 'com.android.mms' },
  { label: '🐦 Twitter / X', pkg: 'com.twitter.android' },
  { label: '💼 LinkedIn', pkg: 'com.linkedin.android' },
];

const LENGTHS: Array<'short' | 'medium' | 'long'> = ['short', 'medium', 'long'];

export default function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { apiKey, replyLength, watchedApps, setApiKey, setReplyLength, toggleWatchedApp } =
    useAppStore();
  const [keyDraft, setKeyDraft] = useState(apiKey);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* API Key */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Groq API Key</Text>
        <TextInput
          style={styles.input}
          value={keyDraft}
          onChangeText={setKeyDraft}
          onBlur={() => setApiKey(keyDraft)}
          placeholder="gsk_..."
          placeholderTextColor="#5050668"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.hint}>
          Get your free key at{' '}
          <Text style={styles.link}>console.groq.com</Text>
        </Text>
      </View>

      {/* Reply Length */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reply Length</Text>
        <View style={styles.chipRow}>
          {LENGTHS.map((len) => (
            <TouchableOpacity
              key={len}
              style={[styles.chip, replyLength === len && styles.chipActive]}
              onPress={() => setReplyLength(len)}
            >
              <Text style={[styles.chipText, replyLength === len && styles.chipTextActive]}>
                {len.charAt(0).toUpperCase() + len.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Watched Apps */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monitor These Apps</Text>
        {WATCHED_APPS.map((app) => (
          <View key={app.pkg} style={styles.switchRow}>
            <Text style={styles.switchLabel}>{app.label}</Text>
            <Switch
              value={watchedApps.includes(app.pkg)}
              onValueChange={() => toggleWatchedApp(app.pkg)}
              trackColor={{ false: '#2A2A3E', true: '#7C5CBF' }}
              thumbColor="#E8E8F0"
            />
          </View>
        ))}
      </View>

      {/* Navigation Links */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.navLink}
          onPress={() => navigation.navigate('MemoryViewer')}
        >
          <Text style={styles.navLinkText}>🧠 Conversation Memory</Text>
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navLink}
          onPress={() => navigation.navigate('Privacy')}
        >
          <Text style={styles.navLinkText}>🔒 Privacy & Data</Text>
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1E' },
  content: { padding: 20, gap: 8, paddingBottom: 40 },
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
  input: {
    backgroundColor: '#0F0F1E',
    borderRadius: 10,
    padding: 12,
    color: '#E8E8F0',
    fontSize: 14,
    fontFamily: 'monospace',
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  hint: { fontSize: 12, color: '#5050A8' },
  link: { color: '#7C5CBF' },
  chipRow: { flexDirection: 'row', gap: 10 },
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#0F0F1E',
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  chipActive: { backgroundColor: '#7C5CBF', borderColor: '#7C5CBF' },
  chipText: { color: '#9090A8', fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: '#fff' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: { color: '#C8C8D8', fontSize: 15 },
  navLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  navLinkText: { color: '#C8C8D8', fontSize: 15 },
  navArrow: { color: '#5050A8', fontSize: 20 },
});
