import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { events, featuredEvent } from '../data/events';
import { theme } from '../theme';
import { isPastDate, programDay } from '../utils/programDay';
import { ActionButton, Feedback, Field, formStyles } from './forms';
import { FriendSavedPrograms } from './FriendSavedPrograms';
import { Body, Button, SectionHeader, styles } from './ui';

export function FriendInvitation() {
  const { program } = useLocalSearchParams<{ program?: string }>();
  const router = useRouter();
  const routeProgram = events.find(event => event.id === program)?.id ?? featuredEvent.id;
  const [selected, setSelected] = useState(featuredEvent.id);
  useEffect(() => { setSelected(routeProgram); }, [routeProgram]);
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('');
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const event = events.find(item => item.id === selected)!;
  const dateDay = programDay(date.trim());
  const dateError = !date.trim() ? undefined : !dateDay ? 'Enter a real date in YYYY-MM-DD format.'
    : isPastDate(date.trim()) ? 'Choose today or a future date.'
    : dateDay !== event.day ? `This date falls on ${dateDay}. Choose the ${dateDay} program or change the date.` : undefined;
  const guestError = guests.trim() && (!/^\d+$/.test(guests.trim()) || Number(guests) < 1 || Number(guests) > 999)
    ? 'Enter a whole number from 1 to 999, including yourself.' : undefined;
  const matchingEvent = dateDay && events.find(item => item.day === dateDay);
  const valid = !dateError && !guestError;
  const invitation = !valid ? 'Invitation preview paused. Correct the group details above before copying.' : [
    'JOIN ME AT PTOWN — INVITATION PREVIEW',
    'PTown Dinner Club · Paducah, Kentucky',
    '',
    `Let’s explore ${event.day} · ${event.title} together.`,
    `Proposed admission: ${event.admission}. Confirmed dates, prices, and entry details will be announced.`,
    ...(date.trim() ? [`Preferred date: ${date.trim()} (planning only; not confirmed).`] : []),
    ...(guests.trim() ? [`Estimated group: ${Number(guests)} ${Number(guests) === 1 ? 'person' : 'people'}, including me (not RSVPs or a capacity confirmation).`] : []),
    ...(note.trim() ? ['', `Personal note: ${note.trim()}`] : []),
    '',
    'Planning only. No event date, table, ticket, or attendance is confirmed.',
    'No invitation or friend request has been sent.',
  ].join('\n');
  const currentText = useRef(invitation);
  currentText.current = invitation;
  useEffect(() => { setMessage(null); setError(null); }, [invitation, date, guests]);

  async function copy() {
    if (working || !valid) return;
    const text = invitation;
    setWorking(true); setMessage(null); setError(null);
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Unavailable');
        await navigator.clipboard.writeText(text);
      } else if (!await Clipboard.setStringAsync(text)) throw new Error('Unavailable');
      if (currentText.current === text) setMessage('Invitation preview copied. No invitation or friend request was sent.');
    } catch {
      if (currentText.current === text) setError('Copy is unavailable. Select the invitation preview below and copy it manually.');
    } finally { setWorking(false); }
  }

  return <>
    <SectionHeader title="Join me at PTown" />
    <Body>Choose a proposed program and preview an invitation. The page link keeps only your program choice, not your date, guest count, or personal note. No guest is contacted and no attendance is recorded.</Body>
    <FriendSavedPrograms disabled={working} onChoose={id => { setSelected(id); router.setParams({ program: id }); }} />
    <View accessibilityRole="radiogroup" accessibilityLabel="Invitation program" style={styles.grid}>{events.map(item => <Pressable key={item.id} accessibilityRole="radio" accessibilityLabel={`${item.day}: ${item.title}`} accessibilityState={{ checked: selected === item.id, disabled: working }} aria-checked={selected === item.id} disabled={working} onPress={() => { setSelected(item.id); router.setParams({ program: item.id }); }} style={{ flexBasis: 240, flexGrow: 1, flexShrink: 1, minWidth: 0, minHeight: 64, padding: 16, gap: 6, borderRadius: 14, borderWidth: 1, borderColor: selected === item.id ? theme.colors.gold : theme.colors.border, backgroundColor: selected === item.id ? theme.colors.elevated : theme.colors.surface }}>
      <Text style={styles.eyebrow}>{item.day}</Text><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.smallBody}>{item.admission} · Proposed program</Text>
    </Pressable>)}</View>
    <View style={styles.card}>
      <SectionHeader title="Plan the group (optional)" />
      <Body>These details are not saved. A matching weekday is only a planning check—not confirmation that an event will run on that date.</Body>
      <Field label="Preferred invitation date (optional)" placeholder="YYYY-MM-DD" value={date} maxLength={10} editable={!working} onChangeText={setDate} autoCapitalize="none" hint="Use YYYY-MM-DD. Choose today or a future date matching the proposed program’s weekday." error={dateError} />
      {dateError && matchingEvent && dateDay !== event.day && !isPastDate(date.trim()) && <ActionButton label={`Use the ${dateDay} program`} secondary disabled={working} onPress={() => { setSelected(matchingEvent.id); router.setParams({ program: matchingEvent.id }); }} />}
      <Field label="Estimated invitation group (optional)" placeholder="Number of people" value={guests} maxLength={12} editable={!working} onChangeText={setGuests} keyboardType="number-pad" hint="1–999 people, including yourself. An estimate, not RSVPs or a reservation." error={guestError} />
      <ActionButton label="Clear group details" secondary disabled={working || (!date && !guests)} onPress={() => { setDate(''); setGuests(''); }} />
      <Field label="Personal invitation note (optional)" placeholder="Let’s make an evening of it…" value={note} maxLength={160} editable={!working} onChangeText={value => setNote(value.slice(0, 160))} multiline hint={`${note.length}/160 characters. This note is not saved; it is included only in the invitation text you choose to copy. Avoid private or sensitive details.`} style={{ minHeight: 100, textAlignVertical: 'top' }} />
      <Body>Review this text before copying. It does not automatically include your saved dinner draft, dinner notes, guest count, or membership preference. Only group details and notes you enter here are included. You choose whether to send copied text outside the app.</Body>
      <ActionButton label={working ? 'Copying…' : 'Copy invitation preview'} disabled={working || !valid} onPress={() => { void copy(); }} />
      <Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
      <Field label="Invitation preview" multiline editable={false} value={invitation} hint={valid ? 'Selectable text for manual copying. This is not a ticket, reservation, or sent invitation.' : 'Copying is disabled until the group details are corrected or cleared.'} style={{ minHeight: 280, lineHeight: 23, fontSize: 14, textAlignVertical: 'top' }} />
      <Button label={`Explore the ${event.day} visit guide`} href={{ pathname: '/visit', params: { day: event.day } }} secondary />
    </View>
  </>;
}
