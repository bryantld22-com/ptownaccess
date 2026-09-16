import { useLocalSearchParams } from 'expo-router';
import { Button, Card, Footer, PageHeader, PreviewNotice, Screen } from '../src/components/ui';
import { sectionContent } from '../src/data/sections';
import type { SectionSlug } from '../src/types';
import { ReservationPlanner } from '../src/components/ReservationPlanner';
import { MembershipPlanner } from '../src/components/MembershipPlanner';
export function generateStaticParams() { return Object.keys(sectionContent).map(section => ({ section })); }
export default function Section() {
  const { section } = useLocalSearchParams<{ section: string }>();
  const content = Object.prototype.hasOwnProperty.call(sectionContent, section ?? '') ? sectionContent[section as SectionSlug] : undefined;
  if (!content) return <Screen><PageHeader eyebrow="PTOWN ACCESS" title="Page not found." description="This section is not available." /><Button label="Return home" href="/" /></Screen>;
  return <Screen><PageHeader eyebrow={content.eyebrow} title={content.title} description={content.description} /><PreviewNotice />{section === 'reservations' && <ReservationPlanner />}{section === 'memberships' && <MembershipPlanner />}{content.items.map(item => <Card key={item.title} {...item} />)}{section === 'memberships' && <Button label="Explore VIP Society" href="/vip" secondary />}<Button label="Explore PTown" href="/ptown" secondary /><Footer /></Screen>;
}
