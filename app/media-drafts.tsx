import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { mediaGroupDivisions } from '../src/data/mediaGroup';
import { mediaProjectStatuses, type MediaProjectStatus } from '../src/data/mediaProjects';
import { MEDIA_DRAFTS_KEY, readMediaDrafts, type MediaDraft } from '../src/utils/mediaDrafts';
import { theme } from '../src/theme';

const blank = { title: '', division: mediaGroupDivisions[0].title, owner: '', status: 'Assigned' as MediaProjectStatus, deadline: '', notes: '' };
export default function MediaDrafts() {
  const [drafts, setDrafts] = useState<MediaDraft[]>([]); const [form, setForm] = useState(blank); const [editing, setEditing] = useState<string | null>(null); const [ready, setReady] = useState(false); const [busy, setBusy] = useState(false); const [message, setMessage] = useState<string | null>(null); const [error, setError] = useState<string | null>(null);
  useEffect(() => { void AsyncStorage.getItem(MEDIA_DRAFTS_KEY).then(value => { setDrafts(readMediaDrafts(value)); }).catch(() => setError('Private production drafts could not be read on this device.')).finally(() => setReady(true)); }, []);
  function update<K extends keyof typeof blank>(key: K, value: typeof blank[K]) { setForm(current => ({ ...current, [key]: value })); setMessage(null); setError(null); }
  function reset() { setForm(blank); setEditing(null); setMessage(null); setError(null); }
  async function save() {
    if (!form.title.trim() || !form.owner.trim()) { setError('Enter a project title and owner before saving.'); return; }
    setBusy(true); setError(null); setMessage(null);
    const item: MediaDraft = { ...form, id: editing ?? `draft-${Date.now()}`, title: form.title.trim(), owner: form.owner.trim(), deadline: form.deadline.trim(), notes: form.notes.trim(), updatedAt: new Date().toISOString() };
    const next = editing ? drafts.map(draft => draft.id === editing ? item : draft) : [item, ...drafts];
    try { await AsyncStorage.setItem(MEDIA_DRAFTS_KEY, JSON.stringify(next)); setDrafts(next); setForm(blank); setEditing(null); setMessage(editing ? 'Private production draft updated on this device.' : 'Private production draft saved on this device.'); }
    catch { setError('The draft could not be saved. Existing drafts are unchanged.'); } finally { setBusy(false); }
  }
  async function remove(id: string) { setBusy(true); setError(null); const next = drafts.filter(draft => draft.id !== id); try { await AsyncStorage.setItem(MEDIA_DRAFTS_KEY, JSON.stringify(next)); setDrafts(next); if (editing === id) reset(); setMessage('Private production draft removed from this device.'); } catch { setError('The draft could not be removed. Existing drafts are unchanged.'); } finally { setBusy(false); } }
  return <Screen><PageHeader eyebrow="PTOWN MEDIA GROUP · PRIVATE DEVICE DRAFTS" title="Create the assignment before it enters production." description="Create, edit, review, and remove private production-planning drafts on this device. No backend, staff notification, approval, or shared workflow is created." /><PreviewNotice />
    <Card title="Private to this device" description="Drafts remain in this browser or app storage. They do not sync between devices and are not part of PTown’s official records. Do not enter confidential, medical, financial, credential, or legally sensitive information." />
    <SectionHeader title={editing ? 'Edit production draft' : 'New production draft'} />
    <Field label="Project title" value={form.title} onChangeText={value => update('title', value.slice(0, 120))} placeholder="Working project title" editable={ready && !busy} />
    <Field label="Owner or responsible role" value={form.owner} onChangeText={value => update('owner', value.slice(0, 120))} placeholder="Role or team—not private contact information" editable={ready && !busy} />
    <Field label="Deadline or timing note" value={form.deadline} onChangeText={value => update('deadline', value.slice(0, 120))} placeholder="Date, event, or timing still to be confirmed" editable={ready && !busy} />
    <Text style={styles.cardTitle}>Division</Text><ChoiceList label="Draft division" items={mediaGroupDivisions.map(item => item.title)} selected={form.division} onChoose={value => update('division', value)} />
    <Text style={styles.cardTitle}>Status</Text><ChoiceList label="Draft status" items={mediaProjectStatuses} selected={form.status} onChoose={value => update('status', value as MediaProjectStatus)} />
    <Field label="Planning notes" value={form.notes} onChangeText={value => update('notes', value.slice(0, 1000))} placeholder="Scope, dependencies, next decision, or readiness note" multiline style={{ minHeight: 120, textAlignVertical: 'top' }} editable={ready && !busy} />
    <ActionButton label={editing ? 'Update private draft' : 'Save private draft'} disabled={!ready || busy} onPress={() => { void save(); }} />{editing && <ActionButton label="Cancel editing" disabled={busy} secondary onPress={reset} />}
    <Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <SectionHeader title="Drafts on this device" />{!ready ? <Body>Loading private drafts…</Body> : drafts.length ? drafts.map(draft => <View key={draft.id} style={styles.card}><Text style={{ color: theme.colors.gold, fontSize: 12, fontWeight: '700' }}>{draft.status.toUpperCase()} · {draft.division.toUpperCase()}</Text><Text style={styles.cardTitle}>{draft.title}</Text><Body>Owner: {draft.owner}{'\n'}Deadline: {draft.deadline || 'Not entered'}{draft.notes ? `\nNotes: ${draft.notes}` : ''}</Body><Button label={`Review ${draft.title}`} href={{ pathname: '/media-drafts/[id]', params: { id: draft.id } }} secondary /><ActionButton label={`Edit ${draft.title}`} disabled={busy} secondary onPress={() => { setEditing(draft.id); setForm({ title: draft.title, division: draft.division, owner: draft.owner, status: draft.status, deadline: draft.deadline, notes: draft.notes }); setMessage(null); }} /><ActionButton label={`Remove ${draft.title}`} disabled={busy} secondary onPress={() => { void remove(draft.id); }} /></View>) : <Card title="No private production drafts" description="Create the first planning draft above. The sample production dashboard remains separate and unchanged." />}
    <Button label="Back up or transfer private drafts" href="/media-draft-backup" /><Button label="Open the sample production dashboard" href="/media-dashboard" secondary /><Button label="Open production templates" href="/media-templates" secondary /><Footer />
  </Screen>;
}
function ChoiceList({ label, items, selected, onChoose }: { label: string; items: readonly string[]; selected: string; onChoose: (value: string) => void }) { return <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.grid}>{items.map(item => <Pressable key={item} accessibilityRole="radio" accessibilityState={{ checked: selected === item }} onPress={() => onChoose(item)} style={{ minHeight: 48, paddingHorizontal: 16, paddingVertical: 13, borderRadius: 24, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: selected === item ? theme.colors.gold : theme.colors.surface }}><Text style={{ color: selected === item ? theme.colors.background : theme.colors.cream, fontWeight: '600' }}>{item}</Text></Pressable>)}</View>; }
