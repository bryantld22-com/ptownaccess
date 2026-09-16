import { useEffect, useRef, useState } from 'react';
import { Platform, Share, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Body, Button, Card, DraftDateNotice, EventCard, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { usePreviewStore } from '../src/state/PreviewStore';
import { planSummary } from '../src/utils/planSummary';

export default function Plans() {
  const store = usePreviewStore();
  const summary = planSummary(store);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canShare, setCanShare] = useState(Platform.OS !== 'web');
  const currentText = useRef(summary.text);
  currentText.current = summary.text;
  useEffect(() => {
    if (Platform.OS === 'web') setCanShare(typeof navigator.share === 'function');
  }, []);
  useEffect(() => { setMessage(null); setError(null); }, [summary.text]);

  async function copy() {
    const text = summary.text;
    setWorking(true); setError(null); setMessage(null);
    try {
      // Use the browser's acknowledged write directly: the package's legacy
      // web fallback can report success even when execCommand returns false.
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Copy unavailable');
        await navigator.clipboard.writeText(text);
      } else if (!await Clipboard.setStringAsync(text)) throw new Error('Copy unavailable');
      if (currentText.current === text) setMessage('Preview plan copied. No bookings or purchases were made.');
    } catch {
      if (currentText.current === text) setError('Copy is unavailable. Select the summary below and copy it manually.');
    } finally { setWorking(false); }
  }

  async function share() {
    const text = summary.text;
    setWorking(true); setError(null); setMessage(null);
    try {
      let canceled = false;
      if (Platform.OS === 'web') await navigator.share({ title: 'My PTown preview plan', text });
      else canceled = (await Share.share({ title: 'My PTown preview plan', message: text })).action === Share.dismissedAction;
      if (currentText.current === text) setMessage(canceled ? 'Sharing canceled. Your saved plans are unchanged.' : 'Preview plan shared. No bookings or purchases were made.');
    } catch (reason) {
      if (currentText.current === text) {
        if (typeof reason === 'object' && reason !== null && 'name' in reason && reason.name === 'AbortError') setMessage('Sharing canceled. Your saved plans are unchanged.');
        else setError('Sharing is unavailable. Copy your preview plan or select the summary below instead.');
      }
    } finally { setWorking(false); }
  }

  return <Screen>
    <PageHeader eyebrow="YOUR EVENING, TOGETHER" title="Review your plan." description="Bring your saved ideas together before you make it a night at PTown." />
    <PreviewNotice />
    {!store.ready ? <><Body>{store.storageError ? 'Your plan cannot be reviewed until this device’s saved data is reset.' : 'Loading your saved plan…'}</Body><Button label="Open saved plans" href="/profile" secondary /></> : !summary.hasPlans ? <><Card title="Start with a good idea" description="Save a proposed program, a dinner draft, or a membership interest. Your review and shareable summary will appear here." /><Button label="Browse programs" href="/events" /><Button label="Plan a dinner draft" href="/reservations" secondary /></> : <>
      <View style={styles.card}><SectionHeader title="Saved ideas, ready to review" /><Body>{summary.programs.length} saved {summary.programs.length === 1 ? 'program' : 'programs'} · {store.reservationDraft ? 'Dinner draft saved' : 'No dinner draft'} · {store.membershipInterest ? 'Membership interest saved' : 'No membership interest'}</Body><Button label="Edit your saved plans" href="/profile" secondary /></View>
      <SectionHeader title="Your proposed programs" href="/events" action="Browse" />
      {summary.programs.length ? summary.programs.map(event => <EventCard key={event.id} event={event} />) : <Card title="No programs saved" description="Browse the proposed week and save any programs you want to return to." />}
      {summary.ticketedPrograms.length > 0 && <Card title="Saved programs aren’t tickets" description={`${summary.ticketedPrograms.length} saved ${summary.ticketedPrograms.length === 1 ? 'program is' : 'programs are'} ticketed in the proposed schedule. No tickets have been purchased. Sales will open only after dates, performers, prices, and policies are confirmed.`} />}
      <SectionHeader title="Your dinner draft" />
      {store.reservationDraft ? <><DraftDateNotice date={store.reservationDraft.date} /><Card title={`${store.reservationDraft.date}${summary.weekday ? ` · ${summary.weekday}` : ''}`} description={`${store.reservationDraft.partySize} ${store.reservationDraft.partySize === 1 ? 'guest' : 'guests'}${store.reservationDraft.occasion ? ` · ${store.reservationDraft.occasion}` : ''}. No reservation has been placed.`} />{summary.weekday && <View style={styles.notice}><Body>{summary.matchingPrograms.length ? `You saved ${summary.matchingPrograms.length} proposed ${summary.weekday} ${summary.matchingPrograms.length === 1 ? 'program' : 'programs'}. This does not confirm an event on your preferred date.` : `Your draft date falls on ${summary.weekday}. You have not saved a proposed program for that weekday.`}</Body><Button label={`Explore ${summary.weekday} programs`} href={{ pathname: '/events', params: { day: summary.weekday } }} secondary /></View>}</> : <Card title="No dinner draft saved" description="Add a preferred date and guest count when you are ready to plan. Availability is not confirmed." />}
      <Button label={store.reservationDraft ? 'Edit dinner draft' : 'Add a dinner draft'} href="/reservations" secondary />
      <SectionHeader title="Your membership interest" />
      <Card title={store.membershipInterest ? store.membershipInterest === 'vip' ? 'VIP Society' : 'PTown community' : 'No membership interest saved'} description="Saving an interest is optional and does not enroll you in a membership." />
      <Button label="Review membership interests" href="/memberships" secondary />
      <View style={styles.card}>
        <SectionHeader title="Take your plan with you" />
        <Body>Copy this preview for yourself or share it with someone you choose. Review the date, guest count, and occasion before sharing. The summary does not sync plans into another device’s app.</Body>
        <View style={formStyles.row}><ActionButton label={working ? 'Working…' : 'Copy preview plan'} disabled={working || store.busy} onPress={() => { void copy(); }} />{canShare && <ActionButton label="Share preview plan" disabled={working || store.busy} secondary onPress={() => { void share(); }} />}</View>
        <Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
        <Field label="Preview plan summary" hint="You can select and copy this text manually." multiline editable={false} value={summary.text} style={{ minHeight: 300, lineHeight: 23, fontSize: 14, textAlignVertical: 'top' }} />
      </View>
    </>}
    <Button label="Return home" href="/" secondary /><Footer />
  </Screen>;
}
