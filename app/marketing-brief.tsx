import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Platform, Text } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';

const MAX = 160;
const clean = (value: string) => value.trim().replace(/\s+/g, ' ');

export default function MarketingBrief() {
  const [campaign, setCampaign] = useState('');
  const [audience, setAudience] = useState('');
  const [objective, setObjective] = useState('');
  const [owner, setOwner] = useState('');
  const [action, setAction] = useState('');
  const [measure, setMeasure] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fields = [campaign, audience, objective, owner, action, measure].map(clean);
  const complete = fields.every(Boolean);
  const brief = [
    'PTOWN MARKETING · CAMPAIGN BRIEF DRAFT',
    `Campaign: ${fields[0] || '[needed]'}`,
    `Audience: ${fields[1] || '[needed]'}`,
    `Objective: ${fields[2] || '[needed]'}`,
    `Responsible owner: ${fields[3] || '[needed]'}`,
    `Guest action: ${fields[4] || '[needed]'}`,
    `Success measure: ${fields[5] || '[needed]'}`,
    'Before publication: confirm dates, offer, capacity, permissions, budget, consent, approved assets, and working guest path.',
    'This is an internal draft. It is not approved, published, submitted, or a live sign-up.',
  ].join('\n');
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
    <PageHeader eyebrow="PTOWN MARKETING & BRAND · BUILD 69" title="Give each campaign a clear job." description="Draft the audience, promise, owner, action, and success measure before production begins." />
    <PreviewNotice />
    <Card title="Temporary planning form" description="Text stays on this screen while it is open. It is not saved to an account, submitted to PTown, sent to Media Group, or published. Do not enter personal contact details or confidential financial terms." />
    <SectionHeader title="Campaign essentials" />
    <Field label="Campaign name" value={campaign} onChangeText={value => { setCampaign(value); setMessage(null); }} maxLength={MAX} placeholder="For example: Wednesday Artist Discovery" />
    <Field label="Intended audience" value={audience} onChangeText={value => { setAudience(value); setMessage(null); }} maxLength={MAX} placeholder="Who should hear about it?" />
    <Field label="Campaign objective" value={objective} onChangeText={value => { setObjective(value); setMessage(null); }} maxLength={MAX} placeholder="What should the campaign accomplish?" />
    <Field label="Responsible owner" value={owner} onChangeText={value => { setOwner(value); setMessage(null); }} maxLength={MAX} placeholder="Role or named staff member" />
    <Field label="Guest action" value={action} onChangeText={value => { setAction(value); setMessage(null); }} maxLength={MAX} placeholder="Explore, RSVP, reserve, or attend when enabled" />
    <Field label="Success measure" value={measure} onChangeText={value => { setMeasure(value); setMessage(null); }} maxLength={MAX} placeholder="An observable outcome" />
    <SectionHeader title="Review draft" />
    <Text selectable style={styles.card}>{brief}</Text>
    <Body>{complete ? 'All six fields are ready for internal review.' : `${fields.filter(Boolean).length} of 6 fields completed.`}</Body>
    <ActionButton label="Copy campaign draft" onPress={() => { void copy(); }} />
    <Feedback message={message} />
    {error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Return to Marketing & Brand" href="/marketing" secondary />
    <Footer />
  </Screen>;
}
