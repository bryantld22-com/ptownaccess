import { Text, View } from 'react-native';
import { events } from '../data/events';
import { usePreviewStore } from '../state/PreviewStore';
import { ActionButton } from './forms';
import { Body, Button, SectionHeader, styles } from './ui';

export function FriendSavedPrograms({ onChoose, disabled }: { onChoose: (id: string) => void; disabled: boolean }) {
  const { ready, storageError, savedEventIds } = usePreviewStore();
  const saved = events.filter(event => savedEventIds.includes(event.id));
  return <View style={styles.card}>
    <SectionHeader title="Start with a saved program" />
    <Body>Favorites belong to this device—not a friend list. Choosing one changes only the proposed invitation program. Dinner drafts, group details, private notes, and membership preferences are never filled in automatically.</Body>
    {!ready ? storageError ? <>
      <Text accessibilityRole="header" style={styles.cardTitle}>Saved programs unavailable</Text>
      <Text accessibilityRole="alert" style={styles.smallBody}>{storageError}</Text>
      <Button label="Recover saved programs in Profile" href="/profile" secondary />
    </> : <Body>Loading this device’s saved programs…</Body> : saved.length ? <>
      <Text accessibilityLiveRegion="polite" style={styles.smallBody}>{saved.length} saved {saved.length === 1 ? 'program' : 'programs'} · Not tickets or confirmed dates</Text>
      <View style={styles.grid}>{saved.map(event => <View key={event.id} style={[styles.card, { flexBasis: 280, flexGrow: 1, flexShrink: 1, minWidth: 0, padding: 16 }]}>
        <Text style={styles.eyebrow}>{event.day} · {event.admission}</Text>
        <Text accessibilityRole="header" style={styles.cardTitle}>{event.title}</Text>
        <ActionButton label={`Use ${event.title} for invitation`} secondary disabled={disabled} onPress={() => onChoose(event.id)} />
      </View>)}</View>
      <Button label="Manage invitation favorites" href={{ pathname: '/profile', params: { view: 'events' } }} secondary />
    </> : <>
      <Text accessibilityRole="header" style={styles.cardTitle}>No saved programs for invitations yet</Text>
      <Body>Save a proposed program in Events to find it here, or choose any program below. Saving a favorite does not contact anyone or buy admission.</Body>
      <Button label="Browse programs to save" href="/events" secondary />
    </>}
  </View>;
}
