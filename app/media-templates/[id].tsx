import { Stack, useLocalSearchParams } from 'expo-router';
import { Platform, Pressable, Text, View } from 'react-native';
import { useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { ActionButton, Feedback, Field, formStyles } from '../../src/components/forms';
import { MissingPage } from '../../src/components/MissingPage';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../../src/components/ui';
import { mediaTemplates } from '../../src/data/mediaTemplates';
import { theme } from '../../src/theme';

export function generateStaticParams() { return mediaTemplates.map(template => ({ id: template.id })); }
export default function MediaTemplatePage() {
  const { id } = useLocalSearchParams<{ id: string }>(); const template = mediaTemplates.find(item => item.id === id);
  const [values, setValues] = useState<Record<string, string>>({}); const [checks, setChecks] = useState<string[]>([]); const [message, setMessage] = useState<string | null>(null); const [error, setError] = useState<string | null>(null);
  if (!template) return <MissingPage title="Production template not found." browse={{ label: 'Browse Media Group templates', href: '/media-templates' }} />;
  const summary = [`PTOWN MEDIA GROUP — ${template.title.toUpperCase()}`, '', ...template.fields.map(field => `${field.label}: ${values[field.id]?.trim() || 'Not entered'}`), '', 'CHECKLIST', ...template.checks.map(check => `${checks.includes(check) ? '[x]' : '[ ]'} ${check}`), '', 'DRAFT ONLY — Not submitted or approved.'].join('\n');
  async function copy() { setMessage(null); setError(null); try { if (Platform.OS === 'web') { if (typeof navigator.clipboard?.writeText !== 'function') throw new Error(); await navigator.clipboard.writeText(summary); } else if (!await Clipboard.setStringAsync(summary)) throw new Error(); setMessage('Reviewed draft copied. It has not been submitted or approved.'); } catch { setError('Copy is unavailable. Select the review summary and copy it manually.'); } }
  return <Screen><Stack.Screen options={{ title: template.title }} /><PageHeader eyebrow="MEDIA PRODUCTION TEMPLATE · DRAFT" title={template.title} description={template.purpose} /><PreviewNotice />
    <Card title="This draft stays on this screen" description="Nothing entered here is saved, synced, sent, approved, or added to PTown records. Copy the summary before leaving if you need it." />
    <SectionHeader title="Project details" />{template.fields.map(field => <Field key={field.id} label={field.label} placeholder={field.placeholder} value={values[field.id] || ''} onChangeText={value => { setValues(current => ({ ...current, [field.id]: value.slice(0, 1000) })); setMessage(null); }} multiline={field.multiline} style={field.multiline ? { minHeight: 120, textAlignVertical: 'top' } : undefined} />)}
    <SectionHeader title="Required checks" /><View style={styles.card}>{template.checks.map(check => { const selected = checks.includes(check); return <Pressable key={check} accessibilityRole="checkbox" accessibilityLabel={check} accessibilityState={{ checked: selected }} aria-checked={selected} onPress={() => { setChecks(current => selected ? current.filter(item => item !== check) : [...current, check]); setMessage(null); }} style={{ minHeight: 48, flexDirection: 'row', gap: 12, alignItems: 'center' }}><Text style={{ color: theme.colors.gold, fontSize: 20 }}>{selected ? '☑' : '☐'}</Text><Body>{check}</Body></Pressable>; })}</View>
    <SectionHeader title="Review before copying" /><Field label="Draft review summary" value={summary} multiline editable={false} style={{ minHeight: 320, textAlignVertical: 'top', lineHeight: 22 }} /><ActionButton label="Copy reviewed draft" onPress={() => { void copy(); }} /><Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Browse all production templates" href="/media-templates" secondary /><Button label="Open the Media Director Operations Guide" href="/media-group/operations-guide" secondary /><Footer />
  </Screen>;
}
