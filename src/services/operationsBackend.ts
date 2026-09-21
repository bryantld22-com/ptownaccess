import type { OperationsRole } from '../state/OperationsStore';

export type StaffSession = { userId: string; displayName: string; role: OperationsRole; expiresAt: string };
export type SyncEnvelope<T> = { recordId: string; version: number; updatedAt: string; updatedBy: string; payload: T };
export type SyncResult = { accepted: boolean; serverVersion: number; conflict?: SyncEnvelope<unknown> };
export interface OperationsBackend {
  getSession(): Promise<StaffSession | null>;
  signOut(): Promise<void>;
  pull<T>(collection: string, since?: string): Promise<SyncEnvelope<T>[]>;
  push<T>(collection: string, record: SyncEnvelope<T>): Promise<SyncResult>;
}

class UnconfiguredBackend implements OperationsBackend {
  async getSession() { return null; }
  async signOut() { return; }
  async pull<T>() { return [] as SyncEnvelope<T>[]; }
  async push<T>() { return { accepted:false, serverVersion:0 }; }
}

// Replace only this adapter when the approved authentication/database provider is connected.
export const operationsBackend: OperationsBackend = new UnconfiguredBackend();
