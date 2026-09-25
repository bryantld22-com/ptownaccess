import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { emptyMarketingStaffPlan, formatMarketingStaffPlan, MARKETING_STAFF_KEY, marketingStaffRoles, readMarketingStaffPlan, type MarketingStaffPlan } from '../src/utils/marketingStaffPlan';

export default function MarketingStaff() {
  const [plan, setPlan] = useState<MarketingStaffPlan>(emptyMarketingStaffPlan);
  const [baseline, setBaseline] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void AsyncStorage.getItem(MARKETING_STAFF_KEY).then(raw => { setPlan(readMarketingStaffPlan(raw)); setBaseline(raw); }).catch(() => setStorageError(true)).finally(() => setLoaded(true)); }, []);
  const proposed = marketingStaffRoles.filter(item => plan[item.id].proposedPerson.trim()).length;
  function update(id: string, field: 'proposedPerson' | 'coverageNote', value: string) {
    setPlan(current => ({ ...current, [id]: { ...current[id], [field]: value } })); setMessage(null); setError(null);
  }
  async function save() {
    if (!loaded || storageError) return;
    setBusy(true); setMessage(null); setError(null);
    try {
      const latest = await AsyncStorage.getItem(MARKETING_STAFF_KEY);
      if (latest !== baseline) throw new Error('Plan changed');
      const next = JSON.stringify(plan);
      await AsyncStorage.setItem(MARKETING_STAFF_KEY, next); setBaseline(next);
      setMessage('Proposed staffing plan saved on this device. No person was contacted.');
    } catch { setError('Saving failed or another tab changed the plan. Existing data was kept; reload to review it.'); }
    finally { setBusy(false); }
  }
  async function copy() {
    setMessage(null); setError(null);
    try {
      const report = formatMarketingStaffPlan(plan);
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(report);
      } else if (!await Clipboard.setStringAsync(report)) throw new Error('Clipboard unavailable');
      setMessage('Proposed staffing draft copied for internal discussion.');
    } catch { setError('Copy is unavailable. Select the draft and copy it manually.'); }
  }
  return <Screen>
    <Stack.Screen options={{ title: 'Marketing Proposed Staffing' }} />
    <PageHeader eyebrow="PTOWN MARKETING & BRAND · BUILD 104" title="Put coverage beside each function." description="Map proposed people and open seats for six Marketing & Brand responsibilities." />
    <PreviewNotice />
    <Card title="Discussion draft" description="The same person can cover multiple roles at startup. A name here does not appoint anyone or grant access. Confirm each person’s interest and scope before sharing responsibilities. Saved plans stay on this device." />
    {!loaded ? <Body>Loading staffing plan…</Body> : storageError ? <Card title="Saved staffing plan unavailable" description="Existing data could not be read. Editing is disabled to protect it." /> : <>
      <SectionHeader title={`${proposed} of ${marketingStaffRoles.length} functions have a proposed person`} />
      {marketingStaffRoles.map(item => <View key={item.id} style={styles.card}>
        <Text style={styles.cardTitle}>{item.role}</Text><Body>{item.accountable}</Body>
        <Field label={`${item.role} · proposed person`} value={plan[item.id].proposedPerson} onChangeText={value => update(item.id, 'proposedPerson', value)} maxLength={80} placeholder="Leave blank for an open seat" />
        <Field label={`${item.role} · coverage or next step`} value={plan[item.id].coverageNote} onChangeText={value => update(item.id, 'coverageNote', value)} maxLength={240} multiline placeholder="Who can cover temporarily? What decision remains?" />
      </View>)}
      <ActionButton label="Save proposed staffing on this device" disabled={busy} onPress={() => { void save(); }} />
      <SectionHeader title="Review the discussion draft" /><Text selectable style={styles.card}>{formatMarketingStaffPlan(plan)}</Text>
      <ActionButton label="Copy proposed staffing draft" disabled={busy} secondary onPress={() => { void copy(); }} />
    </>}
    <Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Return to Marketing Department Guide" href="/marketing-operations" secondary /><Footer />
  </Screen>;
}
