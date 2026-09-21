import type { SyncEnvelope } from '../services/operationsBackend';
import type { OperationsState } from '../state/OperationsStore';

export const MIGRATION_FORMAT_VERSION = 1;

export type MigrationCollection = {
  key: string;
  label: string;
  records: SyncEnvelope<unknown>[];
};

export type MigrationIssue = {
  collection: string;
  recordId: string;
  message: string;
};

export type MigrationPlan = {
  formatVersion: number;
  generatedAt: string;
  collections: MigrationCollection[];
  totalRecords: number;
  errors: MigrationIssue[];
  warnings: MigrationIssue[];
  ready: boolean;
};

type RecordValue = Record<string, unknown>;
type CollectionInput = { key: string; label: string; values: Array<{ id: string; value: unknown }> };

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const datedFields = ['date', 'eventDate', 'dueDate'] as const;

function timestamp(value: unknown, fallback: string) {
  if (!value || typeof value !== 'object') return fallback;
  const record = value as RecordValue;
  const candidate = record.updatedAt ?? record.createdAt;
  return typeof candidate === 'string' && !Number.isNaN(Date.parse(candidate)) ? candidate : fallback;
}

function collectionInputs(state: OperationsState): CollectionInput[] {
  const list = (key: string, label: string, values: unknown[]) => ({
    key,
    label,
    values: values.map((value, index) => {
      const id = value && typeof value === 'object' && typeof (value as RecordValue).id === 'string'
        ? String((value as RecordValue).id)
        : `${key}-${index + 1}`;
      return { id, value };
    }),
  });
  const mapped = (key: string, label: string, values: Record<string, unknown>) => ({
    key,
    label,
    values: Object.entries(values).map(([id, value]) => ({ id, value })),
  });
  return [
    mapped('artist_updates', 'Artist CRM updates', state.artistUpdates),
    list('bookings', 'Calendar bookings', state.bookings),
    list('outreach_drafts', 'Outreach drafts', state.outreachDrafts),
    list('economics', 'Economics worksheets', state.economics),
    list('offers', 'Offer terms', state.offers),
    mapped('deal_rooms', 'Artist deal rooms', state.dealRooms),
    list('show_days', 'Show-day advances', state.showDays),
    list('settlements', 'Event settlements', state.settlements),
    list('post_show_reviews', 'Post-show reviews', state.postShowReviews),
    list('incidents', 'Incident records', state.incidents),
    list('due_items', 'Management due dates', state.dueItems),
    list('audit_log', 'Local audit history', state.auditLog),
  ];
}

export function buildOperationsMigrationPlan(state: OperationsState, generatedAt = new Date().toISOString()): MigrationPlan {
  const errors: MigrationIssue[] = [];
  const warnings: MigrationIssue[] = [];
  const collections = collectionInputs(state).map(input => {
    const seen = new Set<string>();
    const records = input.values.map(({ id, value }) => {
      if (!id.trim()) errors.push({ collection: input.key, recordId: id, message: 'Record ID is missing.' });
      if (seen.has(id)) errors.push({ collection: input.key, recordId: id, message: 'Record ID is duplicated.' });
      seen.add(id);
      if (value && typeof value === 'object') {
        const record = value as RecordValue;
        for (const field of datedFields) {
          const candidate = record[field];
          if (candidate !== undefined && (typeof candidate !== 'string' || !datePattern.test(candidate))) {
            errors.push({ collection: input.key, recordId: id, message: `${field} must use YYYY-MM-DD.` });
          }
        }
        if ('artistId' in record && typeof record.artistId !== 'string') {
          errors.push({ collection: input.key, recordId: id, message: 'artistId must be a string.' });
        }
        if (!('updatedAt' in record) && !('createdAt' in record)) {
          warnings.push({ collection: input.key, recordId: id, message: 'No source timestamp; migration time will be used.' });
        }
      }
      return { recordId: id, version: 0, updatedAt: timestamp(value, generatedAt), updatedBy: 'local-preview-migration', payload: value };
    });
    return { key: input.key, label: input.label, records };
  });
  const totalRecords = collections.reduce((sum, collection) => sum + collection.records.length, 0);
  return { formatVersion: MIGRATION_FORMAT_VERSION, generatedAt, collections, totalRecords, errors, warnings, ready: errors.length === 0 };
}
