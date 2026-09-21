import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { artistLeads, type ArtistLead, type PipelineStatus } from '../data/bookingOperations';

export const OPERATIONS_STORAGE_KEY = '@ptown/operations/v1';
export type ArtistUpdate = Pick<ArtistLead, 'status' | 'contactRoute' | 'contactVerified' | 'contactSource' | 'contactVerifiedOn' | 'lastContact' | 'followUpDate' | 'nextAction' | 'notes' | 'feeRange' | 'contractStatus' | 'paymentStatus'>;
export type BookingEntry = { id: string; artistId: string; date: string; program: string; status: 'Hold' | 'Inquiry' | 'Offer' | 'Contracted'; notes: string; createdAt: string };
type OperationsState = { version: 1; artistUpdates: Record<string, ArtistUpdate>; bookings: BookingEntry[] };
type Store = OperationsState & { ready: boolean; busy: boolean; error: string | null; getArtist: (id: string) => ArtistLead | undefined; saveArtist: (id: string, update: ArtistUpdate) => Promise<boolean>; saveBooking: (booking: Omit<BookingEntry, 'id' | 'createdAt'>) => Promise<boolean>; removeBooking: (id: string) => Promise<boolean> };

const emptyState = (): OperationsState => ({ version: 1, artistUpdates: {}, bookings: [] });
const Context = createContext<Store | null>(null);
const statuses: PipelineStatus[] = ['Identified','Contacted','Warm','Negotiating','Booked','Nurture'];
const contractStatuses: ArtistLead['contractStatus'][] = ['Not started','Drafting','Sent','Signed'];
const paymentStatuses: ArtistLead['paymentStatus'][] = ['Not started','Deposit due','Deposit paid','Paid in full'];

export function parseOperationsState(raw: string | null): OperationsState {
  if (!raw) return emptyState();
  const value = JSON.parse(raw);
  if (!value || value.version !== 1 || typeof value.artistUpdates !== 'object' || !Array.isArray(value.bookings)) throw new Error('Invalid operations data');
  const artistUpdates: Record<string, ArtistUpdate> = {};
  for (const [id, update] of Object.entries(value.artistUpdates as Record<string, ArtistUpdate>)) {
    if (!artistLeads.some(artist => artist.id === id) || !statuses.includes(update.status) || !contractStatuses.includes(update.contractStatus) || !paymentStatuses.includes(update.paymentStatus)) continue;
    artistUpdates[id] = update;
  }
  const bookings = value.bookings.filter((item: BookingEntry) => item && typeof item.id === 'string' && artistLeads.some(artist => artist.id === item.artistId) && /^\d{4}-\d{2}-\d{2}$/.test(item.date) && ['Hold','Inquiry','Offer','Contracted'].includes(item.status));
  return { version: 1, artistUpdates, bookings };
}

export function OperationsStoreProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<OperationsState>(emptyState);
  const stateRef = useRef(state);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  useEffect(() => { let active = true; AsyncStorage.getItem(OPERATIONS_STORAGE_KEY).then(raw => { const loaded = parseOperationsState(raw); if (!active) return; stateRef.current = loaded; setState(loaded); setReady(true); }).catch(() => { if (active) setError('Booking operations data could not be read on this device.'); }); return () => { active = false; }; }, []);
  const update = useCallback((change: (current: OperationsState) => OperationsState) => {
    setPending(count => count + 1);
    const operation = queue.current.then(async () => { try { const next = change(stateRef.current); await AsyncStorage.setItem(OPERATIONS_STORAGE_KEY, JSON.stringify(next)); stateRef.current = next; setState(next); setReady(true); setError(null); return true; } catch { setError('This device could not save the operations update.'); return false; } finally { setPending(count => count - 1); } });
    queue.current = operation; return operation;
  }, []);
  const getArtist = useCallback((id: string) => { const base = artistLeads.find(artist => artist.id === id); return base ? { ...base, ...state.artistUpdates[id] } : undefined; }, [state.artistUpdates]);
  const saveArtist = useCallback((id: string, artistUpdate: ArtistUpdate) => artistLeads.some(artist => artist.id === id) ? update(current => ({ ...current, artistUpdates: { ...current.artistUpdates, [id]: artistUpdate } })) : Promise.resolve(false), [update]);
  const saveBooking = useCallback((booking: Omit<BookingEntry, 'id' | 'createdAt'>) => update(current => ({ ...current, bookings: [...current.bookings, { ...booking, id: `booking-${Date.now()}`, createdAt: new Date().toISOString() }] })), [update]);
  const removeBooking = useCallback((id: string) => update(current => ({ ...current, bookings: current.bookings.filter(booking => booking.id !== id) })), [update]);
  return <Context.Provider value={{ ...state, ready, busy: pending > 0, error, getArtist, saveArtist, saveBooking, removeBooking }}>{children}</Context.Provider>;
}

export function useOperationsStore() { const store = useContext(Context); if (!store) throw new Error('OperationsStoreProvider is required'); return store; }
