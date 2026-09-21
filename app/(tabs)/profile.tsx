import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { Body, Button, Card, DraftDateNotice, EventCard, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../../src/components/ui';
import { ActionButton, Feedback, formStyles } from '../../src/components/forms';
import { events } from '../../src/data/events';
import { usePreviewStore } from '../../src/state/PreviewStore';
import { PlanChecklist } from '../../src/components/PlanChecklist';
import { PathwayCard } from '../../src/components/PathwayCard';
import { pathways } from '../../src/data/pathways';
import { profileViews, SavedPlanNavigation, type ProfileView } from '../../src/components/SavedPlanNavigation';
import { tournamentGames } from '../../src/data/tournament';
export default function Profile() {
  const { view } = useLocalSearchParams<{ view?: string }>();
  const router = useRouter();
  const normalizedView = profileViews.find(value => value === view) ?? 'all';
  const [selectedView, setSelectedView] = useState<ProfileView>('all');
  useEffect(() => { setSelectedView(normalizedView); }, [normalizedView]);
  function selectView(value: ProfileView) { setSelectedView(value); router.setParams({ view: value === 'all' ? undefined : value }); }
  const { ready, busy, storageError, savedEventIds, savedPathwayIds, reservationDraft, membershipInterest, tournamentInterest, clearPlans } = usePreviewStore();
  const [confirmClear, setConfirmClear] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const savedEvents = savedEventIds.map(id => events.find(event => event.id === id)).filter(event => event !== undefined);
  const savedPathways = pathways.filter(pathway => savedPathwayIds.includes(pathway.id));
  const selectedTournamentGames = tournamentGames.filter(game => tournamentInterest?.gameIds.includes(game.id));
  const hasPlans = savedEvents.length > 0 || savedPathways.length > 0 || reservationDraft !== null || membershipInterest !== null || selectedTournamentGames.length > 0;
  async function clear() {
    setMessage(null);
    if (await clearPlans()) {
      setConfirmClear(false);
      setMessage('Saved preview data cleared from this device.');
    }
  }
  return <Screen>
    <PageHeader eyebrow="YOUR PTOWN PLANS" title="Keep the good ideas." description="Saved events, tournament and creative interests, a dinner draft, and membership ideas—all in one place." />
    <PreviewNotice />
    <Card title="Saved on this device" description="No account is needed. These preview plans stay in this browser or app on this device. They do not sync across devices, and clearing app or browser data removes them." />
    <SavedPlanNavigation selected={selectedView} onSelect={selectView} />
    <Button label="Review and share saved ideas" href="/plans" secondary />
    <Button label="Back up or restore plans" href="/backup" secondary />
    {!ready && !storageError && <Body>Loading your saved plans…</Body>}
    {ready && <>
      {selectedView === 'all' && <PlanChecklist />}
      {(selectedView === 'all' || selectedView === 'events') && <>
      <SectionHeader title="Saved events" href="/events" action="Browse" />
      <Button label="Compare your programs" href="/compare" secondary />
      {savedEvents.length ? savedEvents.map(event => <EventCard key={event.id} event={event} />) : <Card title="Your next evening starts here" description="Save a proposed program from its detail page and return to it here." />}
      </>}
      {selectedView === 'all' && <>
      <SectionHeader title="Tournament interests" />
      {selectedTournamentGames.length ? <Card title={selectedTournamentGames.map(game => game.title).join(' · ')} description="Saved on this device as interests only. You are not registered, no place is reserved, and no attendance or check-in has been recorded." /> : <Card title="No tournament interests saved" description="Explore the Monday Tournament Hub and save the games that interest you. Saving does not register a player." />}
      <Button label={selectedTournamentGames.length ? 'Review tournament interests' : 'Explore the Tournament Hub'} href="/tournament" secondary />
      </>}
      {(selectedView === 'all' || selectedView === 'dinner') && <>
      <SectionHeader title="Reservation draft" />
      {reservationDraft ? <Card title={`Preferred date: ${reservationDraft.date}`} description={`${reservationDraft.partySize} ${reservationDraft.partySize === 1 ? 'guest' : 'guests'}${reservationDraft.occasion ? ` · ${reservationDraft.occasion}` : ''}. This is a saved draft; no reservation has been placed.`} /> : <Card title="No reservation draft yet" description="Plan a preferred date, guest count, and occasion. Availability and bookings are not open." />}
      {reservationDraft && <DraftDateNotice date={reservationDraft.date} />}
      {reservationDraft?.notes?.trim() && <Card title="Dinner planning note" description={`${reservationDraft.notes} · Planning only; PTown has not received or confirmed this request.`} />}
      <Button label={reservationDraft ? 'Edit reservation draft' : 'Plan a reservation draft'} href="/reservations" secondary />
      </>}
      {(selectedView === 'all' || selectedView === 'membership') && <>
      <SectionHeader title="Membership interest" />
      {membershipInterest ? <Card title={membershipInterest === 'vip' ? 'Interested in VIP Society' : 'Interested in the PTown community'} description="Your preference is saved on this device. You have not enrolled in a membership." /> : <Card title="Find your connection" description="Explore the PTown community and VIP Society, then save what interests you." />}
      <Button label={membershipInterest ? 'Change membership interest' : 'Explore membership interests'} href="/memberships" secondary />
      </>}
      {(selectedView === 'all' || selectedView === 'creative') && <>
      <SectionHeader title="Creative interests" href="/creative" action="Explore" />
      {savedPathways.length ? savedPathways.map(pathway => <PathwayCard key={pathway.id} pathway={pathway} />) : <Card title="Discover your creative path" description="Explore Save the Arts, Artist Development, and Media. Save interests to return to them here; no application is submitted." />}
      </>}
    </>}
    {(hasPlans || storageError) && <View style={styles.card}>
      <SectionHeader title="Manage saved data" />
      {confirmClear ? <><Body>Clear all saved events, tournament and creative interests, your reservation draft, and membership interest from this device? This also resets unreadable preview data.</Body><View style={formStyles.row}><ActionButton label="Clear my saved plans" disabled={busy} onPress={() => { void clear(); }} /><ActionButton label="Keep my plans" disabled={busy} secondary onPress={() => setConfirmClear(false)} /></View></> : <><Body>You can remove this device’s preview plans at any time.</Body><ActionButton label="Clear saved preview data" disabled={busy} secondary onPress={() => { setMessage(null); setConfirmClear(true); }} /></>}
    </View>}
    <Feedback message={message} /><Footer />
  </Screen>;
}
