import { useEffect, useState, type ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';
import { theme } from '../theme';

export type SectionIconName = ComponentProps<typeof Ionicons>['name'];

export function SectionIcon({ name }: { name: SectionIconName }) {
  // Expo's font cache can differ between static rendering and browser startup.
  // Keep the first render identical, then load the glyph inside its fixed frame.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  return <View aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.frame}>
    {mounted && <Ionicons name={name} size={26} color={theme.colors.gold} />}
  </View>;
}

const styles = StyleSheet.create({
  frame: { width: 48, height: 48, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.elevated, alignItems: 'center', justifyContent: 'center' },
});
