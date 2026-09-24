import * as Clipboard from 'expo-clipboard';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { formatShowcaseReview, reviewCriteria, validShowcaseWednesday, type ReviewCriterion, type ReviewRating } from '../src/data/showcaseReview';
import { theme } from '../src/theme';

const ratings: ReviewRating[] = ['Not observed', '1', '2', '3', '4', '5'];
const nextSteps = ['Further development discussion', 'Support slot consideration', 'More evidence needed', 'No current fit'] as const;

export default function ShowcaseReview() {
  const { date: routeDate } = useLocalSearchParams<{ date?: string | string[] }>();
  const [act, setAct] = useState('');
  const [date, setDate] = useState('');
  const [scores, setScores] = useState<Partial<Record<ReviewCriterion, ReviewRating>>>({});
  const [evidence, setEvidence] = useState('');
  const [nextStep, setNextStep] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { const value = Array.isArray(routeDate) ? routeDate[0] : routeDate; if (value && validShowcaseWednesday(value)) setDate(value); }, [routeDate]);
  const complete = Boolean(act.trim() && validShowcaseWednesday(date) && reviewCriteria.every(item => scores[item.id]) && evidence.trim().length >= 20 && nextStep);
  const report = complete ? formatShowcaseReview(act, date, scores as Record<ReviewCriterion, ReviewRating>, evidence, nextStep) : null;
  async function copy() {
    setMessage(null); setError(null);
    if (!report) { setError('Complete the act, Wednesday date, all observations, evidence notes, and proposed discussion path.'); return; }
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(report);
      } else if (!await Clipboard.setStringAsync(report)) throw new Error('Clipboard unavailable');
      setMessage('Review draft copied. No decision was submitted or shared.');
    } catch { setError('Copy is unavailable. Select the review and copy it manually.'); }
  }
  return <Screen>
    <Stack.Screen options={{ title: 'Wednesday Showcase Review' }} />
    <PageHeader eyebrow="ARTIST DEVELOPMENT · BUILD 75" title="Review the performance with evidence." description="A private planning rubric for the team after an invited Wednesday showcase." />
    <PreviewNotice />
    <Card title="Human review, no automatic decision" description="Ratings describe what one reviewer observed. They do not enroll an act, assign a support slot, approve a booking, or replace a conversation with the artist." />
    <Field label="Artist or act name" value={act} onChangeText={value => { setAct(value); setMessage(null); }} maxLength={120} placeholder="Stage name or group" />
    <Field label="Wednesday showcase date" value={date} onChangeText={value => { setDate(value); setMessage(null); }} maxLength={10} placeholder="YYYY-MM-DD" error={date.trim() && !validShowcaseWednesday(date) ? 'Enter a real Wednesday date in YYYY-MM-DD format.' : undefined} />
    <SectionHeader title="Observed performance" />
    <Body>Use 1–5 for what you directly observed, or choose Not observed. There is no automatic passing score.</Body>
    {reviewCriteria.map(item => <View key={item.id} style={local.criterion}>
      <Text accessibilityRole="header" style={styles.cardTitle}>{item.label}</Text>
      <Body>{item.cue}</Body>
      <View accessibilityRole="radiogroup" accessibilityLabel={item.label} style={local.options}>
        {ratings.map(value => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: scores[item.id] === value }} aria-checked={scores[item.id] === value} onPress={() => { setScores(current => ({ ...current, [item.id]: value })); setMessage(null); }} style={[local.option, scores[item.id] === value && local.selected]}><Text style={[local.optionText, scores[item.id] === value && local.selectedText]}>{value}</Text></Pressable>)}
      </View>
    </View>)}
    <Field label="Observed evidence" value={evidence} onChangeText={value => { setEvidence(value); setMessage(null); }} maxLength={1000} multiline numberOfLines={4} placeholder="What happened in the room? Include specific examples rather than impressions alone." hint="At least 20 characters; avoid private guest information." error={evidence.trim() && evidence.trim().length < 20 ? 'Add specific observations (at least 20 characters).' : undefined} />
    <SectionHeader title="Proposed discussion path" />
    <View accessibilityRole="radiogroup" accessibilityLabel="Proposed discussion path" style={local.options}>
      {nextSteps.map(value => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: nextStep === value }} aria-checked={nextStep === value} onPress={() => { setNextStep(value); setMessage(null); }} style={[local.option, nextStep === value && local.selected]}><Text style={[local.optionText, nextStep === value && local.selectedText]}>{value}</Text></Pressable>)}
    </View>
    <Body>Artist Development leadership reviews this proposal and decides what, if anything, to communicate or offer.</Body>
    <SectionHeader title="Internal review draft" />
    {report ? <Text selectable style={styles.card}>{report}</Text> : <Body>Complete the observations and evidence to preview the review draft.</Body>}
    <ActionButton label="Copy showcase review draft" onPress={() => { void copy(); }} />
    <Feedback message={message} />
    {error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Return to Wednesday at PTown" href="/events/ptown-flow" secondary />
    <Button label="Prepare post-showcase owner handoff" href="/artist-handoff" secondary />
    <Button label="Explore Artist Development" href="/artist-development" secondary />
    <Footer />
  </Screen>;
}

const local = StyleSheet.create({
  criterion: { padding: 18, backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 16, gap: 8 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 12, paddingVertical: 10, justifyContent: 'center' },
  selected: { backgroundColor: theme.colors.gold, borderColor: theme.colors.gold },
  optionText: { color: theme.colors.cream, fontSize: 14 },
  selectedText: { color: theme.colors.background },
});
