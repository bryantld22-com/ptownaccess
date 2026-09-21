import { Stack, useLocalSearchParams } from 'expo-router';
import { MissingPage } from '../../src/components/MissingPage';
import { Button, Card, Footer, PageHeader, PreviewNotice, Screen } from '../../src/components/ui';
import { events } from '../../src/data/events';
import { ActionButton } from '../../src/components/forms';
import { usePreviewStore } from '../../src/state/PreviewStore';
import { FriendInvitationLinks } from '../../src/components/FriendInvitationLinks';
export function generateStaticParams() { return events.map(event => ({ id: event.id })); }
export default function EventDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { savedEventIds, ready, busy, toggleEvent } = usePreviewStore();
  const event = events.find(item => item.id === id);
  if (!event) return <MissingPage title="Program not found." browse={{ label: 'Browse events', href: '/events' }} />;
  const saved = savedEventIds.includes(event.id);
  return <Screen><Stack.Screen options={{ title: `${event.title} · ${event.day}` }} /><PageHeader eyebrow={`${event.day.toUpperCase()} · ${event.category.toUpperCase()}`} title={event.title} description={event.description} /><PreviewNotice calendar /><ActionButton label={saved ? 'Remove saved event' : 'Save this event'} disabled={!ready || busy} onPress={() => { void toggleEvent(event.id); }} /><Card title={saved ? 'Saved on this device' : 'Make it part of your plans'} description="Save this proposed program to find it in Profile. Saving an event does not reserve a seat or purchase a ticket." /><Button label="View your saved plans" href="/profile" secondary /><Card title={`${event.admission} · Proposed weekly program`} description="Event dates, start times, performers, capacity, and availability will be announced. This is a sample program entry." />{event.monthlyFeature && <Card title={event.monthlyFeature.title} description={event.monthlyFeature.description} />}{event.opening && <Card title="Opening the evening" description={event.opening} />}{event.afterParty && <Card title="Keep the evening going" description={event.afterParty} />}<FriendInvitationLinks programs={[event]} /><Button label={event.admission === 'Ticketed' ? 'View ticket information' : 'View reservation information'} href={event.admission === 'Ticketed' ? '/tickets' : '/reservations'} /><Button label="Back to events" href="/events" secondary /><Footer /></Screen>;
}
