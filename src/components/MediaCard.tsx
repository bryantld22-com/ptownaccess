import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import type { MediaFeature } from '../data/media';
import { theme } from '../theme';
import { SectionIcon } from './SectionIcon';
import { Body, Eyebrow, styles } from './ui';

export function MediaCard({ feature }: { feature: MediaFeature }) {
  return <Link href={{ pathname: '/media/[id]', params: { id: feature.id } }} asChild>
    <Pressable accessibilityRole="link" accessibilityLabel={`${feature.title} · ${feature.category}`} android_ripple={{ color: theme.colors.border }} style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}><SectionIcon name={feature.icon} /><Eyebrow>{feature.category.toUpperCase()}</Eyebrow></View>
      <Text style={styles.cardTitle}>{feature.title}</Text><Body>{feature.description}</Body>
      <Text style={{ color: theme.colors.gold, fontSize: 13, lineHeight: 20 }}>Planned feature · Explore the concept →</Text>
    </Pressable>
  </Link>;
}
