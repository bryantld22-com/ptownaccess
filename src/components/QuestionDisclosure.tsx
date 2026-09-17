import { useId, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Body, styles } from './ui';

export function QuestionDisclosure({ question, answer }: { question: string; answer: string }) {
  const [expanded, setExpanded] = useState(false);
  const answerId = useId();
  return <View style={[styles.card, { padding: 0 }]}>
    <Pressable accessibilityRole="button" accessibilityLabel={question} accessibilityState={{ expanded }} aria-expanded={expanded} aria-controls={answerId} onPress={() => setExpanded(value => !value)} style={{ padding: 20, minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      <Text style={[styles.cardTitle, { fontSize: 16, flex: 1 }]}>{question}</Text><Text aria-hidden style={styles.arrow}>{expanded ? '−' : '+'}</Text>
    </Pressable>
    {expanded && <View nativeID={answerId} style={{ paddingHorizontal: 20, paddingBottom: 20 }}><Body>{answer}</Body></View>}
  </View>;
}
