import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { MEDIA_ACTIONS_KEY, readMediaActions, type MediaAction } from '../src/utils/mediaActions';
import { createMediaBundleTransfer, inspectMediaBundle, MAX_MEDIA_BUNDLE_TRANSFER, readMediaBundleTransfer, type MediaBundle } from '../src/utils/mediaBundle';
import { MEDIA_DRAFTS_KEY, readMediaDrafts, type MediaDraft } from '../src/utils/mediaDrafts';
import { theme } from '../src/theme';

export default function MediaBundleBackup() {
  const [drafts, setDrafts] = useState<MediaDraft[]>([]);
  const [actions, setActions] = useState<MediaAction[]>([]);
  const [ready, setReady] = useState(false);
  const [text, setText] = useState('');
  const [incoming, setIncoming] = useState<MediaBundle | null>(null);
  const [targets, setTargets] = useState<Record<string, string>>({});
  const [reviewed, setReviewed] = useState<string[]>([]);
  const [repairLog, setRepairLog] = useState<string[]>([]);
  const [initialFindings, setInitialFindings] = useState(0);
  const [receipt, setReceipt] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    void Promise.all([AsyncStorage.getItem(MEDIA_DRAFTS_KEY), AsyncStorage.getItem(MEDIA_ACTIONS_KEY)])
      .then(([draftValue, actionValue]) => {
        setDrafts(readMediaDrafts(draftValue));
        setActions(readMediaActions(actionValue));
      })
      .catch(() => setError('Private Media Group data could not be read on this device.'))
      .finally(() => setReady(true));
  }, []);
  const code = ready && (drafts.length || actions.length) ? createMediaBundleTransfer({ drafts, actions }) : '';
  const linkedCount = actions.filter((item) => drafts.some((draft) => draft.id === item.draftId)).length;
  async function copy() {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error();
        await navigator.clipboard.writeText(code);
      } else if (!(await Clipboard.setStringAsync(code))) throw new Error();
      setMessage('Unified private Media Group transfer code copied. Keep it secure.');
    } catch {
      setError('Copy is unavailable. Select the complete transfer code and copy it manually.');
    } finally {
      setBusy(false);
    }
  }
  async function copyReceipt() {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error();
        await navigator.clipboard.writeText(receipt);
      } else if (!(await Clipboard.setStringAsync(receipt))) throw new Error();
      setMessage('Private transfer receipt copied.');
    } catch {
      setError('Receipt copy is unavailable. Select the receipt and copy it manually.');
    } finally {
      setBusy(false);
    }
  }
  function review() {
    setIncoming(null);
    setTargets({});
    setReviewed([]);
    setRepairLog([]);
    setInitialFindings(0);
    setReceipt('');
    setMessage(null);
    setError(null);
    try {
      const bundle = readMediaBundleTransfer(text);
      setIncoming(bundle);
      setInitialFindings(inspectMediaBundle(bundle).length);
    } catch {
      setError('This unified Media Group transfer code could not be read. Current device data is unchanged.');
    }
  }
  function updateIncoming(next: MediaBundle, success: string) {
    setIncoming(next);
    setMessage(success);
    setError(null);
  }
  function fixMismatch(actionId: string) {
    if (!incoming) return;
    const action = incoming.actions.find((item) => item.id === actionId);
    const draft = incoming.drafts.find((item) => item.id === action?.draftId);
    if (!action || !draft) return;
    setRepairLog((current) => [...current, `Corrected stored draft title for “${action.action}” to “${draft.title}”.`]);
    updateIncoming(
      {
        ...incoming,
        actions: incoming.actions.map((item) =>
          item.id === actionId
            ? {
                ...item,
                draftTitle: draft.title,
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      },
      `${action.action} now matches ${draft.title}.`,
    );
  }
  function reassign(actionId: string) {
    if (!incoming) return;
    const target = incoming.drafts.find((item) => item.id === targets[actionId]);
    const action = incoming.actions.find((item) => item.id === actionId);
    if (!target || !action) {
      setError('Choose an incoming draft before reconnecting this action.');
      return;
    }
    setRepairLog((current) => [...current, `Reconnected “${action.action}” to “${target.title}”.`]);
    updateIncoming(
      {
        ...incoming,
        actions: incoming.actions.map((item) =>
          item.id === actionId
            ? {
                ...item,
                draftId: target.id,
                draftTitle: target.title,
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      },
      `${action.action} was reconnected to ${target.title}.`,
    );
  }
  function retain(issueKey: string, actionId: string) {
    const action = incoming?.actions.find((item) => item.id === actionId);
    setReviewed((current) => [...current, issueKey]);
    setRepairLog((current) => [...current, `Retained “${action?.action ?? 'Action'}” as unlinked private history.`]);
  }
  function acknowledge(issueKey: string, title: string) {
    setReviewed((current) => [...current, issueKey]);
    setRepairLog((current) => [...current, `Acknowledged ${title}.`]);
  }
  function removeIncomingAction(actionId: string) {
    if (!incoming) return;
    const action = incoming.actions.find((item) => item.id === actionId);
    setRepairLog((current) => [...current, `Removed “${action?.action ?? 'Action'}” from the incoming bundle.`]);
    updateIncoming(
      {
        ...incoming,
        actions: incoming.actions.filter((item) => item.id !== actionId),
      },
      `${action?.action ?? 'The action'} was removed from the incoming bundle.`,
    );
  }
  async function replace() {
    if (!incoming) return;
    if (unresolved.length) {
      setError('Review or repair every integrity finding before replacing device data.');
      return;
    }
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      await AsyncStorage.multiSet([
        [MEDIA_DRAFTS_KEY, JSON.stringify(incoming.drafts)],
        [MEDIA_ACTIONS_KEY, JSON.stringify(incoming.actions)],
      ]);
      const linked = incoming.actions.filter((item) => incoming.drafts.some((draft) => draft.id === item.draftId)).length;
      setReceipt(['PTOWN MEDIA GROUP — PRIVATE UNIFIED TRANSFER RECEIPT', '', `Completed: ${new Date().toISOString()}`, `Private drafts replaced: ${incoming.drafts.length}`, `Private actions replaced: ${incoming.actions.length}`, `Linked actions: ${linked}`, `Unlinked history retained: ${incoming.actions.length - linked}`, `Initial integrity findings: ${initialFindings}`, '', 'REVIEW DECISIONS', ...(repairLog.length ? repairLog.map((item) => `- ${item}`) : ['- No repairs or retention decisions were needed.']), '', 'DEVICE-LOCAL RECEIPT — Not proof of submission, approval, assignment, notification, or cloud backup.'].join('\n'));
      setDrafts(incoming.drafts);
      setActions(incoming.actions);
      setIncoming(null);
      setText('');
      setMessage('Private drafts and actions were replaced together on this device.');
    } catch {
      setError('Unified replacement failed. Existing private Media Group data was kept.');
    } finally {
      setBusy(false);
    }
  }
  const incomingLinked = incoming?.actions.filter((item) => incoming.drafts.some((draft) => draft.id === item.draftId)).length ?? 0;
  const incomingIssues = incoming ? inspectMediaBundle(incoming) : [];
  const unresolved = incomingIssues.filter((issue) => !reviewed.includes(issue.key));
  return (
    <Screen>
      <PageHeader eyebrow="PTOWN MEDIA GROUP · UNIFIED PRIVATE TRANSFER" title="Move drafts and actions together." description="Create one reviewed transfer code for private production drafts, their workbooks and record references, and the owner action queue." />
      <PreviewNotice />
      <Card title="One device-controlled bundle" description="This replaces both private datasets together so linked actions keep their draft relationships. It does not merge, sync, submit, assign, notify, or create an account." />
      <SectionHeader title="Back up this device" />
      {!ready ? (
        <Body>Loading private Media Group data…</Body>
      ) : code ? (
        <View style={styles.card}>
          <Body>
            {drafts.length} private {drafts.length === 1 ? 'draft' : 'drafts'} · {actions.length} private {actions.length === 1 ? 'action' : 'actions'}
            {`\n`}
            {linkedCount} linked · {actions.length - linkedCount} unlinked history
          </Body>
          <ActionButton
            label="Copy unified Media Group transfer code"
            disabled={busy}
            onPress={() => {
              void copy();
            }}
          />
          <Field label="Unified Media Group transfer code" value={code} multiline editable={false} style={{ minHeight: 220, textAlignVertical: 'top', fontSize: 12 }} />
        </View>
      ) : (
        <Card title="No private Media Group data to transfer" description="Create a production draft or owner action first, or restore a reviewed unified transfer below." />
      )}
      <SectionHeader title="Review a unified transfer" />
      <Field
        label="Paste unified Media Group transfer code"
        value={text}
        onChangeText={(value) => {
          setText(value);
          setIncoming(null);
          setReceipt('');
          setMessage(null);
          setError(null);
        }}
        maxLength={MAX_MEDIA_BUNDLE_TRANSFER}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        style={{ minHeight: 180, textAlignVertical: 'top' }}
      />
      <ActionButton label="Review unified Media Group transfer" disabled={!text.trim() || busy} secondary onPress={review} />
      <Feedback message={message} />
      {error && (
        <Text accessibilityRole="alert" style={formStyles.error}>
          {error}
        </Text>
      )}
      {incoming && (
        <View style={styles.card}>
          <SectionHeader title="Review before replacing both datasets" />
          <Body>
            {incoming.drafts.length} incoming private {incoming.drafts.length === 1 ? 'draft' : 'drafts'} · {incoming.actions.length} incoming private {incoming.actions.length === 1 ? 'action' : 'actions'}
            {`\n`}
            {incomingLinked} linked · {incoming.actions.length - incomingLinked} unlinked history{`\n\n`}Confirming overwrites both current device lists. It does not merge.
          </Body>
          <SectionHeader title="Transfer integrity report" />
          {incomingIssues.length ? (
            <>
              <Card title={`${unresolved.length} of ${incomingIssues.length} integrity ${incomingIssues.length === 1 ? 'finding' : 'findings'} unresolved`} description="Repair each relationship or explicitly retain reviewed history before replacement." />
              {incomingIssues.map((issue) => (
                <View key={issue.key} style={{ gap: 8 }}>
                  <Text style={styles.cardTitle}>{issue.title}</Text>
                  <Body>{issue.detail}</Body>
                  {issue.kind === 'title-mismatch' && <ActionButton label={`Update stored title for ${incoming.actions.find((item) => item.id === issue.refId)?.action}`} disabled={busy} secondary onPress={() => fixMismatch(issue.refId)} />}
                  {issue.kind === 'orphaned-action' && (
                    <>
                      <Text style={styles.cardTitle}>Reconnect to incoming draft</Text>
                      <View accessibilityRole="radiogroup" accessibilityLabel={`Incoming destination for ${incoming.actions.find((item) => item.id === issue.refId)?.action}`} style={styles.grid}>
                        {incoming.drafts.map((draft) => (
                          <Choice
                            key={draft.id}
                            label={draft.title}
                            selected={targets[issue.refId] === draft.id}
                            onPress={() =>
                              setTargets((current) => ({
                                ...current,
                                [issue.refId]: draft.id,
                              }))
                            }
                          />
                        ))}
                      </View>
                      <ActionButton label={`Reconnect ${incoming.actions.find((item) => item.id === issue.refId)?.action}`} disabled={busy || !incoming.drafts.length} secondary onPress={() => reassign(issue.refId)} />
                      <ActionButton label={`Retain ${incoming.actions.find((item) => item.id === issue.refId)?.action} as unlinked history`} disabled={busy || reviewed.includes(issue.key)} secondary onPress={() => retain(issue.key, issue.refId)} />
                      <ActionButton label={`Remove ${incoming.actions.find((item) => item.id === issue.refId)?.action} from incoming bundle`} disabled={busy} secondary onPress={() => removeIncomingAction(issue.refId)} />
                    </>
                  )}
                  {issue.kind === 'duplicate-title' && <ActionButton label={`Acknowledge ${issue.title}`} disabled={busy || reviewed.includes(issue.key)} secondary onPress={() => acknowledge(issue.key, issue.title)} />}
                  {reviewed.includes(issue.key) && <Body>Reviewed and retained for this replacement.</Body>}
                </View>
              ))}
            </>
          ) : (
            <Card title="No relationship issues found" description="Draft titles are distinct, every action points to an included draft, and stored action titles match their linked drafts." />
          )}
          {incoming.drafts.map((draft) => (
            <View key={draft.id}>
              <Text style={styles.cardTitle}>{draft.title}</Text>
              <Body>
                {draft.status} · {draft.division} · {incoming.actions.filter((item) => item.draftId === draft.id).length} linked actions
              </Body>
            </View>
          ))}
          <ActionButton
            label={unresolved.length ? `Resolve ${unresolved.length} integrity ${unresolved.length === 1 ? 'finding' : 'findings'} before replacement` : 'Replace private drafts and actions together'}
            disabled={busy || Boolean(unresolved.length)}
            onPress={() => {
              void replace();
            }}
          />
          <ActionButton label="Cancel unified replacement" disabled={busy} secondary onPress={() => setIncoming(null)} />
        </View>
      )}
      {receipt && (
        <View style={styles.card}>
          <SectionHeader title="Private transfer receipt" />
          <Body>Copy this receipt now if you want to keep it with your private records. It is not an official PTown audit record or cloud backup.</Body>
          <ActionButton
            label="Copy private transfer receipt"
            disabled={busy}
            onPress={() => {
              void copyReceipt();
            }}
          />
          <Field
            label="Private transfer receipt"
            value={receipt}
            multiline
            editable={false}
            style={{
              minHeight: 220,
              textAlignVertical: 'top',
              fontSize: 12,
            }}
          />
        </View>
      )}
      <Button label="Manage private production drafts" href="/media-drafts" secondary />
      <Button label="Open owner action queue" href="/media-actions" secondary />
      <Footer />
    </Screen>
  );
}
function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={{
        minHeight: 48,
        paddingHorizontal: 16,
        paddingVertical: 13,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: selected ? theme.colors.gold : theme.colors.surface,
      }}
    >
      <Text
        style={{
          color: selected ? theme.colors.background : theme.colors.cream,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
