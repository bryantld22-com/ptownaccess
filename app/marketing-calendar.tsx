import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { marketingCampaigns, marketingFunnel } from '../src/data/marketing';
import { theme } from '../src/theme';
import { formatMarketingCalendarPlan, MARKETING_CALENDAR_KEY, marketingMonthRange, readMarketingStart, validMarketingStart } from '../src/utils/marketingCalendarPlan';

type Quarter = 'all' | '1' | '2' | '3' | '4';
const quarters: { id: Quarter; label: string }[] = [
  { id: 'all', label: 'Full year' }, { id: '1', label: 'Months 1–3' },
  { id: '2', label: 'Months 4–6' }, { id: '3', label: 'Months 7–9' }, { id: '4', label: 'Months 10–12' },
];

export default function MarketingCalendar() {
  const { quarter } = useLocalSearchParams<{ quarter?: string | string[] }>();
  const router = useRouter();
  const routeQuarter = typeof quarter === 'string' && quarters.some(item => item.id === quarter) ? quarter as Quarter : 'all';
  const [selected, setSelected] = useState<Quarter>('all');
  const [start, setStart] = useState('');
  const [baseline, setBaseline] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setSelected(routeQuarter), [routeQuarter]);
  useEffect(() => { void AsyncStorage.getItem(MARKETING_CALENDAR_KEY).then(raw => { setStart(readMarketingStart(raw)); setBaseline(raw); }).catch(() => setStorageError(true)).finally(() => setLoaded(true)); }, []);
  const visible = marketingCampaigns.filter(item => selected === 'all' || Math.ceil(item.month / 3).toString() === selected);
  const savedStart = baseline === null ? '' : readMarketingStart(baseline);
  const fullPlan = formatMarketingCalendarPlan(savedStart);
  function select(value: Quarter) {
    setSelected(value);
    router.setParams({ quarter: value === 'all' ? undefined : value });
  }
  async function saveStart() {
    if (!loaded || storageError || !validMarketingStart(start)) return;
    setBusy(true); setMessage(null); setError(null);
    try {
      const current = await AsyncStorage.getItem(MARKETING_CALENDAR_KEY);
      if (current !== baseline) throw new Error('Planning date changed');
      const next = JSON.stringify(start);
      await AsyncStorage.setItem(MARKETING_CALENDAR_KEY, next); setBaseline(next);
      setMessage('Planning start saved on this device. No opening or event date was scheduled.');
    } catch { setError('The planning date could not be saved or changed in another tab. Reload to review it.'); }
    finally { setBusy(false); }
  }
  async function copyPlan() {
    if (!loaded || storageError || busy) return;
    setBusy(true); setMessage(null); setError(null);
    try {
      const latest = await AsyncStorage.getItem(MARKETING_CALENDAR_KEY);
      if (latest !== baseline) throw new Error('Planning date changed');
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(fullPlan);
      } else if (!await Clipboard.setStringAsync(fullPlan)) throw new Error('Clipboard unavailable');
      setMessage('Twelve-month planning draft copied. No campaign was scheduled or published.');
    } catch { setError('Copy failed or the saved planning date changed. Reload the calendar before copying.'); }
    finally { setBusy(false); }
  }

  return <Screen>
    <Stack.Screen options={{ title: 'Marketing Campaign Calendar' }} />
    <PageHeader eyebrow="PTOWN MARKETING & BRAND · BUILD 103" title="A campaign rhythm from foundation to launch." description="Twelve planning months with an optional start date, owner function, action, and measurement." />
    <PreviewNotice />
    <Card title="Planning ranges, not scheduled events" description="Enter a proposed work-plan start date to see rolling month ranges. This does not confirm an opening, performers, event dates, campaign spend, ticket links, partner commitments, or venue readiness." />
    {!loaded ? <Body>Loading planning date…</Body> : storageError ? <Card title="Saved planning date unavailable" description="Existing device data could not be read. Saving is disabled to protect it." /> : <><SectionHeader title="Set a proposed work-plan start" /><Field label="Planning start date" value={start} onChangeText={value => { setStart(value); setMessage(null); setError(null); }} maxLength={10} placeholder="YYYY-MM-DD" hint="Use a real date from 2000–2100. The start is only a planning assumption." />{start !== '' && !validMarketingStart(start) && <Text accessibilityRole="alert" style={formStyles.error}>Enter a real date in YYYY-MM-DD format.</Text>}<ActionButton label="Save planning start on this device" disabled={busy || !validMarketingStart(start)} onPress={() => { void saveStart(); }} /><Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}</>}
    <SectionHeader title="Choose a planning period" />
    <View accessibilityRole="tablist" accessibilityLabel="Marketing planning periods" style={styles.grid}>
      {quarters.map(item => <Pressable key={item.id} accessibilityRole="tab" accessibilityState={{ selected: selected === item.id }} aria-selected={selected === item.id} onPress={() => select(item.id)} style={[local.tab, selected === item.id && local.active]}><Text style={[local.label, selected === item.id && local.activeLabel]}>{item.label}</Text></Pressable>)}
    </View>
    <Text accessibilityLiveRegion="polite" style={styles.smallBody}>{visible.length} of 12 campaign months shown.</Text>
    {visible.map(item => <Card key={item.month} title={`Month ${item.month} · ${item.title}`} description={`${validMarketingStart(start) && !storageError ? `Proposed range${JSON.stringify(start) !== baseline ? ' (unsaved)' : ''}: ${marketingMonthRange(start, item.month)}. ` : ''}${item.channel} · ${item.action} Measure: ${item.measure}`} />)}
    {loaded && !storageError && <><SectionHeader title="Copy the full-year planning draft" /><Body>The draft below uses only the saved planning start. Save any date edits above before copying; the selected quarter does not shorten the full-year report.</Body><Text selectable style={styles.card}>{fullPlan}</Text><ActionButton label="Copy twelve-month marketing plan" disabled={busy} secondary onPress={() => { void copyPlan(); }} /></>}
    <SectionHeader title="PTown Access marketing funnel" />
    <Body>Use real opt-in, booking, and attendance data only after those systems are activated. These are measurement definitions, not live metrics.</Body>
    {marketingFunnel.map(item => <Card key={item.stage} title={item.stage} description={`Signal: ${item.signal}. Review: ${item.decision}`} />)}
    <Button label="Return to Marketing & Brand" href="/marketing" />
    <Footer />
  </Screen>;
}

const local = StyleSheet.create({
  tab: { minHeight: 48, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 24, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  active: { backgroundColor: theme.colors.gold, borderColor: theme.colors.gold },
  label: { color: theme.colors.cream, fontSize: 14, fontWeight: '600' },
  activeLabel: { color: theme.colors.background },
});
