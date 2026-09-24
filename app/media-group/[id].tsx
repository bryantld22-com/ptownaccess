import { Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { MissingPage } from '../../src/components/MissingPage';
import { Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../../src/components/ui';
import { mediaGroupDivisions } from '../../src/data/mediaGroup';
import { theme } from '../../src/theme';

export function generateStaticParams() { return mediaGroupDivisions.map(division => ({ id: division.id })); }
export default function MediaGroupDivisionPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const division = mediaGroupDivisions.find(item => item.id === id);
  if (!division) return <MissingPage title="Media Group division not found." browse={{ label: 'Explore PTown Media Group', href: '/media-group' }} />;
  return <Screen><Stack.Screen options={{ title: division.title }} />
    <PageHeader eyebrow="PTOWN MEDIA GROUP · PLANNED DIVISION" title={division.title} description={division.description} /><PreviewNotice />
    <Card title="Accountable lead" description={`${division.lead} is the planned role accountable for this division. Hiring, reporting lines, and launch timing remain subject to funding and final operating design.`} />
    <SectionHeader title="Planned programs" /><List items={division.programs} />
    <SectionHeader title="Core responsibilities" /><List items={division.roles} />
    <SectionHeader title="Skills Passport evidence" /><List items={division.passport} />
    <Card title="Portfolio before placement" description="Every participant will document real supervised work. Completion does not guarantee employment; placement depends on readiness, available opportunities, partner requirements, and final program terms." />
    <Button label="Draft this division’s Skills Passport" href={{ pathname: '/media-passport', params: { division: division.id } }} secondary />
    <Button label="Open the Media Director Operations Guide" href="/media-group/operations-guide" secondary /><Button label="Return to PTown Media Group" href="/media-group" secondary /><Footer />
  </Screen>;
}
function List({ items }: { items: string[] }) { return <View style={styles.card}>{items.map((item, index) => <Text key={item} style={{ color: theme.colors.muted, fontSize: 16, lineHeight: 25 }}>{String(index + 1).padStart(2, '0')} · {item}</Text>)}</View>; }
