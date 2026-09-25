import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Text } from 'react-native';
import { ActionButton, Feedback, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { formatMarketingCommand, marketingCommandKeys, marketingCommandStatuses, type MarketingCommandSnapshot } from '../src/utils/marketingCommand';

export default function MarketingCommand() {
  const [snapshot, setSnapshot] = useState<MarketingCommandSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  async function load() {
    setLoading(true); setSnapshot(null); setMessage(null); setError(null);
    try {
      const values = await Promise.all(marketingCommandKeys.map(key => AsyncStorage.getItem(key)));
      setSnapshot(Object.fromEntries(marketingCommandKeys.map((key, index) => [key, values[index]])) as MarketingCommandSnapshot);
    } catch { setError('Device records could not be loaded. Open the original worksheets to review them.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  const statuses = snapshot ? marketingCommandStatuses(snapshot) : [];
  const followUps = statuses.filter(item => item.blocked).length;
  async function copy() {
    if (!snapshot) return;
    setBusy(true); setMessage(null); setError(null);
    try {
      const latest = await Promise.all(marketingCommandKeys.map(key => AsyncStorage.getItem(key)));
      if (marketingCommandKeys.some((key, index) => snapshot[key] !== latest[index])) throw new Error('Records changed');
      const report = formatMarketingCommand(snapshot);
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(report);
      } else if (!await Clipboard.setStringAsync(report)) throw new Error('Clipboard unavailable');
      setMessage('Internal Marketing command summary copied. No campaign was published.');
    } catch { setError('Copy failed or saved records changed. Reload before copying the summary.'); }
    finally { setBusy(false); }
  }
  return <Screen>
    <Stack.Screen options={{ title: 'Marketing Command Review' }} />
    <PageHeader eyebrow="PTOWN MARKETING & BRAND · BUILD 106" title="See the next Marketing decisions." description="A device-local view of staffing, campaign brief, launch verification, and the twelve-month planning date." />
    <PreviewNotice />
    <Card title="Saved planning records" description="This view reads four saved records on this device. It does not show live staffing, bookings, campaign results, available funds, or publication approval. Reload after editing another worksheet." />
    <ActionButton label="Reload saved Marketing records" disabled={busy || loading} secondary onPress={() => { void load(); }} />
    {loading ? <Body>Loading Marketing records…</Body> : snapshot && <>
      <SectionHeader title={`${followUps} of ${statuses.length} areas need follow-up`} />
      {statuses.map(item => <Card key={item.title} title={`${item.title} · ${item.blocked ? 'Follow-up needed' : 'Draft material present'}`} description={item.detail} />)}
      <SectionHeader title="Internal command summary" /><Text selectable style={styles.card}>{formatMarketingCommand(snapshot)}</Text>
      <ActionButton label="Copy internal Marketing command summary" disabled={busy} onPress={() => { void copy(); }} />
    </>}
    <Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Edit proposed staffing" href="/marketing-staff" secondary /><Button label="Edit campaign brief" href="/marketing-brief" secondary /><Button label="Review launch verification" href="/marketing-launch-review" secondary /><Button label="Open twelve-month calendar" href="/marketing-calendar" secondary /><Button label="Open temporary budget worksheet" href="/marketing-budget" secondary /><Button label="Open temporary campaign scorecard" href="/marketing-scorecard" secondary /><Footer />
  </Screen>;
}
