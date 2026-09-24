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
    <Stack.Screen name="search" options={{ title: 'Explore PTown' }} />
    <Stack.Screen name="creative" options={{ title: 'Creative PTown' }} />
    <Stack.Screen name="access-roles" options={{ title: 'PTown Access roles' }} />
    <Stack.Screen name="access-request" options={{ title: 'Role request worksheet' }} />
    <Stack.Screen name="investor-access" options={{ title: 'Investor Access' }} />
    <Stack.Screen name="marketing" options={{ title: 'PTown Marketing & Brand' }} />
    <Stack.Screen name="marketing-calendar" options={{ title: 'Marketing Campaign Calendar' }} />
    <Stack.Screen name="marketing-operations" options={{ title: 'Marketing Department Guide' }} />
    <Stack.Screen name="marketing-brief" options={{ title: 'Marketing Campaign Brief' }} />
    <Stack.Screen name="championship-path" options={{ title: 'Championship Path' }} />
    <Stack.Screen name="artist-prospects" options={{ title: 'Private artist prospects' }} />
    <Stack.Screen name="artist-prospects/[id]" options={{ title: 'Private prospect review' }} />
    <Stack.Screen name="artist-prospect-actions" options={{ title: 'Private prospect follow-ups' }} />
    <Stack.Screen name="artist-prospect-actions-unlinked" options={{ title: 'Unlinked prospect follow-ups' }} />
    <Stack.Screen name="artist-prospect-backup" options={{ title: 'Private Artist Development transfer' }} />
    <Stack.Screen name="artist-prospect-delete/[id]" options={{ title: 'Review prospect removal' }} />
    <Stack.Screen name="friends" options={{ title: 'Friend 2 Friend' }} />
    <Stack.Screen name="friends/[id]" options={{ title: 'Sample friend profile' }} />
    <Stack.Screen name="programs/[id]" options={{ title: 'Creative pathway' }} />
    <Stack.Screen name="media/[id]" options={{ title: 'PTown Media' }} />
    <Stack.Screen name="media-group" options={{ title: 'PTown Media Group' }} />
    <Stack.Screen name="media-group/[id]" options={{ title: 'Media Group division' }} />
    <Stack.Screen name="media-group/operations-guide" options={{ title: 'Media Director Guide' }} />
    <Stack.Screen name="media-templates" options={{ title: 'Media production templates' }} />
    <Stack.Screen name="media-templates/[id]" options={{ title: 'Media production template' }} />
    <Stack.Screen name="media-dashboard" options={{ title: 'Media production dashboard' }} />
    <Stack.Screen name="media-drafts" options={{ title: 'Private media drafts' }} />
    <Stack.Screen name="media-drafts/[id]" options={{ title: 'Private draft review' }} />
    <Stack.Screen name="media-draft-backup" options={{ title: 'Private draft transfer' }} />
    <Stack.Screen name="media-draft-workbook/[id]" options={{ title: 'Private production workbook' }} />
    <Stack.Screen name="media-readiness" options={{ title: 'Media readiness report' }} />
    <Stack.Screen name="media-actions" options={{ title: 'Media owner action queue' }} />
    <Stack.Screen name="media-actions-unlinked" options={{ title: 'Unlinked action review' }} />
    <Stack.Screen name="media-action-backup" options={{ title: 'Private action transfer' }} />
    <Stack.Screen name="media-bundle-backup" options={{ title: 'Unified Media Group transfer' }} />
    <Stack.Screen name="media-draft-delete/[id]" options={{ title: 'Review draft removal' }} />
    <Stack.Screen name="[section]" options={{ title: 'PTown Access' }} />
    <Stack.Screen name="events/[id]" options={{ title: 'Program details' }} />
    <Stack.Screen name="+not-found" options={{ title: 'PTown Access' }} />
  </Stack></PreviewStoreProvider></SafeAreaProvider>;
}
