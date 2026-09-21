import type { Href } from 'expo-router';
import { Button, Card, Footer, PageHeader, Screen, SectionCard, SectionHeader, styles } from '../../src/components/ui';
import { View } from 'react-native';
import { sections } from '../../src/data/sections';
const planningTools: { title: string; subtitle: string; href: Href }[] = [
  { title: 'Search PTown', subtitle: 'Find programs, creative pathways, and sections', href: '/search' },
  { title: 'Plan your visit', subtitle: 'Explore the proposed week and dinner information', href: '/visit' },
  { title: 'Compare programs', subtitle: 'Consider up to three evenings side by side', href: '/compare' },
  { title: 'Creative pathways', subtitle: 'Discover planned opportunities to build your craft', href: '/creative' },
  { title: 'Review your plan', subtitle: 'Bring your saved programs and dinner ideas together', href: '/plans' },
  { title: 'Back up your plans', subtitle: 'Manually transfer saved ideas to another device', href: '/backup' },
  { title: 'Booking operations', subtitle: 'Open the PTown management Artist CRM', href: '/operations' },
];
export default function PTown() {
  return <Screen>
    <PageHeader eyebrow="PTOWN DINNER CLUB · PADUCAH" title="Culture. Creativity. Community." description="Dinner and a show is only the beginning. PTown connects hospitality, live entertainment, and creative opportunity." />
    <SectionHeader title="Plan and explore" /><View style={styles.grid}>{planningTools.map((tool, index) => <SectionCard key={tool.title} {...tool} icon={String(index + 1).padStart(2, '0')} />)}</View>
    <Card title="Excellence Earns Trust." description="Our standard is simple: serve with care, respect every person, and build experiences our community can be proud of." />
    <SectionHeader title="The PTown experience" /><View style={styles.grid}>{sections.slice(2).map(section => <SectionCard key={section.href} {...section} />)}</View>
    <Button label="Explore the weekly program" href="/events" /><Footer />
  </Screen>;
}
