import { readStaAssignments, type StaAssignments } from './staAssignments';

export const MAX_STA_ASSIGNMENT_TRANSFER = 5000;
export function createStaAssignmentTransfer(record: StaAssignments): string {
  const code = JSON.stringify({ app: 'PTown Access', type: 'sta-assignment-transfer', format: 1, record });
  if (code.length > MAX_STA_ASSIGNMENT_TRANSFER) throw new Error('Transfer too large');
  return code;
}
export function readStaAssignmentTransfer(code: string): StaAssignments {
  if (!code.trim() || code.length > MAX_STA_ASSIGNMENT_TRANSFER) throw new Error('Invalid transfer');
  const parsed: unknown = JSON.parse(code);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid transfer');
  const packet = parsed as { app?: unknown; type?: unknown; format?: unknown; record?: unknown };
  if (packet.app !== 'PTown Access' || packet.type !== 'sta-assignment-transfer' || packet.format !== 1 || !packet.record) throw new Error('Invalid transfer');
  return readStaAssignments(JSON.stringify(packet.record));
}
