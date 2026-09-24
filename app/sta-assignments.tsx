import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { staReadinessItems, type StaReadinessId } from '../src/data/staReadiness';
import { emptyStaAssignments, formatStaAssignments, readStaAssignments, STA_ASSIGNMENTS_KEY, validTargetDate, type StaAssignments } from '../src/utils/staAssignments';

export default function StaAssignmentsPage() {
  const [assignments, setAssignments] = useState<StaAssignments>(emptyStaAssignments);
  const [baseline, setBaseline] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void AsyncStorage.getItem(STA_ASSIGNMENTS_KEY).then(raw => { setAssignments(readStaAssignments(raw)); setBaseline(raw); }).catch(() => setStorageError(true)).finally(() => setLoaded(true)); }, []);
  const invalidDate = staReadinessItems.some(item => assignments[item.id].targetDate.trim() !== '' && !validTargetDate(assignments[item.id].targetDate));
  const assigned = staReadinessItems.filter(item => assignments[item.id].proposedOwner.trim()).length;
  function update(id: StaReadinessId, field: 'proposedOwner' | 'targetDate', value: string) {
    setAssignments(current => ({ ...current, [id]: { ...current[id], [field]: value } })); setMessage(null); setError(null);
  }
  async function save() {
    if (!loaded || storageError || invalidDate) return;
    setBusy(true); setMessage(null); setError(null);
    try {
      const latest = await AsyncStorage.getItem(STA_ASSIGNMENTS_KEY);
      if (latest !== baseline) throw new Error('Assignments changed');
      const next = JSON.stringify(assignments);
      await AsyncStorage.setItem(STA_ASSIGNMENTS_KEY, next); setBaseline(next);
      setMessage('Proposed assignments saved on this device. No person was contacted.');
    } catch { setError('Saving failed or another tab changed this plan. Existing device data was kept; reload to review it.'); }
    finally { setBusy(false); }
  }
  async function copy() {
    setMessage(null); setError(null);
    try {
      const report = formatStaAssignments(assignments);
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(report);
      } else if (!await Clipboard.setStringAsync(report)) throw new Error('Clipboard unavailable');
      setMessage('Proposed assignment draft copied. Confirm roles directly with each person.');
    } catch { setError('Copy is unavailable. Select the draft below and copy it manually.'); }
  }
  return <Screen>
    <Stack.Screen options={{ title: 'Save the Arts Proposed Assignments' }} />
    <PageHeader eyebrow="SAVE THE ARTS · BUILD 96" title="Put names and dates beside the work." description="Draft a proposed owner and target date for each of the seven preparation areas." />
    <PreviewNotice />
    <Card title="Proposals until accepted" description="A name here does not appoint anyone or send an invitation. Confirm participation before sharing responsibilities. These assignments are stored only on this device." />
    {!loaded ? <Body>Loading assignment plan…</Body> : storageError ? <Card title="Assignment plan unavailable" description="Saved device data could not be read. Editing is disabled to protect it." /> : <>
      <SectionHeader title={`${assigned} of ${staReadinessItems.length} areas have a proposed owner`} />
      {staReadinessItems.map(item => <View key={item.id} style={styles.card}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Field label={`${item.title} · proposed owner`} value={assignments[item.id].proposedOwner} onChangeText={value => update(item.id, 'proposedOwner', value)} maxLength={80} placeholder="Leave blank until a person is proposed" />
        <Field label={`${item.title} · target date`} value={assignments[item.id].targetDate} onChangeText={value => update(item.id, 'targetDate', value)} maxLength={10} placeholder="YYYY-MM-DD" autoCapitalize="none" hint="Use YYYY-MM-DD, or leave blank until agreed." />
      </View>)}
      {invalidDate && <Text accessibilityRole="alert" style={formStyles.error}>Correct target dates to real calendar dates in YYYY-MM-DD format before saving.</Text>}
      <ActionButton label="Save proposed assignments on this device" disabled={busy || invalidDate} onPress={() => { void save(); }} />
      <SectionHeader title="Copy a discussion draft" />
      <Text selectable style={styles.card}>{formatStaAssignments(assignments)}</Text>
      <ActionButton label="Copy proposed assignments" disabled={busy || invalidDate} secondary onPress={() => { void copy(); }} />
    </>}
    <Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Back up or transfer proposed assignments" href="/sta-assignment-backup" secondary /><Button label="Review the combined preparation sheet" href="/sta-review-sheet" secondary /><Button label="Return to preparation status" href="/sta-readiness" secondary /><Footer />
  </Screen>;
}
