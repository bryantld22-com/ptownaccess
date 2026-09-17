import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { events } from '../data/events';
import { theme } from '../theme';
import { QuestionDisclosure } from './QuestionDisclosure';
import { SectionIcon } from './SectionIcon';
import { Body, Button, SectionHeader, styles } from './ui';

const topics = [
  { id: 'admission', title: 'Admission', heading: 'Know your entry options', description: 'Free and ticketed labels describe the proposed weekly program. Confirmed event dates, performers, prices, age requirements, and entry policies will be announced before guests can book.' },
  { id: 'food', title: 'Food & after-parties', heading: 'Plan the whole evening', description: 'Ticket nights are planned around one culture signature plate and one alternate plate. Menus, prices, and ticket food inclusions are not confirmed. Friday and Saturday after-parties are planned; separate entry terms and prices will be announced. A show ticket does not confirm after-party entry.' },
  { id: 'entry', title: 'Arrival & passes', heading: 'Before you arrive', description: 'The venue address, arrival times, accessibility arrangements, pass delivery, and check-in instructions will be added with confirmed listings. Transfer, cancellation, and refund policies will be available before sales open. No digital pass or check-in code is issued in this preview.' },
] as const;
type Topic = typeof topics[number]['id'];
const questions = [
  { question: 'Does saving a program buy a ticket?', answer: 'No. Saving keeps a planning favorite on this device. It does not reserve admission, charge you, or issue a pass.' },
  { question: 'Does free admission include dinner?', answer: 'No food inclusion is confirmed. Free describes the proposed entry policy. Meal and drink prices, menus, and inclusions will be announced separately.' },
  { question: 'Does my dinner draft include show admission?', answer: 'No. A dinner draft is a planning note stored on this device. It does not hold a table or purchase a show ticket. Each confirmed event will explain dinner and admission arrangements.' },
  { question: 'When can I buy tickets?', answer: 'Ticket sales are not open and no sale date is confirmed. Dates, performers, prices, inclusions, and policies will be published before purchases become available.' },
];

export function TicketGuide() {
  const { topic } = useLocalSearchParams<{ topic?: string }>();
  const router = useRouter();
  const normalized = topics.find(item => item.id === topic)?.id ?? 'admission';
  const [selected, setSelected] = useState<Topic>('admission');
  // Match static HTML before applying a direct link's query selection.
  useEffect(() => { setSelected(normalized); }, [normalized]);
  const current = topics.find(item => item.id === selected)!;
  return <>
    <SectionHeader title="Understand planned admission" />
    <View style={styles.grid}>{(['Free', 'Ticketed'] as const).map(admission => <View key={admission} style={[styles.card, { flexBasis: 300, flexGrow: 1, flexShrink: 1, minWidth: 0 }]}>
      <SectionIcon name={admission === 'Free' ? 'musical-notes-outline' : 'ticket-outline'} />
      <Text accessibilityRole="header" style={styles.cardTitle}>{admission === 'Free' ? 'Free program entry planned' : 'Ticketed evenings planned'}</Text>
      <Body>{events.filter(event => event.admission === admission).map(event => `${event.day}: ${event.title}`).join('\n')}</Body>
      <Body>{admission === 'Free' ? 'Meals and drinks are not confirmed as included. Entry details will be announced.' : 'Ticket prices, sale dates, food inclusions, and policies will be announced.'}</Body>
    </View>)}</View>
    <SectionHeader title="Ticket information" />
    <View accessibilityRole="tablist" accessibilityLabel="Ticket information topics" style={styles.grid}>{topics.map(item => <Pressable key={item.id} accessibilityRole="tab" accessibilityState={{ selected: selected === item.id }} aria-selected={selected === item.id} onPress={() => { setSelected(item.id); router.setParams({ topic: item.id === 'admission' ? undefined : item.id }); }} style={{ minHeight: 48, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 30, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: selected === item.id ? theme.colors.gold : theme.colors.surface }}>
      <Text style={{ color: selected === item.id ? theme.colors.background : theme.colors.cream, fontWeight: '600' }}>{item.title}</Text>
    </Pressable>)}</View>
    <View style={styles.card}><Text accessibilityRole="header" style={styles.cardTitle}>{current.heading}</Text><Body>{current.description}</Body></View>
    <SectionHeader title="Ticket questions" />{questions.map(question => <QuestionDisclosure key={question.question} {...question} />)}
    <Button label="Plan dinner alongside your show" href="/reservations" secondary />
    <Button label="Explore the weekly visit guide" href="/visit" secondary />
  </>;
}
