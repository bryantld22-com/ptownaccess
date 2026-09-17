import { Stack, useLocalSearchParams } from 'expo-router';
import { Button, Card, Footer, PageHeader, PreviewNotice, Screen } from '../src/components/ui';
import { sectionContent, sections } from '../src/data/sections';
import { MissingPage } from '../src/components/MissingPage';
import type { SectionSlug } from '../src/types';
import { ReservationPlanner } from '../src/components/ReservationPlanner';
import { MembershipPlanner } from '../src/components/MembershipPlanner';
import { PathwayCard } from '../src/components/PathwayCard';
import { pathways, type CreativeDivision } from '../src/data/pathways';
import { SectionHeader } from '../src/components/ui';
import { MediaLibrary } from '../src/components/MediaLibrary';
import { ArtistDevelopmentHub } from '../src/components/ArtistDevelopmentHub';
import { SaveTheArtsHub } from '../src/components/SaveTheArtsHub';
export function generateStaticParams() { return Object.keys(sectionContent).map(section => ({ section })); }
export default function Section() {
  const { section } = useLocalSearchParams<{ section: string }>();
  const content = Object.prototype.hasOwnProperty.call(sectionContent, section ?? '') ? sectionContent[section as SectionSlug] : undefined;
  const division: CreativeDivision | undefined = section === 'save-the-arts' ? 'Save the Arts' : section === 'artist-development' ? 'Artist Development' : section === 'media' ? 'Media' : undefined;
  if (!content) return <MissingPage />;
  return <Screen>
    <Stack.Screen options={{ title: sections.find(item => item.href === `/${section}`)?.title ?? 'Explore PTown' }} />
    <PageHeader eyebrow={content.eyebrow} title={content.title} description={content.description} /><PreviewNotice />
    {section === 'reservations' && <ReservationPlanner />}
    {section === 'memberships' && <MembershipPlanner />}
    {section === 'media' && <MediaLibrary />}
    {section === 'artist-development' ? <ArtistDevelopmentHub /> : section === 'save-the-arts' ? <SaveTheArtsHub /> : division ? <>
      <SectionHeader title="Explore planned pathways" />
      {pathways.filter(pathway => pathway.division === division).map(pathway => <PathwayCard key={pathway.id} pathway={pathway} />)}
      <Button label="Browse all creative pathways" href="/creative" secondary />
    </> : content.items.map(item => <Card key={item.title} {...item} />)}
    {section === 'memberships' && <Button label="Explore VIP Society" href="/vip" secondary />}
    <Button label="Explore PTown" href="/ptown" secondary /><Footer />
  </Screen>;
}
