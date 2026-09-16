import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePreviewStore } from '../state/PreviewStore';
import { theme } from '../theme';
import { programDay } from '../utils/programDay';
import { Body, Button, SectionHeader, styles } from './ui';

export function PlanChecklist() {
  const { ready, savedEventIds, reservationDraft, membershipInterest } = usePreviewStore();
  if (!ready) return null;
  const steps: { title: string; saved: boolean; detail: string; href: Href }[] = [
    { title: 'Choose a program', saved: savedEventIds.length > 0, detail: savedEventIds.length ? `${savedEventIds.length} proposed ${savedEventIds.length === 1 ? 'program' : 'programs'} saved` : 'Browse the proposed week and save a favorite', href: '/events' },
    { title: 'Plan your dinner', saved: reservationDraft !== null, detail: reservationDraft ? `${reservationDraft.date} · ${reservationDraft.partySize} ${reservationDraft.partySize === 1 ? 'guest' : 'guests'}` : 'Save a preferred date and guest count', href: '/reservations' },
    { title: 'Find your connection', saved: membershipInterest !== null, detail: membershipInterest ? membershipInterest === 'vip' ? 'VIP Society interest saved' : 'PTown community interest saved' : 'Explore community and VIP interests', href: '/memberships' },
  ];
  const weekday = reservationDraft ? programDay(reservationDraft.date) : null;
  return <View style={styles.card}>
    <SectionHeader title="Your planning checklist" />
    <Text accessibilityLiveRegion="polite" style={{ color: theme.colors.gold, fontSize: 15 }}>{steps.filter(step => step.saved).length} of 3 planning steps saved</Text>
    <Body>These optional steps keep your ideas together. They do not confirm tickets, a table, or membership.</Body>
    {steps.map(step => <Link key={step.title} href={step.href} asChild><Pressable accessibilityRole="link" accessibilityLabel={`${step.title}: ${step.saved ? 'Saved' : 'Not saved'}`} style={StyleSheet.flatten([{ paddingVertical: 14, gap: 6, borderTopWidth: 1, borderTopColor: theme.colors.border }])}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 }}><Text style={styles.cardTitle}>{step.title}</Text><Text style={{ color: step.saved ? theme.colors.green : theme.colors.gold, fontSize: 12 }}>{step.saved ? 'Saved ✓' : 'Explore →'}</Text></View><Text style={styles.smallBody}>{step.detail}</Text>
    </Pressable></Link>)}
    {weekday && <><Body>Your preferred date falls on {weekday}. Explore the proposed {weekday} program; your date’s event and availability are not confirmed.</Body><Button label={`Explore ${weekday} programs`} href={{ pathname: '/events', params: { day: weekday } }} secondary /></>}
    <Button label="Review and share your plan" href="/plans" secondary />
    <Button label="Plan your visit" href={weekday ? { pathname: '/visit', params: { day: weekday } } : '/visit'} secondary />
  </View>;
}
