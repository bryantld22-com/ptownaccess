import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, PageHeader, Screen } from '../../../../src/components/ui';
import { theme } from '../../../../src/theme';
import { useOperationsStore } from '../../../../src/state/OperationsStore';

const steps = [
  ['1','Verify representative','Confirm the current official booking route and record its source and verification date.'],
  ['2','Request availability','Select a PTown program and proposed date before sending an approved inquiry.'],
  ['3','Review economics','Log the verified quote, travel, hospitality, production needs, and projected event margin.'],
  ['4','Approve offer','Bryant or an authorized PTown manager approves negotiation terms before an offer is sent.'],
  ['5','Contract and deposit','Track agreement status, signatures, deposit due date, and payment confirmation.'],
] as const;

export default function StartBookingScreen() {
  const { id } = useLocalSearchParams<{id:string}>();
  const { getArtist } = useOperationsStore();
  const artist = getArtist(id);
  return <Screen>
    <PageHeader eyebrow="APPROVAL-GATED WORKFLOW" title={artist ? `Start booking ${artist.name}` : 'Start artist booking'} description="A controlled path from contact verification to signed agreement—without treating an inquiry as a confirmed show."/>
    {!artist ? <Card title="Artist not found" description="Return to the Artist CRM and choose an active lead."/> : <>
      <View style={styles.status}><Text style={styles.statusLabel}>CURRENT READINESS</Text><Text style={styles.statusValue}>{artist.contactVerified ? 'Ready for approved outreach' : 'Contact verification required'}</Text></View>
      {steps.map(([number,title,description]) => <View key={number} style={styles.step}><View style={styles.number}><Text style={styles.numberText}>{number}</Text></View><View style={{flex:1,gap:5}}><Text style={styles.title}>{title}</Text><Text style={styles.description}>{description}</Text></View></View>)}
      <Card title="Controlled workflow" description="CRM updates and calendar holds now save on this device. Sending messages, contracts, and payments remains disabled until secure services and role permissions are connected."/>
      <Button label="Add to booking calendar" href={{ pathname:'/operations/calendar', params:{artistId:artist.id} }} />
      <Button label="Return to artist profile" href={{ pathname:'/operations/artists/[id]', params:{id:artist.id} }} secondary />
    </>}
  </Screen>;
}
const styles = StyleSheet.create({status:{backgroundColor:theme.colors.elevated,borderRadius:16,padding:18,borderLeftWidth:3,borderLeftColor:theme.colors.gold,gap:5},statusLabel:{color:theme.colors.gold,fontSize:10,fontWeight:'900',letterSpacing:1.4},statusValue:{color:theme.colors.cream,fontSize:17,fontWeight:'800'},step:{backgroundColor:theme.colors.surface,borderWidth:1,borderColor:theme.colors.border,borderRadius:18,padding:16,flexDirection:'row',gap:14},number:{width:34,height:34,borderRadius:17,backgroundColor:theme.colors.elevated,alignItems:'center',justifyContent:'center'},numberText:{color:theme.colors.gold,fontWeight:'900'},title:{color:theme.colors.cream,fontSize:16,fontWeight:'800'},description:{color:theme.colors.muted,fontSize:12,lineHeight:18}});
