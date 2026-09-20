import { Text, View } from 'react-native';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../../src/components/ui';
import { editorialStandards, operationsGuide } from '../../src/data/mediaGroup';
import { theme } from '../../src/theme';

export default function MediaDirectorOperationsGuide() {
  return <Screen><PageHeader eyebrow="MEDIA DIRECTOR OPERATIONS GUIDE · PREVIEW" title="Lead the story. Protect the trust." description="The Director of PTown Media Group owns daily operations, editorial calendars, event coverage, production schedules, creative approvals, archives, brand protection, and team development." /><PreviewNotice />
    <SectionHeader title="Operating cycle" />{operationsGuide.map(([title, description], index) => <View key={title} style={styles.card}><Text style={{ color: theme.colors.gold, fontSize: 13, fontWeight: '700' }}>STEP {index + 1}</Text><Text style={styles.cardTitle}>{title}</Text><Body>{description}</Body></View>)}
    <SectionHeader title="Non-negotiable editorial checks" />{editorialStandards.map(([title, description]) => <Card key={title} title={title} description={description} />)}
    <SectionHeader title="Director control and safety" />
    <Card title="Live production authority" description="For future livestreams, the assigned director controls the program output, camera selection, scenes, audio coordination, highlight capture, and approved monetization cues. A stable stage camera and backup plan are required before a broadcast is represented as ready." />
    <Card title="Emergency controls" description="The director or designated safety lead must be able to stop the program output, mute audio, remove an unauthorized feed, preserve an incident record, and notify venue leadership. Guest or participant camera access requires consent and role-based approval." />
    <Card title="Rights before release" description="No item advances to publication without the required releases, music and content licenses, privacy/publicity review, ownership and credit record, sponsor disclosure, and approved usage classification." />
    <SectionHeader title="Required operating records" /><Card title="One accountable project file" description="Keep the brief, assignment, rundown, call sheet, source notes, releases, rights, approvals, sponsor requirements, final exports, captions, metadata, archive location, correction history, and performance report together." />
    <Button label="Return to PTown Media Group" href="/media-group" secondary /><Footer />
  </Screen>;
}
