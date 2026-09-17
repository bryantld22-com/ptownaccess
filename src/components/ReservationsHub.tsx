import { Text, View } from 'react-native';
import { usePreviewStore } from '../state/PreviewStore';
import { programDay } from '../utils/programDay';
import { QuestionDisclosure } from './QuestionDisclosure';
import { ReservationPlanner } from './ReservationPlanner';
import { SectionIcon, type SectionIconName } from './SectionIcon';
import { Body, Button, DraftDateNotice, SectionHeader, styles } from './ui';

const experiences: { title: string; description: string; icon: SectionIconName }[] = [
  { title: 'Dinner & a show', description: 'Explore the proposed weekly entertainment and keep your preferred dinner date. Event dates, menus, service times, and table availability will be confirmed later.', icon: 'restaurant-outline' },
  { title: 'Celebrations & gatherings', description: 'Keep a birthday, dinner with friends, or community occasion in your draft. Private-event options and group policies are still being developed.', icon: 'people-outline' },
];
const questions = [
  { question: 'Does my draft hold a table?', answer: 'No. Your draft stays on this device. PTown has not received it, no table is held, and no reservation is confirmed.' },
  { question: 'Can I plan dinner for a ticketed show?', answer: 'Yes. Explore the proposed weekly programs and keep a preferred date in your draft. Dinner booking and show admission will have separate confirmed details. Saving a draft does not buy a ticket or guarantee entry.' },
  { question: 'Can I add dietary or seating preferences?', answer: 'You can keep ideas in your dinner note. The note is not submitted to PTown. Menu choices, accessibility arrangements, and dietary requests will need to be confirmed with the venue when booking opens.' },
  { question: 'Can I save more than one dinner draft?', answer: 'This preview keeps one draft per device. Saving another replaces that dinner draft while keeping your saved programs, creative interests, and membership preference. You can delete the draft separately.' },
];

export function ReservationsHub() {
  const { ready, storageError, reservationDraft } = usePreviewStore();
  const day = reservationDraft ? programDay(reservationDraft.date) : null;
  return <>
    <SectionHeader title="Choose your evening" />
    <View style={styles.grid}>{experiences.map(experience => <View key={experience.title} style={[styles.card, { flexBasis: 300, flexGrow: 1, flexShrink: 1, minWidth: 0 }]}>
      <SectionIcon name={experience.icon} /><Text accessibilityRole="header" style={styles.cardTitle}>{experience.title}</Text><Body>{experience.description}</Body>
    </View>)}</View>
    <SectionHeader title="Your saved dinner draft" />
    <View style={styles.card}>
      {!ready ? <Body>{storageError ? 'Your saved dinner draft could not be read. Open Profile using the recovery link above.' : 'Loading your saved dinner draft…'}</Body> : reservationDraft ? <>
        <Body>{reservationDraft.date} · {reservationDraft.partySize} {reservationDraft.partySize === 1 ? 'guest' : 'guests'}{day ? ` · ${day}` : ''}</Body>
        {reservationDraft.occasion ? <Body>Occasion: {reservationDraft.occasion}</Body> : null}
        {reservationDraft.notes ? <Body>Dinner note: {reservationDraft.notes}</Body> : null}
        <Body>Saved on this device. No table is held and nothing has been submitted to PTown. Edits below become your saved draft only after you press Save reservation draft.</Body>
        <DraftDateNotice date={reservationDraft.date} />
        {day && <Button label={`Explore your ${day} evening`} href={{ pathname: '/visit', params: { day } }} secondary />}
      </> : <Body>No dinner draft is saved yet. Add your preferred date and guest count below to start planning.</Body>}
    </View>
    <ReservationPlanner />
    <SectionHeader title="Reservation questions" />{questions.map(question => <QuestionDisclosure key={question.question} {...question} />)}
    <Button label="Explore the weekly visit guide" href="/visit" secondary />
    <Button label="Review your saved dinner plan" href="/plans" secondary />
    <Button label="Explore ticket information" href="/tickets" secondary />
    <Button label="Discover VIP Society" href="/vip" secondary />
  </>;
}
