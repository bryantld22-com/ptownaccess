import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Text } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { staReadinessItems } from '../src/data/staReadiness';
import { formatStaAssignments, readStaAssignments, STA_ASSIGNMENTS_KEY, type StaAssignments } from '../src/utils/staAssignments';
import { createStaAssignmentTransfer, MAX_STA_ASSIGNMENT_TRANSFER, readStaAssignmentTransfer } from '../src/utils/staAssignmentTransfer';

export default function StaAssignmentBackup() {
  const [current, setCurrent] = useState<StaAssignments | null>(null);
  const [baseline, setBaseline] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [incoming, setIncoming] = useState<StaAssignments | null>(null);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void AsyncStorage.getItem(STA_ASSIGNMENTS_KEY).then(raw => { setCurrent(readStaAssignments(raw)); setBaseline(raw); }).catch(() => setStorageError(true)).finally(() => setReady(true)); }, []);
  const code = current && baseline ? createStaAssignmentTransfer(current) : '';
  async function copy() {
    setBusy(true); setMessage(null); setError(null);
    try {
      if (!code) throw new Error('No saved assignments');
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(code);
      } else if (!await Clipboard.setStringAsync(code)) throw new Error('Clipboard unavailable');
      setMessage('Assignment transfer code copied. Keep proposed names private.');
    } catch { setError('Copy is unavailable. Select the full code and copy it manually.'); }
    finally { setBusy(false); }
  }
  function review() {
    setIncoming(null); setMessage(null); setError(null);
    try { setIncoming(readStaAssignmentTransfer(input)); }
    catch { setError('The assignment code could not be validated. Current device data is unchanged.'); }
  }
  async function replace() {
    if (!incoming || !ready || storageError) return;
    setBusy(true); setMessage(null); setError(null);
    try {
      const latest = await AsyncStorage.getItem(STA_ASSIGNMENTS_KEY);
      if (latest !== baseline) throw new Error('Assignments changed');
      const next = JSON.stringify(incoming);
      await AsyncStorage.setItem(STA_ASSIGNMENTS_KEY, next);
      setCurrent(incoming); setBaseline(next); setIncoming(null); setInput('');
      setMessage('Reviewed proposed assignments replaced on this device. Nobody was contacted.');
    } catch { setError('Replacement failed or current assignments changed. Existing data was kept; reload to review it.'); }
    finally { setBusy(false); }
  }
  return <Screen>
    <Stack.Screen options={{ title: 'Save the Arts Assignment Transfer' }} />
    <PageHeader eyebrow="SAVE THE ARTS · BUILD 97" title="Carry proposed assignments to another device." description="Review all incoming names and dates before replacing this device’s saved proposal." />
    <PreviewNotice />
    <Card title="Private working names" description="A code can reveal proposed team members and target dates. Keep it private. The status tracker has a separate transfer code; this one carries assignments only." />
    <SectionHeader title="Back up this device" />
    {!ready ? <Body>Loading assignment plan…</Body> : storageError ? <Card title="Saved assignments unavailable" description="Current data could not be read. Replacement is disabled to protect it." /> : code ? <><ActionButton label="Copy assignment transfer code" disabled={busy} onPress={() => { void copy(); }} /><Field label="Private assignment transfer code" value={code} multiline editable={false} style={{ minHeight: 170, textAlignVertical: 'top', fontSize: 12 }} /></> : <Card title="No saved assignments yet" description="Save an assignment proposal before creating a transfer code. An incoming code can still be reviewed below." />}
    <SectionHeader title="Review an incoming code" />
    <Field label="Paste an assignment transfer code" value={input} onChangeText={value => { setInput(value); setIncoming(null); setMessage(null); setError(null); }} maxLength={MAX_STA_ASSIGNMENT_TRANSFER} multiline autoCapitalize="none" autoCorrect={false} style={{ minHeight: 170, textAlignVertical: 'top' }} />
    <ActionButton label="Review incoming proposed assignments" disabled={!ready || storageError || busy || !input.trim()} secondary onPress={review} />
    {incoming && <><Card title="Review before replacement" description={`This will replace the ${baseline ? 'saved' : 'empty'} proposed assignments on this device. It does not merge or change the preparation status tracker.`} />{staReadinessItems.map(item => <Card key={item.id} title={item.title} description={`CURRENT: ${current?.[item.id].proposedOwner || 'Unassigned'} · ${current?.[item.id].targetDate || 'No date'}\nINCOMING: ${incoming[item.id].proposedOwner || 'Unassigned'} · ${incoming[item.id].targetDate || 'No date'}`} />)}<ActionButton label="Replace current assignments with reviewed proposal" disabled={busy} onPress={() => { void replace(); }} /><Text selectable style={styles.card}>{formatStaAssignments(incoming)}</Text></>}
    <Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Return to proposed assignments" href="/sta-assignments" secondary /><Footer />
  </Screen>;
}
