import { Button, Card, EventCard, Footer, PageHeader, PreviewNotice, Screen, SectionHeader } from '../../src/components/ui';
import { usePreviewStore } from '../../src/state/PreviewStore';
import { events } from '../../src/data/events';
export default function Tickets() {
  const { ready, savedEventIds } = usePreviewStore();
  const ticketed = events.filter(event => event.admission === 'Ticketed' && savedEventIds.includes(event.id));
  return <Screen><PageHeader eyebrow="YOUR EVENING STARTS HERE" title="Your tickets." description="A home for your future PTown event passes." /><PreviewNotice /><Card title="No tickets yet" description="Ticket sales are not open in this preview. Browse the sample weekly program to discover your next PTown experience." /><Button label="Browse events" href="/events" />{ready && ticketed.length > 0 && <><SectionHeader title="Saved ticketed programs" /><Card title="Favorites, awaiting confirmed listings" description="These saved programs are planning ideas. They are not tickets and do not grant entry." />{ticketed.map(event => <EventCard key={event.id} event={event} />)}</>}<Button label="Review your plan" href="/plans" secondary /><Card title="Before tickets go on sale" description="Confirmed dates, performers, prices, food inclusions, and entry policies will be available with each event." /><Footer /></Screen>;
}
