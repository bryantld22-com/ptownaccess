import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Platform, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { ActionButton, Feedback, Field, formStyles } from '../../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../../src/components/ui';
import { MEDIA_DRAFTS_KEY, mediaDraftSummary, readMediaDrafts, templateForMediaDraft, type MediaDraft } from '../../src/utils/mediaDrafts';
import { theme } from '../../src/theme';

export default function MediaDraftReview() {
  const { id } = useLocalSearchParams<{ id: string }>(); const [draft, setDraft] = useState<MediaDraft | null>(null); const [ready, setReady] = useState(false); const [message, setMessage] = useState<string | null>(null); const [error, setError] = useState<string | null>(null);
  useEffect(() => { void AsyncStorage.getItem(MEDIA_DRAFTS_KEY).then(value => setDraft(readMediaDrafts(value).find(item => item.id === id) ?? null)).catch(() => setError('This device’s private drafts could not be read.')).finally(() => setReady(true)); }, [id]);
  if (!ready) return <Screen><Body>Loading private production draft…</Body></Screen>;
  if (!draft) return <Screen><PageHeader eyebrow="PRIVATE PRODUCTION DRAFT" title="Draft not found." description="This draft may have been removed, may belong to another device, or the link may be incomplete." />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}<Button label="Manage private production drafts" href="/media-drafts" secondary /><Footer /></Screen>;
  const summary = mediaDraftSummary(draft); const warnings = [!draft.deadline && 'Deadline or timing has not been entered.', !draft.notes && 'Planning notes have not been entered.', draft.status === 'Assigned' && 'The draft is assigned but pre-production readiness has not been recorded.', draft.status === 'Approved' && 'Approved is only a private planning label; no official approval record is attached.', draft.status === 'Archived' && 'Archived is only a private planning label; archive files and rights records are not verified.'].filter(Boolean) as string[];
  async function copy() { setMessage(null); setError(null); try { if (Platform.OS === 'web') { if (typeof navigator.clipboard?.writeText !== 'function') throw new Error(); await navigator.clipboard.writeText(summary); } else if (!await Clipboard.setStringAsync(summary)) throw new Error(); setMessage('Private draft summary copied. It has not been submitted, shared, or approved by PTown.'); } catch { setError('Copy is unavailable. Select the summary and copy it manually.'); } }
  return <Screen><Stack.Screen options={{ title: draft.title }} /><PageHeader eyebrow="PTOWN MEDIA GROUP · PRIVATE DRAFT REVIEW" title={draft.title} description="Review readiness, copy a private summary, and open the operating template that best matches this draft’s current status." /><PreviewNotice />
    <View style={styles.card}><Text style={{ color: theme.colors.gold, fontSize: 12, fontWeight: '700' }}>{draft.status.toUpperCase()} · {draft.division.toUpperCase()}</Text><Body>Owner: {draft.owner}{'\n'}Deadline: {draft.deadline || 'Not entered'}{draft.notes ? `\nNotes: ${draft.notes}` : ''}</Body></View>
    <SectionHeader title="Readiness review" />{warnings.length ? warnings.map(warning => <Card key={warning} title="Needs attention" description={warning} />) : <Card title="Basic planning fields complete" description="The private draft has an owner, deadline, and planning notes. This does not confirm rights, releases, staffing, budget, technical readiness, or approval." />}
    <SectionHeader title="Copy or export" /><Field label="Private draft summary" value={summary} multiline editable={false} style={{ minHeight: 300, textAlignVertical: 'top', lineHeight: 22 }} /><ActionButton label="Copy private draft summary" onPress={() => { void copy(); }} /><Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Open private production workbook" href={{ pathname: '/media-draft-workbook/[id]', params: { id: draft.id } }} /><Button label="Open recommended operating template" href={{ pathname: '/media-templates/[id]', params: { id: templateForMediaDraft(draft) } }} secondary /><Button label="Manage private production drafts" href="/media-drafts" secondary /><Footer />
  </Screen>;
}
