import { Stack, useLocalSearchParams } from 'expo-router';
import { MissingPage } from '../../src/components/MissingPage';
import { SectionIcon } from '../../src/components/SectionIcon';
import { Body, Button, Card, EventCard, Footer, PageHeader, PreviewNotice, Screen, SectionHeader } from '../../src/components/ui';
import { events } from '../../src/data/events';
import { sampleFriends } from '../../src/data/friends';
import { pathways } from '../../src/data/pathways';

export function generateStaticParams() { return sampleFriends.map(friend => ({ id: friend.id })); }

export default function SampleFriend() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const friend = sampleFriends.find(item => item.id === id);
  if (!friend) return <MissingPage title="Sample profile not found." description="This sample profile link is unavailable. No real account or connection has been removed." browse={{ label: 'Browse Friend 2 Friend', href: '/friends' }} />;
  const programs = events.filter(event => friend.programIds.includes(event.id));
  const creative = pathways.filter(pathway => friend.pathwayIds.includes(pathway.id));
  return <Screen>
    <Stack.Screen options={{ title: `${friend.name} · Sample profile` }} />
    <PageHeader eyebrow="FRIEND 2 FRIEND · FICTIONAL PROFILE" title={friend.name} description={friend.introduction} />
    <PreviewNotice /><SectionIcon name={friend.icon} />
    <Card title="An example—not a real member" description="This fictional profile demonstrates possible interests. There is no real person to contact, no account to follow, and no attendance or availability to infer. Invitation text does not contact this sample profile." />
    <SectionHeader title="Interests to explore" /><Body>{friend.interests}</Body>
    <Card title="A shared-activity idea" description={friend.activity} />
    <SectionHeader title="Proposed evenings to consider" />
    {programs.map(event => <EventIdea key={event.id} event={event} />)}
    <SectionHeader title="Creative discoveries" />
    <Body>These are planned pathways, not activities joined by this fictional guest. Participation and enrollment are not open.</Body>
    {creative.map(pathway => <Button key={pathway.id} label={`Explore ${pathway.title}`} href={{ pathname: '/programs/[id]', params: { id: pathway.id } }} secondary />)}
    <Button label="Back to related sample profiles" href={{ pathname: '/friends', params: { interest: friend.id } }} secondary />
    <Button label="Browse all sample profiles" href="/friends" secondary /><Footer />
  </Screen>;
}

function EventIdea({ event }: { event: typeof events[number] }) {
  return <><EventCard event={event} /><Button label={`Preview an invitation for ${event.title}`} href={{ pathname: '/friends', params: { program: event.id } }} secondary /></>;
}
