import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from '../src/theme';
import { PreviewStoreProvider } from '../src/state/PreviewStore';
import { OperationsStoreProvider } from '../src/state/OperationsStore';
export default function RootLayout() {
  return <SafeAreaProvider><PreviewStoreProvider><OperationsStoreProvider><StatusBar style="light" /><Stack screenOptions={{ headerStyle: { backgroundColor: theme.colors.background }, headerTintColor: theme.colors.cream, headerTitleStyle: { fontSize: 16 }, contentStyle: { backgroundColor: theme.colors.background } }}>
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    <Stack.Screen name="plans" options={{ title: 'Your evening plan' }} />
    <Stack.Screen name="visit" options={{ title: 'Plan your visit' }} />
    <Stack.Screen name="compare" options={{ title: 'Compare programs' }} />
    <Stack.Screen name="backup" options={{ title: 'Back up and restore' }} />
    <Stack.Screen name="search" options={{ title: 'Explore PTown' }} />
    <Stack.Screen name="creative" options={{ title: 'Creative PTown' }} />
    <Stack.Screen name="programs/[id]" options={{ title: 'Creative pathway' }} />
    <Stack.Screen name="[section]" options={{ title: 'PTown Access' }} />
    <Stack.Screen name="events/[id]" options={{ title: 'Program details' }} />
    <Stack.Screen name="operations" options={{ headerShown: false }} />
    <Stack.Screen name="operations/artists/index" options={{ title: 'Artist CRM' }} />
    <Stack.Screen name="operations/artists/[id]" options={{ title: 'Artist profile' }} />
    <Stack.Screen name="operations/artists/[id]/booking" options={{ title: 'Start booking' }} />
    <Stack.Screen name="operations/artists/[id]/edit" options={{ title: 'Edit artist' }} />
    <Stack.Screen name="operations/calendar" options={{ title: 'Booking calendar' }} />
    <Stack.Screen name="operations/outreach" options={{ title: 'Outreach approvals' }} />
    <Stack.Screen name="operations/access" options={{ title: 'Management access' }} />
    <Stack.Screen name="operations/economics" options={{ title: 'Booking economics' }} />
    <Stack.Screen name="operations/audit" options={{ title: 'Audit history' }} />
    <Stack.Screen name="operations/scenarios" options={{ title: 'Scenario comparison' }} />
    <Stack.Screen name="operations/deal-room" options={{ title: 'Artist deal room' }} />
    <Stack.Screen name="operations/show-day" options={{ title: 'Show-day advance' }} />
    <Stack.Screen name="operations/settlement" options={{ title: 'Event settlement' }} />
    <Stack.Screen name="operations/post-show" options={{ title: 'Post-show scorecard' }} />
    <Stack.Screen name="operations/incidents" options={{ title: 'Incident log' }} />
    <Stack.Screen name="operations/executive-report" options={{ title: 'Executive booking report' }} />
    <Stack.Screen name="operations/readiness" options={{ title: 'Management readiness' }} />
    <Stack.Screen name="operations/production-readiness" options={{ title: 'Production readiness' }} />
    <Stack.Screen name="operations/staff-access" options={{ title: 'Staff access' }} />
    <Stack.Screen name="operations/account-recovery" options={{ title: 'Account recovery' }} />
    <Stack.Screen name="+not-found" options={{ title: 'PTown Access' }} />
  </Stack></OperationsStoreProvider></PreviewStoreProvider></SafeAreaProvider>;
}
