import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { theme } from '../src/theme';
import { STA_MENTOR_READINESS_KEY, formatMentorReadiness, mentorReadinessChecks, readMentorReadiness, type MentorReadinessId, type MentorReadinessRecord, type MentorReadinessStatus } from '../src/utils/staMentorReadiness';

const statuses: MentorReadinessStatus[] = ['Needs work', 'Material gathered'];
export default function MentorReadiness() {
  const [record, setRecord] = useState<MentorReadinessRecord | null>(null);
  const [baseline, setBaseline] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void AsyncStorage.getItem(STA_MENTOR_READINESS_KEY).then(raw => { setRecord(readMentorReadiness(raw)); setBaseline(raw); }).catch(() => setStorageError(true)).finally(() => setLoaded(true)); }, []);
  function update(id: MentorReadinessId, value: Partial<MentorReadinessRecord[MentorReadinessId]>) {
    setRecord(current => current ? { ...current, [id]: { ...current[id], ...value } } : current);
    setMessage(null); setError(null);
  }
  async function save() {
    if (!record || !loaded || storageError) return;
    setBusy(true); setMessage(null); setError(null);
    try {
      const latest = await AsyncStorage.getItem(STA_MENTOR_READINESS_KEY);
      if (latest !== baseline) throw new Error('Record changed');
      const raw = JSON.stringify(record);
      readMentorReadiness(raw);
      await AsyncStorage.setItem(STA_MENTOR_READINESS_KEY, raw); setBaseline(raw);
      setMessage('Mentor pilot preparation saved on this device. No sessions were authorized.');
    } catch { setError('Saving failed or another tab changed this record. Existing data was kept; reload to review it.'); }
    finally { setBusy(false); }
  }
  async function copy() {
    if (!record) return;
    setMessage(null); setError(null);
    try {
      const report = formatMentorReadiness(record);
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(report);
      } else if (!await Clipboard.setStringAsync(report)) throw new Error('Clipboard unavailable');
      setMessage('Preparation draft copied for internal review.');
    } catch { setError('Copy is unavailable. Select the review text and copy it manually.'); }
  }
  const gathered = record ? mentorReadinessChecks.filter(item => record[item.id].status === 'Material gathered').length : 0;
  return <Screen>
    <Stack.Screen options={{ title: 'Save the Arts Mentor Readiness' }} />
    <PageHeader eyebrow="SAVE THE ARTS · BUILD 121" title="Prepare the people and the room." description="Track what needs review before a hands-on instrument or voice mentorship pilot can be considered." />
    <PreviewNotice />
    <Card title="Preparation is not approval" description="A gathered material status only means there is something for leadership to check. Do not put student names, contact details, medical information, or screening records into these notes." />
    {!loaded ? <Body>Loading mentor preparation…</Body> : storageError || !record ? <Card title="Saved preparation unavailable" description="Existing device data could not be read. Editing is disabled to protect it." /> : <>
      <SectionHeader title={`${gathered} of ${mentorReadinessChecks.length} areas have material`} />
      {mentorReadinessChecks.map(item => <View key={item.id} style={styles.card}>
        <Text style={styles.cardTitle}>{item.title}</Text><Body>{item.cue}</Body>
        <View accessibilityRole="radiogroup" accessibilityLabel={`${item.title} preparation status`} style={local.options}>{statuses.map(status => <Pressable key={status} accessibilityRole="radio" accessibilityState={{ checked: record[item.id].status === status }} onPress={() => update(item.id, { status })} style={[local.option, record[item.id].status === status && local.selected]}><Text style={[local.optionText, record[item.id].status === status && local.selectedText]}>{status}</Text></Pressable>)}</View>
        <Field label={`${item.title} · evidence or next step`} value={record[item.id].note} onChangeText={value => update(item.id, { note: value })} maxLength={300} multiline placeholder="Keep notes about the process, not individual students." />
      </View>)}
      <ActionButton label="Save mentor preparation on this device" disabled={busy} onPress={() => { void save(); }} />
      <SectionHeader title="Internal preparation draft" /><Text selectable style={styles.card}>{formatMentorReadiness(record)}</Text>
      <ActionButton label="Copy mentor preparation draft" disabled={busy} secondary onPress={() => { void copy(); }} />
    </>}
    <Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Review the four-session pilot" href="/sta-mentor-pilot" secondary /><Button label="Return to Save the Arts" href="/save-the-arts" secondary /><Footer />
  </Screen>;
}
const local = StyleSheet.create({
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 12, paddingVertical: 10, justifyContent: 'center' },
  selected: { backgroundColor: theme.colors.gold, borderColor: theme.colors.gold },
  optionText: { color: theme.colors.cream, fontSize: 14 }, selectedText: { color: theme.colors.background },
});
