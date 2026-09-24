import * as Clipboard from 'expo-clipboard';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Text } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { followingWednesday } from '../src/data/auditionPath';
import { formatShowcaseSetSheet, type ShowcaseSetSheet } from '../src/data/showcaseSetSheet';

const empty: ShowcaseSetSheet = { act: '', monday: '', format: '', setList: '', director: '', musicians: '', dancers: '', production: '', rehearsal: '', callTime: '', recording: '' };
export default function ShowcaseSetSheetPage() {
  const { monday: routeMonday } = useLocalSearchParams<{ monday?: string | string[] }>();
  const [sheet, setSheet] = useState<ShowcaseSetSheet>(empty);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { const value = Array.isArray(routeMonday) ? routeMonday[0] : routeMonday; if (value && followingWednesday(value)) setSheet(current => ({ ...current, monday: value })); }, [routeMonday]);
  const wednesday = followingWednesday(sheet.monday);
  const complete = Boolean(sheet.act.trim() && wednesday && sheet.format.trim() && sheet.setList.trim().length >= 10);
  const report = complete ? formatShowcaseSetSheet(sheet) : null;
  function update(key: keyof ShowcaseSetSheet, value: string) { setSheet(current => ({ ...current, [key]: value })); setMessage(null); }
  async function copy() {
    setMessage(null); setError(null);
    if (!report) { setError('Enter the act, valid Monday, format, and at least ten characters of set material.'); return; }
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(report);
      } else if (!await Clipboard.setStringAsync(report)) throw new Error('Clipboard unavailable');
      setMessage('Set sheet draft copied. No invitation or assignment was sent.');
    } catch { setError('Copy is unavailable. Select the draft and copy it manually.'); }
  }
  return <Screen>
    <Stack.Screen options={{ title: 'Wednesday Showcase Set Sheet' }} />
    <PageHeader eyebrow="ARTIST DEVELOPMENT · BUILD 81" title="Prepare the act, band, dancers, and stage." description="A working set sheet to coordinate the music director and production team during the nine-day window." />
    <PreviewNotice calendar />
    <Card title="Confirm invitation before scheduling" description="This is a planning draft. PTown must first invite the act and receive acceptance, then confirm the date, rehearsal, band, dancers, production resources, and recording choices." />
    <Field label="Artist or act" value={sheet.act} onChangeText={value => update('act', value)} maxLength={120} placeholder="Stage name or group" />
    <Field label="Proposed Monday audition" value={sheet.monday} onChangeText={value => update('monday', value)} maxLength={10} placeholder="YYYY-MM-DD" error={sheet.monday.trim() && !wednesday ? 'Enter a real Monday date.' : undefined} />
    {wednesday && <Card title={`Possible showcase · ${wednesday}`} description="Nine days after Monday; not a confirmed performance date." />}
    <SectionHeader title="Set and collaborators" />
    <Field label="Performance format and target length" value={sheet.format} onChangeText={value => update('format', value)} maxLength={160} placeholder="Solo / band / comedy / dance; proposed minutes" />
    <Field label="Set or material, order, keys and tempos" value={sheet.setList} onChangeText={value => update('setList', value)} maxLength={1000} multiline numberOfLines={4} placeholder="Include clean versions, backing tracks, cues, and any changes between numbers." hint="At least 10 characters." error={sheet.setList.trim() && sheet.setList.trim().length < 10 ? 'Add more set detail.' : undefined} />
    <Field label="Music director contact plan" value={sheet.director} onChangeText={value => update('director', value)} maxLength={240} placeholder="Who connects with the act and when?" />
    <Field label="Musicians and backing tracks" value={sheet.musicians} onChangeText={value => update('musicians', value)} maxLength={300} multiline placeholder="Players, parts, chart needs, and tracks" />
    <Field label="Dancers and choreography" value={sheet.dancers} onChangeText={value => update('dancers', value)} maxLength={300} multiline placeholder="Participants, spacing, and practice" />
    <SectionHeader title="Production and call" />
    <Field label="Inputs, stage, lighting and video cues" value={sheet.production} onChangeText={value => update('production', value)} maxLength={500} multiline placeholder="Mics, monitors, stage plot, LED, lighting, and safe effects" />
    <Field label="Rehearsal or sound-check plan" value={sheet.rehearsal} onChangeText={value => update('rehearsal', value)} maxLength={240} placeholder="Proposed time and owner" />
    <Field label="Call time and changeover" value={sheet.callTime} onChangeText={value => update('callTime', value)} maxLength={240} placeholder="Arrival, check-in, setup, and transition" />
    <Field label="Recording permissions and media plan" value={sheet.recording} onChangeText={value => update('recording', value)} maxLength={240} placeholder="Confirm artist consent and permitted uses" />
    <SectionHeader title="Internal set sheet draft" /><Body>Unfilled coordination fields appear as “To confirm” in the copied draft.</Body>
    {report ? <Text selectable style={styles.card}>{report}</Text> : <Body>Complete the act, Monday date, format, and set material to preview the sheet.</Body>}
    <ActionButton label="Copy showcase set sheet" onPress={() => { void copy(); }} /><Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Return to nine-day preparation" href={wednesday ? { pathname: '/showcase-prep', params: { monday: sheet.monday } } : '/showcase-prep'} secondary /><Footer />
  </Screen>;
}
