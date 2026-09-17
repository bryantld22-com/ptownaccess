import { Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { MissingPage } from '../../src/components/MissingPage';
import { Body, Button, Card, Footer, PageHeader, Screen, SectionHeader, styles } from '../../src/components/ui';
import { mediaFeatures } from '../../src/data/media';

export function generateStaticParams() { return mediaFeatures.map(feature => ({ id: feature.id })); }
export default function MediaDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const feature = mediaFeatures.find(item => item.id === id);
  if (!feature) return <MissingPage title="Media feature not found." browse={{ label: 'Explore PTown media', href: '/media' }} />;
  return <Screen>
    <Stack.Screen options={{ title: 'PTown Media' }} />
    <PageHeader eyebrow={`PTOWN MEDIA · ${feature.category.toUpperCase()}`} title={feature.title} description={feature.description} />
    <Card title="A planned feature" description="This is a preview of PTown’s media vision. No episode, video, or live stream is available to play yet. Release details will appear when confirmed." />
    <SectionHeader title="Inside the concept" /><View style={styles.card}>{feature.topics.map(topic => <Text key={topic} style={styles.cardTitle}>{topic}</Text>)}</View>
    <SectionHeader title="The project ahead" /><Body>{feature.project}</Body>
    <SectionHeader title="Follow the creative connection" /><Button {...feature.related} secondary />
    <Button label={`Explore ${feature.category.toLowerCase()}`} href={{ pathname: '/media', params: { category: feature.category } }} secondary />
    <Button label="Explore all PTown media" href="/media" secondary /><Footer />
  </Screen>;
}
