import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { formatStaReadiness, initialStaReadiness, staReadinessItems, staReadinessStatuses, type StaReadinessId, type StaReadinessRecord, type StaReadinessStatus } from '../src/data/staReadiness';
import { readStaReadiness, STA_READINESS_KEY } from '../src/utils/staReadiness';
import { formatStaReadinessActions, staReadinessActions } from '../src/utils/staReadinessActions';
import { theme } from '../src/theme';

export default function StaReadiness() {
  const [record, setRecord] = useState<StaReadinessRecord>(initialStaReadiness);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [baseline, setBaseline] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void AsyncStorage.getItem(STA_READINESS_KEY).then(value => { setRecord(readStaReadiness(value)); setBaseline(value); }).catch(() => setStorageError(true)).finally(() => setLoaded(true)); }, []);
  const count = staReadinessItems.filter(item => record[item.id].status === 'Ready for review').length;
  const actions = staReadinessActions(record);
  function update(id: StaReadinessId, value: Partial<StaReadinessRecord[StaReadinessId]>) { setRecord(current => ({ ...current, [id]: { ...current[id], ...value } })); setMessage(null); }
  async function save() {
    if (!loaded || storageError) return;
    setBusy(true); setMessage(null); setError(null);
    try {
      const current = await AsyncStorage.getItem(STA_READINESS_KEY);
      if (current !== baseline) throw new Error('Status changed on device');
      const next = JSON.stringify(record);
      await AsyncStorage.setItem(STA_READINESS_KEY, next); setBaseline(next);
      setMessage('Preparation status saved on this device. No grant readiness was certified.');
    } catch { setError('The status could not be saved or changed in another tab. Existing device data was kept; reload to review it.'); }
    finally { setBusy(false); }
  }
  async function copy() {
    setMessage(null); setError(null);
    try {
      const report = formatStaReadiness(record);
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(report);
      } else if (!await Clipboard.setStringAsync(report)) throw new Error('Clipboard unavailable');
      setMessage('Preparation status copied. No application or meeting request was sent.');
    } catch { setError('Copy is unavailable. Select the status below and copy it manually.'); }
  }
  async function copyActions() {
    setMessage(null); setError(null);
    try {
      const report = formatStaReadinessActions(record);
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(report);
      } else if (!await Clipboard.setStringAsync(report)) throw new Error('Clipboard unavailable');
      setMessage('Preparation follow-up draft copied for internal review.');
    } catch { setError('Copy is unavailable. Select the follow-up draft and copy it manually.'); }
  }
  return <Screen>
    <Stack.Screen options={{ title: 'Save the Arts Preparation Status' }} />
    <PageHeader eyebrow="SAVE THE ARTS · BUILD 94" title="Know what still needs work." description="Track supporting documents and decisions for a Save the Arts grant conversation on this device." />
    <PreviewNotice />
    <Card title={`${count} of ${staReadinessItems.length} areas ready for team review`} description="This is an internal work status. It does not determine funder eligibility, nonprofit status, grant approval, or whether a meeting has been scheduled." />
    {!loaded ? <Body>Loading preparation status…</Body> : storageError ? <Card title="Saved status unavailable" description="Existing device data could not be read. Saving is disabled to avoid overwriting it." /> : <>
      <SectionHeader title="Preparation areas" />
      {staReadinessItems.map(item => <View key={item.id} style={styles.card}>
        <Text style={styles.cardTitle}>{item.title}</Text><Body>{item.cue}</Body>
        <View accessibilityRole="radiogroup" accessibilityLabel={`${item.title} status`} style={local.options}>{staReadinessStatuses.map(status => <Pressable key={status} accessibilityRole="radio" accessibilityState={{ checked: record[item.id].status === status }} onPress={() => update(item.id, { status })} style={[local.option, record[item.id].status === status && local.selected]}><Text style={[local.optionText, record[item.id].status === status && local.selectedText]}>{status}</Text></Pressable>)}</View>
        <Field label={`${item.title} · working note`} value={record[item.id].note} onChangeText={value => update(item.id, { note: value })} maxLength={400} multiline placeholder="What exists, what is missing, and who will verify it?" />
      </View>)}
      <ActionButton label="Save preparation status on this device" disabled={busy} onPress={() => { void save(); }} />
      <SectionHeader title={`Meeting follow-up · ${actions.length} areas`} />
      <Card title="Prepare the next conversation" description="The list updates as you edit. Ready for review still needs a note pointing to the material and reviewer. Propose an owner and date for each area in the assignment plan; this draft does not schedule a meeting." />
      {actions.length ? actions.map(entry => <Card key={entry.id} title={`${entry.title} · ${entry.status}`} description={`Next step: ${entry.action}\nWorking note: ${entry.note || 'No note entered'}`} />) : <Card title="All areas have a review note" description="Check the underlying records and confirm any funder-specific rules before using this draft." />}
      <Text selectable style={styles.card}>{formatStaReadinessActions(record)}</Text>
      <ActionButton label="Copy preparation follow-up draft" disabled={busy} secondary onPress={() => { void copyActions(); }} />
      <SectionHeader title="Copy status for internal review" /><Text selectable style={styles.card}>{formatStaReadiness(record)}</Text>
      <ActionButton label="Copy Save the Arts preparation status" disabled={busy} secondary onPress={() => { void copy(); }} />
    </>}
    <Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Draft proposed owners and target dates" href="/sta-assignments" secondary />
    <Button label="Back up or transfer preparation status" href="/sta-readiness-backup" secondary />
    <Button label="Prepare the grant-meeting brief" href="/sta-grant-brief" secondary /><Button label="Review the working program budget" href="/sta-budget" secondary /><Footer />
  </Screen>;
}
const local = StyleSheet.create({
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 12, paddingVertical: 10, justifyContent: 'center' },
  selected: { backgroundColor: theme.colors.gold, borderColor: theme.colors.gold },
  optionText: { color: theme.colors.cream, fontSize: 14 }, selectedText: { color: theme.colors.background },
});
