import * as Clipboard from 'expo-clipboard';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { mediaGroupDivisions } from '../src/data/mediaGroup';
import { formatMediaPassport } from '../src/data/mediaPassport';
import { theme } from '../src/theme';

export default function MediaPassport() {
  const { division: routeDivision } = useLocalSearchParams<{ division?: string | string[] }>();
  const [participant, setParticipant] = useState('');
  const [divisionId, setDivisionId] = useState('');
  const [skills, setSkills] = useState<ReadonlySet<string>>(new Set());
  const [evidence, setEvidence] = useState('');
  const [mentor, setMentor] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { const value = Array.isArray(routeDivision) ? routeDivision[0] : routeDivision; if (value && mediaGroupDivisions.some(item => item.id === value)) setDivisionId(value); }, [routeDivision]);
  const division = mediaGroupDivisions.find(item => item.id === divisionId);
  const complete = Boolean(participant.trim() && division && evidence.trim().length >= 20 && skills.size);
  const report = complete ? formatMediaPassport(participant, divisionId, skills, evidence, mentor) : null;
  function choose(id: string) { setDivisionId(id); setSkills(new Set()); setMessage(null); }
  function toggle(skill: string) { setSkills(current => { const next = new Set(current); if (next.has(skill)) next.delete(skill); else next.add(skill); return next; }); setMessage(null); }
  async function copy() {
    setMessage(null); setError(null);
    if (!report) { setError('Choose a division, add a participant name, mark a skill with evidence, and describe the portfolio contribution.'); return; }
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(report);
      } else if (!await Clipboard.setStringAsync(report)) throw new Error('Clipboard unavailable');
      setMessage('Skills Passport draft copied. No assessment or enrollment was recorded.');
    } catch { setError('Copy is unavailable. Select the passport and copy it manually.'); }
  }
  return <Screen>
    <Stack.Screen options={{ title: 'Media Academy Skills Passport' }} />
    <PageHeader eyebrow="PTOWN MEDIA ACADEMY · BUILD 82" title="Turn real productions into portfolio evidence." description="Draft a division-specific Skills Passport for mentor review across PTown Media Group." />
    <PreviewNotice />
    <Card title="Evidence before credentials" description="Mark a skill only when there is work to discuss. A mentor must review the artifact and contribution before confirming a demonstrated skill. This draft does not award a credential or placement." />
    <Field label="Participant or working name" value={participant} onChangeText={setParticipant} maxLength={120} placeholder="Name for this internal draft" />
    <SectionHeader title="Choose a Media Group division" />
    <View accessibilityRole="radiogroup" accessibilityLabel="Media Group division" style={local.options}>{mediaGroupDivisions.map(item => <Pressable key={item.id} accessibilityRole="radio" accessibilityState={{ checked: divisionId === item.id }} onPress={() => choose(item.id)} style={[local.option, divisionId === item.id && local.selected]}><Text style={[local.optionText, divisionId === item.id && local.selectedText]}>{item.title}</Text></Pressable>)}</View>
    {division && <><SectionHeader title={`${division.title} skills`} /><Body>Checked skills mean evidence is noted for review, not that the skill has been certified.</Body>{division.passport.map(skill => <Pressable key={skill} accessibilityRole="checkbox" accessibilityState={{ checked: skills.has(skill) }} onPress={() => toggle(skill)} style={local.check}><Text style={styles.cardTitle}>{skills.has(skill) ? '☑' : '☐'} {skill}</Text></Pressable>)}</>}
    <Field label="Portfolio evidence and personal contribution" value={evidence} onChangeText={setEvidence} maxLength={1000} multiline numberOfLines={4} placeholder="Project, artifact, role, result, and what the participant did" hint="At least 20 characters. Include only material the participant may share." error={evidence.trim() && evidence.trim().length < 20 ? 'Describe the work in at least 20 characters.' : undefined} />
    <Field label="Proposed mentor or reviewer (optional)" value={mentor} onChangeText={setMentor} maxLength={120} placeholder="Role or name for a future review" />
    <SectionHeader title="Internal passport draft" />{report ? <Text selectable style={styles.card}>{report}</Text> : <Body>Choose a division and describe portfolio evidence to preview the passport.</Body>}
    <ActionButton label="Copy Skills Passport draft" onPress={() => { void copy(); }} /><Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Return to PTown Media Group" href="/media-group" secondary /><Footer />
  </Screen>;
}
const local = StyleSheet.create({
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 12, paddingVertical: 10, justifyContent: 'center' },
  selected: { backgroundColor: theme.colors.gold, borderColor: theme.colors.gold },
  optionText: { color: theme.colors.cream, fontSize: 14 }, selectedText: { color: theme.colors.background },
  check: { padding: 18, backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 16, minHeight: 60 },
});
