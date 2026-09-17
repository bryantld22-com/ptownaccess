import { useState } from 'react';
import { Text, View } from 'react-native';
import { ActionButton, Feedback } from '../src/components/forms';
import { FriendInvitation } from '../src/components/FriendInvitation';
import { QuestionDisclosure } from '../src/components/QuestionDisclosure';
import { SectionIcon } from '../src/components/SectionIcon';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { sampleFriends } from '../src/data/friends';

const questions = [
  { question: 'Are these real PTown members?', answer: 'No. Every profile shown here is fictional and labeled as a sample. There are no real accounts, friend lists, or live conversations in this preview.' },
  { question: 'Does a connection preview send a friend request?', answer: 'No. It only demonstrates feedback on this screen. It is not saved and does not contact anyone.' },
  { question: 'What will be needed for live Friend 2 Friend?', answer: 'Live connections will require accounts, privacy and visibility controls, consent-based requests, and blocking and reporting tools. Messaging and invitations will need a backend before they can be sent or received in PTown Access.' },
];

export default function Friends() {
  return <Screen>
    <PageHeader eyebrow="FRIEND 2 FRIEND" title="Good company. Shared experiences." description="Explore the vision for making a PTown connection and planning an evening together." />
    <PreviewNotice />
    <Card title="Social preview—not a live network" description="Profiles below are fictional examples. No account, friend request, message, invitation delivery, or RSVP is created. Existing saved plans remain unchanged." />
    <FriendInvitation />
    <SectionHeader title="Meet the sample profiles" />
    <View style={styles.grid}>{sampleFriends.map(friend => <SampleProfile key={friend.id} friend={friend} />)}</View>
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
    <ActionButton label={`Preview connection with ${friend.name}`} disabled={previewed} secondary onPress={() => setPreviewed(true)} />
    <Feedback message={previewed ? `Connection previewed with ${friend.name}. No friend request was sent or saved.` : null} />
  </View>;
}
