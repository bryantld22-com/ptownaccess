import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { styles } from './ui';
import { theme } from '../theme';

export function ActionButton({ label, onPress, disabled = false, secondary = false }: {
  label: string; onPress: () => void; disabled?: boolean; secondary?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} android_ripple={{ color: theme.colors.border }} style={[styles.button, { maxWidth: '100%' }, secondary && styles.secondaryButton, disabled && { opacity: 0.5 }]}>
    <Text style={[styles.buttonText, secondary && { color: theme.colors.cream }]}>{label}</Text>
  </Pressable>;
}

export function Field({ label, hint, error, ...props }: TextInputProps & { label: string; hint?: string; error?: string }) {
  return <View style={{ gap: 8 }}>
    <Text style={{ color: theme.colors.cream, fontSize: 15, fontWeight: '600' }}>{label}</Text>
    <TextInput {...props} accessibilityLabel={label} placeholderTextColor={theme.colors.muted} style={[formStyles.input, props.style]} />
    {hint && <Text style={styles.smallBody}>{hint}</Text>}
    {error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
  </View>;
}

export function Feedback({ message }: { message: string | null }) {
  if (!message) return null;
  return <Text accessibilityLiveRegion="polite" style={{ color: theme.colors.green, fontSize: 14, lineHeight: 22 }}>{message}</Text>;
}

export const formStyles = StyleSheet.create({
  input: { color: theme.colors.cream, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, minHeight: 50, padding: 14, fontSize: 16, width: '100%' },
  error: { color: '#E8AAA2', fontSize: 13, lineHeight: 20 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
