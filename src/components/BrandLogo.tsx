import { Image, Platform, StyleSheet, View } from 'react-native';
import { theme } from '../theme';

export function BrandLogo() {
  return <View style={styles.frame}>
    <Image source={require('../../assets/ptown-dinner-club-logo.png')} resizeMode="contain" accessibilityRole={Platform.OS === 'web' ? undefined : 'image'} accessibilityLabel="PTown Dinner Club logo, Paducah Kentucky" style={styles.logo} />
  </View>;
}

const styles = StyleSheet.create({
  frame: { width: '100%', maxWidth: 720, aspectRatio: 2, alignSelf: 'center', backgroundColor: '#000000', borderWidth: 1, borderColor: theme.colors.border, borderRadius: 20, overflow: 'hidden' },
  logo: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
});
