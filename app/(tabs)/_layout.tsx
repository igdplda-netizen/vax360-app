import { Tabs, useRouter, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { useEffect } from 'react';
import { Colors } from '../../constants/colors';
import { useApp } from '../../context/AppContext';

export default function TabLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { t, state, onboardingConfig } = useApp();
  const router = useRouter();

  // Enforce the mandatory password-change screen — cannot be bypassed by
  // navigating directly to /(tabs) (e.g. hardware back, deep-link, app restart
  // with a saved token that still carries the default-credential flag).
  useEffect(() => {
    if (state.mustChangePassword) {
      router.replace('/change-password');
    }
  }, [state.mustChangePassword]);

  if (state.mustChangePassword) return <Redirect href="/change-password" />;
  if (onboardingConfig.enabled && !state.isOnboarded) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light,
          borderTopColor: isDark ? Colors.border.dark : Colors.border.light,
          height: 84,
          paddingBottom: 28,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: t('schedule'),
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="children"
        options={{
          title: t('children'),
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t('search'),
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings'),
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
