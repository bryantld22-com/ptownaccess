import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { weekDays } from '../data/events';
import { usePreviewStore } from '../state/PreviewStore';
import { theme } from '../theme';
import type { ProgramEvent } from '../types';
import { Body, Eyebrow, styles } from './ui';

export function WeeklyProgram({ events }: { events: ProgramEvent[] }) {
  const { width } = useWindowDimensions();
  const { savedEventIds } = usePreviewStore();
  return <View style={styles.grid}>{weekDays.flatMap(day => events.filter(event => event.day === day)).map(event => <Link key={event.id} href={{ pathname: '/events/[id]', params: { id: event.id } }} asChild>
    <Pressable accessibilityRole="link" accessibilityLabel={`${event.day}: ${event.title}`} android_ripple={{ color: theme.colors.border }} style={StyleSheet.flatten([styles.card, { width: width >= 1000 ? '31.5%' : width >= 650 ? '48%' : '100%', padding: 20 }])}>
      <Eyebrow>{event.day.toUpperCase()}</Eyebrow><Text style={styles.cardTitle}>{event.title}</Text><Text style={styles.smallBody}>{event.category} · {event.admission}</Text><Body>{event.description}</Body>
      <Text style={{ color: theme.colors.gold, fontSize: 13, lineHeight: 20 }}>{savedEventIds.includes(event.id) ? 'Saved on this device · ' : ''}Program details →</Text>
    </Pressable>
  </Link>)}</View>;
}
