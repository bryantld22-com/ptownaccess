import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { accessRequestControls, accessRequestWindows, type AccessRequestWindowId } from '../src/data/accessRequest';
import { accessRoles, type AccessRoleId } from '../src/data/accessRoles';
import { theme } from '../src/theme';

const defaultRole = accessRoles[0];

export default function AccessRequest() {
  const { role } = useLocalSearchParams<{ role?: string | string[] }>();
  const router = useRouter();
  const routeRole = typeof role === 'string' && accessRoles.some(item => item.id === role) ? role as AccessRoleId : defaultRole.id;
  const active = accessRoles.find(item => item.id === routeRole) ?? defaultRole;
  const [scope, setScope] = useState<string>(defaultRole.requestScopes[0]);
  const [windowId, setWindowId] = useState<AccessRequestWindowId>('event-shift');
  const [controls, setControls] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setScope(active.requestScopes[0]);
    setWindowId('event-shift');
    setControls([]);
    setMessage(null);
    setError(null);
  }, [active.id]);

  const selectedWindow = accessRequestWindows.find(item => item.id === windowId) ?? accessRequestWindows[0];
  const ready = controls.length === accessRequestControls.length;
  const summary = [
    'PTOWN ACCESS — ROLE REQUEST WORKSHEET',
    'WORKSHEET ONLY — NOT SUBMITTED, APPROVED, ASSIGNED, OR GRANTED',
    '',
    `Requested role: ${active.title}`,
    `Role group: ${active.group}`,
    `Limited responsibility: ${scope}`,
    `Access window: ${selectedWindow.title}`,
    `Lifecycle rule: ${selectedWindow.rule}`,
    '',
    'REQUIRED BEFORE LIVE ACCESS',
    ...accessRequestControls.map(item => `${controls.includes(item) ? '[x]' : '[ ]'} ${item}`),
    '',
    'DENIED BY DEFAULT',
    ...active.deniedByDefault.map(item => `- ${item}`),
    '',
    'Owner review is required. This worksheet contains no applicant name, contact details, credentials, medical details, payment information, or staff assignment. Copying it does not create an account or grant access.',
  ].join('\n');

  function chooseRole(id: AccessRoleId) {
    setMessage(null);
    setError(null);
    router.setParams({ role: id === defaultRole.id ? undefined : id });
  }

  function toggleControl(control: string) {
    setControls(current => current.includes(control) ? current.filter(item => item !== control) : [...current, control]);
    setMessage(null);
    setError(null);
  }

  function clearWorksheet() {
    setScope(active.requestScopes[0]);
    setWindowId('event-shift');
    setControls([]);
    setMessage('Worksheet cleared. Nothing was submitted, approved, or revoked.');
    setError(null);
  }

  async function copy() {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error();
        await navigator.clipboard.writeText(summary);
      } else if (!await Clipboard.setStringAsync(summary)) throw new Error();
      setMessage('Worksheet copied for review. It has not been submitted, approved, assigned, or granted.');
    } catch {
      setError('Copy is unavailable. Select the worksheet summary and copy it manually.');
    } finally {
      setBusy(false);
    }
  }

  return <Screen>
    <Stack.Screen options={{ title: 'Role request worksheet' }} />
    <PageHeader eyebrow="PTOWN ACCESS · REVIEW WORKSHEET" title="Request only the access the work requires." description="Define one role, one responsibility, a limited access window, and every safeguard an owner must review before a future account receives access." />
    <PreviewNotice />
    <Card title="Worksheet only—not an access request system" description="Nothing on this page is saved, synced, sent, assigned, approved, or connected to a live account. Do not enter names, contact details, passwords, medical information, payment information, or confidential records." />

    <SectionHeader title="1. Choose the requested role" />
    <View accessibilityRole="tablist" accessibilityLabel="Requested PTown role" style={styles.grid}>
      {accessRoles.map(item => <Pressable key={item.id} accessibilityRole="tab" accessibilityState={{ selected: active.id === item.id, disabled: busy }} aria-selected={active.id === item.id} disabled={busy} onPress={() => chooseRole(item.id)} style={[local.roleTab, active.id === item.id && local.selected]}><Text style={[local.optionTitle, active.id === item.id && local.selectedText]}>{item.title}</Text></Pressable>)}
    </View>
    <Body>{active.summary}</Body>

    <SectionHeader title="2. Limit the responsibility" />
    <View accessibilityRole="radiogroup" accessibilityLabel="Requested responsibility" style={styles.grid}>
      {active.requestScopes.map(item => <Choice key={item} label={item} selected={scope === item} disabled={busy} onPress={() => { setScope(item); setMessage(null); setError(null); }} />)}
    </View>

    <SectionHeader title="3. Set the access window" />
    <View accessibilityRole="radiogroup" accessibilityLabel="Requested access window" style={styles.grid}>
      {accessRequestWindows.map(item => <Choice key={item.id} label={item.title} description={item.rule} selected={windowId === item.id} disabled={busy} onPress={() => { setWindowId(item.id); setMessage(null); setError(null); }} />)}
    </View>

    <SectionHeader title="4. Include every required safeguard" />
    <View style={local.checklist}>
      {accessRequestControls.map(control => { const checked = controls.includes(control); return <Pressable key={control} accessibilityRole="checkbox" accessibilityState={{ checked, disabled: busy }} aria-checked={checked} disabled={busy} onPress={() => toggleControl(control)} style={local.checkRow}><Text aria-hidden style={local.checkmark}>{checked ? '☑' : '☐'}</Text><Text style={local.checkLabel}>{control}</Text></Pressable>; })}
    </View>

    <Card title={ready ? 'Worksheet ready for owner review' : `${controls.length} of ${accessRequestControls.length} safeguards included`} description={ready ? 'Every required safeguard is included for review. This is still only a worksheet—not verification, approval, assignment, or an access grant.' : 'Include every safeguard before using the copy control. A future live system must verify each requirement rather than trusting this worksheet.'} />
    <SectionHeader title="Review the worksheet" />
    <Field label="Role request worksheet summary" value={summary} multiline editable={false} hint="Selectable text for manual copying. The role stays in the page link; all other choices clear when this page reloads." style={{ minHeight: 390, textAlignVertical: 'top', lineHeight: 22, fontSize: 13 }} />
    <View style={formStyles.row}>
      <ActionButton label={busy ? 'Working…' : 'Copy worksheet for review'} disabled={busy || !ready} onPress={() => { void copy(); }} />
      <ActionButton label="Clear worksheet" secondary disabled={busy} onPress={clearWorksheet} />
    </View>
    <Feedback message={message} />
    {error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Review this role’s full boundary" href={{ pathname: '/access-roles', params: { role: active.id } }} secondary />
    <Button label="Return to PTown" href="/ptown" secondary />
    <Footer />
  </Screen>;
}

