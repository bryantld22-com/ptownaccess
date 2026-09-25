import type { Href } from 'expo-router';
import { Button, Card, Footer, PageHeader, Screen, SectionCard, SectionHeader, styles } from '../../src/components/ui';
import { View } from 'react-native';
import { sections } from '../../src/data/sections';
import type { SectionIconName } from '../../src/components/SectionIcon';
const planningTools: { title: string; subtitle: string; href: Href; icon: SectionIconName }[] = [
  { title: 'Farm To Table', subtitle: 'Explore local agriculture, chefs, students, and the story behind the plate', href: '/farm-to-table', icon: 'leaf-outline' },
  { title: 'PTown Media Group', subtitle: 'Explore the newsroom, production, distribution, and career vision', href: '/media-group', icon: 'radio-outline' },
  { title: 'Marketing & Brand', subtitle: 'Plan audience growth, campaigns, community outreach, and launch', href: '/marketing', icon: 'megaphone-outline' },
  { title: 'Investor Access', subtitle: 'Map secure tiers for the Executive Investors Edition', href: '/investor-access', icon: 'briefcase-outline' },
  { title: 'Championship Path', subtitle: 'Build the quarterly season, chess hub, travel award, and broadcast plan', href: '/championship-path', icon: 'trophy-outline' },
  { title: 'Access roles', subtitle: 'Map guest, member, talent, staff, media, and leadership boundaries', href: '/access-roles', icon: 'shield-checkmark-outline' },
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
    <Card title="Friend 2 Friend" description="Explore fictional sample profiles and preview an invitation to a proposed PTown evening. No live connections or messages are available yet." /><Button label="Explore Friend 2 Friend" href="/friends" secondary />
    <Card title="Excellence Earns Trust." description="Our standard is simple: serve with care, respect every person, and build experiences our community can be proud of." />
    <SectionHeader title="The PTown experience" /><View style={styles.grid}>{sections.slice(2).map(section => <SectionCard key={section.href} {...section} />)}</View>
    <Button label="Explore the weekly program" href="/events" /><Footer />
  </Screen>;
}
