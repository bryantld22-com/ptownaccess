import { useLocalSearchParams } from 'expo-router';
import { Button, Card, Footer, PageHeader, PreviewNotice, Screen } from '../../src/components/ui';
import { events } from '../../src/data/events';
export function generateStaticParams() { return events.map(event => ({ id: event.id })); }
export default function EventDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = events.find(item => item.id === id);
  if (!event) return <Screen><PageHeader eyebrow="PTOWN EVENTS" title="Program not found." /><Button label="Browse events" href="/events" /></Screen>;
  return <Screen><PageHeader eyebrow={`${event.day.toUpperCase()} · ${event.category.toUpperCase()}`} title={event.title} description={event.description} /><PreviewNotice calendar /><Card title={`${event.admission} · Proposed weekly program`} description="Event dates, start times, performers, capacity, and availability will be announced. This is a sample program entry." />{event.opening && <Card title="Opening the evening" description={event.opening} />}{event.afterParty && <Card title="Keep the evening going" description={event.afterParty} />}<Button label={event.admission === 'Ticketed' ? 'View ticket information' : 'View reservation information'} href={event.admission === 'Ticketed' ? '/tickets' : '/reservations'} /><Button label="Back to events" href="/events" secondary /><Footer /></Screen>;
}
