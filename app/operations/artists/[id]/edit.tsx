import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../../../../src/components/forms';
import { Body, Button, PageHeader, Screen, SectionHeader } from '../../../../src/components/ui';
import type { ArtistLead, PipelineStatus } from '../../../../src/data/bookingOperations';
import { useOperationsStore } from '../../../../src/state/OperationsStore';
import { theme } from '../../../../src/theme';

const pipeline: PipelineStatus[] = ['Identified','Contacted','Warm','Negotiating','Booked','Nurture'];
const contracts: ArtistLead['contractStatus'][] = ['Not started','Drafting','Sent','Signed'];
const payments: ArtistLead['paymentStatus'][] = ['Not started','Deposit due','Deposit paid','Paid in full'];

export default function EditArtistScreen() {
  const { id } = useLocalSearchParams<{id:string}>();
  const { getArtist, saveArtist, busy } = useOperationsStore();
  const artist = getArtist(id);
  const [form, setForm] = useState<ArtistLead | null>(artist ?? null);
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => { if (artist) setForm(artist); }, [id]);
  if (!artist || !form) return <Screen><PageHeader eyebrow="ARTIST CRM" title="Artist not found"/><Button label="Return to Artist CRM" href="/operations/artists" secondary /></Screen>;
  const artistId = artist.id;
  const set = <K extends keyof ArtistLead>(key: K, value: ArtistLead[K]) => setForm(current => current ? { ...current, [key]: value } : current);
  async function save() { setMessage(null); const ok = await saveArtist(artistId, { status:form!.status, contactRoute:form!.contactRoute.trim(), contactVerified:form!.contactVerified, contactSource:form!.contactSource.trim(), contactVerifiedOn:form!.contactVerifiedOn?.trim() || undefined, lastContact:form!.lastContact?.trim() || undefined, followUpDate:form!.followUpDate?.trim() || undefined, nextAction:form!.nextAction.trim(), notes:form!.notes.trim(), feeRange:form!.feeRange.trim(), contractStatus:form!.contractStatus, paymentStatus:form!.paymentStatus }); if (ok) { setMessage('Artist CRM record saved on this device.'); router.replace({ pathname:'/operations/artists/[id]', params:{id:artistId} }); } }
  return <Screen>
    <PageHeader eyebrow="EDIT CRM RECORD" title={artist.name} description="Save verified facts and internal next steps. Do not enter guessed contact or fee information."/>
    <SectionHeader title="Pipeline status"/><ChoiceRow values={pipeline} selected={form.status} onSelect={value => set('status', value)}/>
    <Field label="Next action" value={form.nextAction} onChangeText={value => set('nextAction', value)} maxLength={160}/>
    <Field label="Follow-up date" hint="Use YYYY-MM-DD." value={form.followUpDate ?? ''} onChangeText={value => set('followUpDate', value)} maxLength={10}/>
    <SectionHeader title="Verified contact"/>
    <ChoiceRow values={['Needs verification','Verified'] as const} selected={form.contactVerified ? 'Verified' : 'Needs verification'} onSelect={value => set('contactVerified', value === 'Verified')}/>
    <Field label="Contact route" value={form.contactRoute} onChangeText={value => set('contactRoute', value)} maxLength={160}/>
    <Field label="Contact source" value={form.contactSource} onChangeText={value => set('contactSource', value)} maxLength={240}/>
    <Field label="Verification date" hint="Use YYYY-MM-DD only after verification." value={form.contactVerifiedOn ?? ''} onChangeText={value => set('contactVerifiedOn', value)} maxLength={10}/>
    <Field label="Last contact" hint="Use YYYY-MM-DD." value={form.lastContact ?? ''} onChangeText={value => set('lastContact', value)} maxLength={10}/>
    <SectionHeader title="Commercial tracking"/>
    <Field label="Verified fee or quote status" value={form.feeRange} onChangeText={value => set('feeRange', value)} maxLength={100}/>
    <Text style={styles.groupLabel}>Contract</Text><ChoiceRow values={contracts} selected={form.contractStatus} onSelect={value => set('contractStatus', value)}/>
    <Text style={styles.groupLabel}>Payment</Text><ChoiceRow values={payments} selected={form.paymentStatus} onSelect={value => set('paymentStatus', value)}/>
    <Field label="Internal notes" value={form.notes} onChangeText={value => set('notes', value)} multiline numberOfLines={5} maxLength={600} style={{minHeight:120,textAlignVertical:'top'}}/>
    <View style={formStyles.row}><ActionButton label="Save CRM record" disabled={busy || !form.nextAction.trim() || !form.contactRoute.trim()} onPress={() => { void save(); }}/><ActionButton label="Cancel" secondary onPress={() => router.back()}/></View><Feedback message={message}/>
  </Screen>;
}

function ChoiceRow<T extends string>({values,selected,onSelect}:{values:readonly T[];selected:T;onSelect:(value:T)=>void}) { return <View style={styles.choices}>{values.map(value => <Pressable key={value} onPress={() => onSelect(value)} style={[styles.choice,selected===value&&styles.choiceSelected]}><Text style={[styles.choiceText,selected===value&&styles.choiceTextSelected]}>{value}</Text></Pressable>)}</View> }
const styles = StyleSheet.create({choices:{flexDirection:'row',flexWrap:'wrap',gap:8},choice:{borderWidth:1,borderColor:theme.colors.border,borderRadius:20,paddingHorizontal:12,paddingVertical:9},choiceSelected:{backgroundColor:theme.colors.gold,borderColor:theme.colors.gold},choiceText:{color:theme.colors.cream,fontSize:12,fontWeight:'700'},choiceTextSelected:{color:theme.colors.background},groupLabel:{color:theme.colors.cream,fontSize:15,fontWeight:'600'}});
