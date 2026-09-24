import { Stack } from 'expo-router';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader } from '../src/components/ui';
import { staAudiences, staGrantMeetingPrep, staLeadershipWork, staPurpose } from '../src/data/saveTheArtsLeadership';

export default function SaveTheArtsLeadership() {
  return <Screen>
    <Stack.Screen options={{ title: 'Save the Arts Leadership Briefing' }} />
    <PageHeader eyebrow="SAVE THE ARTS · BUILD 89" title="A mission ready for a capable team." description="A planning preview for prospective leaders and collaborators before roles, programs, property use, or funding are finalized." />
    <PreviewNotice />
    <Card title="Leadership invitations come first" description="Director and assistant director roles are proposed until each person has been invited, understands the scope, and accepts. This page does not announce appointments or assign authority." />
    <SectionHeader title="Why Save the Arts exists" />
    {staPurpose.map(item => <Card key={item.title} title={item.title} description={item.detail} />)}
    <SectionHeader title="Who the program intends to serve" />
    {staAudiences.map((item, index) => <Card key={item} title={`${index + 1}. Community served`} description={item} />)}
    <SectionHeader title="Educational approach" />
    <Card title="Saturday arts sessions" description="Two planned sessions use PTown’s lounge and stage for creative exploration, hands-on practice, mentorship, and supervised collaboration. Ages, schedule, curriculum, staffing, accessibility, and enrollment are still to be designed." />
    <Card title="The Heritage Tour" description="A planned cultural discovery experience connects local stories, live performance, mentorship, and industry exposure. Destinations, transportation, safety, partner agreements, budget, and participant terms must be developed before dates are announced." />
    <Card title="Document growth" description="Set learning goals, collect appropriate consent, record participation and work samples, and invite participant feedback. Outcomes should reflect actual work and permission to use it." />
    <SectionHeader title="Prospective leadership responsibilities" />
    {staLeadershipWork.map(item => <Card key={item.title} title={item.title} description={item.detail} />)}
    <SectionHeader title="Phase 1 property context" />
    <Card title="PTown’s working facility plan" description="PTown’s current Phase 1 planning uses approximately 36,000 square feet of the larger Kentucky Oaks Mall space, subject to a final demising wall, lease drawing, inspections, and design. Save the Arts may use appropriate shared lounge, stage, and support areas for planned sessions; room access and operating terms are not finalized." />
    <SectionHeader title="Prepare for a grants conversation" />
    <Body>Grant fit and eligibility depend on the applicant entity, program design, funder rules, timing, and required documentation. Bring specific questions and verify each opportunity before applying.</Body>
    {staGrantMeetingPrep.map((item, index) => <Card key={item} title={`${index + 1}. Meeting preparation`} description={item} />)}
    <Button label="Prepare a grant-meeting discussion brief" href="/sta-grant-brief" secondary />
    <Button label="Explore Save the Arts programs" href="/save-the-arts" secondary />
    <Button label="Explore Artist Development" href="/artist-development" secondary />
    <Footer />
  </Screen>;
}
