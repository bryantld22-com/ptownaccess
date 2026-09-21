import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PageHeader, Screen } from '../../../src/components/ui';
import { artistLeads } from '../../../src/data/bookingOperations';
import { theme } from '../../../src/theme';

export default function ArtistCrmScreen() {
  return <Screen>
    <PageHeader eyebrow="PTOWN MANAGEMENT" title="Artist CRM" description="Verified contacts, booking progress, follow-ups, agreements, and payment readiness in one working directory." />
    <View style={styles.notice}><Ionicons name="shield-checkmark-outline" size={21} color={theme.colors.green}/><Text style={styles.noticeText}>Only official or directly confirmed contact routes belong here. Never guess an email, representative, fee, or availability.</Text></View>
    <View style={styles.summary}>{(['Identified','Contacted','Warm','Negotiating','Booked'] as const).map(status => <View key={status} style={styles.stat}><Text style={styles.statValue}>{artistLeads.filter(a => a.status === status).length}</Text><Text style={styles.statLabel}>{status}</Text></View>)}</View>
    {artistLeads.map(artist => <Link key={artist.id} href={{ pathname: '/operations/artists/[id]', params: { id: artist.id } }} asChild><Pressable accessibilityRole="link" style={styles.card}>
      <View style={styles.avatar}><Text style={styles.avatarText}>{artist.name.split(' ').map(word => word[0]).slice(0,2).join('')}</Text></View>
      <View style={styles.cardBody}><View style={styles.titleRow}><Text style={styles.name}>{artist.name}</Text><Text style={styles.status}>{artist.status}</Text></View><Text style={styles.meta}>{artist.genre} · {artist.market}</Text><Text style={styles.next}>{artist.nextAction}</Text><Text style={styles.contact}>{artist.contactVerified ? '✓ Contact verified' : '○ Contact needs verification'}</Text></View>
      <Text style={styles.arrow}>→</Text>
    </Pressable></Link>)}
  </Screen>;
}

const styles = StyleSheet.create({
  notice:{flexDirection:'row',gap:10,backgroundColor:theme.colors.elevated,padding:16,borderRadius:14,alignItems:'flex-start'},noticeText:{color:theme.colors.muted,fontSize:12,lineHeight:18,flex:1},
  summary:{flexDirection:'row',flexWrap:'wrap',gap:8},stat:{backgroundColor:theme.colors.surface,borderWidth:1,borderColor:theme.colors.border,borderRadius:14,padding:12,minWidth:100,flexGrow:1},statValue:{color:theme.colors.gold,fontSize:22,fontWeight:'800'},statLabel:{color:theme.colors.muted,fontSize:11,marginTop:3},
  card:{backgroundColor:theme.colors.surface,borderWidth:1,borderColor:theme.colors.border,borderRadius:18,padding:16,flexDirection:'row',alignItems:'center',gap:12},avatar:{width:44,height:44,borderRadius:22,backgroundColor:theme.colors.elevated,alignItems:'center',justifyContent:'center'},avatarText:{color:theme.colors.gold,fontWeight:'900'},cardBody:{flex:1,gap:4},titleRow:{flexDirection:'row',justifyContent:'space-between',gap:10,alignItems:'center'},name:{color:theme.colors.cream,fontSize:17,fontWeight:'800',flex:1},status:{color:theme.colors.cream,fontSize:10,borderWidth:1,borderColor:theme.colors.border,borderRadius:10,paddingHorizontal:7,paddingVertical:4},meta:{color:theme.colors.muted,fontSize:12},next:{color:theme.colors.gold,fontSize:11},contact:{color:theme.colors.muted,fontSize:10},arrow:{color:theme.colors.gold,fontSize:20}
});
