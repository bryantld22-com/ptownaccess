import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Text } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { formatMarketingStaffPlan, MARKETING_STAFF_KEY, marketingStaffRoles, readMarketingStaffPlan, type MarketingStaffPlan } from '../src/utils/marketingStaffPlan';
import { createMarketingStaffTransfer, MAX_MARKETING_STAFF_TRANSFER, readMarketingStaffTransfer } from '../src/utils/marketingStaffTransfer';

export default function MarketingStaffBackup() {
  const [current, setCurrent] = useState<MarketingStaffPlan | null>(null);
  const [baseline, setBaseline] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [incoming, setIncoming] = useState<MarketingStaffPlan | null>(null);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void AsyncStorage.getItem(MARKETING_STAFF_KEY).then(raw => { setCurrent(readMarketingStaffPlan(raw)); setBaseline(raw); }).catch(() => setStorageError(true)).finally(() => setReady(true)); }, []);
  const code = current && baseline ? createMarketingStaffTransfer(current) : '';
  async function copy() {
    setBusy(true); setMessage(null); setError(null);
    try {
      if (!code) throw new Error('No saved plan');
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(code);
      } else if (!await Clipboard.setStringAsync(code)) throw new Error('Clipboard unavailable');
      setMessage('Staffing transfer code copied. Keep proposed names private.');
    } catch { setError('Copy is unavailable. Select the full code and copy it manually.'); }
    finally { setBusy(false); }
  }
  function review() {
    setIncoming(null); setMessage(null); setError(null);
    try { setIncoming(readMarketingStaffTransfer(input)); }
    catch { setError('The staffing code could not be validated. Current device data is unchanged.'); }
  }
  async function replace() {
    if (!incoming || !ready || storageError) return;
    setBusy(true); setMessage(null); setError(null);
    try {
      const latest = await AsyncStorage.getItem(MARKETING_STAFF_KEY);
      if (latest !== baseline) throw new Error('Staffing plan changed');
      const next = JSON.stringify(incoming);
      await AsyncStorage.setItem(MARKETING_STAFF_KEY, next);
      setCurrent(incoming); setBaseline(next); setIncoming(null); setInput('');
      setMessage('Reviewed proposed staffing replaced on this device. No appointment or message was sent.');
    } catch { setError('Replacement failed or current staffing changed. Existing data was kept; reload to review it.'); }
    finally { setBusy(false); }
  }
  return <Screen>
    <Stack.Screen options={{ title: 'Marketing Staffing Transfer' }} />
    <PageHeader eyebrow="PTOWN MARKETING & BRAND · BUILD 105" title="Carry the proposed team plan to another device." description="Compare all six roles before replacing this device’s staffing draft." />
    <PreviewNotice />
    <Card title="Private working names" description="The transfer code contains proposed people and coverage notes in plain text. Keep it private. It does not grant roles, invite anyone, or sync devices." />
    <SectionHeader title="Back up this device" />
    {!ready ? <Body>Loading staffing plan…</Body> : storageError ? <Card title="Saved staffing unavailable" description="Current device data could not be read. Replacement is disabled to protect it." /> : code ? <><ActionButton label="Copy staffing transfer code" disabled={busy} onPress={() => { void copy(); }} /><Field label="Private staffing transfer code" value={code} multiline editable={false} style={{ minHeight: 170, textAlignVertical: 'top', fontSize: 12 }} /></> : <Card title="No saved staffing plan yet" description="Save a proposed staffing plan before creating a transfer code. An incoming code can still be reviewed below." />}
    <SectionHeader title="Review an incoming code" />
    <Field label="Paste a staffing transfer code" value={input} onChangeText={value => { setInput(value); setIncoming(null); setMessage(null); setError(null); }} maxLength={MAX_MARKETING_STAFF_TRANSFER} multiline autoCapitalize="none" autoCorrect={false} style={{ minHeight: 170, textAlignVertical: 'top' }} />
    <ActionButton label="Review incoming proposed staffing" disabled={!ready || storageError || busy || !input.trim()} secondary onPress={review} />
    {incoming && <><Card title="Review before replacement" description={`This will replace the ${baseline ? 'saved' : 'empty'} staffing proposal on this device. It does not merge roles or notes.`} />{marketingStaffRoles.map(item => <Card key={item.id} title={item.role} description={`CURRENT: ${current?.[item.id].proposedPerson || 'Open seat'} · ${current?.[item.id].coverageNote || 'No coverage note'}\nINCOMING: ${incoming[item.id].proposedPerson || 'Open seat'} · ${incoming[item.id].coverageNote || 'No coverage note'}`} />)}<ActionButton label="Replace current staffing with reviewed proposal" disabled={busy} onPress={() => { void replace(); }} /><Text selectable style={styles.card}>{formatMarketingStaffPlan(incoming)}</Text></>}
    <Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Return to staffing worksheet" href="/marketing-staff" secondary /><Footer />
  </Screen>;
}
