import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { ActionButton, Feedback, Field, formStyles } from '../../src/components/forms';
import { Body, Button, Card, PageHeader, Screen, SectionHeader } from '../../src/components/ui';
import { useOperationsStore, type OperationsState } from '../../src/state/OperationsStore';
import { theme } from '../../src/theme';
import { createOperationsBackup, maxOperationsBackupLength, readOperationsBackup } from '../../src/utils/operationsBackup';
import { buildOperationsMigrationPlan } from '../../src/utils/operationsMigration';

export default function OperationsBackup() {
  const store = useOperationsStore();
  const [backupCreatedAt] = useState(() => new Date().toISOString());
  const code = store.ready ? createOperationsBackup(store, backupCreatedAt) : '';
  const currentCode = useRef(code); currentCode.current = code;
  const [copying, setCopying] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [incoming, setIncoming] = useState<{state:OperationsState;createdAt:string}|null>(null);
  const [confirmation, setConfirmation] = useState('');
  const plan = buildOperationsMigrationPlan(store);
  useEffect(() => { setFeedback(null); setError(null); }, [code]);
  async function copy() {
    const outgoing = code; setCopying(true); setFeedback(null); setError(null);
    try {
      if (Platform.OS === 'web') { if (typeof navigator.clipboard?.writeText !== 'function') throw new Error(); await navigator.clipboard.writeText(outgoing); }
      else if (!await Clipboard.setStringAsync(outgoing)) throw new Error();
      if (currentCode.current === outgoing) setFeedback('Operations backup copied. Store it in a secure, access-controlled location.');
    } catch { if (currentCode.current === outgoing) setError('Automatic copy is unavailable. Select the complete backup below and copy it manually.'); }
    finally { setCopying(false); }
  }
  function review() {
    setFeedback(null); setError(null); setIncoming(null); setConfirmation('');
    try { const backup=readOperationsBackup(text); setIncoming({state:backup.state,createdAt:backup.createdAt}); }
    catch { setError('This operations backup failed validation. Current device records are unchanged.'); }
  }
  async function restore() {
    if (!incoming || confirmation !== 'RESTORE') return;
    const ok=await store.restoreOperations(incoming.state);
    if (ok) { setIncoming(null); setText(''); setConfirmation(''); setFeedback('Operations records restored and revalidated on this device.'); }
    else setError('Restore failed. The previous operations records were kept.');
  }
  const incomingPlan=incoming?buildOperationsMigrationPlan(incoming.state):null;
  return <Screen>
    <PageHeader eyebrow="PRE-MIGRATION RECOVERY" title="Operations backup" description="Create and validate a complete device-local recovery copy before activating cloud migration."/>
    <View style={s.warning}><Text style={s.warningTitle}>CONFIDENTIAL OPERATIONS DATA</Text><Body>This backup can contain artist contacts, financial assumptions, incident notes, and staff activity. Store it only in an approved, access-controlled location.</Body></View>
    <View style={s.metrics}><Metric label="Collections" value={plan.collections.length}/><Metric label="Records" value={plan.totalRecords}/><Metric label="Validation issues" value={plan.errors.length}/></View>
    <SectionHeader title="Create recovery copy"/>
    {!store.ready?<Body>Loading local operations records…</Body>:<View style={s.card}><ActionButton label={copying?'Copying…':'Copy complete operations backup'} disabled={copying||store.busy} onPress={()=>{void copy();}}/><Feedback message={feedback}/>{error&&<Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}<Field label="Operations backup" hint="The checksum and record manifest are included automatically." value={code} multiline editable={false} style={{minHeight:220,textAlignVertical:'top',fontSize:12}}/></View>}
    <SectionHeader title="Validate and restore"/>
    <Body>Paste a complete PTown operations backup. The app checks its format, checksum, record counts, and migration structure before replacement is offered.</Body>
    <Field label="Paste operations backup" value={text} onChangeText={value=>{setText(value);setIncoming(null);setConfirmation('');setError(null);}} multiline maxLength={maxOperationsBackupLength} autoCapitalize="none" autoCorrect={false} style={{minHeight:160,textAlignVertical:'top'}}/>
    <ActionButton label="Validate backup" disabled={!text.trim()||store.busy} secondary onPress={review}/>
    {incoming&&incomingPlan&&<View style={s.card}><Card title="Validated recovery copy" description={`${incomingPlan.totalRecords} records across ${incomingPlan.collections.length} collections · created ${new Date(incoming.createdAt).toLocaleString()}`}/><Body>Restoring replaces every operations record currently stored on this device. It does not merge records or change cloud data.</Body><Field label="Type RESTORE to confirm replacement" value={confirmation} onChangeText={setConfirmation} autoCapitalize="characters"/><ActionButton label="Replace local operations records" disabled={confirmation!=='RESTORE'||store.busy} onPress={()=>{void restore();}}/><ActionButton label="Cancel restore" secondary onPress={()=>{setIncoming(null);setConfirmation('');}}/></View>}
    <Button label="Cloud migration dry run" href="/operations/cloud-migration"/><Button label="Supabase activation" href="/operations/activation" secondary/><Button label="Production readiness" href="/operations/production-readiness" secondary/>
  </Screen>;
}
function Metric({label,value}:{label:string;value:number}){return <View style={s.metric}><Text style={s.metricValue}>{value}</Text><Text style={s.metricLabel}>{label}</Text></View>}
const s=StyleSheet.create({warning:{backgroundColor:theme.colors.elevated,borderLeftWidth:3,borderLeftColor:theme.colors.gold,borderRadius:16,padding:18,gap:7},warningTitle:{color:theme.colors.gold,fontSize:10,fontWeight:'900',letterSpacing:1.5},metrics:{flexDirection:'row',flexWrap:'wrap',gap:10},metric:{backgroundColor:theme.colors.surface,borderRadius:14,padding:14,minWidth:'30%',flex:1},metricValue:{color:theme.colors.gold,fontSize:22,fontWeight:'900'},metricLabel:{color:theme.colors.muted,fontSize:10,marginTop:4},card:{backgroundColor:theme.colors.surface,padding:18,borderRadius:16,borderWidth:1,borderColor:theme.colors.border,gap:14}});
