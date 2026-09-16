import { Link } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { usePreviewStore } from '../state/PreviewStore';
import { theme } from '../theme';
import type { CreativePathway } from '../data/pathways';
import { Body, Eyebrow, styles } from './ui';

export function PathwayCard({ pathway }: { pathway: CreativePathway }) {
  const { savedPathwayIds } = usePreviewStore();
  return <Link href={{ pathname: '/programs/[id]', params: { id: pathway.id } }} asChild><Pressable accessibilityRole="link" accessibilityLabel={`${pathway.title} · ${pathway.division}`} android_ripple={{ color: theme.colors.border }} style={styles.card}>
    <Eyebrow>{pathway.division.toUpperCase()}</Eyebrow><Text style={styles.cardTitle}>{pathway.title}</Text><Body>{pathway.description}</Body><Text style={{ color: theme.colors.gold, fontSize: 13, lineHeight: 20 }}>{savedPathwayIds.includes(pathway.id) ? 'Interest saved on this device · ' : ''}Explore pathway →</Text>
  </Pressable></Link>;
}
