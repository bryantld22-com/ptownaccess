import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { createMediaPassportTransfer, MAX_MEDIA_PASSPORT_TRANSFER, planMediaPassportMerge, readMediaPassportTransfer, type MediaPassportDuplicateChoice, type MediaPassportMergeChoice } from '../src/utils/mediaPassportTransfer';
import { MEDIA_PASSPORTS_KEY, readMediaPassports, type MediaPassportDraft } from '../src/utils/mediaPassports';

export default function MediaPassportBackup() {
  const [drafts, setDrafts] = useState<MediaPassportDraft[]>([]);
  const [codeInput, setCodeInput] = useState('');
  const [incoming, setIncoming] = useState<MediaPassportDraft[] | null>(null);
  const [choices, setChoices] = useState<Record<string, MediaPassportMergeChoice>>({});
  const [duplicateChoices, setDuplicateChoices] = useState<Record<string, MediaPassportDuplicateChoice>>({});
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void AsyncStorage.getItem(MEDIA_PASSPORTS_KEY).then(value => setDrafts(readMediaPassports(value))).catch(() => setStorageError(true)).finally(() => setReady(true)); }, []);
  const code = ready && !storageError && drafts.length ? createMediaPassportTransfer(drafts) : '';
  const mergePlan = incoming ? planMediaPassportMerge(drafts, incoming, choices, duplicateChoices) : null;
  async function copy() {
    setBusy(true); setMessage(null); setError(null);
    try {
      if (!code) throw new Error('No transfer code');
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(code);
      } else if (!await Clipboard.setStringAsync(code)) throw new Error('Clipboard unavailable');
      setMessage('Private Skills Passport transfer code copied. Keep it secure.');
    } catch { setError('Copy is unavailable. Select the complete code and copy it manually.'); }
    finally { setBusy(false); }
  }
  function review() {
    setMessage(null); setError(null); setIncoming(null); setChoices({}); setDuplicateChoices({});
    try { setIncoming(readMediaPassportTransfer(codeInput)); }
    catch { setError('This transfer code could not be validated. Current drafts are unchanged.'); }
  }
  async function replace() {
    if (!incoming || !ready || storageError) return;
    setBusy(true); setMessage(null); setError(null);
    try {
      // Re-read before replacement so a failed or changed local record is never silently discarded.
      const current = readMediaPassports(await AsyncStorage.getItem(MEDIA_PASSPORTS_KEY));
      if (JSON.stringify(current) !== JSON.stringify(drafts)) throw new Error('Current drafts changed');
      await AsyncStorage.setItem(MEDIA_PASSPORTS_KEY, JSON.stringify(incoming));
      setDrafts(incoming); setIncoming(null); setCodeInput('');
      setMessage('Reviewed Skills Passport drafts replaced on this device. No mentor was notified.');
    } catch { setError('Replacement failed or current drafts changed. Reload before trying again. Existing device data was not intentionally changed.'); }
    finally { setBusy(false); }
  }
  async function merge() {
    if (!incoming || !mergePlan || mergePlan.unresolved.length || mergePlan.unresolvedDuplicates.length || mergePlan.overLimit || !ready || storageError) return;
    setBusy(true); setMessage(null); setError(null);
    try {
      const current = readMediaPassports(await AsyncStorage.getItem(MEDIA_PASSPORTS_KEY));
      if (JSON.stringify(current) !== JSON.stringify(drafts)) throw new Error('Current drafts changed');
      const plan = planMediaPassportMerge(current, incoming, choices, duplicateChoices);
      if (plan.unresolved.length || plan.unresolvedDuplicates.length || plan.overLimit) throw new Error('Merge not ready');
      const validated = readMediaPassports(JSON.stringify(plan.merged));
      await AsyncStorage.setItem(MEDIA_PASSPORTS_KEY, JSON.stringify(validated));
      setDrafts(validated); setIncoming(null); setChoices({}); setDuplicateChoices({}); setCodeInput('');
      setMessage(`Merged ${plan.added} new drafts, skipped ${plan.skipped} incoming copies, and reviewed ${plan.conflicts.length} changed drafts on this device. No mentor was notified.`);
    } catch { setError('Merge failed or current drafts changed. Reload before trying again. Existing device data was not intentionally changed.'); }
    finally { setBusy(false); }
  }
  return <Screen>
    <PageHeader eyebrow="PTOWN MEDIA ACADEMY · BUILD 88" title="Move Skills Passport drafts carefully." description="Copy a private transfer code, review its contents, then merge or replace saved drafts on another device." />
    <PreviewNotice />
    <Card title="This code contains private planning notes" description="It may include participant names, mentor names, and portfolio evidence. Share it only through a trusted channel and keep a separate copy before replacing device data. Transfer does not certify skills or enroll anyone." />
    <SectionHeader title="Back up this device" />
    {!ready ? <Body>Loading saved passports…</Body> : storageError ? <Card title="Saved passports unavailable" description="Device data could not be read. Replacement is disabled to protect existing drafts." /> : code ? <><Card title={`${drafts.length} saved ${drafts.length === 1 ? 'draft' : 'drafts'}`} description="Copy the full transfer code and keep it secure before moving devices." /><ActionButton label="Copy Skills Passport transfer code" disabled={busy} onPress={() => { void copy(); }} /><Field label="Private transfer code" value={code} multiline editable={false} style={{ minHeight: 180, textAlignVertical: 'top', fontSize: 12 }} /></> : <Card title="No saved drafts to transfer" description="Save a Skills Passport first, or review a transfer below." />}
    <SectionHeader title="Review a transfer" />
    <Field label="Paste a Skills Passport transfer code" value={codeInput} onChangeText={value => { setCodeInput(value); setIncoming(null); setChoices({}); setDuplicateChoices({}); setMessage(null); setError(null); }} maxLength={MAX_MEDIA_PASSPORT_TRANSFER} multiline autoCapitalize="none" autoCorrect={false} style={{ minHeight: 180, textAlignVertical: 'top' }} />
    <ActionButton label="Review incoming drafts" disabled={!ready || storageError || busy || !codeInput.trim()} secondary onPress={review} />
    {incoming && mergePlan && <><Card title={`${incoming.length} incoming ${incoming.length === 1 ? 'draft' : 'drafts'}`} description={`Merge can add ${mergePlan.added} new drafts while keeping current records. ${mergePlan.identical} are identical. ${mergePlan.conflicts.length} changed records use the same ID and need a choice. Review the entries below.`} />{incoming.map(item => <Card key={item.id} title={`${item.participant} · ${item.divisionId}`} description={`Skills with evidence noted: ${item.skills.join(', ') || 'None'}\nPortfolio evidence: ${item.evidence}\nProposed mentor: ${item.mentor || 'To assign'}\nUpdated: ${item.updatedAt.slice(0, 10)}`} />)}
      {mergePlan.conflicts.map(item => { const current = drafts.find(value => value.id === item.id)!; return <Card key={item.id} title={`Choose version · ${item.participant}`} description={`CURRENT · ${current.participant} · ${current.divisionId} · ${current.updatedAt.slice(0, 10)}\nSkills: ${current.skills.join(', ') || 'None'}\nEvidence: ${current.evidence}\nMentor: ${current.mentor || 'To assign'}\n\nINCOMING · ${item.participant} · ${item.divisionId} · ${item.updatedAt.slice(0, 10)}\nSkills: ${item.skills.join(', ') || 'None'}\nEvidence: ${item.evidence}\nMentor: ${item.mentor || 'To assign'}`} />; })}
      {mergePlan.conflicts.map(item => <View key={`choice-${item.id}`} style={{ gap: 8 }}><Text style={styles.cardTitle}>{item.participant} · {choices[item.id] ? `Keep ${choices[item.id]} version` : 'Choice required'}</Text><ActionButton label={`Keep current ${item.participant}`} secondary onPress={() => setChoices(value => ({ ...value, [item.id]: 'current' }))} /><ActionButton label={`Use incoming ${item.participant}`} secondary onPress={() => setChoices(value => ({ ...value, [item.id]: 'incoming' }))} /></View>)}
      {mergePlan.duplicateCandidates.map(candidate => <View key={`duplicate-${candidate.incoming.id}`} style={{ gap: 8 }}>
        <Card title={`Possible duplicate · ${candidate.incoming.participant}`} description={`This incoming draft has a different ID but shares a name and division with ${candidate.existing.length} saved or incoming draft(s).\nCURRENT OR EARLIER: ${candidate.existing.map(item => `${item.updatedAt.slice(0, 10)} · ${item.evidence}`).join('\n')}\nINCOMING: ${candidate.incoming.updatedAt.slice(0, 10)} · ${candidate.incoming.evidence}`} />
        <Text style={styles.cardTitle}>{duplicateChoices[candidate.incoming.id] ? `Choice: ${duplicateChoices[candidate.incoming.id]}` : 'Choose how to handle this incoming copy'}</Text>
        <ActionButton label={`Keep both ${candidate.incoming.participant} drafts`} secondary onPress={() => setDuplicateChoices(value => ({ ...value, [candidate.incoming.id]: 'keep-both' }))} />
        <ActionButton label={`Skip incoming ${candidate.incoming.participant} draft`} secondary onPress={() => setDuplicateChoices(value => ({ ...value, [candidate.incoming.id]: 'skip-incoming' }))} />
      </View>)}
      {mergePlan.overLimit && <Card title="Merge exceeds 50 drafts" description="This device supports up to 50 saved drafts. Merge is disabled; review the transfer or replace the existing list after backing it up." />}
      <ActionButton label={`Merge reviewed drafts (${mergePlan.unresolved.length + mergePlan.unresolvedDuplicates.length} choices remaining)`} disabled={busy || mergePlan.unresolved.length > 0 || mergePlan.unresolvedDuplicates.length > 0 || mergePlan.overLimit} onPress={() => { void merge(); }} />
      <Card title="Replace the entire list" description={`Replacement removes all ${drafts.length} currently saved drafts and stores only the ${incoming.length} incoming drafts. Make a separate backup first.`} />
      <ActionButton label="Replace current Skills Passports with reviewed drafts" secondary disabled={busy} onPress={() => { void replace(); }} /></>}
    <Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Return to Skills Passport" href="/media-passport" secondary /><Footer />
  </Screen>;
}
