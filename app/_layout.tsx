import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from '../src/theme';
import { PreviewStoreProvider } from '../src/state/PreviewStore';
export default function RootLayout() {
  return <SafeAreaProvider><PreviewStoreProvider><StatusBar style="light" /><Stack screenOptions={{ headerStyle: { backgroundColor: theme.colors.background }, headerTintColor: theme.colors.cream, headerTitleStyle: { fontSize: 16 }, contentStyle: { backgroundColor: theme.colors.background } }}>
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    <Stack.Screen name="plans" options={{ title: 'Your evening plan' }} />
    <Stack.Screen name="visit" options={{ title: 'Plan your visit' }} />
    <Stack.Screen name="compare" options={{ title: 'Compare programs' }} />
    <Stack.Screen name="backup" options={{ title: 'Back up and restore' }} />
    <Stack.Screen name="creative" options={{ title: 'Creative PTown' }} />
    <Stack.Screen name="programs/[id]" options={{ title: 'Creative pathway' }} />
    <Stack.Screen name="[section]" options={{ title: 'Explore PTown' }} />
    <Stack.Screen name="events/[id]" options={{ title: 'Program details' }} />
    <Stack.Screen name="+not-found" options={{ title: 'Page not found' }} />
  </Stack></PreviewStoreProvider></SafeAreaProvider>;
}
