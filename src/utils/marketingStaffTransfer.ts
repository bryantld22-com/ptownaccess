import { readMarketingStaffPlan, type MarketingStaffPlan } from './marketingStaffPlan';

export const MAX_MARKETING_STAFF_TRANSFER = 6000;
export function createMarketingStaffTransfer(record: MarketingStaffPlan): string {
  const code = JSON.stringify({ app: 'PTown Access', type: 'marketing-staff-transfer', format: 1, record });
  if (code.length > MAX_MARKETING_STAFF_TRANSFER) throw new Error('Transfer too large');
  return code;
}
export function readMarketingStaffTransfer(code: string): MarketingStaffPlan {
  if (!code.trim() || code.length > MAX_MARKETING_STAFF_TRANSFER) throw new Error('Invalid transfer');
  const parsed: unknown = JSON.parse(code);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid transfer');
  const packet = parsed as { app?: unknown; type?: unknown; format?: unknown; record?: unknown };
  if (packet.app !== 'PTown Access' || packet.type !== 'marketing-staff-transfer' || packet.format !== 1 || !packet.record) throw new Error('Invalid transfer');
  return readMarketingStaffPlan(JSON.stringify(packet.record));
}
