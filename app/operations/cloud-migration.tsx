import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ActionButton, Feedback } from '../../src/components/forms';
import { Body, Button, Card, PageHeader, Screen, SectionHeader } from '../../src/components/ui';
import { supabaseConfigured } from '../../src/config/environment';
import { getSupabaseClient } from '../../src/services/supabaseClient';
import { SupabaseOperationsBackend } from '../../src/services/supabaseOperationsBackend';
import type { StaffSession } from '../../src/services/operationsBackend';
import { useOperationsStore } from '../../src/state/OperationsStore';
import { theme } from '../../src/theme';
import { buildOperationsMigrationPlan } from '../../src/utils/operationsMigration';

export default function CloudMigration() {
  const store = useOperationsStore();
  const [session, setSession] = useState<StaffSession | null>(null);
  const [checked, setChecked] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const plan = useMemo(() => buildOperationsMigrationPlan(store), [store]);
  useEffect(() => {
    let active = true;
    const client = getSupabaseClient();
    if (!client) { setChecked(true); return; }
    new SupabaseOperationsBackend(client).getSession().then(value => { if (active) { setSession(value); setChecked(true); } });
    return () => { active = false; };
  }, []);
  const ownerReady = supabaseConfigured && session?.role === 'Owner';
  function dryRun() {
    setFeedback(plan.ready
      ? `Dry check passed: ${plan.totalRecords} local records are structurally ready. Nothing was uploaded.`
      : `Dry check found ${plan.errors.length} blocking issue${plan.errors.length === 1 ? '' : 's'}. Nothing was uploaded.`);
  }
  return <Screen>
    <PageHeader eyebrow="LOCAL-TO-CLOUD TRANSITION" title="Cloud migration" description="Inventory and validate device-local booking operations data before any controlled production upload." />
    <View style={s.banner}><Text style={s.bannerLabel}>DRY-RUN ONLY</Text><Text style={s.bannerTitle}>No data leaves this device</Text><Body>This build prepares versioned sync envelopes and reports validation results. It does not upload, delete, or alter local records.</Body></View>
    <View style={s.metrics}><Metric label="Collections" value={plan.collections.length}/><Metric label="Local records" value={plan.totalRecords}/><Metric label="Blocking issues" value={plan.errors.length} danger={plan.errors.length > 0}/></View>
    <SectionHeader title="Migration inventory" />
    {plan.collections.map(collection => <View key={collection.key} style={s.row}><View style={{flex: 1}}><Text style={s.rowTitle}>{collection.label}</Text><Text style={s.rowKey}>{collection.key} · envelope v{plan.formatVersion}</Text></View><Text style={s.count}>{collection.records.length}</Text></View>)}
    <SectionHeader title="Validation" />
    <Card title={plan.ready ? 'Structure check ready' : `${plan.errors.length} blocking issue${plan.errors.length === 1 ? '' : 's'}`} description={plan.ready ? `${plan.warnings.length} timestamp warning${plan.warnings.length === 1 ? '' : 's'} will use the migration time. Run the dry check before connecting cloud upload.` : plan.errors.slice(0, 3).map(issue => `${issue.collection}/${issue.recordId}: ${issue.message}`).join(' ')} />
    <ActionButton label="Run migration dry check" onPress={dryRun}/><Feedback message={feedback}/>
    <SectionHeader title="Cloud upload gate" />
    <Gate label="Supabase project configured" ready={supabaseConfigured}/><Gate label="Authenticated staff session" ready={Boolean(session)}/><Gate label="Verified Owner role" ready={session?.role === 'Owner'}/><Gate label="Local validation passed" ready={plan.ready}/>
    <ActionButton label="Upload remains locked in this build" disabled={!ownerReady || !plan.ready || !checked} onPress={() => setFeedback('Upload execution is intentionally unavailable until the production migration runbook and recovery test are approved.')} />
    <Body>Even with every gate ready, a production upload requires an approved backup, rollback plan, record-count reconciliation, and post-migration verification.</Body>
    <Button label="Staff access" href="/operations/staff-access"/><Button label="Production readiness" href="/operations/production-readiness" secondary/>
  </Screen>;
}

function Metric({label,value,danger=false}:{label:string;value:number;danger?:boolean}){return <View style={s.metric}><Text style={[s.metricValue,danger&&s.danger]}>{value}</Text><Text style={s.metricLabel}>{label}</Text></View>}
function Gate({label,ready}:{label:string;ready:boolean}){return <View style={s.gate}><View style={[s.dot,ready&&s.ready]}/><Text style={s.gateLabel}>{label}</Text><Text style={[s.status,ready&&s.statusReady]}>{ready?'READY':'LOCKED'}</Text></View>}
const s=StyleSheet.create({banner:{backgroundColor:theme.colors.elevated,borderLeftWidth:3,borderLeftColor:theme.colors.gold,borderRadius:16,padding:18,gap:7},bannerLabel:{color:theme.colors.gold,fontSize:10,fontWeight:'900',letterSpacing:1.5},bannerTitle:{color:theme.colors.cream,fontSize:19,fontWeight:'900'},metrics:{flexDirection:'row',flexWrap:'wrap',gap:10},metric:{backgroundColor:theme.colors.surface,borderRadius:14,padding:14,minWidth:'30%',flex:1},metricValue:{color:theme.colors.gold,fontSize:22,fontWeight:'900'},danger:{color:'#E8AAA2'},metricLabel:{color:theme.colors.muted,fontSize:10,marginTop:4},row:{backgroundColor:theme.colors.surface,borderWidth:1,borderColor:theme.colors.border,borderRadius:13,padding:13,flexDirection:'row',alignItems:'center',gap:12},rowTitle:{color:theme.colors.cream,fontSize:14,fontWeight:'700'},rowKey:{color:theme.colors.muted,fontSize:10,marginTop:4},count:{color:theme.colors.gold,fontSize:22,fontWeight:'900'},gate:{backgroundColor:theme.colors.surface,borderWidth:1,borderColor:theme.colors.border,borderRadius:13,padding:13,flexDirection:'row',alignItems:'center',gap:10},dot:{width:9,height:9,borderRadius:5,backgroundColor:'#A96F45'},ready:{backgroundColor:theme.colors.green},gateLabel:{color:theme.colors.cream,fontSize:13,flex:1},status:{color:'#E8B07E',fontSize:9,fontWeight:'900'},statusReady:{color:theme.colors.green}});
