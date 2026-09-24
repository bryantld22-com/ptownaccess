import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { djCriteria, formatDjReview, type DjCriterion, type DjRating } from '../src/data/djReview';
import { theme } from '../src/theme';

const ratings: DjRating[] = ['Not observed', '1', '2', '3', '4', '5'];
const paths = ['More observation needed', 'Discuss after-party rotation', 'Development conversation', 'No current fit'] as const;

export default function DjReview() {
  const [name, setName] = useState('');
  const [scores, setScores] = useState<Partial<Record<DjCriterion, DjRating>>>({});
  const [evidence, setEvidence] = useState('');
  const [path, setPath] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const complete = Boolean(name.trim() && djCriteria.every(item => scores[item.id]) && evidence.trim().length >= 20 && path);
  const report = complete ? formatDjReview(name, evidence, scores as Record<DjCriterion, DjRating>, path) : null;
  async function copy() {
    setMessage(null); setError(null);
    if (!report) { setError('Complete the name, all observations, evidence, and discussion path.'); return; }
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(report);
      } else if (!await Clipboard.setStringAsync(report)) throw new Error('Clipboard unavailable');
      setMessage('Evaluation draft copied. No booking or offer was sent.');
    } catch { setError('Copy is unavailable. Select the draft and copy it manually.'); }
  }
  return <Screen>
    <Stack.Screen options={{ title: 'After-Party DJ Review' }} />
    <PageHeader eyebrow="ARTIST DEVELOPMENT · BUILD 76" title="Hear how the DJ moves the whole room." description="An internal observation guide for producers and DJs being considered for PTown’s after-party rotation." />
    <PreviewNotice />
    <Card title="One after-party experience" description="Consider how a DJ serves current and classic music across PTown’s after-party nights. These observations inform a leadership conversation; no score awards a slot." />
    <Field label="DJ or producer name" value={name} onChangeText={value => { setName(value); setMessage(null); }} maxLength={120} placeholder="Stage name" />
    <SectionHeader title="Observed set" />
    <Body>Rate only what you observed from 1–5, or choose Not observed. Describe actual moments in the evidence field.</Body>
    {djCriteria.map(item => <View key={item.id} style={local.criterion}>
      <Text accessibilityRole="header" style={styles.cardTitle}>{item.label}</Text><Body>{item.cue}</Body>
      <View accessibilityRole="radiogroup" accessibilityLabel={item.label} style={local.options}>{ratings.map(value => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: scores[item.id] === value }} onPress={() => { setScores(current => ({ ...current, [item.id]: value })); setMessage(null); }} style={[local.option, scores[item.id] === value && local.selected]}><Text style={[local.optionText, scores[item.id] === value && local.selectedText]}>{value}</Text></Pressable>)}</View>
    </View>)}
    <Field label="Observed evidence" value={evidence} onChangeText={value => { setEvidence(value); setMessage(null); }} maxLength={1000} multiline numberOfLines={4} placeholder="Specific transitions, audience response, announcements, and recovery moments" hint="At least 20 characters; avoid private guest details." error={evidence.trim() && evidence.trim().length < 20 ? 'Add at least 20 characters of observations.' : undefined} />
    <SectionHeader title="Proposed discussion path" />
    <View accessibilityRole="radiogroup" accessibilityLabel="Proposed discussion path" style={local.options}>{paths.map(value => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: path === value }} onPress={() => { setPath(value); setMessage(null); }} style={[local.option, path === value && local.selected]}><Text style={[local.optionText, path === value && local.selectedText]}>{value}</Text></Pressable>)}</View>
    <SectionHeader title="Internal evaluation draft" />
    {report ? <Text selectable style={styles.card}>{report}</Text> : <Body>Complete the observations to preview a copyable draft.</Body>}
    <ActionButton label="Copy DJ evaluation draft" onPress={() => { void copy(); }} />
    <Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Return to Wednesday at PTown" href="/events/ptown-flow" secondary /><Button label="Explore Artist Development" href="/artist-development" secondary /><Footer />
  </Screen>;
}

const local = StyleSheet.create({
  criterion: { padding: 18, backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 16, gap: 8 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 12, paddingVertical: 10, justifyContent: 'center' },
  selected: { backgroundColor: theme.colors.gold, borderColor: theme.colors.gold },
  optionText: { color: theme.colors.cream, fontSize: 14 }, selectedText: { color: theme.colors.background },
});
