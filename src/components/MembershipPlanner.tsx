import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { type MembershipInterest, usePreviewStore } from '../state/PreviewStore';
import { theme } from '../theme';
import { ActionButton, Feedback, formStyles } from './forms';
import { Body, SectionHeader, styles } from './ui';

const choices: { id: MembershipInterest; title: string; description: string }[] = [
  { id: 'community', title: 'PTown community', description: 'Explore creative connections, member activities, and PTown news.' },
  { id: 'vip', title: 'VIP Society', description: 'Explore the vision for elevated hospitality and special experiences.' },
];

export function MembershipPlanner() {
  const { ready, busy, membershipInterest, saveInterest } = usePreviewStore();
  const [selected, setSelected] = useState<MembershipInterest | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (ready) setSelected(membershipInterest);
  }, [ready, membershipInterest]);

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
      <View accessibilityRole="radiogroup" accessibilityLabel="Membership interest" style={{ gap: 12 }}>
        {choices.map(choice => <Pressable key={choice.id} accessibilityRole="radio" accessibilityLabel={choice.title} aria-checked={selected === choice.id} accessibilityState={{ checked: selected === choice.id, disabled: !ready || busy }} disabled={!ready || busy} onPress={() => { setSelected(choice.id); setError(null); setMessage(null); }} style={{ padding: 20, borderRadius: 12, borderWidth: 1, borderColor: selected === choice.id ? theme.colors.gold : theme.colors.border, backgroundColor: selected === choice.id ? theme.colors.elevated : theme.colors.background, gap: 8 }}>
          <Text style={styles.cardTitle}>{selected === choice.id ? '● ' : '○ '}{choice.title}</Text><Body>{choice.description}</Body>
        </Pressable>)}
      </View>
      {error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
      <ActionButton label={busy ? 'Saving…' : 'Save my interest'} disabled={!ready || busy} onPress={() => { void save(); }} />
      <Feedback message={message} />
    </View>
  </>;
}
