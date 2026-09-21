import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { artistLeads, outreachSequence, weeklyProgramming } from '../src/data/bookingOperations';
import { theme } from '../src/theme';
import { useOperationsStore } from '../src/state/OperationsStore';

const metrics = [
  ['Artist Leads', String(artistLeads.length), 'people-outline'],
  ['Active Talks', String(artistLeads.filter(a => ['Warm','Negotiating'].includes(a.status)).length), 'chatbubbles-outline'],
  ['Booked', String(artistLeads.filter(a => a.status === 'Booked').length), 'checkmark-circle-outline'],
  ['Follow-ups', String(outreachSequence.length), 'mail-unread-outline'],
] as const;

export default function OperationsScreen() {
  const { bookings, outreachDrafts, currentRole } = useOperationsStore();
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.topbar}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}><Ionicons name="chevron-back" size={22} color={theme.colors.cream} /></Pressable>
        <View style={{ flex: 1 }}><Text style={styles.eyebrow}>PTOWN MANAGEMENT</Text><Text style={styles.title}>Booking Operations</Text></View>
        <View style={styles.live}><View style={styles.dot}/><Text style={styles.liveText}>CONTROL CENTER</Text></View>
      </View>

      <Text style={styles.subtitle}>Artist CRM · Booking pipeline · Outreach · Programming</Text>
      <View style={styles.roleBar}><Text style={styles.roleLabel}>ACCESS ROLE</Text><Text style={styles.roleValue}>{currentRole}</Text><Pressable onPress={() => router.push('/operations/access')}><Text style={styles.roleLink}>Manage →</Text></Pressable></View>
      <View style={styles.operationsNav}><Pressable onPress={() => router.push('/operations/artists')} style={styles.crmButton}><Text style={styles.crmButtonText}>Artist CRM →</Text></Pressable><Pressable onPress={() => router.push('/operations/calendar')} style={styles.secondaryNav}><Text style={styles.secondaryNavText}>Calendar · {bookings.length} →</Text></Pressable><Pressable onPress={() => router.push('/operations/outreach')} style={styles.secondaryNav}><Text style={styles.secondaryNavText}>Outreach · {outreachDrafts.length} →</Text></Pressable><Pressable onPress={() => router.push('/operations/economics')} style={styles.secondaryNav}><Text style={styles.secondaryNavText}>Economics →</Text></Pressable><Pressable onPress={() => router.push('/operations/audit')} style={styles.secondaryNav}><Text style={styles.secondaryNavText}>Audit History →</Text></Pressable></View>

      <View style={styles.metricGrid}>{metrics.map(([label,value,icon]) => <View key={label} style={styles.metric}><Ionicons name={icon} size={20} color={theme.colors.gold}/><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>)}</View>

      <Section title="Booking Pipeline" action="Artist CRM">
        <Pressable accessibilityRole="link" onPress={() => router.push('/operations/artists')} style={styles.crmButton}><Text style={styles.crmButtonText}>Open complete Artist CRM →</Text></Pressable>
        {artistLeads.map(artist => <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: '/operations/artists/[id]', params: { id: artist.id } })} key={artist.id} style={styles.artistRow}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{artist.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</Text></View>
          <View style={{ flex: 1 }}><Text style={styles.artist}>{artist.name}</Text><Text style={styles.meta}>{artist.genre} · {artist.market}{artist.recognition ? ` · ${artist.recognition}` : ''}</Text><Text style={styles.next}>{artist.nextAction}</Text></View>
          <View style={styles.status}><Text style={styles.statusText}>{artist.status}</Text></View>
        </Pressable>)}
      </Section>

      <Section title="PTOWN Weekly Booking Map" action="Programming">
        <View style={styles.week}>{weeklyProgramming.map(item => <View key={item.day} style={styles.day}><Text style={styles.dayName}>{item.day}</Text><Text style={styles.program}>{item.program}</Text><Text style={styles.meta}>{item.booking}</Text></View>)}</View>
      </Section>

      <Section title="Outreach Automation" action="Sequence">
        {outreachSequence.map(step => <View key={step.step} style={styles.sequence}><View style={styles.step}><Text style={styles.stepText}>{step.step}</Text></View><View style={{flex:1}}><Text style={styles.artist}>{step.label} · {step.timing}</Text><Text style={styles.meta}>{step.rule}</Text></View></View>)}
        <View style={styles.safety}><Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.green}/><Text style={styles.safetyText}>Negotiations, contracts, guarantees and sensitive messages stay approval-gated. Routine follow-ups can automate after CRM integration.</Text></View>
      </Section>
    </ScrollView>
  );
}

