import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Text } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { formatStaReadiness, staReadinessItems, type StaReadinessRecord } from '../src/data/staReadiness';
import { STA_READINESS_KEY, readStaReadiness } from '../src/utils/staReadiness';
import { createStaReadinessTransfer, MAX_STA_READINESS_TRANSFER, readStaReadinessTransfer } from '../src/utils/staReadinessTransfer';

export default function StaReadinessBackup() {
  const [current, setCurrent] = useState<StaReadinessRecord | null>(null);
  const [baseline, setBaseline] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [incoming, setIncoming] = useState<StaReadinessRecord | null>(null);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void AsyncStorage.getItem(STA_READINESS_KEY).then(value => { setCurrent(readStaReadiness(value)); setBaseline(value); }).catch(() => setStorageError(true)).finally(() => setReady(true)); }, []);
  const code = current && baseline ? createStaReadinessTransfer(current) : '';
  async function copy() {
    setBusy(true); setMessage(null); setError(null);
    try {
      if (!code) throw new Error('No saved status');
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(code);
      } else if (!await Clipboard.setStringAsync(code)) throw new Error('Clipboard unavailable');
      setMessage('Preparation transfer code copied. Keep it private.');
    } catch { setError('Copy is unavailable. Select the full code and copy it manually.'); }
    finally { setBusy(false); }
  }
  function review() {
    setIncoming(null); setMessage(null); setError(null);
    try { setIncoming(readStaReadinessTransfer(input)); }
    catch { setError('The transfer code could not be validated. Current device status is unchanged.'); }
  }
  async function replace() {
    if (!incoming || !ready || storageError) return;
    setBusy(true); setMessage(null); setError(null);
    try {
      const latest = await AsyncStorage.getItem(STA_READINESS_KEY);
      if (latest !== baseline) throw new Error('Current status changed');
      const next = JSON.stringify(incoming);
      await AsyncStorage.setItem(STA_READINESS_KEY, next);
      setCurrent(incoming); setBaseline(next); setIncoming(null); setInput('');
      setMessage('Reviewed preparation status replaced on this device. No grant application or meeting request was sent.');
    } catch { setError('Replacement failed or current status changed. Existing device data was kept; reload to review it.'); }
    finally { setBusy(false); }
  }
  return <Screen>
    <Stack.Screen options={{ title: 'Save the Arts Preparation Transfer' }} />
    <PageHeader eyebrow="SAVE THE ARTS · BUILD 93" title="Carry the preparation record to another device." description="Copy a versioned transfer code and review each incoming status before replacing this device’s saved record." />
    <PreviewNotice />
    <Card title="Private planning data" description="The code includes working notes about applicant structure, partners, budget, and funder checks. Keep a separate secure copy. Replacement changes this device only; it does not sync, certify eligibility, or submit an application." />
    <SectionHeader title="Back up this device" />
    {!ready ? <Body>Loading saved preparation status…</Body> : storageError ? <Card title="Current status unavailable" description="Saved data could not be read. Replacement is disabled to protect it." /> : code ? <><ActionButton label="Copy preparation transfer code" disabled={busy} onPress={() => { void copy(); }} /><Field label="Private preparation transfer code" value={code} multiline editable={false} style={{ minHeight: 170, textAlignVertical: 'top', fontSize: 12 }} /></> : <Card title="No saved status yet" description="Save the preparation tracker before creating a transfer code. An incoming code can still be reviewed below." />}
    <SectionHeader title="Review an incoming code" />
    <Field label="Paste a preparation transfer code" value={input} onChangeText={value => { setInput(value); setIncoming(null); setMessage(null); setError(null); }} maxLength={MAX_STA_READINESS_TRANSFER} multiline autoCapitalize="none" autoCorrect={false} style={{ minHeight: 170, textAlignVertical: 'top' }} />
    <ActionButton label="Review incoming preparation status" disabled={!ready || storageError || busy || !input.trim()} secondary onPress={review} />
    {incoming && <><Card title="Review before replacement" description={`This will replace the ${baseline ? 'saved' : 'empty'} preparation record on this device. Compare all seven areas below; it does not merge notes.`} />{staReadinessItems.map(item => <Card key={item.id} title={item.title} description={`CURRENT: ${current?.[item.id].status ?? 'Not started'} · ${current?.[item.id].note || 'No note'}\nINCOMING: ${incoming[item.id].status} · ${incoming[item.id].note || 'No note'}`} />)}<ActionButton label="Replace current preparation status with reviewed record" disabled={busy} onPress={() => { void replace(); }} /><Text selectable style={styles.card}>{formatStaReadiness(incoming)}</Text></>}
    <Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Return to preparation tracker" href="/sta-readiness" secondary /><Footer />
  </Screen>;
}
