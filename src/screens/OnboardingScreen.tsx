import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  AppState,
  Linking,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { storage } from '../storage/mmkv';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const STEPS = [
  {
    title: 'Welcome to ReplyAI',
    description:
      'ReplyAI reads your notifications and generates smart reply suggestions using AI — all processed locally and privately. Nothing leaves your device except the AI request.',
    action: null,
  },
  {
    title: 'Grant Notification Access',
    description:
      'We need permission to read your notifications so we can detect incoming messages.',
    action: 'notification',
  },
  {
    title: 'Grant Overlay Permission',
    description:
      'We need permission to draw the reply suggestions over other apps, right above your keyboard.',
    action: 'overlay',
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(async () => {
      // Poll permissions — on real device we'd check actual permission state
      // For now, we rely on the user tapping through
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function goNext() {
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      if (step < STEPS.length - 1) {
        setStep((s: number) => s + 1);
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      } else {
        storage.set('onboarding_done', true);
        navigation.reset({ index: 0, routes: [{ name: 'Settings' }] });
      }
    });
  }

  async function handleAction() {
    const action = STEPS[step].action;
    if (action === 'notification') {
      await Linking.openSettings();
    } else if (action === 'overlay') {
      await Linking.openSettings();
    }
  }

  const currentStep = STEPS[step];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressRow}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
        ))}
      </View>

      <View style={[styles.content, { opacity: fadeAnim as unknown as number }]}>
        <Text style={styles.emoji}>{step === 0 ? '🤖' : step === 1 ? '🔔' : '🪟'}</Text>
        <Text style={styles.title}>{currentStep.title}</Text>
        <Text style={styles.description}>{currentStep.description}</Text>
      </View>

      <View style={styles.buttonRow}>
        {currentStep.action && (
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleAction}>
            <Text style={styles.secondaryBtnText}>Open Settings</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.primaryBtn} onPress={goNext}>
          <Text style={styles.primaryBtnText}>
            {step < STEPS.length - 1 ? 'Next →' : 'Get Started'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 48,
    paddingHorizontal: 28,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  dot: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2A2A3E',
  },
  dotActive: {
    backgroundColor: '#7C5CBF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#E8E8F0',
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#9090A8',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  buttonRow: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: '#7C5CBF',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: '#3A3A5C',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#9090A8',
    fontWeight: '600',
    fontSize: 15,
  },
});
