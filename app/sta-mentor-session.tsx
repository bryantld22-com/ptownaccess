import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { theme } from '../src/theme';

type Track = 'Instrument' | 'Voice';
const tracks: Track[] = ['Instrument', 'Voice'];
const steps = [
  { title: '1 · Show', instrument: 'Sit where the learner can see the instrument and both hands. Demonstrate a comfortable hold, then show one small finger movement slowly.', voice: 'Demonstrate a gentle supported breath and one short phrase. Explain the feeling without forcing or pressing on the learner’s body.' },
  { title: '2 · Try', instrument: 'Let the learner position the instrument and try the same movement at their own pace. Ask what feels comfortable.', voice: 'Invite the learner to try the phrase at a comfortable volume. Listen for ease and pause if there is strain.' },
  { title: '3 · Notice', instrument: 'Name one thing that worked and one precise adjustment in hand or finger placement. Ask permission before any physical guidance.', voice: 'Name one strength and one adjustment in breath timing or phrasing. Use verbal cues or self-demonstration.' },
  { title: '4 · Try again', instrument: 'Repeat the movement, compare the sound, and let the learner describe the difference.', voice: 'Repeat the phrase, listen together, and let the learner describe how it felt.' },
];
export default function MentorSession() {
  const [track, setTrack] = useState<Track>('Instrument');
  const [goal, setGoal] = useState('');
  const [observation, setObservation] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const report = [
    'SAVE THE ARTS · MENTOR SESSION DRAFT', `Focus: ${track}`,
    `One skill to practice: ${goal.trim() || 'Not entered'}`,
    ...steps.map(step => `${step.title}: ${track === 'Instrument' ? step.instrument : step.voice}`),
    `What the learner noticed: ${observation.trim() || 'Not entered'}`,
    `Possible next practice: ${nextStep.trim() || 'Not entered'}`,
    'Planning template only. No participant or mentor was assigned. Confirm supervision, consent, accessibility, and qualified instruction before use.',
  ].join('\n');
  async function copy() {
    setMessage(null); setError(null);
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(report);
      } else if (!await Clipboard.setStringAsync(report)) throw new Error('Clipboard unavailable');
      setMessage('Mentor session draft copied. It was not saved or sent.');
    } catch { setError('Copy is unavailable. Select the session text and copy it manually.'); }
  }
  return <Screen>
    <Stack.Screen options={{ title: 'Save the Arts Mentor Session' }} />
    <PageHeader eyebrow="SAVE THE ARTS · BUILD 119" title="Teach it where the learner can see it." description="A proposed one-to-one session built around demonstration, a student’s attempt, specific feedback, and another try." />
    <PreviewNotice />
    <Card title="A planning template" description="Choose an instrument or voice example. This page does not enroll a student, assign a mentor, save notes, or collect names. Keep identifying details and health information out of this worksheet." />
    <SectionHeader title="Choose a teaching focus" />
    <View style={{ flexDirection: 'row', gap: 10 }}>{tracks.map(item => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: track === item }} onPress={() => { setTrack(item); setMessage(null); }} style={{ padding: 15, borderRadius: 24, backgroundColor: track === item ? theme.colors.gold : theme.colors.surface }}><Text style={{ color: track === item ? theme.colors.background : theme.colors.cream }}>{item}</Text></Pressable>)}</View>
    <Field label="One skill to practice (optional; no names)" value={goal} onChangeText={setGoal} maxLength={160} placeholder={track === 'Instrument' ? 'For example: comfortable hand position' : 'For example: breathing through one short phrase'} />
    <SectionHeader title="Show → try → notice → try again" />
    {steps.map(step => <Card key={step.title} title={step.title} description={track === 'Instrument' ? step.instrument : step.voice} />)}
    <Field label="What the learner noticed (optional; no names)" value={observation} onChangeText={setObservation} maxLength={300} multiline placeholder="For example: which adjustment felt easier" />
    <Field label="Possible next practice (optional)" value={nextStep} onChangeText={setNextStep} maxLength={300} multiline placeholder="One achievable next step" />
    <SectionHeader title="Copy a draft for internal planning" />
    <Text selectable style={styles.card}>{report}</Text>
    <ActionButton label="Copy mentor session draft" onPress={() => { void copy(); }} />
    <Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Body>Before running a session with minors, establish mentor screening, supervision, safeguarding, appropriate touch and consent rules, accessibility, and qualified guidance. Vocal instruction should stop if a learner feels pain or strain.</Body>
    <Button label="Return to Save the Arts" href="/save-the-arts" secondary /><Footer />
  </Screen>;
}
