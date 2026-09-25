import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Text } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { formatBudgetCents, formatBudgetWorksheet, parseBudgetCents } from '../src/data/marketingBudget';
import { budgetLines } from '../src/data/marketingOperations';
import { MARKETING_BUDGET_KEY, readMarketingBudgetPlan } from '../src/utils/marketingBudgetPlan';

export default function MarketingBudget() {
  const [ceiling, setCeiling] = useState('');
  const [amounts, setAmounts] = useState<string[]>(budgetLines.map(() => ''));
  const [baseline, setBaseline] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  useEffect(() => { void AsyncStorage.getItem(MARKETING_BUDGET_KEY).then(raw => { const saved = readMarketingBudgetPlan(raw); if (saved) { setCeiling(saved.ceiling); setAmounts(saved.amounts); } setBaseline(raw); }).catch(() => setStorageError(true)).finally(() => setLoaded(true)); }, []);
  const total = parseBudgetCents(ceiling);
  const parsed = amounts.map(value => value.trim() ? parseBudgetCents(value) : 0);
  const invalidLine = parsed.findIndex(value => value === null);
  const allocated = parsed.reduce<number>((sum, value) => sum + (value ?? 0), 0);
  const valid = total !== null && total > 0 && invalidLine === -1;
  const report = valid ? formatBudgetWorksheet(total, parsed as number[]) : null;
  function editLine(index: number, value: string) {
    setAmounts(current => current.map((amount, i) => i === index ? value : amount));
    setMessage(null); setCopyError(null);
  }
  async function save() {
    if (!loaded || storageError || !valid) return;
    setBusy(true); setMessage(null); setCopyError(null);
    try {
      const latest = await AsyncStorage.getItem(MARKETING_BUDGET_KEY);
      if (latest !== baseline) throw new Error('Budget changed');
      const next = JSON.stringify({ ceiling, amounts });
      await AsyncStorage.setItem(MARKETING_BUDGET_KEY, next); setBaseline(next);
      setMessage('Planning budget saved on this device. No funds were approved or committed.');
    } catch { setCopyError('Saving failed or another tab changed this budget. Existing data was kept; reload to review it.'); }
    finally { setBusy(false); }
  }
  async function copy() {
    setMessage(null); setCopyError(null);
    if (!report) { setCopyError('Enter a positive planning ceiling and valid amounts before copying.'); return; }
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(report);
      } else if (!await Clipboard.setStringAsync(report)) throw new Error('Clipboard unavailable');
      setMessage('Budget worksheet copied. No funds were requested, committed, or approved.');
    } catch { setCopyError('Copy is unavailable. Select the worksheet text and copy it manually.'); }
  }

  return <Screen>
    <Stack.Screen options={{ title: 'Marketing Budget Worksheet' }} />
    <PageHeader eyebrow="PTOWN MARKETING & BRAND · BUILD 110" title="Give every marketing dollar an owner." description="Allocate a planning ceiling across the department’s budget lines and spot a gap before approval." />
    <PreviewNotice />
    <Card title="Device-local planning worksheet" description="You can save draft amounts on this device. This page does not authorize purchases, commit funds, or confirm available funding. Finance still needs to verify and approve the figures." />
    {!loaded ? <Body>Loading budget worksheet…</Body> : storageError ? <Card title="Saved budget unavailable" description="Existing device data could not be read. Editing is disabled to protect it." /> : <>
    <Field label="Planning ceiling in dollars" value={ceiling} onChangeText={value => { setCeiling(value); setMessage(null); setCopyError(null); }} keyboardType="decimal-pad" maxLength={14} placeholder="For example: 25000.00" hint="Enter a proposed planning ceiling. No default amount or funding approval is assumed." error={ceiling.trim() && (total === null || total === 0) ? 'Enter a positive amount with no more than two decimal places.' : undefined} />
    <SectionHeader title="Allocate by budget line" />
    {budgetLines.map((line, index) => <Field key={line} label={line} value={amounts[index]} onChangeText={value => editLine(index, value)} keyboardType="decimal-pad" maxLength={14} placeholder="0.00" error={amounts[index].trim() && parsed[index] === null ? 'Enter zero or a positive amount with no more than two decimal places.' : undefined} />)}
    <SectionHeader title="Live balance" />
    {valid ? <>
      <Card title={`Planning ceiling: ${formatBudgetCents(total)}`} description={`Allocated: ${formatBudgetCents(allocated)}. ${allocated > total ? `Over ceiling by ${formatBudgetCents(allocated - total)}. Revise the lines or seek a new approval.` : `Unallocated: ${formatBudgetCents(total - allocated)}.`}`} />
      <Text selectable style={styles.card}>{report}</Text>
    </> : <Body>Enter a positive ceiling and valid line amounts to calculate the balance. Blank lines count as zero.</Body>}
    <ActionButton label="Save planning budget on this device" disabled={busy || !valid} onPress={() => { void save(); }} />
    <ActionButton label="Copy budget worksheet" disabled={busy || !valid} secondary onPress={() => { void copy(); }} />
    </>}
    <Feedback message={message} />
    {copyError && <Text accessibilityRole="alert" style={formStyles.error}>{copyError}</Text>}
    <Button label="Back up or restore planning budget" href="/marketing-budget-backup" secondary />
    <Button label="Return to Marketing & Brand" href="/marketing" secondary />
    <Footer />
  </Screen>;
}
