import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from './forms';
import { Body, Card, SectionHeader, styles } from './ui';
import { theme } from '../theme';
import { FRIEND_CIRCLE_KEY, friendCircleInterests, readFriendCircle, type FriendCircleInterest, type FriendCirclePerson } from '../utils/friendCircle';

export function FriendCircle({ onChooseInvite }: { onChooseInvite: (name: string) => void }) {
  const [people, setPeople] = useState<FriendCirclePerson[]>([]);
  const [baseline, setBaseline] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState('');
  const [interest, setInterest] = useState<FriendCircleInterest>('Music');
  const [idea, setIdea] = useState('');
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void AsyncStorage.getItem(FRIEND_CIRCLE_KEY).then(raw => { setPeople(readFriendCircle(raw)); setBaseline(raw); }).catch(() => setStorageError(true)).finally(() => setLoaded(true)); }, []);
  async function commit(next: FriendCirclePerson[], confirmation: string) {
    setBusy(true); setMessage(null); setError(null);
    try {
      const latest = await AsyncStorage.getItem(FRIEND_CIRCLE_KEY);
      if (latest !== baseline) throw new Error('Circle changed');
      const raw = JSON.stringify(next);
      readFriendCircle(raw);
      await AsyncStorage.setItem(FRIEND_CIRCLE_KEY, raw);
      setPeople(next); setBaseline(raw); setRemoveId(null); setMessage(confirmation);
      return true;
    } catch { setError('The list could not be saved or changed in another tab. Existing data was kept; reload the page before trying again.'); return false; }
    finally { setBusy(false); }
  }
  async function add() {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 60 || people.length >= 25 || !loaded || storageError || busy) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    const next = [...people, { id, name: trimmed, interest, idea: idea.trim() }];
    if (await commit(next, `${trimmed} added to your private list on this device. No request or message was sent.`)) { setName(''); setIdea(''); }
  }
  async function remove(id: string) {
    const person = people.find(item => item.id === id);
    if (!person || removeId !== id || busy) return;
    await commit(people.filter(item => item.id !== id), `${person.name} removed from this device’s list.`);
  }
  return <>
    <SectionHeader title="Your private friend list" />
    <Card title="Build your circle on this device" description="Add people you already know by a first name or nickname and an interest. This list stays on this device. It is not a PTown account, discovery network, contact upload, friend request, message, or RSVP. Avoid contact details and private notes." />
    {!loaded ? <Body>Loading your list…</Body> : storageError ? <Card title="Saved list unavailable" description="Device data could not be read. Editing is disabled to protect it." /> : <>
      <Field label="Friend’s first name or nickname" value={name} onChangeText={value => { setName(value); setError(null); }} maxLength={60} placeholder="For example: Jackie" />
      <Body>Choose one interest to start a conversation.</Body>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{friendCircleInterests.map(item => <Pressable key={item} accessibilityRole="radio" accessibilityState={{ checked: interest === item }} onPress={() => setInterest(item)} style={{ minHeight: 44, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 22, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: interest === item ? theme.colors.gold : theme.colors.surface }}><Text style={{ color: interest === item ? theme.colors.background : theme.colors.cream }}>{item}</Text></Pressable>)}</View>
      <Field label="Shared evening idea (optional)" value={idea} onChangeText={setIdea} maxLength={120} placeholder="For example: hear the Tuesday jam session" />
      <ActionButton label="Add to my private list" disabled={busy || !name.trim() || people.length >= 25} onPress={() => { void add(); }} />
      {people.length >= 25 && <Body>For this preview, the list is limited to 25 people on this device.</Body>}
      <SectionHeader title={`${people.length} ${people.length === 1 ? 'person' : 'people'} saved here`} />
      {!people.length ? <Body>No one added yet. Start with someone you already know.</Body> : people.map(person => <View key={person.id} style={styles.card}>
        <Text style={styles.cardTitle}>{person.name}</Text><Body>{person.interest}{person.idea ? ` · ${person.idea}` : ''}</Body>
        <ActionButton label={`Draft invitation for ${person.name}`} secondary onPress={() => onChooseInvite(person.name)} />
        {removeId === person.id ? <><Body>Remove {person.name} from this device’s list?</Body><ActionButton label={`Confirm remove ${person.name}`} disabled={busy} onPress={() => { void remove(person.id); }} /><ActionButton label="Keep this person" secondary onPress={() => setRemoveId(null)} /></> : <ActionButton label={`Remove ${person.name}`} secondary disabled={busy} onPress={() => setRemoveId(person.id)} />}
      </View>)}
    </>}
    <Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
  </>;
}
