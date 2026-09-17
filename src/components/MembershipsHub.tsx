import { Text, View } from 'react-native';
import { membershipChoices } from '../data/memberships';
import { MembershipPlanner } from './MembershipPlanner';
import { QuestionDisclosure } from './QuestionDisclosure';
import { SectionIcon } from './SectionIcon';
import { Body, Button, Card, Eyebrow, SectionHeader, styles } from './ui';

const questions = [
  { question: 'Does saving my interest enroll me?', answer: 'No. Saving keeps a preference on this device. It does not notify PTown, create a membership, reserve a table, or purchase tickets.' },
  { question: 'Can I change my preference?', answer: 'Yes. Select another interest and press Save my interest. VIP Society and Memberships use the same saved preference. You can remove it without clearing your other plans.' },
  { question: 'When will membership details be available?', answer: 'Prices, final benefits, guest policies, and enrollment terms will be announced before memberships open. No enrollment date is confirmed in this preview.' },
];

export function MembershipsHub() {
  return <>
    <Card title="Find your connection to PTown." description="Compare the vision for PTown community and VIP Society, then keep the interest that fits you. Both programs are being developed; this preview does not offer memberships for sale." />
    <SectionHeader title="Compare planned memberships" />
    <View style={styles.grid}>{membershipChoices.map(choice => <View key={choice.id} style={[styles.card, { flexBasis: 300, flexGrow: 1, flexShrink: 1, minWidth: 0 }]}>
      <SectionIcon name={choice.icon} /><Text accessibilityRole="header" style={styles.cardTitle}>{choice.title}</Text>
      <Eyebrow>MAIN FOCUS</Eyebrow><Body>{choice.focus}</Body>
      <Eyebrow>PLANNED EXPERIENCE</Eyebrow><Body>{choice.experience}</Body>
      <Eyebrow>PRICE & ENROLLMENT</Eyebrow><Body>Price to be announced. Enrollment is not open.</Body>
    </View>)}</View>
    <MembershipPlanner />
    <SectionHeader title="Membership questions" />{questions.map(question => <QuestionDisclosure key={question.question} {...question} />)}
    <Button label="Review your membership interest" href="/profile" secondary />
    <Button label="Explore community pathways" href="/creative" secondary />
  </>;
}
