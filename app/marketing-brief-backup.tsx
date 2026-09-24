import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Text } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { formatMarketingBrief, MARKETING_BRIEF_KEY, readMarketingBrief, type MarketingBriefRecord } from '../src/utils/marketingBrief';
import { createMarketingBriefTransfer, MAX_MARKETING_BRIEF_TRANSFER, readMarketingBriefTransfer } from '../src/utils/marketingBriefTransfer';

const labels: { key: keyof MarketingBriefRecord; title: string }[] = [
  { key: 'campaign', title: 'Campaign' }, { key: 'audience', title: 'Audience' }, { key: 'objective', title: 'Objective' },
  { key: 'owner', title: 'Responsible owner' }, { key: 'action', title: 'Guest action' }, { key: 'measure', title: 'Success measure' },
];
export default function MarketingBriefBackup() {
  const [current, setCurrent] = useState<MarketingBriefRecord | null>(null);
  const [baseline, setBaseline] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [incoming, setIncoming] = useState<MarketingBriefRecord | null>(null);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void AsyncStorage.getItem(MARKETING_BRIEF_KEY).then(raw => { setCurrent(readMarketingBrief(raw)); setBaseline(raw); }).catch(() => setStorageError(true)).finally(() => setReady(true)); }, []);
  const code = current && baseline ? createMarketingBriefTransfer(current) : '';
  async function copy() {
    setBusy(true); setMessage(null); setError(null);
    try {
      if (!code) throw new Error('No saved brief');
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(code);
      } else if (!await Clipboard.setStringAsync(code)) throw new Error('Clipboard unavailable');
      setMessage('Marketing brief transfer code copied. Keep internal plans private.');
    } catch { setError('Copy is unavailable. Select the full code and copy it manually.'); }
    finally { setBusy(false); }
  }
  function review() {
    setIncoming(null); setMessage(null); setError(null);
    try { setIncoming(readMarketingBriefTransfer(input)); }
    catch { setError('The transfer code could not be validated. The current brief is unchanged.'); }
  }
  async function replace() {
    if (!incoming || !ready || storageError) return;
    setBusy(true); setMessage(null); setError(null);
    try {
      const latest = await AsyncStorage.getItem(MARKETING_BRIEF_KEY);
      if (latest !== baseline) throw new Error('Brief changed');
      const next = JSON.stringify(incoming);
      await AsyncStorage.setItem(MARKETING_BRIEF_KEY, next);
      setCurrent(incoming); setBaseline(next); setIncoming(null); setInput('');
      setMessage('Reviewed campaign draft replaced on this device. Nothing was published or sent.');
    } catch { setError('Replacement failed or the current brief changed. Existing data was kept; reload to review it.'); }
    finally { setBusy(false); }
  }
  return <Screen>
    <Stack.Screen options={{ title: 'Marketing Campaign Brief Transfer' }} />
    <PageHeader eyebrow="PTOWN MARKETING & BRAND · BUILD 99" title="Carry the campaign draft with you." description="Review all six incoming fields before replacing the saved brief on another device." />
    <PreviewNotice />
    <Card title="Private working code" description="The code contains the campaign strategy and proposed owner in plain text. Keep a secure copy and share only with the intended team. It does not sync or publish a campaign." />
    <SectionHeader title="Back up this device" />
    {!ready ? <Body>Loading campaign draft…</Body> : storageError ? <Card title="Saved brief unavailable" description="Current data could not be read. Replacement is disabled to protect it." /> : code ? <><ActionButton label="Copy campaign brief transfer code" disabled={busy} onPress={() => { void copy(); }} /><Field label="Private campaign brief transfer code" value={code} multiline editable={false} style={{ minHeight: 170, textAlignVertical: 'top', fontSize: 12 }} /></> : <Card title="No saved brief yet" description="Save a campaign brief before creating a transfer code. An incoming code can still be reviewed below." />}
    <SectionHeader title="Review an incoming code" />
    <Field label="Paste a campaign brief transfer code" value={input} onChangeText={value => { setInput(value); setIncoming(null); setMessage(null); setError(null); }} maxLength={MAX_MARKETING_BRIEF_TRANSFER} multiline autoCapitalize="none" autoCorrect={false} style={{ minHeight: 170, textAlignVertical: 'top' }} />
    <ActionButton label="Review incoming campaign brief" disabled={!ready || storageError || busy || !input.trim()} secondary onPress={review} />
    {incoming && <><Card title="Review before replacement" description={`This will replace the ${baseline ? 'saved' : 'empty'} campaign brief on this device. The two drafts are not merged.`} />{labels.map(field => <Card key={field.key} title={field.title} description={`CURRENT: ${current?.[field.key] || 'Not entered'}\nINCOMING: ${incoming[field.key] || 'Not entered'}`} />)}<ActionButton label="Replace current brief with reviewed draft" disabled={busy} onPress={() => { void replace(); }} /><Text selectable style={styles.card}>{formatMarketingBrief(incoming)}</Text></>}
    <Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Return to campaign brief" href="/marketing-brief" secondary /><Footer />
  </Screen>;
}
