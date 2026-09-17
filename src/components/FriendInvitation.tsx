import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { events, featuredEvent } from '../data/events';
import { theme } from '../theme';
import { ActionButton, Feedback, Field, formStyles } from './forms';
import { Body, Button, SectionHeader, styles } from './ui';

export function FriendInvitation() {
  const { program } = useLocalSearchParams<{ program?: string }>();
  const router = useRouter();
  const routeProgram = events.find(event => event.id === program)?.id ?? featuredEvent.id;
  const [selected, setSelected] = useState(featuredEvent.id);
  useEffect(() => { setSelected(routeProgram); }, [routeProgram]);
  const [note, setNote] = useState('');
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const event = events.find(item => item.id === selected)!;
  const invitation = [
    'JOIN ME AT PTOWN — INVITATION PREVIEW',
    'PTown Dinner Club · Paducah, Kentucky',
    '',
    `Let’s explore ${event.day} · ${event.title} together.`,
    `Proposed admission: ${event.admission}. Confirmed dates, prices, and entry details will be announced.`,
    ...(note.trim() ? ['', `Personal note: ${note.trim()}`] : []),
    '',
    'Planning only. No event date, table, ticket, or attendance is confirmed.',
    'No invitation or friend request has been sent.',
  ].join('\n');
  const currentText = useRef(invitation);
  currentText.current = invitation;
  useEffect(() => { setMessage(null); setError(null); }, [invitation]);

  async function copy() {
    if (working) return;
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
    <Body>Choose a proposed program and preview an invitation. The page link keeps your program choice, not your personal note. No guest is contacted and no attendance is recorded.</Body>
    <View accessibilityRole="radiogroup" accessibilityLabel="Invitation program" style={styles.grid}>{events.map(item => <Pressable key={item.id} accessibilityRole="radio" accessibilityLabel={`${item.day}: ${item.title}`} accessibilityState={{ checked: selected === item.id, disabled: working }} aria-checked={selected === item.id} disabled={working} onPress={() => { setSelected(item.id); router.setParams({ program: item.id }); }} style={{ flexBasis: 240, flexGrow: 1, flexShrink: 1, minWidth: 0, minHeight: 64, padding: 16, gap: 6, borderRadius: 14, borderWidth: 1, borderColor: selected === item.id ? theme.colors.gold : theme.colors.border, backgroundColor: selected === item.id ? theme.colors.elevated : theme.colors.surface }}>
      <Text style={styles.eyebrow}>{item.day}</Text><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.smallBody}>{item.admission} · Proposed program</Text>
    </Pressable>)}</View>
    <View style={styles.card}>
      <Field label="Personal invitation note (optional)" placeholder="Let’s make an evening of it…" value={note} maxLength={160} editable={!working} onChangeText={value => setNote(value.slice(0, 160))} multiline hint={`${note.length}/160 characters. This note is not saved; it is included only in the invitation text you choose to copy. Avoid private or sensitive details.`} style={{ minHeight: 100, textAlignVertical: 'top' }} />
      <Body>Review this text before copying. It does not include your saved dinner draft, dinner notes, guest count, or membership preference. You choose whether to send copied text outside the app.</Body>
      <ActionButton label={working ? 'Copying…' : 'Copy invitation preview'} disabled={working} onPress={() => { void copy(); }} />
      <Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
      <Field label="Invitation preview" multiline editable={false} value={invitation} hint="Selectable text for manual copying. This is not a ticket, reservation, or sent invitation." style={{ minHeight: 280, lineHeight: 23, fontSize: 14, textAlignVertical: 'top' }} />
      <Button label={`Explore the ${event.day} visit guide`} href={{ pathname: '/visit', params: { day: event.day } }} secondary />
    </View>
  </>;
}
