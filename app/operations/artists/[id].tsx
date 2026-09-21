import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Body, Button, Card, PageHeader, Screen, SectionHeader } from '../../../src/components/ui';
import { theme } from '../../../src/theme';
import { useOperationsStore } from '../../../src/state/OperationsStore';

export default function ArtistProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getArtist } = useOperationsStore();
  const artist = getArtist(id);
  if (!artist) return <Screen><PageHeader eyebrow="ARTIST CRM" title="Artist not found" description="This artist is not in the current PTown booking pipeline."/><Button label="Return to Artist CRM" href="/operations/artists" secondary /></Screen>;
  return <Screen>
    <PageHeader eyebrow={`ARTIST CRM · ${artist.status.toUpperCase()}`} title={artist.name} description={`${artist.genre} · ${artist.market}${artist.recognition ? ` · ${artist.recognition}` : ''}`} />
    <View style={styles.profileActions}><Button label="Edit CRM record" href={{ pathname:'/operations/artists/[id]/edit', params:{id:artist.id} }} /><Button label="Booking calendar" href="/operations/calendar" secondary /></View>
    <View style={styles.actionCard}><View style={styles.actionIcon}><Ionicons name="calendar-outline" size={24} color={theme.colors.gold}/></View><View style={{flex:1,gap:5}}><Text style={styles.actionTitle}>Next action</Text><Text style={styles.actionText}>{artist.nextAction}</Text>{artist.followUpDate && <Text style={styles.meta}>Follow up: {artist.followUpDate}</Text>}</View><Link href={{ pathname:'/operations/artists/[id]/booking', params:{ id:artist.id } }} style={styles.start}>Start Booking →</Link></View>
    <SectionHeader title="Contact verification" />
    <View style={styles.grid}><Detail label="Route" value={artist.contactRoute}/><Detail label="Verification" value={artist.contactVerified ? 'Verified' : 'Required before outreach'}/><Detail label="Source" value={artist.contactSource}/><Detail label="Verified on" value={artist.contactVerifiedOn ?? 'Not yet verified'}/></View>
    <SectionHeader title="Commercial status" />
    <View style={styles.grid}><Detail label="Current fee" value={artist.feeRange}/><Detail label="Contract" value={artist.contractStatus}/><Detail label="Payment" value={artist.paymentStatus}/><Detail label="Last contact" value={artist.lastContact ?? 'No outreach logged'}/></View>
    <Card title="Booking notes" description={artist.notes}/>
    <SectionHeader title="Fee quote history" />
    {artist.feeHistory.length ? artist.feeHistory.map(item => <Card key={`${item.date}-${item.quote}`} title={`${item.quote} · ${item.date}`} description={item.source}/>) : <Card title="No verified quotes yet" description="Log a quote only after it is received from a verified representative or official booking route."/>}
    <SectionHeader title="PTown show history" />
    {artist.showHistory.length ? artist.showHistory.map(item => <Card key={`${item.date}-${item.event}`} title={`${item.event} · ${item.date}`} description={item.result}/>) : <Card title="No PTown appearances yet" description="Confirmed and completed appearances will build the artist’s venue history here."/>}
    <Button label="Back to Artist CRM" href="/operations/artists" secondary />
  </Screen>;
}

function Detail({label,value}:{label:string;value:string}) { return <View style={styles.detail}><Text style={styles.label}>{label}</Text><Body>{value}</Body></View> }
const styles = StyleSheet.create({
  profileActions:{flexDirection:'row',flexWrap:'wrap',gap:10},actionCard:{backgroundColor:theme.colors.surface,borderWidth:1,borderColor:theme.colors.gold,borderRadius:18,padding:16,flexDirection:'row',alignItems:'center',gap:12,flexWrap:'wrap'},actionIcon:{width:44,height:44,borderRadius:22,backgroundColor:theme.colors.elevated,alignItems:'center',justifyContent:'center'},actionTitle:{color:theme.colors.muted,fontSize:10,fontWeight:'800',letterSpacing:1.2,textTransform:'uppercase'},actionText:{color:theme.colors.cream,fontSize:15,fontWeight:'700'},meta:{color:theme.colors.muted,fontSize:11},start:{color:theme.colors.gold,fontSize:13,fontWeight:'800',paddingVertical:10},grid:{flexDirection:'row',flexWrap:'wrap',gap:10},detail:{backgroundColor:theme.colors.surface,borderWidth:1,borderColor:theme.colors.border,borderRadius:16,padding:16,minWidth:'47%',flex:1,gap:6},label:{color:theme.colors.gold,fontSize:10,fontWeight:'800',letterSpacing:1,textTransform:'uppercase'}
});
