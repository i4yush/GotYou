import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { storage } from '../storage/mmkv';

import OnboardingScreen from '../screens/OnboardingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MemoryViewerScreen from '../screens/MemoryViewerScreen';
import PrivacyScreen from '../screens/PrivacyScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Settings: undefined;
  MemoryViewer: undefined;
  Privacy: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const onboardingDone = storage.getBoolean('onboarding_done') ?? false;

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={onboardingDone ? 'Settings' : 'Onboarding'}
        screenOptions={{
          headerStyle: { backgroundColor: '#0F0F1E' },
          headerTintColor: '#E0E0E0',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#0F0F1E' },
        }}
      >
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'ReplyAI', headerLeft: () => null }}
        />
        <Stack.Screen
          name="MemoryViewer"
          component={MemoryViewerScreen}
          options={{ title: 'Conversation Memory' }}
        />
        <Stack.Screen
          name="Privacy"
          component={PrivacyScreen}
          options={{ title: 'Privacy & Data' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
