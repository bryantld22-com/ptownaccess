import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Text } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { emptyMarketingBrief, formatMarketingBrief, MARKETING_BRIEF_KEY, MARKETING_BRIEF_LIMIT, marketingBriefComplete, readMarketingBrief, type MarketingBriefRecord } from '../src/utils/marketingBrief';

export default function MarketingBrief() {
  const [draft, setDraft] = useState<MarketingBriefRecord>(emptyMarketingBrief);
  const [baseline, setBaseline] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void AsyncStorage.getItem(MARKETING_BRIEF_KEY).then(raw => { setDraft(readMarketingBrief(raw)); setBaseline(raw); }).catch(() => setStorageError(true)).finally(() => setLoaded(true)); }, []);
  const complete = marketingBriefComplete(draft);
  const filled = Object.values(draft).filter(value => value.trim()).length;
  const brief = formatMarketingBrief(draft);
  function update(field: keyof MarketingBriefRecord, value: string) { setDraft(current => ({ ...current, [field]: value })); setMessage(null); setError(null); }
  async function save() {
    if (!loaded || storageError) return;
    setBusy(true); setMessage(null); setError(null);
    try {
      const current = await AsyncStorage.getItem(MARKETING_BRIEF_KEY);
      if (current !== baseline) throw new Error('Brief changed');
      const next = JSON.stringify(draft);
      await AsyncStorage.setItem(MARKETING_BRIEF_KEY, next); setBaseline(next);
      setMessage('Campaign brief saved on this device. It remains an unapproved draft.');
    } catch { setError('Saving failed or another tab changed this brief. Existing data was kept; reload to review it.'); }
    finally { setBusy(false); }
  }
  async function copy() {
    setMessage(null); setError(null);
    if (!complete) { setError('Complete all six fields before copying the campaign brief.'); return; }
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(brief);
      } else if (!await Clipboard.setStringAsync(brief)) throw new Error('Clipboard unavailable');
      setMessage('Campaign draft copied. Nothing was submitted or approved.');
    } catch { setError('Copy is unavailable. Select the preview and copy it manually.'); }
  }
  return <Screen>
    <Stack.Screen options={{ title: 'Marketing Campaign Brief' }} />
    <PageHeader eyebrow="PTOWN MARKETING & BRAND · BUILD 98" title="Give each campaign a clear job." description="Draft the audience, promise, owner, action, and success measure before production begins." />
    <PreviewNotice />
    <Card title="Device-local working draft" description="Save this campaign brief on this device and return to it later. No account sync, Media Group handoff, approval, or publication takes place. Avoid personal contact details and confidential financial terms." />
    {!loaded ? <Body>Loading campaign brief…</Body> : storageError ? <Card title="Saved brief unavailable" description="The existing device record could not be read. Editing is disabled to protect it." /> : <>
      <SectionHeader title="Campaign essentials" />
      <Field label="Campaign name" value={draft.campaign} onChangeText={value => update('campaign', value)} maxLength={MARKETING_BRIEF_LIMIT} placeholder="For example: Wednesday Artist Discovery" />
      <Field label="Intended audience" value={draft.audience} onChangeText={value => update('audience', value)} maxLength={MARKETING_BRIEF_LIMIT} placeholder="Who should hear about it?" />
      <Field label="Campaign objective" value={draft.objective} onChangeText={value => update('objective', value)} maxLength={MARKETING_BRIEF_LIMIT} placeholder="What should the campaign accomplish?" />
      <Field label="Responsible owner" value={draft.owner} onChangeText={value => update('owner', value)} maxLength={MARKETING_BRIEF_LIMIT} placeholder="Role or named staff member" />
      <Field label="Guest action" value={draft.action} onChangeText={value => update('action', value)} maxLength={MARKETING_BRIEF_LIMIT} placeholder="Explore, RSVP, reserve, or attend when enabled" />
      <Field label="Success measure" value={draft.measure} onChangeText={value => update('measure', value)} maxLength={MARKETING_BRIEF_LIMIT} placeholder="An observable outcome" />
      <ActionButton label="Save campaign draft on this device" disabled={busy} onPress={() => { void save(); }} />
      <SectionHeader title="Review draft" />
      <Text selectable style={styles.card}>{brief}</Text>
      <Body>{complete ? 'All six fields are ready for internal review.' : `${filled} of 6 fields completed.`}</Body>
      <ActionButton label="Copy campaign draft" disabled={busy || !complete} onPress={() => { void copy(); }} />
    </>}
    <Feedback message={message} />
    {error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Back up or transfer this campaign draft" href="/marketing-brief-backup" secondary />
    <Button label="Return to Marketing & Brand" href="/marketing" secondary />
    <Footer />
  </Screen>;
}
