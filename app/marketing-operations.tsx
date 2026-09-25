import { Stack } from 'expo-router';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader } from '../src/components/ui';
import { budgetLines, campaignSteps, marketingRoles } from '../src/data/marketingOperations';

export default function MarketingOperations() {
  return <Screen>
    <Stack.Screen options={{ title: 'Marketing Department Guide' }} />
    <PageHeader eyebrow="PTOWN MARKETING & BRAND · BUILD 68" title="The department behind every campaign." description="A working operations guide for staffing, briefs, approvals, budget control, and honest measurement." />
    <PreviewNotice />
    <Card title="Accountability" description="Marketing owns the campaign and audience promise. Program owners verify details. Media Group keeps its own production and editorial authority. A person may cover several roles during startup, but every campaign still needs named decisions and an approval record." />
    <SectionHeader title="Staffing structure" />
    {marketingRoles.map(item => <Card key={item.role} title={item.role} description={item.accountable} />)}
    <Button label="Draft proposed staffing and open seats" href="/marketing-staff" secondary />
    <SectionHeader title="Campaign operating sequence" />
    {campaignSteps.map(item => <Card key={item.title} title={item.title} description={item.detail} />)}
    <SectionHeader title="Budget worksheet categories" />
    <Body>Set a total budget only after the venue plan and launch schedule are approved. Assign each line an owner, amount, funding source, commitment date, approval limit, actual spend, and variance. Review spend and results monthly.</Body>
    {budgetLines.map((item, index) => <Card key={item} title={`${index + 1}. ${item}`} description="Amount, owner, approval limit, and actual spend to be determined in the controlled operating budget." />)}
    <SectionHeader title="Weekly and monthly cadence" />
    <Card title="Weekly campaign meeting" description="Review the next four weeks, blocked facts or assets, approvals, audience feedback, sponsor promises, and one responsible owner for each next action." />
    <Card title="Monthly performance review" description="Compare results to each brief, reconcile spend, document corrections, review consent and opt-outs, confirm sponsor delivery, and decide what to stop, change, or repeat." />
    <Card title="Launch gate" description="Never advertise an unconfirmed opening, performer, price, prize, sponsor, affiliation, or feature as active. Confirm the guest path works before paid promotion." />
    <Button label="Open the campaign calendar" href="/marketing-calendar" secondary />
    <Button label="Draft a campaign brief" href="/marketing-brief" secondary />
    <Button label="Open the marketing budget worksheet" href="/marketing-budget" secondary />
    <Button label="Return to Marketing & Brand" href="/marketing" />
    <Footer />
  </Screen>;
}
