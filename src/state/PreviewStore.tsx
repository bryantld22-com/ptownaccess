import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { events } from '../data/events';

export const PREVIEW_STORAGE_KEY = '@ptown/preview/v1';
export type MembershipInterest = 'community' | 'vip';
export type ReservationDraft = { date: string; partySize: number; occasion: string; savedAt: string };
type PreviewState = {
  version: 1;
  savedEventIds: string[];
  reservationDraft: ReservationDraft | null;
  membershipInterest: MembershipInterest | null;
};
const emptyState = (): PreviewState => ({ version: 1, savedEventIds: [], reservationDraft: null, membershipInterest: null });

function parseStoredState(raw: string | null): PreviewState {
  if (raw === null) return emptyState();
  const value = JSON.parse(raw);
  if (!value || value.version !== 1 || !Array.isArray(value.savedEventIds) || value.savedEventIds.some((id: unknown) => typeof id !== 'string')) throw new Error('Invalid preview data');
  if (value.membershipInterest !== null && value.membershipInterest !== 'community' && value.membershipInterest !== 'vip') throw new Error('Invalid interest');
  const draft = value.reservationDraft;
  if (draft !== null && (!draft || typeof draft.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(draft.date) || !Number.isInteger(draft.partySize) || draft.partySize < 1 || draft.partySize > 999 || typeof draft.occasion !== 'string' || draft.occasion.length > 80 || typeof draft.savedAt !== 'string')) throw new Error('Invalid draft');
  return {
    version: 1,
    savedEventIds: [...new Set<string>(value.savedEventIds)].filter(id => events.some(event => event.id === id)),
    reservationDraft: draft === null ? null : { date: draft.date, partySize: draft.partySize, occasion: draft.occasion, savedAt: draft.savedAt },
    membershipInterest: value.membershipInterest,
  };
}

type Store = PreviewState & {
  ready: boolean;
  busy: boolean;
  storageError: string | null;
  toggleEvent: (id: string) => Promise<boolean>;
  saveDraft: (draft: ReservationDraft | null) => Promise<boolean>;
  saveInterest: (interest: MembershipInterest | null) => Promise<boolean>;
  clearPlans: () => Promise<boolean>;
};
const Context = createContext<Store | null>(null);

export function PreviewStoreProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<PreviewState>(emptyState);
  const stateRef = useRef(state);
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);
  const [pending, setPending] = useState(0);
  const [storageError, setStorageError] = useState<string | null>(null);
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(PREVIEW_STORAGE_KEY).then(raw => {
      const loaded = parseStoredState(raw);
      if (!active) return;
      stateRef.current = loaded;
      readyRef.current = true;
      setState(loaded);
      setReady(true);
    }).catch(() => {
      if (active) setStorageError('Your saved preview plans could not be read. Open Profile to reset this device’s preview data.');
    });
    return () => { active = false; };
  }, []);

  // Serialize changes and show success only after storage acknowledges the write.
  const update = useCallback((change: (current: PreviewState) => PreviewState, reset = false): Promise<boolean> => {
    if (!readyRef.current && !reset) return Promise.resolve(false);
    setPending(count => count + 1);
    const operation = queue.current.then(async () => {
      try {
        const next = change(stateRef.current);
        if (reset) await AsyncStorage.removeItem(PREVIEW_STORAGE_KEY);
        else await AsyncStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(next));
        stateRef.current = next;
        readyRef.current = true;
        setState(next);
        setReady(true);
        setStorageError(null);
        return true;
      } catch {
        setStorageError('This device could not save your changes. Your previously saved plans have been kept. Please try again.');
        return false;
      } finally { setPending(count => count - 1); }
    });
    queue.current = operation;
    return operation;
  }, []);

  const toggleEvent = useCallback((id: string) => {
    if (!events.some(event => event.id === id)) return Promise.resolve(false);
    return update(current => ({ ...current, savedEventIds: current.savedEventIds.includes(id) ? current.savedEventIds.filter(saved => saved !== id) : [...current.savedEventIds, id] }));
  }, [update]);
  const saveDraft = useCallback((draft: ReservationDraft | null) => update(current => ({ ...current, reservationDraft: draft })), [update]);
  const saveInterest = useCallback((interest: MembershipInterest | null) => update(current => ({ ...current, membershipInterest: interest })), [update]);
  const clearPlans = useCallback(() => update(emptyState, true), [update]);

  return <Context.Provider value={{ ...state, ready, busy: pending > 0, storageError, toggleEvent, saveDraft, saveInterest, clearPlans }}>{children}</Context.Provider>;
}

export function usePreviewStore() {
  const store = useContext(Context);
  if (!store) throw new Error('PreviewStoreProvider is required');
  return store;
}
