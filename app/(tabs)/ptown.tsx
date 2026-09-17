import type { Href } from 'expo-router';
import { Button, Card, Footer, PageHeader, Screen, SectionCard, SectionHeader, styles } from '../../src/components/ui';
import { View } from 'react-native';
import { sections } from '../../src/data/sections';
import type { SectionIconName } from '../../src/components/SectionIcon';
const planningTools: { title: string; subtitle: string; href: Href; icon: SectionIconName }[] = [
  { title: 'Search PTown', subtitle: 'Find programs, creative pathways, and sections', href: '/search', icon: 'search-outline' },
  { title: 'Plan your visit', subtitle: 'Explore the proposed week and dinner information', href: '/visit', icon: 'map-outline' },
  { title: 'Compare programs', subtitle: 'Consider up to three evenings side by side', href: '/compare', icon: 'git-compare-outline' },
  { title: 'Creative pathways', subtitle: 'Discover planned opportunities to build your craft', href: '/creative', icon: 'musical-notes-outline' },
  { title: 'Review your plan', subtitle: 'Bring your saved programs and dinner ideas together', href: '/plans', icon: 'bookmark-outline' },
  { title: 'Back up your plans', subtitle: 'Manually transfer saved ideas to another device', href: '/backup', icon: 'cloud-download-outline' },
];
export default function PTown() {
  return <Screen>
    <PageHeader eyebrow="PTOWN DINNER CLUB · PADUCAH" title="Culture. Creativity. Community." description="Dinner and a show is only the beginning. PTown connects hospitality, live entertainment, and creative opportunity." />
    <SectionHeader title="Plan and explore" /><View style={styles.grid}>{planningTools.map(tool => <SectionCard key={tool.title} {...tool} />)}</View>
    <Card title="Excellence Earns Trust." description="Our standard is simple: serve with care, respect every person, and build experiences our community can be proud of." />
    <SectionHeader title="The PTown experience" /><View style={styles.grid}>{sections.slice(2).map(section => <SectionCard key={section.href} {...section} />)}</View>
    <Button label="Explore the weekly program" href="/events" /><Footer />
  </Screen>;
}
