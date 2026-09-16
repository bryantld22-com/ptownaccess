import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { usePreviewStore } from '../state/PreviewStore';
import { ActionButton, Feedback, Field, formStyles } from './forms';
import { Body, SectionHeader, styles } from './ui';

export function ReservationPlanner() {
  const { ready, busy, reservationDraft, saveDraft } = usePreviewStore();
  const [date, setDate] = useState('');
  const [party, setParty] = useState('2');
  const [occasion, setOccasion] = useState('');
  const [errors, setErrors] = useState<{ date?: string; party?: string }>({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    setDate(reservationDraft?.date ?? '');
    setParty(String(reservationDraft?.partySize ?? 2));
    setOccasion(reservationDraft?.occasion ?? '');
  }, [ready, reservationDraft]);

  async function save() {
    const nextErrors: typeof errors = {};
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
    if (!match) nextErrors.date = 'Enter a preferred date as YYYY-MM-DD.';
    else {
      const [, year, month, day] = match.map(Number);
      const preferred = new Date(year, month - 1, day);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (preferred.getFullYear() !== year || preferred.getMonth() !== month - 1 || preferred.getDate() !== day) nextErrors.date = 'Choose a real calendar date.';
      else if (preferred < today) nextErrors.date = 'Choose today or a future date.';
    }
    if (!/^\d{1,3}$/.test(party.trim()) || Number(party) < 1) nextErrors.party = 'Enter a whole number of guests from 1 to 999.';
    setErrors(nextErrors); setMessage(null);
    if (Object.keys(nextErrors).length) return;
    const saved = await saveDraft({ date: date.trim(), partySize: Number(party), occasion: occasion.trim(), savedAt: new Date().toISOString() });
    if (saved) setMessage('Draft saved on this device. No reservation has been placed.');
  }

  async function remove() {
    if (await saveDraft(null)) {
      setDate(''); setParty('2'); setOccasion(''); setErrors({});
      setMessage('Reservation draft deleted from this device.');
    }
  }

  return <>
    <SectionHeader title="Plan your evening" />
    <View style={styles.card}>
      <Body>Save one draft on this device while you plan. Dates and party sizes do not indicate availability or a confirmed booking.</Body>
      <Field label="Preferred date" placeholder="YYYY-MM-DD" hint="For example: 2027-08-08" value={date} maxLength={10} autoCapitalize="none" editable={ready && !busy} error={errors.date} onChangeText={value => { setDate(value); setMessage(null); }} />
      <Field label="Number of guests" value={party} keyboardType="number-pad" maxLength={3} editable={ready && !busy} error={errors.party} onChangeText={value => { setParty(value); setMessage(null); }} />
      <Field label="Occasion (optional)" placeholder="Birthday, dinner with friends…" value={occasion} maxLength={80} editable={ready && !busy} onChangeText={value => { setOccasion(value); setMessage(null); }} />
      <View style={formStyles.row}>
        <ActionButton label={busy ? 'Saving…' : 'Save reservation draft'} disabled={!ready || busy} onPress={() => { void save(); }} />
        {reservationDraft && <ActionButton label="Delete reservation draft" disabled={busy} secondary onPress={() => { void remove(); }} />}
      </View>
      <Feedback message={message} />
    </View>
  </>;
}
