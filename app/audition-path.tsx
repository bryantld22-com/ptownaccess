import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Platform, Text } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { auditionDraft, followingWednesday, validEpkLink } from '../src/data/auditionPath';

export default function AuditionPath() {
  const [name, setName] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [monday, setMonday] = useState('');
  const [epk, setEpk] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wednesday = followingWednesday(monday);
  const ready = Boolean(name.trim() && discipline.trim() && wednesday && validEpkLink(epk));
  const draft = ready ? auditionDraft(name, discipline, monday, epk) : null;
  async function copy() {
    setMessage(null); setError(null);
    if (!draft) { setError('Enter the act, discipline, and a valid Monday date. An EPK link is optional, but any link entered must use HTTPS.'); return; }
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(draft);
      } else if (!await Clipboard.setStringAsync(draft)) throw new Error('Clipboard unavailable');
      setMessage('Preparation draft copied. No audition request was submitted.');
    } catch { setError('Copy is unavailable. Select the draft and copy it manually.'); }
  }
  return <Screen>
    <Stack.Screen options={{ title: 'Auditions for PTown Path' }} />
    <PageHeader eyebrow="ARTIST DEVELOPMENT · BUILD 72" title="From Monday audition to the next Wednesday." description="See the nine-day preparation window and what PTown needs before an artist can be invited to perform." />
    <PreviewNotice calendar />
    <Card title="How selection works" description="Monday auditions include artists and comedians. PTown evaluates audience capture, stage control, professionalism, and fit. Selected acts may be invited to perform the following week's Wednesday showcase, nine days later. An invitation and schedule confirmation are required." />
    <Card title="EPK is optional" description="An electronic press kit or performance link helps the team review material and prepare sooner. It does not guarantee selection. PTown will need a working submission and contact process before public registration opens." />
    <SectionHeader title="Prepare an audition request" />
    <Body>This device-only form creates a copyable preparation draft. It does not send an application or reserve an audition slot. Avoid private contact details in the draft.</Body>
    <Field label="Artist or act name" value={name} onChangeText={value => { setName(value); setMessage(null); }} maxLength={120} placeholder="Stage name or group name" />
    <Field label="Discipline" value={discipline} onChangeText={value => { setDiscipline(value); setMessage(null); }} maxLength={120} placeholder="Singer, band, comedian, producer, or dancer" />
    <Field label="Proposed Monday audition date" value={monday} onChangeText={value => { setMonday(value); setMessage(null); }} maxLength={10} placeholder="YYYY-MM-DD" hint="Enter a calendar Monday. Dates remain proposals until PTown publishes and confirms them." error={monday.trim() && !wednesday ? 'Enter a real Monday date in YYYY-MM-DD format.' : undefined} />
    <Field label="EPK or performance link (optional)" value={epk} onChangeText={value => { setEpk(value); setMessage(null); }} maxLength={500} placeholder="https://..." autoCapitalize="none" autoCorrect={false} error={epk.trim() && !validEpkLink(epk) ? 'Use an HTTPS link, or leave this blank.' : undefined} />
    {wednesday && <Card title={`Possible Wednesday showcase: ${wednesday}`} description="Nine days after the proposed Monday. This is a planning calculation, not an invitation or confirmed performance date. PTown and the music director must coordinate the act, musicians, and dancers." />}
    <SectionHeader title="Review draft" />
    {draft ? <Text selectable style={styles.card}>{draft}</Text> : <Body>Complete the required fields to preview your preparation draft.</Body>}
    <ActionButton label="Copy audition preparation draft" onPress={() => { void copy(); }} />
    <Feedback message={message} />
    {error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Explore Artist Development" href="/artist-development" secondary />
    <Button label="Explore Wednesday's Artist Discovery showcase" href="/events/ptown-flow" secondary />
    <Button label="Review a Monday audition" href="/audition-review" secondary />
    <Button label="Plan the nine-day showcase handoff" href="/showcase-prep" secondary />
    <Button label="View Monday auditions" href="/events/monday-jazz" secondary />
    <Footer />
  </Screen>;
}
