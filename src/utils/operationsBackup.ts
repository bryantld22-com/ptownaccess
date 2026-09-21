import { parseOperationsState, type OperationsState } from '../state/OperationsStore';
import { buildOperationsMigrationPlan } from './operationsMigration';

export const maxOperationsBackupLength = 2_000_000;

type OperationsBackup = {
  app: 'PTown Access';
  kind: 'operations-backup';
  format: 1;
  createdAt: string;
  checksum: string;
  counts: Record<string, number>;
  state: OperationsState;
};

function persistedState(state: OperationsState): OperationsState {
  return parseOperationsState(JSON.stringify({
    version: 1,
    artistUpdates: state.artistUpdates,
    bookings: state.bookings,
    currentRole: state.currentRole,
    outreachDrafts: state.outreachDrafts,
    economics: state.economics,
    offers: state.offers,
    auditLog: state.auditLog,
    dealRooms: state.dealRooms,
    showDays: state.showDays,
    settlements: state.settlements,
    postShowReviews: state.postShowReviews,
    incidents: state.incidents,
    dueItems: state.dueItems,
  }));
}

function checksum(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function counts(state: OperationsState) {
  return Object.fromEntries(buildOperationsMigrationPlan(state, '2000-01-01T00:00:00.000Z').collections.map(item => [item.key, item.records.length]));
}

export function createOperationsBackup(state: OperationsState, createdAt = new Date().toISOString()) {
  const snapshot = persistedState(state);
  const serialized = JSON.stringify(snapshot);
  const backup: OperationsBackup = { app: 'PTown Access', kind: 'operations-backup', format: 1, createdAt, checksum: checksum(serialized), counts: counts(snapshot), state: snapshot };
  return JSON.stringify(backup, null, 2);
}

export function readOperationsBackup(raw: string): OperationsBackup {
  if (!raw.trim() || raw.length > maxOperationsBackupLength) throw new Error('Invalid backup length');
  const value = JSON.parse(raw) as OperationsBackup;
  if (!value || value.app !== 'PTown Access' || value.kind !== 'operations-backup' || value.format !== 1 || !value.state || !value.counts || typeof value.counts !== 'object' || typeof value.createdAt !== 'string' || Number.isNaN(Date.parse(value.createdAt))) throw new Error('Unsupported backup');
  const state = persistedState(value.state);
  if (checksum(JSON.stringify(state)) !== value.checksum) throw new Error('Checksum mismatch');
  const actualCounts = counts(state);
  if (Object.keys(actualCounts).some(key => actualCounts[key] !== value.counts[key])) throw new Error('Record count mismatch');
  if (!buildOperationsMigrationPlan(state).ready) throw new Error('Invalid operations records');
  return { ...value, state, counts: actualCounts };
}
