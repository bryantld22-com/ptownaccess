import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { MARKETING_BRIEF_KEY, marketingBriefComplete, readMarketingBrief } from '../src/utils/marketingBrief';
import { formatMarketingLaunchReview, MARKETING_LAUNCH_REVIEW_KEY, marketingLaunchChecks, marketingLaunchStatuses, newMarketingLaunchReview, readMarketingLaunchReview, type MarketingLaunchId, type MarketingLaunchReview, type MarketingLaunchStatus } from '../src/utils/marketingLaunchReview';
import { theme } from '../src/theme';

export default function MarketingLaunchReviewPage() {
  const [briefRaw, setBriefRaw] = useState<string | null>(null);
  const [baseline, setBaseline] = useState<string | null>(null);
  const [record, setRecord] = useState<MarketingLaunchReview | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void Promise.all([AsyncStorage.getItem(MARKETING_BRIEF_KEY), AsyncStorage.getItem(MARKETING_LAUNCH_REVIEW_KEY)]).then(([brief, review]) => {
    if (brief !== null) readMarketingBrief(brief);
    setRecord(readMarketingLaunchReview(review)); setBriefRaw(brief); setBaseline(review);
  }).catch(() => setStorageError(true)).finally(() => setLoaded(true)); }, []);
  const hasBrief = briefRaw !== null && marketingBriefComplete(readMarketingBrief(briefRaw));
  const matched = !!record && record.sourceBrief === briefRaw;
  const active = matched ? record : null;
  const gathered = active ? marketingLaunchChecks.filter(item => active.checks[item.id].status === 'Evidence gathered').length : 0;
  function update(id: MarketingLaunchId, value: Partial<MarketingLaunchReview['checks'][MarketingLaunchId]>) {
    setRecord(current => current ? { ...current, checks: { ...current.checks, [id]: { ...current.checks[id], ...value } } } : current);
    setMessage(null); setError(null);
  }
  async function start() {
    if (!briefRaw || !hasBrief || storageError) return;
    setBusy(true); setMessage(null); setError(null);
    try {
      const [latestBrief, latestReview] = await Promise.all([AsyncStorage.getItem(MARKETING_BRIEF_KEY), AsyncStorage.getItem(MARKETING_LAUNCH_REVIEW_KEY)]);
      if (latestBrief !== briefRaw || latestReview !== baseline) throw new Error('Records changed');
      const next = newMarketingLaunchReview(briefRaw);
      const raw = JSON.stringify(next);
      await AsyncStorage.setItem(MARKETING_LAUNCH_REVIEW_KEY, raw);
      setRecord(next); setBaseline(raw);
      setMessage('A fresh verification draft was started for this saved campaign brief.');
    } catch { setError('The brief or review changed. Reload before starting a new verification draft.'); }
    finally { setBusy(false); }
  }
  async function save() {
    if (!active || storageError) return;
    setBusy(true); setMessage(null); setError(null);
    try {
      const [latestBrief, latestReview] = await Promise.all([AsyncStorage.getItem(MARKETING_BRIEF_KEY), AsyncStorage.getItem(MARKETING_LAUNCH_REVIEW_KEY)]);
      if (latestBrief !== briefRaw || latestReview !== baseline) throw new Error('Records changed');
      const raw = JSON.stringify(active);
      await AsyncStorage.setItem(MARKETING_LAUNCH_REVIEW_KEY, raw); setBaseline(raw);
      setMessage('Verification notes saved on this device. No campaign was approved or published.');
    } catch { setError('The brief or review changed. Existing data was kept; reload before saving.'); }
    finally { setBusy(false); }
  }
  async function copy() {
    if (!active) return;
    setMessage(null); setError(null);
    try {
      const report = formatMarketingLaunchReview(active);
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(report);
      } else if (!await Clipboard.setStringAsync(report)) throw new Error('Clipboard unavailable');
      setMessage('Verification draft copied for internal discussion.');
    } catch { setError('Copy is unavailable. Select the draft and copy it manually.'); }
  }
  return <Screen>
    <Stack.Screen options={{ title: 'Marketing Launch Verification' }} />
    <PageHeader eyebrow="PTOWN MARKETING & BRAND · BUILD 100" title="Check the promise before promotion." description="Track seven release checks against the exact campaign brief saved on this device." />
    <PreviewNotice />
    <Card title="Evidence is not sign-off" description="Marking evidence gathered only means material is ready for a decision-maker to inspect. This screen does not authorize spend, approve assets, contact guests, or publish a campaign." />
    {!loaded ? <Body>Loading campaign review…</Body> : storageError ? <Card title="Saved review unavailable" description="Device data could not be read. Editing is disabled to protect it." /> : !hasBrief ? <Card title="Complete and save the campaign brief first" description="All six brief fields must be saved before starting a verification draft." /> : !active ? <><Card title={record ? 'Campaign brief changed' : 'No launch review started'} description={record ? 'The saved brief no longer matches this review. Starting a fresh review replaces the previous check notes on this device; select and copy anything needed from the old review shown below.' : 'Start a verification draft linked to the current saved campaign brief.'} />{record && <Text selectable style={styles.card}>{formatMarketingLaunchReview(record)}</Text>}<ActionButton label={record ? 'Replace old review with a fresh campaign review' : 'Start campaign verification draft'} disabled={busy} onPress={() => { void start(); }} /></> : <>
      <SectionHeader title={`${gathered} of ${marketingLaunchChecks.length} areas have evidence`} />
      {marketingLaunchChecks.map(item => <View key={item.id} style={styles.card}>
        <Text style={styles.cardTitle}>{item.title}</Text><Body>{item.cue}</Body>
        <View accessibilityRole="radiogroup" accessibilityLabel={`${item.title} review status`} style={local.options}>{marketingLaunchStatuses.map(status => <Pressable key={status} accessibilityRole="radio" accessibilityState={{ checked: active.checks[item.id].status === status }} onPress={() => update(item.id, { status })} style={[local.option, active.checks[item.id].status === status && local.selected]}><Text style={[local.optionText, active.checks[item.id].status === status && local.selectedText]}>{status}</Text></Pressable>)}</View>
        <Field label={`${item.title} · evidence or next step`} value={active.checks[item.id].note} onChangeText={value => update(item.id, { note: value })} maxLength={300} multiline placeholder="Who will verify the source and where is the record?" />
      </View>)}
      <ActionButton label="Save launch verification on this device" disabled={busy} onPress={() => { void save(); }} />
      <SectionHeader title="Internal discussion draft" /><Text selectable style={styles.card}>{formatMarketingLaunchReview(active)}</Text>
      <ActionButton label="Copy launch verification draft" disabled={busy} secondary onPress={() => { void copy(); }} />
    </>}
    <Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Back up or transfer launch verification" href="/marketing-launch-backup" secondary /><Button label="Return to campaign brief" href="/marketing-brief" secondary /><Footer />
  </Screen>;
}
const local = StyleSheet.create({
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 12, paddingVertical: 10, justifyContent: 'center' },
  selected: { backgroundColor: theme.colors.gold, borderColor: theme.colors.gold },
  optionText: { color: theme.colors.cream, fontSize: 14 }, selectedText: { color: theme.colors.background },
});
