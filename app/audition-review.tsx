import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { followingWednesday } from '../src/data/auditionPath';
import { auditionCriteria, auditionPaths, formatAuditionReview, type AuditionCriterion, type AuditionRating } from '../src/data/auditionReview';
import { theme } from '../src/theme';

const ratings: AuditionRating[] = ['Not observed', '1', '2', '3', '4', '5'];
export default function AuditionReview() {
  const [name, setName] = useState('');
  const [monday, setMonday] = useState('');
  const [scores, setScores] = useState<Partial<Record<AuditionCriterion, AuditionRating>>>({});
  const [evidence, setEvidence] = useState('');
  const [path, setPath] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wednesday = followingWednesday(monday);
  const complete = Boolean(name.trim() && wednesday && auditionCriteria.every(item => scores[item.id]) && evidence.trim().length >= 20 && path);
  const report = complete ? formatAuditionReview(name, monday, scores as Record<AuditionCriterion, AuditionRating>, evidence, path) : null;
  async function copy() {
    setMessage(null); setError(null);
    if (!report) { setError('Complete the act, real Monday date, observations, evidence, and discussion path.'); return; }
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(report);
      } else if (!await Clipboard.setStringAsync(report)) throw new Error('Clipboard unavailable');
      setMessage('Monday review copied. No invitation or result was sent.');
    } catch { setError('Copy is unavailable. Select the review and copy it manually.'); }
  }
  return <Screen>
    <Stack.Screen options={{ title: 'Monday Audition Review' }} />
    <PageHeader eyebrow="ARTIST DEVELOPMENT · BUILD 79" title="Record what Monday revealed." description="A private observation draft for artists and comedians before PTown considers an invitation to the following Wednesday." />
    <PreviewNotice calendar />
    <Card title="Invitation follows a human review" description="The rubric captures one reviewer’s observations. No score automatically selects an act. A proposed Wednesday date is nine days after Monday, subject to invitation and production confirmation." />
    <Field label="Artist or act name" value={name} onChangeText={setName} maxLength={120} placeholder="Stage name or group" />
    <Field label="Monday audition date" value={monday} onChangeText={setMonday} maxLength={10} placeholder="YYYY-MM-DD" error={monday.trim() && !wednesday ? 'Enter a real Monday date in YYYY-MM-DD format.' : undefined} />
    {wednesday && <Card title={`Potential Wednesday: ${wednesday}`} description="Nine days later. This date is not a booked showcase." />}
    <SectionHeader title="Observed audition" /><Body>Choose 1–5 only for direct observations; use Not observed when evidence is unavailable.</Body>
    {auditionCriteria.map(item => <View key={item.id} style={local.criterion}><Text accessibilityRole="header" style={styles.cardTitle}>{item.label}</Text><Body>{item.cue}</Body><View accessibilityRole="radiogroup" accessibilityLabel={item.label} style={local.options}>{ratings.map(value => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: scores[item.id] === value }} onPress={() => setScores(current => ({ ...current, [item.id]: value }))} style={[local.option, scores[item.id] === value && local.selected]}><Text style={[local.optionText, scores[item.id] === value && local.selectedText]}>{value}</Text></Pressable>)}</View></View>)}
    <Field label="Observed evidence" value={evidence} onChangeText={setEvidence} maxLength={1000} multiline numberOfLines={4} placeholder="Specific audience response, material, stage moments, and preparation needs" hint="At least 20 characters; avoid private guest information." error={evidence.trim() && evidence.trim().length < 20 ? 'Add at least 20 characters of observations.' : undefined} />
    <SectionHeader title="Proposed discussion path" /><View accessibilityRole="radiogroup" accessibilityLabel="Proposed discussion path" style={local.options}>{auditionPaths.map(value => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: path === value }} onPress={() => setPath(value)} style={[local.option, path === value && local.selected]}><Text style={[local.optionText, path === value && local.selectedText]}>{value}</Text></Pressable>)}</View>
    <SectionHeader title="Internal Monday review" />{report ? <Text selectable style={styles.card}>{report}</Text> : <Body>Complete the observations to preview the draft.</Body>}
    <ActionButton label="Copy Monday audition review" onPress={() => { void copy(); }} /><Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Plan the nine-day showcase handoff" href="/showcase-prep" secondary /><Button label="Explore the audition path" href="/audition-path" secondary /><Footer />
  </Screen>;
}
const local = StyleSheet.create({
  criterion: { padding: 18, backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 16, gap: 8 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 12, paddingVertical: 10, justifyContent: 'center' },
  selected: { backgroundColor: theme.colors.gold, borderColor: theme.colors.gold },
  optionText: { color: theme.colors.cream, fontSize: 14 }, selectedText: { color: theme.colors.background },
});