function Choice({ label, description, selected, disabled, onPress }: { label: string; description?: string; selected: boolean; disabled: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected, disabled }} aria-checked={selected} disabled={disabled} onPress={onPress} style={[local.choice, selected && local.selected]}>
    <Text style={[local.optionTitle, selected && local.selectedText]}>{label}</Text>
    {description && <Text style={[styles.smallBody, selected && local.selectedDescription]}>{description}</Text>}
  </Pressable>;
}

const local = StyleSheet.create({
  roleTab: { minHeight: 48, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 30, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, justifyContent: 'center' },
  choice: { flexBasis: 260, flexGrow: 1, minWidth: 0, minHeight: 76, padding: 18, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, gap: 6, justifyContent: 'center' },
  selected: { backgroundColor: theme.colors.gold, borderColor: theme.colors.gold },
  optionTitle: { color: theme.colors.cream, fontSize: 15, lineHeight: 22, fontWeight: '600' },
  selectedText: { color: theme.colors.background },
  selectedDescription: { color: theme.colors.background },
  checklist: { backgroundColor: theme.colors.surface, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, gap: 8 },
  checkRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkmark: { color: theme.colors.gold, width: 24, fontSize: 20, lineHeight: 26 },
  checkLabel: { flex: 1, color: theme.colors.cream, fontSize: 15, lineHeight: 23 },
});
