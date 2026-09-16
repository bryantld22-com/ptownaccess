import { Button, Card, Footer, PageHeader, PreviewNotice, Screen } from '../../src/components/ui';
export default function Tickets() {
  return <Screen><PageHeader eyebrow="YOUR EVENING STARTS HERE" title="Your tickets." description="A home for your future PTown event passes." /><PreviewNotice /><Card title="No tickets yet" description="Ticket sales are not open in this preview. Browse the sample weekly program to discover your next PTown experience." /><Button label="Browse events" href="/events" /><Card title="Before tickets go on sale" description="Confirmed dates, performers, prices, food inclusions, and entry policies will be available with each event." /><Footer /></Screen>;
}
