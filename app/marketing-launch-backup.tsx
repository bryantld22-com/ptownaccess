import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Text } from 'react-native';
import { ActionButton, Feedback, Field, formStyles } from '../src/components/forms';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { MARKETING_BRIEF_KEY, readMarketingBrief } from '../src/utils/marketingBrief';
import { formatMarketingLaunchReview, MARKETING_LAUNCH_REVIEW_KEY, marketingLaunchChecks, readMarketingLaunchReview, type MarketingLaunchReview } from '../src/utils/marketingLaunchReview';
import { createMarketingLaunchTransfer, MAX_MARKETING_LAUNCH_TRANSFER, readMarketingLaunchTransfer } from '../src/utils/marketingLaunchTransfer';

export default function MarketingLaunchBackup() {
  const [current, setCurrent] = useState<MarketingLaunchReview | null>(null);
  const [baseline, setBaseline] = useState<string | null>(null);
  const [briefRaw, setBriefRaw] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [incoming, setIncoming] = useState<MarketingLaunchReview | null>(null);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void Promise.all([AsyncStorage.getItem(MARKETING_BRIEF_KEY), AsyncStorage.getItem(MARKETING_LAUNCH_REVIEW_KEY)]).then(([brief, review]) => {
    if (brief !== null) readMarketingBrief(brief);
    setBriefRaw(brief); setCurrent(readMarketingLaunchReview(review)); setBaseline(review);
  }).catch(() => setStorageError(true)).finally(() => setReady(true)); }, []);
  const code = current && baseline ? createMarketingLaunchTransfer(current) : '';
  async function copy() {
    setBusy(true); setMessage(null); setError(null);
    try {
      if (!code) throw new Error('No saved review');
      if (Platform.OS === 'web') {
        if (typeof navigator.clipboard?.writeText !== 'function') throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(code);
      } else if (!await Clipboard.setStringAsync(code)) throw new Error('Clipboard unavailable');
      setMessage('Launch review code copied. Keep campaign notes private.');
    } catch { setError('Copy is unavailable. Select the full code and copy it manually.'); }
    finally { setBusy(false); }
  }
  function review() {
    setIncoming(null); setMessage(null); setError(null);
    try { setIncoming(readMarketingLaunchTransfer(input)); }
    catch { setError('The launch review code could not be validated. Current data is unchanged.'); }
  }
  async function replace() {
    if (!incoming || !ready || storageError || incoming.sourceBrief !== briefRaw) return;
    setBusy(true); setMessage(null); setError(null);
    try {
      const [latestBrief, latestReview] = await Promise.all([AsyncStorage.getItem(MARKETING_BRIEF_KEY), AsyncStorage.getItem(MARKETING_LAUNCH_REVIEW_KEY)]);
      if (latestBrief !== briefRaw || latestReview !== baseline) throw new Error('Records changed');
      const next = JSON.stringify(incoming);
      await AsyncStorage.setItem(MARKETING_LAUNCH_REVIEW_KEY, next);
      setCurrent(incoming); setBaseline(next); setIncoming(null); setInput('');
      setMessage('Reviewed launch verification replaced on this device. No campaign was approved or published.');
    } catch { setError('Replacement failed or saved records changed. Existing data was kept; reload to review it.'); }
    finally { setBusy(false); }
  }
  return <Screen>
    <Stack.Screen options={{ title: 'Marketing Launch Review Transfer' }} />
    <PageHeader eyebrow="PTOWN MARKETING & BRAND · BUILD 101" title="Move the launch review with its campaign." description="Compare every incoming check before replacing this device’s saved verification notes." />
    <PreviewNotice />
    <Card title="The brief must match" description="Transfer and save the campaign brief first. This review can replace the current one only when the receiving device has the exact saved brief it was created for. Codes contain internal notes in plain text." />
    <SectionHeader title="Back up this device" />
    {!ready ? <Body>Loading launch review…</Body> : storageError ? <Card title="Saved review unavailable" description="Current device data could not be read. Replacement is disabled to protect it." /> : code ? <><ActionButton label="Copy launch review transfer code" disabled={busy} onPress={() => { void copy(); }} /><Field label="Private launch review transfer code" value={code} multiline editable={false} style={{ minHeight: 170, textAlignVertical: 'top', fontSize: 12 }} /></> : <Card title="No saved launch review yet" description="Save launch verification before creating a code. You can still review an incoming code below." />}
    <SectionHeader title="Review an incoming code" />
    <Field label="Paste a launch review transfer code" value={input} onChangeText={value => { setInput(value); setIncoming(null); setMessage(null); setError(null); }} maxLength={MAX_MARKETING_LAUNCH_TRANSFER} multiline autoCapitalize="none" autoCorrect={false} style={{ minHeight: 170, textAlignVertical: 'top' }} />
    <ActionButton label="Review incoming launch verification" disabled={!ready || storageError || busy || !input.trim()} secondary onPress={review} />
    {incoming && <><Card title={incoming.sourceBrief === briefRaw ? 'Review before replacement' : 'Campaign brief does not match'} description={incoming.sourceBrief === briefRaw ? `This will replace the ${baseline ? 'saved' : 'empty'} launch review on this device. It will not change the campaign brief.` : 'Transfer the matching campaign brief first, then reload this screen. Replacement is disabled to prevent attaching the review to a different draft.'} />{marketingLaunchChecks.map(item => <Card key={item.id} title={item.title} description={`CURRENT: ${current?.checks[item.id].status || 'Needs verification'} · ${current?.checks[item.id].note || 'No note'}\nINCOMING: ${incoming.checks[item.id].status} · ${incoming.checks[item.id].note || 'No note'}`} />)}<ActionButton label="Replace current launch review with reviewed record" disabled={busy || incoming.sourceBrief !== briefRaw} onPress={() => { void replace(); }} /><Text selectable style={styles.card}>{formatMarketingLaunchReview(incoming)}</Text></>}
    <Feedback message={message} />{error && <Text accessibilityRole="alert" style={formStyles.error}>{error}</Text>}
    <Button label="Transfer the campaign brief first" href="/marketing-brief-backup" secondary /><Button label="Return to launch verification" href="/marketing-launch-review" secondary /><Footer />
  </Screen>;
}
