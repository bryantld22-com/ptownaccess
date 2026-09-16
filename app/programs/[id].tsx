import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { ActionButton } from '../../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../../src/components/ui';
import { pathways } from '../../src/data/pathways';
import { usePreviewStore } from '../../src/state/PreviewStore';

export function generateStaticParams() { return pathways.map(pathway => ({ id: pathway.id })); }
export default function ProgramDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ready, busy, savedPathwayIds, togglePathway } = usePreviewStore();
  const pathway = pathways.find(item => item.id === id);
  if (!pathway) return <Screen><PageHeader eyebrow="CREATIVE PTOWN" title="Pathway not found." /><Button label="Explore creative pathways" href="/creative" /></Screen>;
  const saved = savedPathwayIds.includes(pathway.id);
  return <Screen>
    <PageHeader eyebrow={pathway.division.toUpperCase()} title={pathway.title} description={pathway.description} /><PreviewNotice />
    <ActionButton label={saved ? 'Remove saved interest' : 'Save this creative interest'} disabled={!ready || busy} onPress={() => { void togglePathway(pathway.id); }} />
    <Card title={saved ? 'Creative interest saved on this device' : 'Keep this pathway in mind'} description="Saving is a personal preference on this device. It does not submit an application, enroll you, or notify PTown." />
    <SectionHeader title="What you could explore" /><View style={styles.card}>{pathway.focus.map((focus, index) => <Text key={focus} style={styles.cardTitle}>{`${String(index + 1).padStart(2, '0')} · ${focus}`}</Text>)}</View>
    <SectionHeader title="A project to imagine" /><Body>{pathway.project}</Body>
    <Card title="Before participation opens" description="Dates, instructors, eligibility, prices, locations, and application requirements will be announced. Saving an interest does not create an enrollment." />
    <Button label="View your saved interests" href="/profile" secondary /><Button label="Explore creative pathways" href="/creative" secondary /><Footer />
  </Screen>;
}
