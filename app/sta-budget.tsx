import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { formatStaBudget, parseStaDollars, staBudgetLines, staMoney, summarizeStaBudget, type StaBudgetId, type StaBudgetValues } from '../src/data/staBudget';

const initial = Object.fromEntries(staBudgetLines.map(line => [line.id, { request: '', other: '' }])) as StaBudgetValues;
export default function StaBudget() {
  const [program, setProgram] = useState('');
  const [values, setValues] = useState<StaBudgetValues>(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const total = summarizeStaBudget(values);
  const report = program.trim() && total?.total ? formatStaBudget(program, values) : null;
  function update(id: StaBudgetId, field: 'request' | 'other', value: string) { setValues(current => ({ ...current, [id]: { ...current[id], [field]: value } })); setMessage(null); }
  async function copy() {
    setMessage(null); setError(null);
    if (!report) { setError('Enter a program and at least one valid cost. Amounts use dollars and up to two decimal places.'); return; }
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(report);
      } else if (!await Clipboard.setStringAsync(report)) throw new Error('Clipboard unavailable');
      setMessage('Working Save the Arts budget copied. No grant request was submitted.');
    } catch { setError('Copy is unavailable. Select the budget and copy it manually.'); }
  }
  return <Screen>
    <Stack.Screen options={{ title: 'Save the Arts Working Budget' }} />
    <PageHeader eyebrow="SAVE THE ARTS · BUILD 91" title="Put a cost beside the program." description="Estimate a proposed grant request and other planned support by category for a Save the Arts pilot." />
    <PreviewNotice />
    <Card title="Working numbers for discussion" description="These entries are estimates, not verified eligible expenses, committed match, or a grant award. Use a detailed line-item budget and current funder instructions before applying." />
    <Field label="Proposed program or pilot" value={program} onChangeText={setProgram} maxLength={160} placeholder="Saturday arts sessions or a defined Heritage Tour pilot" />
    <SectionHeader title="Cost categories" /><Body>Enter nonnegative dollar amounts without a dollar sign or commas. Leave a category blank if it does not apply.</Body>
    {staBudgetLines.map(line => <View key={line.id} style={styles.card}>
      <Text style={styles.cardTitle}>{line.label}</Text><Body>{line.cue}</Body>
      <Field label={`${line.label} · proposed grant request`} value={values[line.id].request} onChangeText={value => update(line.id, 'request', value)} maxLength={12} keyboardType="decimal-pad" placeholder="0.00" error={parseStaDollars(values[line.id].request) === null ? 'Enter 0–9,999,999.99 with at most two decimals.' : undefined} />
      <Field label={`${line.label} · other planned support`} value={values[line.id].other} onChangeText={value => update(line.id, 'other', value)} maxLength={12} keyboardType="decimal-pad" placeholder="0.00" error={parseStaDollars(values[line.id].other) === null ? 'Enter 0–9,999,999.99 with at most two decimals.' : undefined} />
    </View>)}
    <SectionHeader title="Working totals" />
    {total ? <Card title={`Program cost · ${staMoney(total.total)}`} description={`Proposed grant request: ${staMoney(total.request)}\nOther planned support: ${staMoney(total.other)}\nOther support is not counted as a funder-required match until its source and the funder’s rules are verified.`} /> : <Card title="Correct amount entries" description="All lines must use valid nonnegative dollar amounts before totals can be calculated." />}
    <SectionHeader title="Internal budget draft" />{report ? <Text selectable style={styles.card}>{report}</Text> : <Body>Enter the program and a valid cost to preview the draft.</Body>}
    <ActionButton label="Copy working Save the Arts budget" onPress={() => { void copy(); }} /><Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Prepare the grant-meeting brief" href="/sta-grant-brief" secondary /><Button label="Review Save the Arts leadership" href="/save-the-arts-leadership" secondary /><Footer />
  </Screen>;
}
