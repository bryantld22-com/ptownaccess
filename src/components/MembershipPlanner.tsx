import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { type MembershipInterest, usePreviewStore } from '../state/PreviewStore';
import { theme } from '../theme';
import { ActionButton, Feedback, formStyles } from './forms';
import { Body, SectionHeader, styles } from './ui';
import { membershipChoices as choices } from '../data/memberships';

export function MembershipPlanner() {
  const router = useRouter();
  const params = useLocalSearchParams<{ interest?: string | string[] }>();
  const routeInterest = choices.find(choice => choice.id === params.interest)?.id ?? null;
  const { ready, busy, membershipInterest, saveInterest } = usePreviewStore();
  const [selected, setSelected] = useState<MembershipInterest | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (ready) setSelected(routeInterest ?? membershipInterest);
  }, [ready, membershipInterest, routeInterest]);

  function choose(interest: MembershipInterest) {
    setSelected(interest); setError(null); setMessage(null);
    router.setParams({ interest });
  }

  async function remove() {
    setMessage(null); setError(null);
    if (await saveInterest(null)) {
      setSelected(null); router.setParams({ interest: undefined });
      setMessage('Membership interest removed. Your other saved plans have been kept.');
    }
  }

  async function save() {
    setMessage(null);
    if (!selected) { setError('Choose an interest before saving.'); return; }
    if (await saveInterest(selected)) {
      setError(null);
      setMessage('Interest saved on this device. You have not enrolled in a membership.');
    }
  }

  return <>
    <SectionHeader title="What interests you?" />
    <View style={styles.card}>
      <Body>Keep your preference on this device. Prices and final benefits will be announced before enrollment opens.</Body>
      {ready && <Body>{membershipInterest ? `Saved interest: ${choices.find(choice => choice.id === membershipInterest)?.title}.` : 'No membership interest is saved yet.'}</Body>}
      <View accessibilityRole="radiogroup" accessibilityLabel="Membership interest" style={{ gap: 12 }}>
        {choices.map(choice => <Pressable key={choice.id} accessibilityRole="radio" accessibilityLabel={choice.title} aria-checked={selected === choice.id} accessibilityState={{ checked: selected === choice.id, disabled: !ready || busy }} disabled={!ready || busy} onPress={() => choose(choice.id)} style={{ padding: 20, borderRadius: 12, borderWidth: 1, borderColor: selected === choice.id ? theme.colors.gold : theme.colors.border, backgroundColor: selected === choice.id ? theme.colors.elevated : theme.colors.background, gap: 8 }}>
          <Text style={styles.cardTitle}>{selected === choice.id ? '● ' : '○ '}{choice.title}</Text><Body>{choice.description}</Body>
        </Pressable>)}
      </View>
      <Body>Copy this page’s link to share your selection. Selecting an option does not save it; press Save my interest to update this device’s preference.</Body>
      {error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
      <ActionButton label={busy ? 'Saving…' : 'Save my interest'} disabled={!ready || busy} onPress={() => { void save(); }} />
      {membershipInterest && <ActionButton label="Remove saved membership interest" secondary disabled={!ready || busy} onPress={() => { void remove(); }} />}
      <Feedback message={message} />
    </View>
  </>;
}
