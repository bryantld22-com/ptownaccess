import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { mediaGroupDivisions } from '../src/data/mediaGroup';
import { formatMediaPassport } from '../src/data/mediaPassport';
import { theme } from '../src/theme';
import { MEDIA_PASSPORTS_KEY, readMediaPassports, type MediaPassportDraft } from '../src/utils/mediaPassports';

export default function MediaPassport() {
  const { division: routeDivision, draft: routeDraft } = useLocalSearchParams<{ division?: string | string[]; draft?: string | string[] }>();
  const [participant, setParticipant] = useState('');
  const [divisionId, setDivisionId] = useState('');
  const [skills, setSkills] = useState<ReadonlySet<string>>(new Set());
  const [evidence, setEvidence] = useState('');
  const [mentor, setMentor] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<MediaPassportDraft[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => { void AsyncStorage.getItem(MEDIA_PASSPORTS_KEY).then(value => setSaved(readMediaPassports(value))).catch(() => setStorageError(true)).finally(() => setLoaded(true)); }, []);
  useEffect(() => { const value = Array.isArray(routeDivision) ? routeDivision[0] : routeDivision; if (value && mediaGroupDivisions.some(item => item.id === value)) setDivisionId(value); }, [routeDivision]);
  useEffect(() => { if (!loaded || storageError) return; const value = Array.isArray(routeDraft) ? routeDraft[0] : routeDraft; if (!value) return; const item = saved.find(entry => entry.id === value); if (item) openDraft(item); else setError('The requested draft is not saved on this device.'); }, [loaded, routeDraft]);
  const division = mediaGroupDivisions.find(item => item.id === divisionId);
  const complete = Boolean(participant.trim() && division && evidence.trim().length >= 20 && skills.size);
  const report = complete ? formatMediaPassport(participant, divisionId, skills, evidence, mentor) : null;
  function openDraft(item: MediaPassportDraft) { setCurrentId(item.id); setParticipant(item.participant); setDivisionId(item.divisionId); setSkills(new Set(item.skills)); setEvidence(item.evidence); setMentor(item.mentor); setMessage('Saved draft opened. Changes are not stored until you save again.'); setError(null); }
  function newDraft() { setCurrentId(null); setParticipant(''); setDivisionId(''); setSkills(new Set()); setEvidence(''); setMentor(''); setMessage('New draft started.'); setError(null); }
  async function save() {
    setMessage(null); setError(null);
    if (!report || !division) { setError('Complete a passport draft before saving it.'); return; }
    if (!loaded || storageError) { setError('Saved passports could not be read. Existing device data was not changed.'); return; }
    if (!currentId && saved.length >= 50) { setError('This device has reached 50 drafts. Copy an existing draft before making more.'); return; }
    setBusy(true);
    try {
      const latest = readMediaPassports(await AsyncStorage.getItem(MEDIA_PASSPORTS_KEY));
      const id = currentId ?? `media-passport-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      if (!currentId && latest.length >= 50) throw new Error('Draft limit reached');
      if (currentId && !latest.some(item => item.id === currentId)) throw new Error('Draft changed on device');
      const item: MediaPassportDraft = { id, participant: participant.trim(), divisionId, skills: [...skills], evidence: evidence.trim(), mentor: mentor.trim(), updatedAt: new Date().toISOString() };
      const next = [item, ...latest.filter(value => value.id !== id)];
      await AsyncStorage.setItem(MEDIA_PASSPORTS_KEY, JSON.stringify(next));
      setSaved(next); setCurrentId(id); setMessage('Skills Passport draft saved on this device. No mentor was notified and no skill was certified.');
    } catch { setError('The draft could not be saved. Existing device data was kept.'); }
    finally { setBusy(false); }
  }
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
    <PageHeader eyebrow="PTOWN MEDIA ACADEMY · BUILD 85" title="Turn real productions into portfolio evidence." description="Draft a division-specific Skills Passport for mentor review across PTown Media Group." />
    <PreviewNotice />
    <Card title="Private drafts on this device" description="Saved passports stay in this browser or app storage. Clearing this device’s data can remove them. Use the copy button for a separate record; do not enter sensitive personal details." />
    <SectionHeader title="Saved Skills Passports" />
    {!loaded ? <Body>Loading saved drafts…</Body> : storageError ? <Card title="Saved drafts unavailable" description="Device storage could not be read. Existing drafts were not changed." /> : saved.length ? saved.map(item => <Pressable key={item.id} accessibilityRole="button" onPress={() => openDraft(item)} style={local.check}><Text style={styles.cardTitle}>{item.participant} · {mediaGroupDivisions.find(value => value.id === item.divisionId)?.title}</Text><Body>Updated {item.updatedAt.slice(0, 10)} · Open draft</Body></Pressable>) : <Body>No Skills Passport drafts saved on this device yet.</Body>}
    <ActionButton label="Start a new Skills Passport" secondary onPress={newDraft} />
    <Card title="Evidence before credentials" description="Mark a skill only when there is work to discuss. A mentor must review the artifact and contribution before confirming a demonstrated skill. This draft does not award a credential or placement." />
    <Field label="Participant or working name" value={participant} onChangeText={setParticipant} maxLength={120} placeholder="Name for this internal draft" />
    <SectionHeader title="Choose a Media Group division" />
    <View accessibilityRole="radiogroup" accessibilityLabel="Media Group division" style={local.options}>{mediaGroupDivisions.map(item => <Pressable key={item.id} accessibilityRole="radio" accessibilityState={{ checked: divisionId === item.id }} onPress={() => choose(item.id)} style={[local.option, divisionId === item.id && local.selected]}><Text style={[local.optionText, divisionId === item.id && local.selectedText]}>{item.title}</Text></Pressable>)}</View>
    {division && <><SectionHeader title={`${division.title} skills`} /><Body>Checked skills mean evidence is noted for review, not that the skill has been certified.</Body>{division.passport.map(skill => <Pressable key={skill} accessibilityRole="checkbox" accessibilityState={{ checked: skills.has(skill) }} onPress={() => toggle(skill)} style={local.check}><Text style={styles.cardTitle}>{skills.has(skill) ? '☑' : '☐'} {skill}</Text></Pressable>)}</>}
    <Field label="Portfolio evidence and personal contribution" value={evidence} onChangeText={setEvidence} maxLength={1000} multiline numberOfLines={4} placeholder="Project, artifact, role, result, and what the participant did" hint="At least 20 characters. Include only material the participant may share." error={evidence.trim() && evidence.trim().length < 20 ? 'Describe the work in at least 20 characters.' : undefined} />
    <Field label="Proposed mentor or reviewer (optional)" value={mentor} onChangeText={setMentor} maxLength={120} placeholder="Role or name for a future review" />
    <SectionHeader title="Internal passport draft" />{report ? <Text selectable style={styles.card}>{report}</Text> : <Body>Choose a division and describe portfolio evidence to preview the passport.</Body>}
    <ActionButton label={currentId ? "Update saved Skills Passport" : "Save Skills Passport on this device"} disabled={!loaded || storageError || busy || !report} onPress={() => { void save(); }} />
    <ActionButton label="Copy Skills Passport draft" onPress={() => { void copy(); }} /><Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Open Skills Passport overview" href="/media-academy-dashboard" secondary />
    <Button label="Back up or transfer saved Skills Passports" href="/media-passport-backup" secondary />
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
