import { Text, View } from 'react-native';
import { Footer, PageHeader, PreviewNotice, Screen, SectionCard, SectionHeader, Body, Button, Card, styles } from '../src/components/ui';
import { editorialStandards, mediaCareerPath, mediaGroupDivisions, mediaLeadership } from '../src/data/mediaGroup';
import { theme } from '../src/theme';

export default function MediaGroup() {
  return <Screen>
    <PageHeader eyebrow="PTOWN MEDIA GROUP · FOUNDATION" title="Independent. Unfiltered. Artist Driven." description="PTown Media Group is planned as an independent community media network for Paducah, Western Kentucky, and the Mid-South—built to document PTown, amplify talent, preserve culture, and create professional media careers." />
    <PreviewNotice />
    <Card title="Every Story Matters." description="PTown Access and the PTown website are the planned home base for original reporting, programs, performances, and archives. Social platforms support promotion and discovery; they do not replace PTown’s owned distribution." />

    <SectionHeader title="Media Group divisions" />
    <View style={styles.grid}>{mediaGroupDivisions.map(division => <SectionCard key={division.id} title={division.title} subtitle={division.description} href={{ pathname: '/media-group/[id]', params: { id: division.id } }} icon={division.icon} />)}</View>

    <SectionHeader title="Editorial promise" />
    {editorialStandards.map(([title, description]) => <Card key={title} title={title} description={description} />)}
    <Card title="What “unfiltered” means" description="Independent judgment, honest community storytelling, and room for difficult subjects—with verification, fairness, transparency, corrections, and clear separation between reporting and opinion. It does not mean publishing without standards." />

    <SectionHeader title="Training to job placement" />
    <View accessibilityLabel="Media career pathway" style={styles.card}>
      <Text style={styles.cardTitle}>{mediaCareerPath.join(' → ')}</Text>
      <Body>Each participant will use a Skills Passport, complete real PTown productions, build portfolio evidence, and connect training to internships, apprenticeships, employment, or entrepreneurship. Details and enrollment are not open yet.</Body>
    </View>

    <SectionHeader title="Leadership and operating team" />
    <View style={styles.card}>{mediaLeadership.map(role => <Text key={role} style={{ color: theme.colors.muted, fontSize: 16, lineHeight: 25 }}>• {role}</Text>)}</View>

    <SectionHeader title="Distribution and access" />
    <Card title="Audience experience" description="Planned channels include PTown Journal, PTown Radio, the Podcast Network, livestreams, documentaries, artist interviews, performance highlights, community information, tourism and culture, and the PTown Story Archive." />
    <Card title="Investor and partner access" description="A protected future path will present selected investor documents, due-diligence materials, sponsorship opportunities, media-partner inquiries, and production-service information. No confidential documents are exposed in this preview." />
    <Button label="Open the Media Director Operations Guide" href="/media-group/operations-guide" secondary />
    <Button label="Open production templates" href="/media-templates" secondary />
    <Button label="Open the production dashboard" href="/media-dashboard" secondary />
    <Button label="Create private production drafts" href="/media-drafts" secondary />
    <Button label="Explore planned PTown media" href="/media" />
    <Button label="Explore creative media pathways" href="/creative?division=Media" secondary />
    <Footer />
  </Screen>;
}
