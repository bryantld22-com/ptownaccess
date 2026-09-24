import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Text } from 'react-native';
import { ActionButton, Feedback, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { staReadinessItems, type StaReadinessRecord } from '../src/data/staReadiness';
import { readStaAssignments, STA_ASSIGNMENTS_KEY, type StaAssignments } from '../src/utils/staAssignments';
import { readStaReadiness, STA_READINESS_KEY } from '../src/utils/staReadiness';
import { formatStaReviewSheet } from '../src/utils/staReviewSheet';

type Snapshot = { readiness: StaReadinessRecord; assignments: StaAssignments; readinessRaw: string | null; assignmentsRaw: string | null };
export default function StaReviewSheet() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  async function load() {
    setLoading(true); setSnapshot(null); setError(null); setMessage(null);
    try {
      const [readinessRaw, assignmentsRaw] = await Promise.all([AsyncStorage.getItem(STA_READINESS_KEY), AsyncStorage.getItem(STA_ASSIGNMENTS_KEY)]);
      setSnapshot({ readiness: readStaReadiness(readinessRaw), assignments: readStaAssignments(assignmentsRaw), readinessRaw, assignmentsRaw });
    } catch { setError('One of the saved records could not be read. Review the original tracker and assignment plan before copying.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  async function copy() {
    if (!snapshot) return;
    setBusy(true); setMessage(null); setError(null);
    try {
      const [readinessRaw, assignmentsRaw] = await Promise.all([AsyncStorage.getItem(STA_READINESS_KEY), AsyncStorage.getItem(STA_ASSIGNMENTS_KEY)]);
      if (readinessRaw !== snapshot.readinessRaw || assignmentsRaw !== snapshot.assignmentsRaw) throw new Error('Records changed');
      const report = formatStaReviewSheet(snapshot.readiness, snapshot.assignments);
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(report);
      } else if (!await Clipboard.setStringAsync(report)) throw new Error('Clipboard unavailable');
      setMessage('Internal review sheet copied. Keep working notes private.');
    } catch { setError('Copy failed or saved records changed. Reload this review sheet before copying again.'); }
    finally { setBusy(false); }
  }
  const ready = snapshot ? staReadinessItems.filter(item => snapshot.readiness[item.id].status === 'Ready for review').length : 0;
  const owners = snapshot ? staReadinessItems.filter(item => snapshot.assignments[item.id].proposedOwner.trim()).length : 0;
  return <Screen>
    <Stack.Screen options={{ title: 'Save the Arts Internal Review Sheet' }} />
    <PageHeader eyebrow="SAVE THE ARTS · BUILD 96" title="Review the plan together." description="See saved preparation statuses beside proposed owners and dates in one internal discussion sheet." />
    <PreviewNotice />
    <Card title="Saved snapshot" description="This sheet reads saved records from this device. Save edits in the tracker or assignments page, then reload here. Names remain proposals until the people involved accept them." />
    <ActionButton label="Reload saved preparation and assignments" disabled={busy || loading} secondary onPress={() => { void load(); }} />
    {loading ? <Body>Loading review sheet…</Body> : snapshot && <>
      <SectionHeader title={`${ready} of 7 ready for team review · ${owners} proposed owners`} />
      {staReadinessItems.map(item => <Card key={item.id} title={item.title} description={`Status: ${snapshot.readiness[item.id].status}\nWorking note: ${snapshot.readiness[item.id].note.trim() || 'Not entered'}\nProposed owner: ${snapshot.assignments[item.id].proposedOwner.trim() || 'Unassigned'}\nTarget date: ${snapshot.assignments[item.id].targetDate || 'Not set'}`} />)}
      <Text selectable style={styles.card}>{formatStaReviewSheet(snapshot.readiness, snapshot.assignments)}</Text>
      <ActionButton label="Copy internal review sheet" disabled={busy} onPress={() => { void copy(); }} />
    </>}
    <Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Edit preparation status" href="/sta-readiness" secondary /><Button label="Edit proposed assignments" href="/sta-assignments" secondary /><Footer />
  </Screen>;
}
