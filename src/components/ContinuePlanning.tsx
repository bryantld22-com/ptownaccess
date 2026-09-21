import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePreviewStore } from '../state/PreviewStore';
import { isPastDate, programDay } from '../utils/programDay';
import { SectionIcon, type SectionIconName } from './SectionIcon';
import { Body, Button, SectionHeader, styles } from './ui';

export function ContinuePlanning() {
  const { ready, storageError, savedEventIds, savedPathwayIds, reservationDraft, membershipInterest, tournamentInterest } = usePreviewStore();
  const hasPlans = savedEventIds.length > 0 || savedPathwayIds.length > 0 || !!reservationDraft || !!membershipInterest || !!tournamentInterest?.gameIds.length;
  const past = reservationDraft ? isPastDate(reservationDraft.date) : false;
  const day = reservationDraft ? programDay(reservationDraft.date) : null;
  const shortcuts: { title: string; detail: string; href: Href; icon: SectionIconName }[] = [];
  if (savedEventIds.length) shortcuts.push({ title: 'Review saved programs', detail: `${savedEventIds.length} proposed ${savedEventIds.length === 1 ? 'program' : 'programs'} · Not purchased tickets`, href: { pathname: '/profile', params: { view: 'events' } }, icon: 'calendar-outline' });
  if (reservationDraft) shortcuts.push({ title: past ? 'Update your dinner draft' : 'Review dinner draft', detail: `${reservationDraft.date}${day ? ` · ${day}` : ''} · ${reservationDraft.partySize} ${reservationDraft.partySize === 1 ? 'guest' : 'guests'}${past ? ' · Preferred date has passed' : ' · No table held'}`, href: past ? '/reservations' : { pathname: '/profile', params: { view: 'dinner' } }, icon: 'restaurant-outline' });
  if (membershipInterest) shortcuts.push({ title: 'Review membership interest', detail: `${membershipInterest === 'vip' ? 'VIP Society' : 'PTown community'} · Not enrolled`, href: { pathname: '/profile', params: { view: 'membership' } }, icon: 'people-outline' });
  if (savedPathwayIds.length) shortcuts.push({ title: 'Review creative interests', detail: `${savedPathwayIds.length} creative ${savedPathwayIds.length === 1 ? 'interest' : 'interests'} · No application submitted`, href: { pathname: '/profile', params: { view: 'creative' } }, icon: 'color-palette-outline' });
  if (tournamentInterest?.gameIds.length) shortcuts.push({ title: 'Review tournament interests', detail: `${tournamentInterest.gameIds.length} ${tournamentInterest.gameIds.length === 1 ? 'game' : 'games'} · Not registered`, href: '/tournament', icon: 'trophy-outline' });
  return <View style={styles.card}>
    <SectionHeader title="Your saved plans" />
    {!ready ? <Body>{storageError ? 'Your saved plans could not be read. Open Profile to recover this device’s preview data.' : 'Loading this device’s saved plans…'}</Body> : hasPlans ? <>
      <Text accessibilityRole="header" style={styles.cardTitle}>Continue planning</Text>
      <Body>Pick up a saved idea below. Plans stay on this device; bookings, ticket purchases, and enrollment are not confirmed.</Body>
      <View style={styles.grid}>{shortcuts.map(shortcut => <Link key={shortcut.title} href={shortcut.href} asChild><Pressable accessibilityRole="link" accessibilityLabel={shortcut.title} style={StyleSheet.flatten([styles.card, { flexBasis: 400, flexGrow: 1, flexShrink: 1, minWidth: 0, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }])}>
        <SectionIcon name={shortcut.icon} /><View style={{ flex: 1, minWidth: 0, gap: 6 }}><Text style={styles.cardTitle}>{shortcut.title}</Text><Text style={styles.smallBody}>{shortcut.detail}</Text></View>
      </Pressable></Link>)}</View>
    </> : <>
      <Text accessibilityRole="header" style={styles.cardTitle}>Start with a good idea</Text>
      <Body>No plans are saved on this device yet. Explore a proposed program, save a favorite, and return here to continue planning.</Body>
      <Button label="Choose your first program" href="/events" secondary />
    </>}
    <Button label="Review your plan" href="/plans" secondary />
    <Button label="Manage saved plans" href="/profile" secondary />
  </View>;
}
