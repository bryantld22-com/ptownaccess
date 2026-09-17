import { Link, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

const shortcuts = [
  { label: 'Home', href: '/' },
  { label: 'Search', href: '/search' },
  { label: 'Visit guide', href: '/visit' },
  { label: 'Saved plans', href: '/profile' },
] as const;

export function QuickNavigation() {
  const pathname = usePathname();
  return <View style={styles.bar}><View role="navigation" aria-label="PTown shortcuts" style={styles.links}>
    {shortcuts.map(item => {
      const current = pathname === item.href;
      return <Link key={item.href} href={item.href} asChild>
        <Pressable accessibilityRole="link" aria-current={current ? 'page' : undefined} style={StyleSheet.flatten([styles.link, current && styles.current])}>
          <Text style={[styles.label, current && styles.currentLabel]}>{item.label}</Text>
        </Pressable>
      </Link>;
    })}
  </View></View>;
}

const styles = StyleSheet.create({
  bar: { borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.background },
  links: { width: '100%', maxWidth: 1100, alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  link: { minHeight: 44, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border, justifyContent: 'center' },
  current: { borderColor: theme.colors.gold, backgroundColor: theme.colors.elevated },
  label: { color: theme.colors.cream, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  currentLabel: { color: theme.colors.gold },
});
