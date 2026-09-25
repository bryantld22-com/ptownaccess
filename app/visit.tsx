import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton } from '../src/components/forms';
import { FriendInvitationLinks } from '../src/components/FriendInvitationLinks';
import { Body, Button, Card, DraftDateNotice, EventCard, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { events, weekDays } from '../src/data/events';
import { visitQuestions } from '../src/data/visit';
import { usePreviewStore } from '../src/state/PreviewStore';
import { theme } from '../src/theme';
import { programDay } from '../src/utils/programDay';

export default function Visit() {
  const router = useRouter();
  const { day } = useLocalSearchParams<{ day?: string }>();
  const normalizedDay = weekDays.find(value => value === day) ?? 'Monday';
  // Static HTML has no search parameters. Match it on the first browser render,
  // then apply the URL so direct weekday links hydrate without a mismatch.
  const [selectedDay, setSelectedDay] = useState<typeof weekDays[number]>('Monday');
  useEffect(() => { setSelectedDay(normalizedDay); }, [normalizedDay]);
  const programs = events.filter(event => event.day === selectedDay);
  const ticketed = programs.some(event => event.admission === 'Ticketed');
  const { ready, reservationDraft } = usePreviewStore();
  const draftDay = ready && reservationDraft ? programDay(reservationDraft.date) : null;
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  function selectDay(value: string) { router.setParams({ day: value }); }

  return <Screen>
    <PageHeader eyebrow="YOUR EVENING AT PTOWN" title="Plan your visit." description="Start with a day, explore the proposed experience, and keep your dinner and membership ideas together." />
    <PreviewNotice calendar />
    <SectionHeader title="A proposed look and feel" />
    <Card title="PTown restaurant and lounge concept" description="An illustrative design board, not a photo of an operating venue. Room layouts, finishes, and amenities are still subject to design and buildout." />
    <View style={{ backgroundColor: '#fff' }}>
    <Image source={require('../assets/ptown-restaurant-concept.jpg')} resizeMode="contain" accessibilityLabel="Illustrative PTown restaurant and lounge design board" style={{ width: '100%', aspectRatio: 1.5, backgroundColor: '#fff', opacity: 0.72 }} />
    </View>
    <SectionHeader title="Choose a day" />
    <View style={styles.grid}>{weekDays.map(value => <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: value === selectedDay }} aria-pressed={value === selectedDay} onPress={() => selectDay(value)} style={[visit.day, value === selectedDay && visit.selectedDay]}><Text style={[visit.dayText, value === selectedDay && { color: theme.colors.background }]}>{value}</Text></Pressable>)}</View>
    {draftDay && reservationDraft && <View style={styles.card}>
      <Text style={styles.cardTitle}>Start from your dinner draft</Text>
      <Body>{reservationDraft.date} · {reservationDraft.partySize} {reservationDraft.partySize === 1 ? 'guest' : 'guests'} · {draftDay}</Body>
      <DraftDateNotice date={reservationDraft.date} />
      <ActionButton label={`Use my ${draftDay} draft`} onPress={() => selectDay(draftDay)} secondary />
      <Body>This selects the recurring weekday. Your date’s event and availability are not confirmed.</Body>
    </View>}
    <SectionHeader title={`${selectedDay} at PTown`} />
    {programs.map(event => <EventCard key={event.id} event={event} />)}
    {programs.map(event => event.tournamentFeature && <View key={`tournament-${event.id}`} style={{ gap: 12 }}><Card title={event.tournamentFeature.title} description={event.tournamentFeature.description} /><Button label="Explore the quarterly tournament" href="/tournament" secondary /></View>)}
    <Card title={ticketed ? 'A ticketed evening is planned' : 'Free program admission is planned'} description={ticketed ? 'Confirmed dates, artists, ticket prices, and sale details will be announced. Saving a program does not purchase admission.' : 'The recurring program is proposed with free entry. Confirmed dates and entry details will be announced. Meals and drinks are not confirmed as included.'} />
    <Card title="Your dinner options" description={selectedDay === 'Sunday' ? 'Gospel jazz brunch is planned, followed by R&B jazz until 6 pm. Brunch hours, dishes, prices, and food inclusions will be announced.' : ticketed ? 'Ticket nights are planned around one culture signature plate and one alternate plate. Specific dishes, prices, and ticket food inclusions will be announced.' : 'An open menu is planned Monday through Wednesday. Dishes, prices, and availability will be announced.'} />
    {programs.map(event => event.opening && <Card key={`opening-${event.id}`} title="Opening the evening" description={event.opening} />)}
    {programs.map(event => event.afterParty && <Card key={`after-${event.id}`} title="After the show" description={`${event.afterParty} Entry terms and prices will be announced separately; a show ticket does not confirm after-party entry.`} />)}
    <FriendInvitationLinks programs={programs} />
    <Button label={`Browse ${selectedDay} programs`} href={{ pathname: '/events', params: { day: selectedDay } }} secondary />
    <SectionHeader title="Keep your ideas together" />
    <Button label="Plan your dinner" href="/reservations" />
    <Button label="Explore ticket information" href="/tickets" secondary />
    <Button label="Discover VIP Society" href="/vip" secondary />
    <Button label="Explore membership interests" href="/memberships" secondary />
    <Button label="Review your saved plan" href="/plans" secondary />
    <SectionHeader title="Before you visit" />
    <Body>Visits cannot be booked yet. We’ll add confirmed arrival details and policies when the venue is ready to welcome guests.</Body>
    {visitQuestions.map(item => <View key={item.question} style={styles.card}>
      <Pressable accessibilityRole="button" accessibilityLabel={item.question} accessibilityState={{ expanded: openQuestion === item.question }} aria-expanded={openQuestion === item.question} onPress={() => setOpenQuestion(current => current === item.question ? null : item.question)} style={visit.question}>
        <Text style={[styles.cardTitle, { flex: 1 }]}>{item.question}</Text><Text style={styles.arrow}>{openQuestion === item.question ? '−' : '+'}</Text>
      </Pressable>
      {openQuestion === item.question && <Body>{item.answer}</Body>}
    </View>)}
    <Button label="Explore PTown" href="/ptown" secondary /><Footer />
  </Screen>;
}

const visit = StyleSheet.create({
  day: { borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, borderRadius: 30, minHeight: 48, paddingVertical: 14, paddingHorizontal: 18 },
  selectedDay: { backgroundColor: theme.colors.gold, borderColor: theme.colors.gold },
  dayText: { color: theme.colors.cream, fontSize: 14, fontWeight: '600' },
  question: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 },
});
