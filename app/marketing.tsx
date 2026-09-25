import { Stack } from 'expo-router';
import { View } from 'react-native';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { marketingFunctions, marketingPhases } from '../src/data/marketing';

export default function Marketing() {
  return <Screen>
    <Stack.Screen options={{ title: 'PTown Marketing & Brand' }} />
    <PageHeader eyebrow="PTOWN MARKETING & BRAND · BUILD 66" title="Give every PTown story a path to its audience." description="A proposed department for brand, audience growth, event demand, community relationships, and measurable campaign delivery." />
    <PreviewNotice />
    <Card title="Marketing owns demand; Media Group owns editorial work" description="Marketing sets audience goals, campaign briefs, placement, offers, and measurement. PTown Media Group creates and distributes approved productions under its own editorial and production standards. A shared calendar coordinates both teams." />
    <SectionHeader title="Department functions" />
    <View style={styles.grid}>{marketingFunctions.map(item => <Card key={item.title} title={item.title} description={item.description} />)}</View>
    <SectionHeader title="PTown Access audience path" />
    <Card title="Discover → explore → opt in → attend → return" description="A guest finds an event or artist, reviews a clear program page, chooses to receive updates when consent tools exist, then follows a confirmed ticket or reservation path. After the event, PTown measures attendance, feedback, return visits, and referrals. This preview has no live marketing sign-up or purchase flow." />
    <SectionHeader title="12-month planning rhythm" />
    {marketingPhases.map(item => <Card key={item.title} title={item.title} description={item.description} />)}
    <Button label="Open the 12-month campaign calendar" href="/marketing-calendar" secondary />
    <Button label="Open the Marketing command review" href="/marketing-command" secondary />
    <SectionHeader title="Management controls" />
    <Body>Assign a marketing director, brand lead, digital and analytics lead, event campaign lead, community lead, and sponsorship lead as staffing permits. Approve a budget by campaign, name an owner and deadline for each asset, and review reach, qualified interest, attendance, cost, repeat visits, and sponsor fulfillment monthly. Publish confirmed program details only.</Body>
    <Card title="Working plans awaiting approval" description="The department guide, twelve-month campaign sequence, staffing roles, budget categories, and PTown Access funnel are available as drafts. Named owners, calendar dates, spending amounts, consent tools, and final approvals remain to be established." />
    <Button label="Open the Marketing Department Guide" href="/marketing-operations" secondary />
    <Button label="Draft proposed Marketing staffing" href="/marketing-staff" secondary />
    <Button label="Draft a campaign brief" href="/marketing-brief" secondary />
    <Button label="Review campaign launch checks" href="/marketing-launch-review" secondary />
    <Button label="Open the marketing budget worksheet" href="/marketing-budget" secondary />
    <Button label="Open the campaign scorecard" href="/marketing-scorecard" secondary />
    <Button label="Explore PTown Media Group" href="/media-group" secondary />
    <Button label="Review the weekly program" href="/events" secondary />
    <Button label="Return to PTown" href="/ptown" />
    <Footer />
  </Screen>;
}
