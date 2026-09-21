import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ActionButton, Feedback } from '../../src/components/forms';
import { Body, Button, Card, PageHeader, Screen, SectionHeader } from '../../src/components/ui';
import { runtime, supabaseConfigured } from '../../src/config/environment';
import { checkSupabaseConnection } from '../../src/services/supabaseDiagnostics';
import { theme } from '../../src/theme';

type CheckState = 'not-run' | 'running' | 'passed' | 'failed';

export default function Activation() {
  const [state, setState] = useState<CheckState>('not-run');
  const [feedback, setFeedback] = useState<string | null>(null);
  async function runCheck() {
    setState('running');
    setFeedback(null);
    const result = await checkSupabaseConnection();
    setState(result.ok ? 'passed' : 'failed');
    setFeedback(result.message);
  }
  return <Screen>
    <PageHeader eyebrow="DEVELOPMENT PROJECT HANDOFF" title="Supabase activation" description="Connect PTown Access to an isolated development project before enabling any production synchronization." />
    <View style={s.warning}><Text style={s.warningTitle}>SAFE CLIENT CREDENTIALS ONLY</Text><Body>Configure the project URL and publishable key through release environment variables. Never enter a service-role key in the app, repository, browser, or mobile build.</Body></View>
    <SectionHeader title="Configuration status" />
    <Status label="Development project URL" ready={Boolean(runtime.supabaseUrl)} detail={runtime.supabaseUrl ? safeHost(runtime.supabaseUrl) : 'EXPO_PUBLIC_SUPABASE_URL'} />
    <Status label="Publishable key" ready={Boolean(runtime.supabasePublishableKey)} detail={runtime.supabasePublishableKey ? 'Present · value hidden' : 'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY'} />
    <Status label="Production runtime" ready={runtime.mode === 'production'} detail={`Current mode: ${runtime.mode}`} />
    <Status label="Cloud synchronization" ready={runtime.syncEnabled} detail={runtime.syncEnabled ? 'Enabled' : 'Disabled'} />
    <ActionButton label={state === 'running' ? 'Checking development project…' : 'Run safe connection check'} disabled={!supabaseConfigured || state === 'running'} onPress={() => { void runCheck(); }} />
    <Feedback message={feedback} />
    <Card title={state === 'passed' ? 'Connection check passed' : 'No cloud activation yet'} description={state === 'passed' ? 'The URL, publishable key, network, and PTown staff schema responded. Staff authentication and authorization tests are still required.' : 'Local preview records remain on this device. Nothing is uploaded by this screen.'} />
    <SectionHeader title="Activation sequence" />
    {steps.map((step, index) => <View key={step} style={s.step}><Text style={s.stepNumber}>{index + 1}</Text><Text style={s.stepText}>{step}</Text></View>)}
    <SectionHeader title="Release gate" />
    <Body>Keep runtime mode in preview and synchronization disabled until the Owner account, row-level permissions, backup restore, conflict handling, and migration reconciliation have all passed in development.</Body>
    <Button label="Create operations backup" href="/operations/backup"/><Button label="Cloud migration" href="/operations/cloud-migration" secondary/><Button label="Cloud reconciliation" href="/operations/reconciliation" secondary/><Button label="Production readiness" href="/operations/production-readiness" secondary/>
  </Screen>;
}

const steps = [
  'Create an isolated Supabase development project.',
  'Apply the PTown operations database migration.',
  'Create the first authenticated user and verified Owner profile.',
  'Deploy and test the Owner-only staff invitation function.',
  'Run this connection check and the staff sign-in tests.',
  'Back up local data, dry-run migration, and reconcile record counts.',
  'Enable synchronization only after recovery and conflict tests pass.',
];
function safeHost(value:string){try{return new URL(value).host}catch{return 'Configured URL'}}
function Status({label,ready,detail}:{label:string;ready:boolean;detail:string}){return <View style={s.status}><View style={[s.dot,ready&&s.ready]}/><View style={{flex:1}}><Text style={s.statusLabel}>{label}</Text><Text style={s.detail}>{detail}</Text></View><Text style={[s.state,ready&&s.stateReady]}>{ready?'READY':'NOT SET'}</Text></View>}
const s=StyleSheet.create({warning:{backgroundColor:theme.colors.elevated,borderLeftWidth:3,borderLeftColor:theme.colors.gold,borderRadius:16,padding:18,gap:7},warningTitle:{color:theme.colors.gold,fontSize:10,fontWeight:'900',letterSpacing:1.5},status:{backgroundColor:theme.colors.surface,borderWidth:1,borderColor:theme.colors.border,borderRadius:13,padding:13,flexDirection:'row',alignItems:'center',gap:10},dot:{width:9,height:9,borderRadius:5,backgroundColor:'#A96F45'},ready:{backgroundColor:theme.colors.green},statusLabel:{color:theme.colors.cream,fontSize:13,fontWeight:'700'},detail:{color:theme.colors.muted,fontSize:10,marginTop:3},state:{color:'#E8B07E',fontSize:9,fontWeight:'900'},stateReady:{color:theme.colors.green},step:{flexDirection:'row',gap:12,alignItems:'center',backgroundColor:theme.colors.surface,borderRadius:13,padding:13},stepNumber:{width:27,height:27,borderRadius:14,textAlign:'center',textAlignVertical:'center',backgroundColor:theme.colors.elevated,color:theme.colors.gold,fontWeight:'900'},stepText:{color:theme.colors.cream,fontSize:12,flex:1}});
