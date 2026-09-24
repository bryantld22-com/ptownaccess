import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { formatArtistHandoff, handoffChecks, handoffPaths, type HandoffCheck } from '../src/data/artistHandoff';
import { theme } from '../src/theme';
import { ARTIST_PROSPECTS_KEY, readArtistProspects, type ArtistProspect } from '../src/utils/artistProspects';
import { ARTIST_PROSPECT_ACTIONS_KEY, readArtistProspectActions, type ArtistProspectAction } from '../src/utils/artistProspectActions';

export default function ArtistHandoff() {
  const { prospect: requestedProspect } = useLocalSearchParams<{ prospect?: string | string[] }>();
  const [name, setName] = useState('');
  const [path, setPath] = useState<string>('');
  const [evidence, setEvidence] = useState('');
  const [owner, setOwner] = useState('');
  const [checks, setChecks] = useState<ReadonlySet<HandoffCheck>>(new Set());
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prospects, setProspects] = useState<ArtistProspect[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [storageReady, setStorageReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    void AsyncStorage.getItem(ARTIST_PROSPECTS_KEY).then(value => {
      const items = readArtistProspects(value);
      setProspects(items);
      const requested = Array.isArray(requestedProspect) ? requestedProspect[0] : requestedProspect;
      const match = items.find(item => item.id === requested);
      if (match) { setSelectedId(match.id); setName(match.name); }
    }).catch(() => setStorageError(true)).finally(() => setStorageReady(true));
  }, [requestedProspect]);
  const complete = name.trim().length > 0 && path.length > 0 && evidence.trim().length >= 20 && owner.trim().length > 0;
  const report = complete ? formatArtistHandoff(name, path, evidence, checks, owner) : null;
  async function copy() {
    setMessage(null); setError(null);
    if (!report) { setError('Enter the act, discussion path, evidence, and review owner.'); return; }
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(report);
      } else if (!await Clipboard.setStringAsync(report)) throw new Error('Clipboard unavailable');
      setMessage('Handoff copied. No artist was invited or booked.');
    } catch { setError('Copy is unavailable. Select the draft and copy it manually.'); }
  }
  function toggle(id: HandoffCheck) {
    setChecks(current => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; }); setMessage(null);
  }
  async function saveFollowUp() {
    setMessage(null); setError(null);
    const selected = prospects.find(item => item.id === selectedId);
    if (!report || !selected || selected.name.trim().toLowerCase() !== name.trim().toLowerCase()) {
      setError('Complete the draft and select the matching private prospect before saving a follow-up.'); return;
    }
    setSaving(true);
    try {
      const current = readArtistProspectActions(await AsyncStorage.getItem(ARTIST_PROSPECT_ACTIONS_KEY));
      const action = `Review showcase handoff: ${path}`;
      if (current.some(item => !item.completed && item.prospectId === selected.id && item.action === action && item.owner === owner.trim())) {
        setMessage('An open follow-up for this prospect, path, and owner already exists on this device.'); return;
      }
      const item: ArtistProspectAction = {
        id: `prospect-action-${Date.now()}`, prospectId: selected.id, prospectName: selected.name,
        action, owner: owner.trim(), priority: 'Normal', dueDate: '',
        completed: false, updatedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(ARTIST_PROSPECT_ACTIONS_KEY, JSON.stringify([item, ...current]));
      setMessage('Private follow-up saved on this device. The evaluation draft was not saved or sent.');
    } catch { setError('The follow-up could not be saved. Existing private data was kept.'); }
    finally { setSaving(false); }
  }
  return <Screen>
    <Stack.Screen options={{ title: 'Artist Showcase Handoff' }} />
    <PageHeader eyebrow="ARTIST DEVELOPMENT · BUILD 78" title="Carry the showcase into a careful decision." description="An owner worksheet for deciding what conversation, if any, follows Monday auditions and Wednesday performance." />
    <PreviewNotice />
    <Card title="A discussion path, not an offer" description="A strong showcase can lead to more observation, development, a support slot discussion, or a future booking conversation. None happens automatically from a rating or this worksheet." />
    <Field label="Artist or act" value={name} onChangeText={setName} maxLength={120} placeholder="Stage name or group" />
    <SectionHeader title="Proposed discussion path" />
    <View accessibilityRole="radiogroup" accessibilityLabel="Proposed discussion path" style={local.options}>{handoffPaths.map(value => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: path === value }} onPress={() => setPath(value)} style={[local.option, path === value && local.selected]}><Text style={[local.optionText, path === value && local.selectedText]}>{value}</Text></Pressable>)}</View>
    <Field label="Evidence from the room" value={evidence} onChangeText={setEvidence} maxLength={1000} multiline numberOfLines={4} placeholder="Specific Monday and Wednesday observations, growth, audience response, and preparation" hint="At least 20 characters. Avoid private guest information." error={evidence.trim() && evidence.trim().length < 20 ? 'Add at least 20 characters of observations.' : undefined} />
    <Field label="Review owner or team" value={owner} onChangeText={setOwner} maxLength={120} placeholder="Who will lead the internal discussion?" />
    <SectionHeader title="Confirm before advancing" />
    <Body>Mark what the team has actually reviewed. Unmarked items remain visible in the copied draft.</Body>
    {handoffChecks.map(item => <Pressable key={item.id} accessibilityRole="checkbox" accessibilityState={{ checked: checks.has(item.id) }} onPress={() => toggle(item.id)} style={local.check}><Text style={styles.cardTitle}>{checks.has(item.id) ? '☑' : '☐'} {item.label}</Text><Body>{item.detail}</Body></Pressable>)}
    <SectionHeader title="Internal handoff draft" />
    {report ? <Text selectable style={styles.card}>{report}</Text> : <Body>Complete the act, discussion path, evidence, and review owner to preview the draft.</Body>}
    <ActionButton label="Copy artist handoff draft" onPress={() => { void copy(); }} />
    <SectionHeader title="Keep a private follow-up" />
    <Body>Select an existing prospect to save only the proposed discussion and owner role as a device-local follow-up. Copy the full evidence draft separately if needed.</Body>
    {storageError ? <Card title="Private pipeline unavailable" description="Prospects could not be read. No follow-up will be saved." /> : !storageReady ? <Body>Loading private prospects…</Body> : prospects.length ? <View accessibilityRole="radiogroup" accessibilityLabel="Matching private prospect" style={local.options}>{prospects.map(item => <Pressable key={item.id} accessibilityRole="radio" accessibilityState={{ checked: selectedId === item.id }} onPress={() => { setSelectedId(item.id); setName(item.name); setMessage(null); }} style={[local.option, selectedId === item.id && local.selected]}><Text style={[local.optionText, selectedId === item.id && local.selectedText]}>{item.name}</Text></Pressable>)}</View> : <Card title="No private prospects yet" description="Create a private prospect profile before linking a follow-up." />}
    <ActionButton label="Save linked private follow-up" disabled={!storageReady || storageError || saving || !report || !selectedId} onPress={() => { void saveFollowUp(); }} />
    <Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Review Wednesday performance" href="/showcase-review" secondary /><Button label="Open private prospect pipeline" href="/artist-development-dashboard" secondary /><Footer />
  </Screen>;
}
const local = StyleSheet.create({
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 12, paddingVertical: 10, justifyContent: 'center' },
  selected: { backgroundColor: theme.colors.gold, borderColor: theme.colors.gold },
  optionText: { color: theme.colors.cream, fontSize: 14 }, selectedText: { color: theme.colors.background },
  check: { padding: 18, backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 16, gap: 8, minHeight: 60 },
});
