import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../../src/components/forms';
import { Body, Button, Card, PageHeader, Screen, SectionHeader } from '../../src/components/ui';
import { artistLeads } from '../../src/data/bookingOperations';
import { useOperationsStore, type BookingEntry } from '../../src/state/OperationsStore';
import { theme } from '../../src/theme';

const programs = ['Thursday Comedy','Friday R&B / Blues','Saturday Any Genre','Communion Sunday','Private Event'] as const;
const statuses: BookingEntry['status'][] = ['Hold','Inquiry','Offer','Contracted'];

export default function BookingCalendarScreen() {
  const params = useLocalSearchParams<{artistId?:string}>();
  const { bookings, getArtist, saveBooking, removeBooking, busy } = useOperationsStore();
  const initialArtist = artistLeads.some(artist => artist.id === params.artistId) ? params.artistId! : artistLeads[0].id;
  const [artistId,setArtistId] = useState(initialArtist); const [date,setDate] = useState(''); const [program,setProgram] = useState<(typeof programs)[number]>('Saturday Any Genre'); const [status,setStatus] = useState<BookingEntry['status']>('Hold'); const [notes,setNotes] = useState(''); const [message,setMessage] = useState<string|null>(null);
  const sorted = useMemo(() => [...bookings].sort((a,b) => a.date.localeCompare(b.date)), [bookings]);
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(new Date(`${date}T12:00:00`).getTime());
  async function add() { setMessage(null); const ok = await saveBooking({artistId,date,program,status,notes:notes.trim()}); if(ok){setDate('');setNotes('');setMessage('Booking calendar entry saved on this device.');} }
  return <Screen>
    <PageHeader eyebrow="PTOWN MANAGEMENT" title="Booking Calendar" description="Track holds, inquiries, offers, and contracted dates without presenting an unconfirmed event as booked."/>
    <View style={styles.legend}>{statuses.map(item => <View key={item} style={styles.legendItem}><View style={[styles.dot,{backgroundColor:statusColor(item)}]}/><Text style={styles.legendText}>{item}</Text></View>)}</View>
    <SectionHeader title="Add calendar entry"/>
    <Text style={styles.label}>Artist</Text><View style={styles.choices}>{artistLeads.map(base => { const artist=getArtist(base.id)??base; return <Pressable key={artist.id} onPress={() => setArtistId(artist.id)} style={[styles.choice,artistId===artist.id&&styles.choiceSelected]}><Text style={[styles.choiceText,artistId===artist.id&&styles.choiceTextSelected]}>{artist.name}</Text></Pressable> })}</View>
    <Field label="Proposed date" hint="Use YYYY-MM-DD." value={date} onChangeText={setDate} maxLength={10}/>
    <Text style={styles.label}>PTown program</Text><View style={styles.choices}>{programs.map(item => <Pressable key={item} onPress={() => setProgram(item)} style={[styles.choice,program===item&&styles.choiceSelected]}><Text style={[styles.choiceText,program===item&&styles.choiceTextSelected]}>{item}</Text></Pressable>)}</View>
    <Text style={styles.label}>Booking stage</Text><View style={styles.choices}>{statuses.map(item => <Pressable key={item} onPress={() => setStatus(item)} style={[styles.choice,status===item&&styles.choiceSelected]}><Text style={[styles.choiceText,status===item&&styles.choiceTextSelected]}>{item}</Text></Pressable>)}</View>
    <Field label="Internal calendar note" value={notes} onChangeText={setNotes} multiline maxLength={280}/>
    <ActionButton label="Save calendar entry" disabled={busy||!validDate} onPress={() => {void add();}}/><Feedback message={message}/>
    <SectionHeader title="Upcoming booking activity"/>
    {sorted.length ? sorted.map(booking => { const artist=getArtist(booking.artistId); return <View key={booking.id} style={styles.entry}><View style={[styles.dateBlock,{borderColor:statusColor(booking.status)}]}><Text style={styles.date}>{booking.date}</Text><Text style={styles.stage}>{booking.status}</Text></View><View style={{flex:1,gap:4}}><Text style={styles.artist}>{artist?.name ?? 'Artist'}</Text><Text style={styles.meta}>{booking.program}</Text>{booking.notes?<Text style={styles.notes}>{booking.notes}</Text>:null}</View><Pressable accessibilityRole="button" onPress={() => {void removeBooking(booking.id);}}><Text style={styles.remove}>Remove</Text></Pressable></View> }) : <Card title="No booking dates saved" description="Add a hold or inquiry above. Calendar entries are internal planning records, not public event confirmations."/>}
    <Body>Calendar entries save only on this device during the preview stage.</Body><Button label="Return to Booking Operations" href="/operations" secondary />
  </Screen>;
}
function statusColor(status:BookingEntry['status']) { return status==='Contracted'?theme.colors.green:status==='Offer'?theme.colors.gold:status==='Inquiry'?'#9BBCE0':theme.colors.muted; }
const styles=StyleSheet.create({legend:{flexDirection:'row',flexWrap:'wrap',gap:12},legendItem:{flexDirection:'row',alignItems:'center',gap:6},dot:{width:8,height:8,borderRadius:4},legendText:{color:theme.colors.muted,fontSize:11},label:{color:theme.colors.cream,fontSize:15,fontWeight:'600'},choices:{flexDirection:'row',flexWrap:'wrap',gap:8},choice:{borderWidth:1,borderColor:theme.colors.border,borderRadius:20,paddingHorizontal:12,paddingVertical:9},choiceSelected:{backgroundColor:theme.colors.gold,borderColor:theme.colors.gold},choiceText:{color:theme.colors.cream,fontSize:12,fontWeight:'700'},choiceTextSelected:{color:theme.colors.background},entry:{backgroundColor:theme.colors.surface,borderWidth:1,borderColor:theme.colors.border,borderRadius:16,padding:14,flexDirection:'row',alignItems:'center',gap:12},dateBlock:{borderLeftWidth:3,paddingLeft:10,minWidth:92},date:{color:theme.colors.cream,fontSize:12,fontWeight:'800'},stage:{color:theme.colors.muted,fontSize:10,marginTop:4},artist:{color:theme.colors.cream,fontSize:15,fontWeight:'800'},meta:{color:theme.colors.gold,fontSize:11},notes:{color:theme.colors.muted,fontSize:11},remove:{color:'#E8AAA2',fontSize:11,padding:8}});
