import { useEffect, useRef, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { usePreviewStore, type PreviewState } from '../src/state/PreviewStore';
import { createTransferCode, maxTransferLength, readTransferCode } from '../src/utils/previewBackup';
import { planSummary } from '../src/utils/planSummary';
import { isPastDate } from '../src/utils/programDay';

export default function Backup() {
  const store = usePreviewStore();
  const hasPlans = planSummary(store).hasPlans;
  const code = store.ready && hasPlans ? createTransferCode(store) : '';
  const currentCode = useRef(code); currentCode.current = code;
  const [copying, setCopying] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [incoming, setIncoming] = useState<PreviewState | null>(null);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  useEffect(() => { setCopyMessage(null); setCopyError(null); }, [code]);

  async function copy() {
    const outgoing = code;
    setCopying(true); setCopyMessage(null); setCopyError(null);
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Unavailable');
        await navigator.clipboard.writeText(outgoing);
      } else if (!await Clipboard.setStringAsync(outgoing)) throw new Error('Unavailable');
      if (currentCode.current === outgoing) setCopyMessage('Transfer code copied. Paste it into PTown Access on your other device.');
    } catch {
      if (currentCode.current === outgoing) setCopyError('Copy is unavailable. Select the transfer code below and copy it manually.');
    } finally { setCopying(false); }
  }
  function edit(value: string) { setText(value); setIncoming(null); setRestoreMessage(null); setRestoreError(null); }
  function review() {
    setRestoreMessage(null); setRestoreError(null); setIncoming(null);
    try { setIncoming(readTransferCode(text)); }
    catch { setRestoreError('This transfer code could not be read. Copy a complete, current code from PTown Access. Your saved plans are unchanged.'); }
  }
  async function restore() {
    if (!incoming) return;
    setRestoreMessage(null); setRestoreError(null);
    try {
      if (await store.restorePlans(incoming)) {
        setIncoming(null); setText('');
        setRestoreMessage('Plans restored on this device. No bookings, purchases, or enrollment were created.');
      } else setRestoreError('Restoring failed. Your previous saved data has been kept. You can try again.');
    } catch { setRestoreError('Restoring failed. Your previous saved data has been kept.'); }
  }

  return <Screen>
    <PageHeader eyebrow="KEEP YOUR PTOWN IDEAS" title="Back up your plans." description="Copy a transfer code to keep a backup or move your saved ideas to another device. You choose when to restore it." />
    <PreviewNotice />
    <Card title="A manual transfer, on your terms" description="This code contains your saved programs, creative interests, dinner date, guest count, occasion, dinner note, and membership interest. Keep it somewhere you can find again. It does not create an account or automatically sync devices." />
    <SectionHeader title="Copy from this device" />
    {!store.ready ? <Body>{store.storageError ? 'Your current saved data is unreadable. You can review and restore a valid transfer code below, or reset data in Profile.' : 'Loading your saved plans…'}</Body> : !hasPlans ? <Card title="No plans to back up yet" description="Save a program or another planning idea first. You can still restore a transfer code below." /> : <View style={styles.card}>
      <ActionButton label={copying ? 'Copying…' : 'Copy transfer code'} disabled={copying || store.busy} onPress={() => { void copy(); }} />
      <Feedback message={copyMessage} />{copyError && <Text accessibilityRole="alert" style={formStyles.error}>{copyError}</Text>}
      <Field label="Your transfer code" hint="Select and copy all of this text if automatic copying is unavailable." value={code} multiline editable={false} style={{ minHeight: 220, lineHeight: 22, fontSize: 13, textAlignVertical: 'top' }} />
    </View>}
    <SectionHeader title="Restore on this device" />
    <Body>Paste the complete code from your backup or other device. Review its contents before replacing this device’s saved plans.</Body>
    <Field label="Paste a transfer code" value={text} onChangeText={edit} multiline editable={!store.busy} maxLength={maxTransferLength} autoCapitalize="none" autoCorrect={false} placeholder="Paste your complete PTown transfer code" style={{ minHeight: 160, textAlignVertical: 'top' }} />
    <ActionButton label="Review transfer code" disabled={!text.trim() || store.busy} secondary onPress={review} />
    <Feedback message={restoreMessage} />{restoreError && <Text accessibilityRole="alert" style={formStyles.error}>{restoreError}</Text>}
    {incoming && <View style={styles.card}>
      <SectionHeader title="Review before replacing" />
      <Body>{incoming.savedEventIds.length} saved {incoming.savedEventIds.length === 1 ? 'program' : 'programs'} · {incoming.savedPathwayIds.length} creative {incoming.savedPathwayIds.length === 1 ? 'interest' : 'interests'} · {incoming.reservationDraft ? 'Dinner draft included' : 'No dinner draft'} · {incoming.membershipInterest ? 'Membership interest included' : 'No membership interest'}</Body>
      {incoming.reservationDraft && isPastDate(incoming.reservationDraft.date) && <Body>This imported date has passed. You can edit it after restoring.</Body>}
      <Field label="Plans to restore" value={planSummary(incoming).text} multiline editable={false} style={{ minHeight: 300, lineHeight: 23, fontSize: 14, textAlignVertical: 'top' }} />
      <Body>Restoring replaces all saved plans on this device with the reviewed contents. It does not merge them. Back up your current plans first if you want to keep them.</Body>
      {!store.ready && store.storageError && <Body>Your existing data cannot be read. Restoring will replace that data with these reviewed plans.</Body>}
      <ActionButton label="Replace this device’s plans" disabled={store.busy || (!store.ready && !store.storageError)} onPress={() => { void restore(); }} />
      <ActionButton label="Cancel restore" disabled={store.busy} secondary onPress={() => { setIncoming(null); setRestoreError(null); }} />
    </View>}
    <Button label="Open saved plans" href="/profile" secondary /><Button label="Review your plan" href="/plans" secondary /><Footer />
  </Screen>;
}
