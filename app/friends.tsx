import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { ActionButton, Feedback } from '../src/components/forms';
import { FriendInvitation } from '../src/components/FriendInvitation';
import { QuestionDisclosure } from '../src/components/QuestionDisclosure';
import { SectionIcon } from '../src/components/SectionIcon';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { friendInterests, sampleFriends } from '../src/data/friends';
import { theme } from '../src/theme';

const questions = [
  { question: 'Are these real PTown members?', answer: 'No. Every profile shown here is fictional and labeled as a sample. There are no real accounts, friend lists, or live conversations in this preview.' },
  { question: 'Does a connection preview send a friend request?', answer: 'No. It only demonstrates feedback on this screen. It is not saved and does not contact anyone.' },
  { question: 'What will be needed for live Friend 2 Friend?', answer: 'Live connections will require accounts, privacy and visibility controls, consent-based requests, and blocking and reporting tools. Messaging and invitations will need a backend before they can be sent or received in PTown Access.' },
];

export default function Friends() {
  const { interest } = useLocalSearchParams<{ interest?: string }>();
  const router = useRouter();
  const normalizedInterest = friendInterests.find(item => item.id === interest)?.id ?? 'all';
  const [selectedInterest, setSelectedInterest] = useState<typeof friendInterests[number]['id']>('all');
  useEffect(() => { setSelectedInterest(normalizedInterest); }, [normalizedInterest]);
  const profiles = sampleFriends.filter(friend => selectedInterest === 'all' || friend.id === selectedInterest);
  return <Screen>
    <PageHeader eyebrow="FRIEND 2 FRIEND" title="Good company. Shared experiences." description="Explore the vision for making a PTown connection and planning an evening together." />
    <PreviewNotice />
    <Card title="Social preview—not a live network" description="Profiles below are fictional examples. No account, friend request, message, invitation delivery, or RSVP is created. Existing saved plans remain unchanged." />
    <FriendInvitation />
    <SectionHeader title="Meet the sample profiles" />
    <Body>Browse fictional examples by interest. Filters do not match you with real people or change your saved plans.</Body>
    <View accessibilityRole="tablist" accessibilityLabel="Sample profile interests" style={styles.grid}>{friendInterests.map(item => <Pressable key={item.id} accessibilityRole="tab" accessibilityState={{ selected: selectedInterest === item.id }} aria-selected={selectedInterest === item.id} onPress={() => { setSelectedInterest(item.id); router.setParams({ interest: item.id === 'all' ? undefined : item.id }); }} style={{ minHeight: 48, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 30, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: selectedInterest === item.id ? theme.colors.gold : theme.colors.surface }}><Text style={{ color: selectedInterest === item.id ? theme.colors.background : theme.colors.cream, fontWeight: '600' }}>{item.title}</Text></Pressable>)}</View>
    <Text accessibilityLiveRegion="polite" style={styles.smallBody}>{profiles.length} fictional sample {profiles.length === 1 ? 'profile' : 'profiles'}</Text>
    <View style={styles.grid}>{profiles.map(friend => <SampleProfile key={friend.id} friend={friend} />)}</View>
    <SectionHeader title="An evening together" />
    <Card title="Music & good company" description="Choose a proposed weekly program, consider dinner alongside the entertainment, and use invitation text to discuss the idea with someone you already know. Event dates and bookings are not confirmed." />
    <Card title="A creative connection" description="Explore Save the Arts, Artist Development, and Media together. These planned pathways offer ideas for shared discovery; participation and enrollment are not open." />
    <Button label="Explore creative pathways together" href="/creative" secondary />
    <SectionHeader title="Friend 2 Friend questions" />{questions.map(question => <QuestionDisclosure key={question.question} {...question} />)}
    <Button label="Review your saved plans" href="/profile" secondary /><Button label="Return home" href="/" secondary /><Footer />
  </Screen>;
}

function SampleProfile({ friend }: { friend: typeof sampleFriends[number] }) {
  const [previewed, setPreviewed] = useState(false);
  return <View style={[styles.card, { flexBasis: 300, flexGrow: 1, flexShrink: 1, minWidth: 0 }]}>
    <SectionIcon name={friend.icon} /><Text style={styles.eyebrow}>FICTIONAL SAMPLE PROFILE</Text><Text accessibilityRole="header" style={styles.cardTitle}>{friend.name}</Text>
    <Body>{friend.interests}</Body><Body>{friend.introduction}</Body>
    <Button label={`Explore ${friend.name} sample profile`} href={{ pathname: '/friends/[id]', params: { id: friend.id } }} secondary />
    <ActionButton label={`Preview connection with ${friend.name}`} disabled={previewed} secondary onPress={() => setPreviewed(true)} />
    <Feedback message={previewed ? `Connection previewed with ${friend.name}. No friend request was sent or saved.` : null} />
  </View>;
}
