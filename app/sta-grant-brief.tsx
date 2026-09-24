import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { formatStaGrantBrief, staApplicantStates, staMeetingQuestions, type StaGrantBrief } from '../src/data/staGrantBrief';
import { theme } from '../src/theme';

const initial: StaGrantBrief = { program: '', audience: '', applicant: '', request: '', useOfFunds: '', outcomes: '', partners: '', questions: [...staMeetingQuestions] };
export default function StaGrantBriefPage() {
  const [brief, setBrief] = useState<StaGrantBrief>(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const complete = Boolean(brief.program.trim() && brief.audience.trim() && brief.applicant && brief.useOfFunds.trim().length >= 20 && brief.outcomes.trim().length >= 20 && brief.questions.length);
  const report = complete ? formatStaGrantBrief(brief) : null;
  function update(key: keyof Omit<StaGrantBrief, 'questions'>, value: string) { setBrief(current => ({ ...current, [key]: value })); setMessage(null); }
  function toggle(question: string) { setBrief(current => ({ ...current, questions: current.questions.includes(question) ? current.questions.filter(item => item !== question) : [...current.questions, question] })); setMessage(null); }
  async function copy() {
    setMessage(null); setError(null);
    if (!report) { setError('Complete the program, audience, applicant status, use of funds, outcomes, and at least one meeting question.'); return; }
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(report);
      } else if (!await Clipboard.setStringAsync(report)) throw new Error('Clipboard unavailable');
      setMessage('Grant meeting discussion draft copied. Nothing was sent or scheduled.');
    } catch { setError('Copy is unavailable. Select the draft and copy it manually.'); }
  }
  return <Screen>
    <Stack.Screen options={{ title: 'Save the Arts Grant Meeting Brief' }} />
    <PageHeader eyebrow="SAVE THE ARTS · BUILD 90" title="Bring a clear program and clear questions." description="Prepare an internal discussion draft for a grants conversation before selecting a funder or application." />
    <PreviewNotice />
    <Card title="Working brief, not an application" description="PTown’s desired request and the actual grant fit are separate questions. This page does not determine eligibility or schedule a meeting. Verify nonprofit or fiscal sponsor status and current funder rules before submitting anything." />
    <Field label="Proposed program" value={brief.program} onChangeText={value => update('program', value)} maxLength={160} placeholder="Saturday arts sessions, Heritage Tour, or a defined pilot" />
    <Field label="Who the program would serve" value={brief.audience} onChangeText={value => update('audience', value)} maxLength={240} placeholder="Age group, geography, access needs, and expected participants" />
    <SectionHeader title="Applicant structure to verify" />
    <View accessibilityRole="radiogroup" accessibilityLabel="Applicant structure" style={local.options}>{staApplicantStates.map(value => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: brief.applicant === value }} onPress={() => update('applicant', value)} style={[local.option, brief.applicant === value && local.selected]}><Text style={[local.optionText, brief.applicant === value && local.selectedText]}>{value}</Text></Pressable>)}</View>
    <Field label="Working funding request (optional)" value={brief.request} onChangeText={value => update('request', value)} maxLength={80} placeholder="For discussion after a line-item budget" hint="A target is not an available award or confirmed eligible amount." />
    <Field label="Proposed use of funds" value={brief.useOfFunds} onChangeText={value => update('useOfFunds', value)} maxLength={800} multiline numberOfLines={4} placeholder="Instruction, supplies, access support, transportation, evaluation, or other defined costs" hint="At least 20 characters; verify allowed costs with each funder." error={brief.useOfFunds.trim() && brief.useOfFunds.trim().length < 20 ? 'Add specific costs to discuss.' : undefined} />
    <Field label="Outcomes to measure" value={brief.outcomes} onChangeText={value => update('outcomes', value)} maxLength={800} multiline numberOfLines={4} placeholder="Sessions delivered, participants served, skills practiced, feedback, portfolio work" hint="At least 20 characters; do not claim results in advance." error={brief.outcomes.trim() && brief.outcomes.trim().length < 20 ? 'Describe how the program will measure results.' : undefined} />
    <Field label="Potential partners and staffing (optional)" value={brief.partners} onChangeText={value => update('partners', value)} maxLength={400} multiline placeholder="Prospective educators, mentors, community partners, and oversight" />
    <SectionHeader title="Questions to take to the meeting" /><Body>Keep the questions relevant to this program. Answers and deadlines must come from the grants office or current funder instructions.</Body>
    {staMeetingQuestions.map(question => <Pressable key={question} accessibilityRole="checkbox" accessibilityState={{ checked: brief.questions.includes(question) }} onPress={() => toggle(question)} style={local.check}><Text style={styles.cardTitle}>{brief.questions.includes(question) ? '☑' : '☐'} {question}</Text></Pressable>)}
    <SectionHeader title="Internal meeting draft" />{report ? <Text selectable style={styles.card}>{report}</Text> : <Body>Complete the program details and questions to preview the draft.</Body>}
    <ActionButton label="Copy Save the Arts meeting brief" onPress={() => { void copy(); }} /><Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Review Save the Arts leadership briefing" href="/save-the-arts-leadership" secondary /><Footer />
  </Screen>;
}
const local = StyleSheet.create({
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 12, paddingVertical: 10, justifyContent: 'center' },
  selected: { backgroundColor: theme.colors.gold, borderColor: theme.colors.gold },
  optionText: { color: theme.colors.cream, fontSize: 14 }, selectedText: { color: theme.colors.background },
  check: { padding: 18, backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 16, minHeight: 60 },
});
