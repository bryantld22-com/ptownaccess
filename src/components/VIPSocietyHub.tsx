import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { usePreviewStore } from '../state/PreviewStore';
import { theme } from '../theme';
import { ActionButton, Feedback } from './forms';
import { SectionIcon } from './SectionIcon';
import { QuestionDisclosure } from './QuestionDisclosure';
import { Body, Button, Card, Eyebrow, SectionHeader, styles } from './ui';

const categories = [{ id: 'hospitality', title: 'Hospitality' }, { id: 'access', title: 'Special access' }];
const benefits = [
  { category: 'hospitality', title: 'A welcoming lounge experience', description: 'A comfortable, welcoming lounge is part of the planned VIP hospitality program. Access arrangements will be confirmed before enrollment.' },
  { category: 'hospitality', title: 'Attentive hospitality', description: 'Explore PTown’s vision for a more personal evening with thoughtful service and care. Final service details remain in development.' },
  { category: 'access', title: 'Member occasions', description: 'Future member events and creative connections are part of the VIP vision. Programming and availability will be announced.' },
  { category: 'access', title: 'Artist experiences', description: 'Explore planned artist experiences, subject to each event’s availability. Participating artists, access terms, and any additional costs will be confirmed.' },
];
const questions = [
  { question: 'Is VIP enrollment open?', answer: 'Enrollment is not open in this preview. You can explore the program and save an interest on this device.' },
  { question: 'Are prices and benefits confirmed?', answer: 'Prices, membership terms, guest policies, and final benefits will be announced before enrollment opens.' },
  { question: 'Does VIP include event admission?', answer: 'Event admission and seating arrangements will be confirmed in the final membership terms. This preview does not include or confirm tickets.' },
];

export function VIPSocietyHub() {
  const router = useRouter();
  const params = useLocalSearchParams<{ benefit?: string | string[] }>();
  const routeBenefit = categories.find(category => category.id === params.benefit)?.id ?? 'hospitality';
  const [selected, setSelected] = useState('hospitality');
  const [message, setMessage] = useState<string | null>(null);
  const { ready, busy, storageError, membershipInterest, saveInterest } = usePreviewStore();
  const saved = membershipInterest === 'vip';
  useEffect(() => { setSelected(routeBenefit); }, [routeBenefit]);
  function choose(id: string) { setSelected(id); router.setParams({ benefit: id === 'hospitality' ? undefined : id }); }
  async function save() {
    setMessage(null);
    if (await saveInterest('vip')) setMessage('VIP interest saved on this device. You have not enrolled.');
  }
  async function remove() {
    setMessage(null);
    if (membershipInterest === 'vip' && await saveInterest(null)) setMessage('VIP interest removed. Your other saved plans have been kept.');
  }
  return <>
    <View style={styles.card}><SectionIcon name="diamond-outline" /><Eyebrow>PTOWN VIP SOCIETY</Eyebrow><Text style={styles.cardTitle}>A more personal PTown evening.</Text><Body>Discover the planned lounge, hospitality, and member experiences. Final benefits, prices, and availability will be confirmed before enrollment opens.</Body></View>
    <SectionHeader title="Explore the VIP vision" />
    <View accessibilityRole="tablist" accessibilityLabel="VIP benefit categories" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{categories.map(category => <Pressable key={category.id} accessibilityRole="tab" aria-selected={selected === category.id} accessibilityState={{ selected: selected === category.id }} onPress={() => choose(category.id)} style={{ minHeight: 48, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 25, backgroundColor: selected === category.id ? theme.colors.gold : theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}><Text style={{ color: selected === category.id ? theme.colors.background : theme.colors.cream, fontWeight: '600' }}>{category.title}</Text></Pressable>)}</View>
    <Eyebrow>PLANNED BENEFITS</Eyebrow>
    {benefits.filter(benefit => benefit.category === selected).map(benefit => <Card key={benefit.title} title={benefit.title} description={benefit.description} />)}
    <SectionHeader title="Keep VIP in your plans" />
    <View style={styles.card}>
      <Body>{!ready ? storageError ? 'Your saved interest could not be read. Open Profile to recover your plans.' : 'Loading saved interest…' : saved ? 'Your VIP interest is saved on this device.' : membershipInterest === 'community' ? 'Your current saved interest is PTown community. Saving VIP will change that preference to VIP Society.' : 'Save a VIP interest to return to it in your plans.'}</Body>
      <Body>Saving an interest does not enroll you, notify PTown, reserve a table, or purchase tickets.</Body>
      <ActionButton label={saved ? 'VIP interest saved' : 'Save VIP interest'} disabled={!ready || busy || saved} onPress={() => { void save(); }} />
      {saved && <ActionButton label="Remove VIP interest" secondary disabled={!ready || busy} onPress={() => { void remove(); }} />}
      <Feedback message={message} />
    </View>
    <SectionHeader title="VIP questions" />{questions.map(question => <QuestionDisclosure key={question.question} {...question} />)}
    <Button label="Review your VIP interest" href="/profile" secondary />
    <Button label="Compare membership interests" href="/memberships" secondary />
    <Button label="Explore the weekly program" href="/events" secondary />
  </>;
}
