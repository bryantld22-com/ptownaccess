import { Button, Card, EventCard, Footer, PageHeader, PreviewNotice, Screen, SectionHeader } from '../../src/components/ui';
import { usePreviewStore } from '../../src/state/PreviewStore';
import { events } from '../../src/data/events';
import { TicketGuide } from '../../src/components/TicketGuide';
export default function Tickets() {
  const { ready, storageError, savedEventIds } = usePreviewStore();
  const ticketed = events.filter(event => event.admission === 'Ticketed' && savedEventIds.includes(event.id));
  return <Screen><PageHeader eyebrow="YOUR EVENING STARTS HERE" title="Your tickets." description="A home for your future PTown event passes." /><PreviewNotice />
    <Card title="No tickets yet" description="Ticket sales are not open in this preview. Browse the sample weekly program to discover your next PTown experience." /><Button label="Browse events" href="/events" />
    <SectionHeader title="Saved ticketed programs" />
    {!ready ? <Card title={storageError ? 'Saved programs unavailable' : 'Loading saved programs…'} description={storageError ? 'Your saved plans could not be read. Open Profile using the recovery link above.' : 'Checking this device’s saved planning favorites.'} /> : ticketed.length ? <><Card title="Favorites, awaiting confirmed listings" description="These saved programs are planning ideas. They are not tickets and do not grant entry." />{ticketed.map(event => <EventCard key={event.id} event={event} />)}</> : <Card title="No saved ticketed programs" description="Save a Thursday, Friday, or Saturday program from its detail page to keep it here. Free-admission favorites remain in your saved plan. No ticket is purchased." />}
    <Button label="Review your plan" href="/plans" secondary />
    <TicketGuide /><Footer />
  </Screen>;
}
