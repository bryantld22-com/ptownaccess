import { events } from '../data/events';
import { pathways } from '../data/pathways';
import { parseStoredState, type PreviewState } from '../state/PreviewStore';

export const maxTransferLength = 20000;

export function createTransferCode(plans: PreviewState) {
  // Whitelist the stored fields; provider actions and transient errors never travel.
  const snapshot = parseStoredState(JSON.stringify({ version: 1, savedEventIds: plans.savedEventIds, savedPathwayIds: plans.savedPathwayIds, reservationDraft: plans.reservationDraft, membershipInterest: plans.membershipInterest, ...(plans.tournamentInterest !== undefined ? { tournamentInterest: plans.tournamentInterest } : {}) }));
  return JSON.stringify({ app: 'PTown Access', format: 1, plans: snapshot }, null, 2);
}

export function readTransferCode(raw: string): PreviewState {
  if (!raw.trim() || raw.length > maxTransferLength) throw new Error('Invalid transfer length');
  const value = JSON.parse(raw);
  if (!value || value.app !== 'PTown Access' || value.format !== 1 || !value.plans) throw new Error('Unsupported transfer');
  const plans = parseStoredState(JSON.stringify(value.plans));
  // Storage recovery may discard unknown IDs; a transfer must not silently lose them.
  if (value.plans.savedEventIds.some((id: string) => !events.some(event => event.id === id)) || (value.plans.savedPathwayIds ?? []).some((id: string) => !pathways.some(pathway => pathway.id === id))) throw new Error('Unknown programs');
  return plans;
}
