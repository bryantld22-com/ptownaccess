import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Text } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { formatBudgetCents, formatBudgetWorksheet } from '../src/data/marketingBudget';
import { MARKETING_BUDGET_KEY, marketingBudgetTotals, readMarketingBudgetPlan, type MarketingBudgetPlan } from '../src/utils/marketingBudgetPlan';
import { createMarketingBudgetTransfer, MAX_MARKETING_BUDGET_TRANSFER, readMarketingBudgetTransfer } from '../src/utils/marketingBudgetTransfer';

export default function MarketingBudgetBackup() {
  const [current, setCurrent] = useState<MarketingBudgetPlan | null>(null);
  const [baseline, setBaseline] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [incoming, setIncoming] = useState<MarketingBudgetPlan | null>(null);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void AsyncStorage.getItem(MARKETING_BUDGET_KEY).then(raw => { setCurrent(readMarketingBudgetPlan(raw)); setBaseline(raw); }).catch(() => setStorageError(true)).finally(() => setReady(true)); }, []);
  const code = current && baseline ? createMarketingBudgetTransfer(current) : '';
  async function copy() {
    setBusy(true); setMessage(null); setError(null);
    try {
      if (!code) throw new Error('No saved budget');
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(code);
      } else if (!await Clipboard.setStringAsync(code)) throw new Error('Clipboard unavailable');
      setMessage('Budget transfer code copied. Keep internal planning figures private.');
    } catch { setError('Copy is unavailable. Select the full code and copy it manually.'); }
    finally { setBusy(false); }
  }
  function review() {
    setIncoming(null); setMessage(null); setError(null);
    try { setIncoming(readMarketingBudgetTransfer(input)); }
    catch { setError('The transfer code could not be validated. The current budget is unchanged.'); }
  }
  async function replace() {
    if (!incoming || !ready || storageError) return;
    setBusy(true); setMessage(null); setError(null);
    try {
      const latest = await AsyncStorage.getItem(MARKETING_BUDGET_KEY);
      if (latest !== baseline) throw new Error('Budget changed');
      const next = JSON.stringify(incoming);
      await AsyncStorage.setItem(MARKETING_BUDGET_KEY, next);
      setCurrent(incoming); setBaseline(next); setIncoming(null); setInput('');
      setMessage('Reviewed planning budget replaced on this device. No funds were approved or committed.');
    } catch { setError('Replacement failed or the saved budget changed. Existing data was kept; reload to review it.'); }
    finally { setBusy(false); }
  }
  const incomingTotals = incoming ? marketingBudgetTotals(incoming) : null;
  const currentTotals = current ? marketingBudgetTotals(current) : null;
  return <Screen>
    <Stack.Screen options={{ title: 'Marketing Budget Transfer' }} />
    <PageHeader eyebrow="PTOWN MARKETING & BRAND · BUILD 110" title="Carry the planning budget with you." description="Review the incoming ceiling, all budget lines, and any overage before replacing saved figures on another device." />
    <PreviewNotice />
    <Card title="Private working code" description="The code contains planning amounts in plain text. Keep it secure. It transfers one draft; it does not sync records or approve funding." />
    <SectionHeader title="Back up this device" />
    {!ready ? <Body>Loading planning budget…</Body> : storageError ? <Card title="Saved budget unavailable" description="Current data could not be read. Replacement is disabled to protect it." /> : code ? <><ActionButton label="Copy planning budget transfer code" disabled={busy} onPress={() => { void copy(); }} /><Field label="Private budget transfer code" value={code} multiline editable={false} style={{ minHeight: 170, textAlignVertical: 'top', fontSize: 12 }} /></> : <Card title="No saved budget yet" description="Save a planning budget to create a transfer code. You can review an incoming code below." />}
    <SectionHeader title="Review an incoming code" />
    <Field label="Paste a budget transfer code" value={input} onChangeText={value => { setInput(value); setIncoming(null); setMessage(null); setError(null); }} maxLength={MAX_MARKETING_BUDGET_TRANSFER} multiline autoCapitalize="none" autoCorrect={false} style={{ minHeight: 170, textAlignVertical: 'top' }} />
    <ActionButton label="Review incoming budget" disabled={!ready || storageError || busy || !input.trim()} secondary onPress={review} />
    {incoming && incomingTotals && <><Card title="Review before replacement" description={`This will replace the ${baseline ? 'saved' : 'empty'} planning budget on this device. Drafts are not merged.`} /><Card title="Current draft" description={currentTotals ? `Ceiling ${formatBudgetCents(currentTotals.ceiling)}; allocated ${formatBudgetCents(currentTotals.allocated)}.` : 'No saved draft.'} /><Card title="Incoming draft" description={`Ceiling ${formatBudgetCents(incomingTotals.ceiling)}; allocated ${formatBudgetCents(incomingTotals.allocated)}. ${incomingTotals.allocated > incomingTotals.ceiling ? `Over ceiling by ${formatBudgetCents(incomingTotals.allocated - incomingTotals.ceiling)}.` : `Unallocated ${formatBudgetCents(incomingTotals.ceiling - incomingTotals.allocated)}.`}`} /><Text selectable style={styles.card}>{formatBudgetWorksheet(incomingTotals.ceiling, incomingTotals.allocations)}</Text><ActionButton label="Replace current budget with reviewed draft" disabled={busy} onPress={() => { void replace(); }} /></>}
    <Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Return to planning budget" href="/marketing-budget" secondary /><Footer />
  </Screen>;
}
