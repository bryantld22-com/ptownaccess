import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { ActionButton, Feedback, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { theme } from '../src/theme';

type Focus = 'Instrument' | 'Voice';
const sequence = [
  { title: '1 · Meet and observe', instrument: 'Ask what music the learner enjoys. Watch their current instrument hold and one short phrase or pattern. Agree on a comfortable starting skill.', voice: 'Ask what music the learner enjoys. Listen to one comfortable short phrase and discuss what breathing and phrasing feel like. Avoid a range or power test.' },
  { title: '2 · Demonstrate a foundation', instrument: 'Model posture, instrument support, and one finger placement. The learner copies, compares the sound, and chooses one small practice task.', voice: 'Model an easy breath and phrase. The learner tries it, describes the feeling, and chooses a short practice task without strain.' },
  { title: '3 · Apply it in music', instrument: 'Use the same hand skill in a short musical passage. Demonstrate, let the learner try, and offer one specific adjustment.', voice: 'Use breath support in a short blues phrase. Demonstrate, invite a response, and offer one specific cue for timing or ease.' },
  { title: '4 · Reflect and continue', instrument: 'Repeat the original passage, let the learner notice change, and identify a next musical question. A small demonstration is optional.', voice: 'Repeat the original phrase comfortably, let the learner describe progress, and identify a next musical question. A small demonstration is optional.' },
];
export default function MentorPilot() {
  const [focus, setFocus] = useState<Focus>('Instrument');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const report = [
    'SAVE THE ARTS · FOUR-SESSION MENTORSHIP PILOT DRAFT', `Focus: ${focus}`,
    ...sequence.map(item => `${item.title}: ${focus === 'Instrument' ? item.instrument : item.voice}`),
    'After each meeting: record an anonymous skill observation, learner reflection, and one next practice. Do not rate talent or promise placement.',
    'Pilot proposal only. No dates, students, mentors, credentials, or outcomes are confirmed. Establish screening, supervision, accessibility, consent, and qualified instruction before launch.',
  ].join('\n');
  async function copy() {
    setMessage(null); setError(null);
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(report);
      } else if (!await Clipboard.setStringAsync(report)) throw new Error('Clipboard unavailable');
      setMessage('Pilot outline copied. It was not scheduled or sent.');
    } catch { setError('Copy is unavailable. Select the outline and copy it manually.'); }
  }
  return <Screen>
    <Stack.Screen options={{ title: 'Save the Arts Mentor Pilot' }} />
    <PageHeader eyebrow="SAVE THE ARTS · BUILD 120" title="Let a skill grow across four meetings." description="A proposed pilot progression from a first conversation to practice, musical application, and reflection." />
    <PreviewNotice />
    <Card title="A pilot to refine with mentors" description="These are session themes, not calendar dates or a formal course. Each meeting should fit the learner’s age, access needs, interests, pace, and the mentor’s qualifications." />
    <SectionHeader title="Choose a focus" />
    <View style={{ flexDirection: 'row', gap: 10 }}>{(['Instrument', 'Voice'] as const).map(item => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: focus === item }} onPress={() => { setFocus(item); setMessage(null); }} style={{ padding: 15, borderRadius: 24, backgroundColor: focus === item ? theme.colors.gold : theme.colors.surface }}><Text style={{ color: focus === item ? theme.colors.background : theme.colors.cream }}>{item}</Text></Pressable>)}</View>
    <SectionHeader title="Four proposed meetings" />
    {sequence.map(item => <Card key={item.title} title={item.title} description={focus === 'Instrument' ? item.instrument : item.voice} />)}
    <SectionHeader title="What to notice" />
    <Card title="A learner’s own progress" description="Notice comfort, participation, one demonstrated skill, and how the learner describes their growth. Invite the learner to choose the next question. These are learning observations, not a talent ranking or promise of a performance." />
    <Card title="Before a pilot begins" description="Confirm mentor screening and supervision, parent or guardian consent where needed, accessible instruments and space, qualified vocal guidance, a clear photo and recording policy, and a plan for feedback and incident response." />
    <Text selectable style={styles.card}>{report}</Text>
    <ActionButton label="Copy four-session pilot outline" onPress={() => { void copy(); }} />
    <Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Body>This page stores no learner data. A copied outline should remain an internal planning draft until PTown approves a pilot.</Body>
    <Button label="Track mentor pilot preparation" href="/sta-mentor-readiness" secondary />
    <Button label="Open one mentor session" href="/sta-mentor-session" secondary />
    <Button label="Return to Save the Arts" href="/save-the-arts" secondary /><Footer />
  </Screen>;
}