function Section({title, action, children}:{title:string;action:string;children:React.ReactNode}) { return <View style={styles.section}><View style={styles.sectionHead}><Text style={styles.sectionTitle}>{title}</Text><Text style={styles.action}>{action}</Text></View>{children}</View> }

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:theme.colors.background}, content:{padding:20,paddingTop:54,paddingBottom:60,gap:18},
  topbar:{flexDirection:'row',alignItems:'center',gap:12}, iconButton:{width:40,height:40,borderRadius:20,borderWidth:1,borderColor:theme.colors.border,alignItems:'center',justifyContent:'center'},
  eyebrow:{color:theme.colors.gold,fontSize:11,fontWeight:'800',letterSpacing:1.6}, title:{color:theme.colors.cream,fontSize:30,fontWeight:'800'}, subtitle:{color:theme.colors.muted,fontSize:14,marginTop:-10},
  live:{borderWidth:1,borderColor:theme.colors.border,borderRadius:20,paddingHorizontal:10,paddingVertical:7,flexDirection:'row',gap:6,alignItems:'center'},dot:{width:7,height:7,borderRadius:4,backgroundColor:theme.colors.green},liveText:{color:theme.colors.muted,fontSize:9,fontWeight:'800'},
  metricGrid:{flexDirection:'row',flexWrap:'wrap',gap:10},metric:{minWidth:'47%',flexGrow:1,backgroundColor:theme.colors.surface,borderColor:theme.colors.border,borderWidth:1,borderRadius:theme.radius.card,padding:16},metricValue:{color:theme.colors.cream,fontSize:28,fontWeight:'800',marginTop:8},metricLabel:{color:theme.colors.muted,fontSize:12},
  section:{backgroundColor:theme.colors.surface,borderWidth:1,borderColor:theme.colors.border,borderRadius:theme.radius.card,padding:16,gap:12},sectionHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},sectionTitle:{color:theme.colors.cream,fontSize:19,fontWeight:'800'},action:{color:theme.colors.gold,fontSize:12,fontWeight:'700'},
  crmButton:{backgroundColor:theme.colors.gold,borderRadius:12,paddingHorizontal:14,paddingVertical:12,alignItems:'center'},crmButtonText:{color:theme.colors.background,fontWeight:'800',fontSize:13},
  operationsNav:{flexDirection:'row',flexWrap:'wrap',gap:10},secondaryNav:{borderWidth:1,borderColor:theme.colors.gold,borderRadius:12,paddingHorizontal:14,paddingVertical:12,alignItems:'center'},secondaryNavText:{color:theme.colors.gold,fontWeight:'800',fontSize:13},
  roleBar:{backgroundColor:theme.colors.elevated,borderRadius:12,padding:12,flexDirection:'row',alignItems:'center',gap:10},roleLabel:{color:theme.colors.muted,fontSize:9,fontWeight:'900',letterSpacing:1.2},roleValue:{color:theme.colors.cream,fontSize:13,fontWeight:'800',flex:1},roleLink:{color:theme.colors.gold,fontSize:12,fontWeight:'800'},
  artistRow:{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:10,borderTopWidth:1,borderTopColor:theme.colors.border},avatar:{width:38,height:38,borderRadius:19,backgroundColor:theme.colors.elevated,alignItems:'center',justifyContent:'center'},avatarText:{color:theme.colors.gold,fontWeight:'800'},artist:{color:theme.colors.cream,fontSize:14,fontWeight:'700'},meta:{color:theme.colors.muted,fontSize:11,marginTop:3},next:{color:theme.colors.gold,fontSize:10,marginTop:4},status:{borderWidth:1,borderColor:theme.colors.border,borderRadius:12,paddingHorizontal:8,paddingVertical:5},statusText:{color:theme.colors.cream,fontSize:10},
  week:{gap:8},day:{backgroundColor:theme.colors.elevated,borderRadius:14,padding:12},dayName:{color:theme.colors.gold,fontSize:11,fontWeight:'900'},program:{color:theme.colors.cream,fontSize:15,fontWeight:'800',marginTop:3},
  sequence:{flexDirection:'row',gap:10,alignItems:'center',paddingVertical:7},step:{width:30,height:30,borderRadius:15,backgroundColor:theme.colors.elevated,alignItems:'center',justifyContent:'center'},stepText:{color:theme.colors.gold,fontWeight:'900'},safety:{flexDirection:'row',gap:10,backgroundColor:theme.colors.elevated,padding:12,borderRadius:14,alignItems:'flex-start'},safetyText:{color:theme.colors.muted,fontSize:11,lineHeight:17,flex:1}
});
