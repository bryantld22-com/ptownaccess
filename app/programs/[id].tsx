import { Stack, useLocalSearchParams } from 'expo-router';
import { MissingPage } from '../../src/components/MissingPage';
import { Image, Text, View } from 'react-native';
import { ActionButton } from '../../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../../src/components/ui';
import { pathways } from '../../src/data/pathways';
import { usePreviewStore } from '../../src/state/PreviewStore';

export function generateStaticParams() { return pathways.map(pathway => ({ id: pathway.id })); }
export default function ProgramDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ready, busy, savedPathwayIds, togglePathway } = usePreviewStore();
  const pathway = pathways.find(item => item.id === id);
  if (!pathway) return <MissingPage title="Pathway not found." browse={{ label: 'Explore creative pathways', href: '/creative' }} />;
  const saved = savedPathwayIds.includes(pathway.id);
  return <Screen>
    <Stack.Screen options={{ title: `${pathway.division} pathway` }} />
    <PageHeader eyebrow={pathway.division.toUpperCase()} title={pathway.title} description={pathway.description} /><PreviewNotice />
    {pathway.id === 'culinary-development' && <>
      <Card title="PTown culinary concept board" description="Illustrative dishes and drinks from PTown’s planning. This is not a final menu; ingredients, prices, recipes, availability, sourcing, and service require confirmation." />
      <Image source={require('../../assets/ptown-culinary-concept.png')} resizeMode="contain" accessibilityLabel="Illustrative PTown food and drink concept board with Southern, Caribbean, island, bakery, and plant-forward ideas" style={{ width: '100%', aspectRatio: 1.3, backgroundColor: '#000' }} />
    </>}
    {pathway.id === 'culinary-development' && <>
      <SectionHeader title="Signature dish priorities" />
      <Card title="Smokehouse and Southern" description="Smoked oxtails, pit-master beef ribs, burnt ends, and catfish belong in the culinary concept. The board pictures oxtails and ribs; catfish is listed here so it is not overlooked." />
      <Card title="Broader table" description="Keep the Jamaican, island seafood, bakery, and plant-forward tracks visible alongside the smokehouse dishes. Specific preparations, menus, pricing, and availability require kitchen testing and approval." />
    </>}
    <ActionButton label={saved ? 'Remove saved interest' : 'Save this creative interest'} disabled={!ready || busy} onPress={() => { void togglePathway(pathway.id); }} />
    <Card title={saved ? 'Creative interest saved on this device' : 'Keep this pathway in mind'} description="Saving is a personal preference on this device. It does not submit an application, enroll you, or notify PTown." />
    <SectionHeader title="What you could explore" /><View style={styles.card}>{pathway.focus.map((focus, index) => <Text key={focus} style={styles.cardTitle}>{`${String(index + 1).padStart(2, '0')} · ${focus}`}</Text>)}</View>
    <SectionHeader title="A project to imagine" /><Body>{pathway.project}</Body>
    <Card title="Before participation opens" description="Dates, instructors, eligibility, prices, locations, and application requirements will be announced. Saving an interest does not create an enrollment." />
    {pathway.id === 'culinary-development' && <Button label="Explore Farm To Table agriculture" href="/farm-to-table" secondary />}
    <Button label="View your saved interests" href="/profile" secondary /><Button label="Explore creative pathways" href="/creative" secondary /><Footer />
  </Screen>;
}
