import { View } from 'react-native';
import { Footer, PageHeader, PreviewNotice, Screen, SectionCard, SectionHeader, Card, styles } from '../src/components/ui';
import { mediaTemplates } from '../src/data/mediaTemplates';

export default function MediaTemplates() { return <Screen>
  <PageHeader eyebrow="PTOWN MEDIA GROUP · PRODUCTION TOOLS" title="Plan it. Clear it. Document it." description="Use these working templates to organize a production draft before official systems, approvals, and staff workflows are launched." /><PreviewNotice />
  <Card title="Draft tools—not official approval" description="Entries stay only on this screen and are not submitted, saved, synced, or treated as authorization. Copy the reviewed summary if you need to keep it." />
  <SectionHeader title="Production templates" /><View style={styles.grid}>{mediaTemplates.map(template => <SectionCard key={template.id} title={template.title} subtitle={template.purpose} href={{ pathname: '/media-templates/[id]', params: { id: template.id } }} icon="document-text-outline" />)}</View><Footer />
</Screen>; }
