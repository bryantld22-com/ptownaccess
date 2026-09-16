import { events, weekDays } from '../data/events';
import type { MembershipInterest, ReservationDraft } from '../state/PreviewStore';
import { isPastDate, programDay } from './programDay';

export function planSummary({ savedEventIds, reservationDraft, membershipInterest }: {
  savedEventIds: readonly string[]; reservationDraft: ReservationDraft | null; membershipInterest: MembershipInterest | null;
}) {
  const programs = weekDays.flatMap(day => events.filter(event => event.day === day && savedEventIds.includes(event.id)));
  const weekday = reservationDraft ? programDay(reservationDraft.date) : null;
  const matchingPrograms = weekday ? programs.filter(event => event.day === weekday) : [];
  const ticketedPrograms = programs.filter(event => event.admission === 'Ticketed');
  const hasPlans = programs.length > 0 || reservationDraft !== null || membershipInterest !== null;
  const lines = [
    'PTOWN ACCESS — PREVIEW PLAN',
    'PTown Dinner Club · Paducah, Kentucky',
    '',
    'Planning summary only. No tickets, reservation, or membership are confirmed.',
    'Programs are proposed; dates, artists, prices, and availability are not confirmed.',
    '',
    'SAVED PROGRAMS',
    ...(programs.length ? programs.map(event => `- ${event.day} · ${event.title} · ${event.admission}${event.admission === 'Ticketed' ? ' (no ticket purchased)' : ' (availability not confirmed)'}`) : ['None saved.']),
    '',
    'DINNER DRAFT',
    ...(reservationDraft ? [
      `Preferred date: ${reservationDraft.date}${weekday ? ` (${weekday})` : ''}`,
      `Guests: ${reservationDraft.partySize}`,
      ...(reservationDraft.occasion ? [`Occasion: ${reservationDraft.occasion}`] : []),
      ...(isPastDate(reservationDraft.date) ? ['This preferred date has passed. Update your dinner draft.'] : []),
      'No reservation has been placed.',
    ] : ['No dinner draft saved.']),
    '',
    'MEMBERSHIP INTEREST',
    membershipInterest ? `${membershipInterest === 'vip' ? 'VIP Society' : 'PTown community'} (interest only; not enrolled)` : 'None saved.',
    '',
    'Plans are stored only on this device. Copying or sharing this summary does not sync plans to another device.',
  ];
  return { programs, weekday, matchingPrograms, ticketedPrograms, hasPlans, text: lines.join('\n') };
}
