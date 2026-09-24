import * as Clipboard from 'expo-clipboard';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Text } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { showcaseMilestones, showcaseSchedule } from '../src/data/auditionPath';

export default function ShowcasePrep() {
  const { monday: routeMonday } = useLocalSearchParams<{ monday?: string | string[] }>();
  const [monday, setMonday] = useState('');
  const [act, setAct] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { const value = Array.isArray(routeMonday) ? routeMonday[0] : routeMonday; if (value && showcaseSchedule(value)) setMonday(value); }, [routeMonday]);
  const schedule = showcaseSchedule(monday);
  const report = schedule ? [
    'PTOWN · INVITATION-DEPENDENT SHOWCASE PREPARATION',
    `Act: ${act.trim() || 'To be assigned'}`,
    `Proposed Monday audition: ${monday}`,
    ...schedule.flatMap(item => [`${item.date} · ${item.title} · ${item.owner}`, item.detail]),
    'Planning targets only. PTown must confirm invitation, act acceptance, venue date, staff, musicians, dancers, and production before any performance is promised.',
  ].join('\n') : null;
  async function copy() {
    setMessage(null); setError(null);
    if (!report) { setError('Enter a valid Monday date to copy the preparation schedule.'); return; }
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(report);
      } else if (!await Clipboard.setStringAsync(report)) throw new Error('Clipboard unavailable');
      setMessage('Preparation schedule copied. No invitation or assignment was sent.');
    } catch { setError('Copy is unavailable. Select the schedule and copy it manually.'); }
  }
  return <Screen>
    <Stack.Screen options={{ title: 'Wednesday Showcase Preparation' }} />
    <PageHeader eyebrow="ARTIST DEVELOPMENT · BUILD 80" title="Nine days to prepare the room and the artist." description="A working handoff for the act, music director, dancers, production team, and stage manager after a Monday selection." />
    <PreviewNotice calendar />
    <Card title="Invitation comes first" description="These are suggested preparation checkpoints. PTown must review the Monday audition, invite the act, receive acceptance, and confirm the Wednesday program before assigning a stage slot or rehearsals." />
    <Field label="Proposed Monday audition date" value={monday} onChangeText={value => { setMonday(value); setMessage(null); }} placeholder="YYYY-MM-DD" maxLength={10} hint="Enter a real Monday to calculate the nine-day timeline." error={monday.trim() && !schedule ? 'Enter a real Monday date in YYYY-MM-DD format.' : undefined} />
    <Field label="Act name (optional)" value={act} onChangeText={value => { setAct(value); setMessage(null); }} placeholder="Stage name or group" maxLength={120} />
    <SectionHeader title="Preparation checkpoints" />
    {schedule ? schedule.map(item => <Card key={item.offset} title={`${item.date} · ${item.title}`} description={`${item.owner}. ${item.detail}`} />) : showcaseMilestones.map(item => <Card key={item.offset} title={`Day ${item.offset} · ${item.title}`} description={`${item.owner}. ${item.detail}`} />)}
    <SectionHeader title="Internal handoff" />
    <Body>Copy this schedule to discuss ownership with PTown staff. It is not stored, sent to the act, or added to a show calendar.</Body>
    {report && <Text selectable style={styles.card}>{report}</Text>}
    <ActionButton label="Copy preparation schedule" onPress={() => { void copy(); }} />
    <Feedback message={message} />
    {error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Prepare the music director set sheet" href={schedule ? { pathname: '/showcase-set-sheet', params: { monday } } : '/showcase-set-sheet'} secondary />
    <Button label="Return to the audition path" href="/audition-path" secondary />
    <Button label="Review the Wednesday showcase" href={schedule ? { pathname: '/showcase-review', params: { date: schedule.at(-1)!.date } } : '/showcase-review'} secondary />
    <Button label="View Wednesday at PTown" href="/events/ptown-flow" secondary />
    <Footer />
  </Screen>;
}
