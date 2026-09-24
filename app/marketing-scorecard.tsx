import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Platform, Text } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { formatBudgetCents, parseBudgetCents } from '../src/data/marketingBudget';
import { campaignScorecard, parseCampaignCount, rate } from '../src/data/marketingScorecard';

const measures = [
  { key: 'reach', label: 'Campaign reach', hint: 'Platform or distribution reach for the same reporting period.' },
  { key: 'visits', label: 'Program-page visits', hint: 'Visits to the tracked program or campaign page.' },
  { key: 'optIns', label: 'Confirmed opt-ins', hint: 'People who explicitly chose to receive relevant updates.' },
  { key: 'attendance', label: 'Verified attendance', hint: 'Confirmed check-ins or reconciled attendance, not clicks.' },
  { key: 'repeatAttendance', label: 'Returning attendees', hint: 'Attendees known to have visited PTown before.' },
] as const;

export default function MarketingScorecard() {
  const [label, setLabel] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});
  const [spend, setSpend] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const parsed = measures.map(item => parseCampaignCount(values[item.key] ?? ''));
  const spendCents = spend.trim() ? parseBudgetCents(spend) : null;
  const ready = label.trim().length > 0 && parsed.every(value => value !== null) && (!spend.trim() || spendCents !== null);
  const [reach, visits, optIns, attendance, repeatAttendance] = parsed;
  const inconsistent = ready && (
    visits! > reach! || optIns! > visits! || repeatAttendance! > attendance!
  );
  const report = ready && !inconsistent ? campaignScorecard(label, { reach: reach!, visits: visits!, optIns: optIns!, attendance: attendance!, repeatAttendance: repeatAttendance! }, spendCents) : null;
  function edit(key: string, value: string) {
    setValues(current => ({ ...current, [key]: value }));
    setMessage(null); setError(null);
  }
  async function copy() {
    setMessage(null); setError(null);
    if (!report) { setError('Complete the reporting period and all five counts, then resolve any inconsistent figures.'); return; }
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(report);
      } else if (!await Clipboard.setStringAsync(report)) throw new Error('Clipboard unavailable');
      setMessage('Scorecard copied. Figures were not verified or submitted.');
    } catch { setError('Copy is unavailable. Select the scorecard and copy it manually.'); }
  }

  return <Screen>
    <Stack.Screen options={{ title: 'Marketing Campaign Scorecard' }} />
    <PageHeader eyebrow="PTOWN MARKETING & BRAND · BUILD 71" title="See what a campaign actually produced." description="Compare reported reach, interest, attendance, repeat visits, and spend before deciding what to repeat." />
    <PreviewNotice />
    <Card title="Temporary internal scorecard" description="No metrics are connected yet. Enter verified counts for one period. This screen does not save them or claim that marketing alone caused attendance." />
    <Field label="Campaign or reporting period" value={label} onChangeText={value => { setLabel(value); setMessage(null); }} maxLength={120} placeholder="For example: Thursday comedy launch week" />
    <SectionHeader title="Reported outcomes" />
    {measures.map(item => <Field key={item.key} label={item.label} value={values[item.key] ?? ''} onChangeText={value => edit(item.key, value)} keyboardType="number-pad" maxLength={13} placeholder="0" hint={item.hint} error={(values[item.key] ?? '').trim() && parseCampaignCount(values[item.key]) === null ? 'Enter a whole number from zero to one billion.' : undefined} />)}
    <Field label="Campaign spend in dollars (optional)" value={spend} onChangeText={value => { setSpend(value); setMessage(null); }} keyboardType="decimal-pad" maxLength={14} placeholder="0.00" error={spend.trim() && spendCents === null ? 'Enter zero or a positive amount with no more than two decimal places.' : undefined} />
    {inconsistent && <Text accessibilityRole="alert" style={formStyles.error}>Check the counts: page visits cannot exceed reported reach, opt-ins cannot exceed visits, and returning attendees cannot exceed attendance in this worksheet.</Text>}
    <SectionHeader title="Scorecard" />
    {report ? <>
      <Card title={`Program-page visit rate: ${rate(visits!, reach!)}`} description={`Opt-in rate: ${rate(optIns!, visits!)}. Attendance per page visit: ${rate(attendance!, visits!)}. Returning share: ${rate(repeatAttendance!, attendance!)}.${spendCents !== null ? ` Spend per attendee: ${attendance! > 0 ? formatBudgetCents(Math.round(spendCents / attendance!)) : 'N/A'}.` : ''}`} />
      <Text selectable style={styles.card}>{report}</Text>
    </> : <Body>Complete the reporting period and all five counts to review the scorecard. Use zero where a verified count is zero.</Body>}
    <ActionButton label="Copy campaign scorecard" onPress={() => { void copy(); }} />
    <Feedback message={message} />
    {error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Return to Marketing & Brand" href="/marketing" secondary />
    <Footer />
  </Screen>;
}
