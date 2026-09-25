import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Text } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { formatBudgetCents, parseBudgetCents } from '../src/data/marketingBudget';
import { campaignScorecard } from '../src/data/marketingScorecard';
import { MARKETING_SCORECARD_KEY, readMarketingScorecardPlan, type MarketingScorecardPlan } from '../src/utils/marketingScorecardPlan';
import { createMarketingScorecardTransfer, MAX_MARKETING_SCORECARD_TRANSFER, readMarketingScorecardTransfer } from '../src/utils/marketingScorecardTransfer';

function summary(plan: MarketingScorecardPlan) {
  return campaignScorecard(plan.label, plan.counts, plan.spend.trim() ? parseBudgetCents(plan.spend) : null);
}
export default function MarketingScorecardBackup() {
  const [current, setCurrent] = useState<MarketingScorecardPlan | null>(null);
  const [baseline, setBaseline] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [incoming, setIncoming] = useState<MarketingScorecardPlan | null>(null);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void AsyncStorage.getItem(MARKETING_SCORECARD_KEY).then(raw => { setCurrent(readMarketingScorecardPlan(raw)); setBaseline(raw); }).catch(() => setStorageError(true)).finally(() => setReady(true)); }, []);
  const code = current && baseline ? createMarketingScorecardTransfer(current) : '';
  async function copy() {
    setBusy(true); setMessage(null); setError(null);
    try {
      if (!code) throw new Error('No saved scorecard');
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(code);
      } else if (!await Clipboard.setStringAsync(code)) throw new Error('Clipboard unavailable');
      setMessage('Scorecard transfer code copied. Keep internal campaign figures private.');
    } catch { setError('Copy is unavailable. Select the full code and copy it manually.'); }
    finally { setBusy(false); }
  }
  function review() {
    setIncoming(null); setMessage(null); setError(null);
    try { setIncoming(readMarketingScorecardTransfer(input)); }
    catch { setError('The transfer code could not be validated. The current scorecard is unchanged.'); }
  }
  async function replace() {
    if (!incoming || !ready || storageError) return;
    setBusy(true); setMessage(null); setError(null);
    try {
      const latest = await AsyncStorage.getItem(MARKETING_SCORECARD_KEY);
      if (latest !== baseline) throw new Error('Scorecard changed');
      const next = JSON.stringify(incoming);
      await AsyncStorage.setItem(MARKETING_SCORECARD_KEY, next);
      setCurrent(incoming); setBaseline(next); setIncoming(null); setInput('');
      setMessage('Reviewed draft scorecard replaced on this device. Figures remain unverified.');
    } catch { setError('Replacement failed or the saved scorecard changed. Existing data was kept; reload to review it.'); }
    finally { setBusy(false); }
  }
  return <Screen>
    <Stack.Screen options={{ title: 'Marketing Scorecard Transfer' }} />
    <PageHeader eyebrow="PTOWN MARKETING & BRAND · BUILD 109" title="Carry the scorecard draft with you." description="Review the incoming counts and spend before replacing a saved scorecard on another device." />
    <PreviewNotice />
    <Card title="Private working code" description="The code contains campaign figures in plain text. Keep it secure. It transfers one draft; it does not sync records or verify results." />
    <SectionHeader title="Back up this device" />
    {!ready ? <Body>Loading scorecard…</Body> : storageError ? <Card title="Saved scorecard unavailable" description="Current data could not be read. Replacement is disabled to protect it." /> : code ? <><ActionButton label="Copy scorecard transfer code" disabled={busy} onPress={() => { void copy(); }} /><Field label="Private scorecard transfer code" value={code} multiline editable={false} style={{ minHeight: 170, textAlignVertical: 'top', fontSize: 12 }} /></> : <Card title="No saved scorecard yet" description="Save a scorecard to create a transfer code. You can review an incoming code below." />}
    <SectionHeader title="Review an incoming code" />
    <Field label="Paste a scorecard transfer code" value={input} onChangeText={value => { setInput(value); setIncoming(null); setMessage(null); setError(null); }} maxLength={MAX_MARKETING_SCORECARD_TRANSFER} multiline autoCapitalize="none" autoCorrect={false} style={{ minHeight: 170, textAlignVertical: 'top' }} />
    <ActionButton label="Review incoming scorecard" disabled={!ready || storageError || busy || !input.trim()} secondary onPress={review} />
    {incoming && <><Card title="Review before replacement" description={`This will replace the ${baseline ? 'saved' : 'empty'} scorecard on this device. Drafts are not merged.`} /><Card title="Current draft" description={current ? `${current.label}: attendance ${current.counts.attendance.toLocaleString('en-US')}; spend ${current.spend.trim() ? formatBudgetCents(parseBudgetCents(current.spend)!) : 'not entered'}.` : 'No saved draft.'} /><Text selectable style={styles.card}>{summary(incoming)}</Text><ActionButton label="Replace current scorecard with reviewed draft" disabled={busy} onPress={() => { void replace(); }} /></>}
    <Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Return to campaign scorecard" href="/marketing-scorecard" secondary /><Footer />
  </Screen>;
}
