import { events, weekDays } from '../data/events';
import type { MembershipInterest, ReservationDraft, TournamentInterest } from '../state/PreviewStore';
import { isPastDate, programDay } from './programDay';
import { pathways } from '../data/pathways';
import { tournamentGames } from '../data/tournament';

export function planSummary({ savedEventIds, savedPathwayIds = [], reservationDraft, membershipInterest, tournamentInterest }: {
  savedEventIds: readonly string[]; savedPathwayIds?: readonly string[]; reservationDraft: ReservationDraft | null; membershipInterest: MembershipInterest | null; tournamentInterest?: TournamentInterest | null;
}) {
  const programs = weekDays.flatMap(day => events.filter(event => event.day === day && savedEventIds.includes(event.id)));
  const weekday = reservationDraft ? programDay(reservationDraft.date) : null;
  const matchingPrograms = weekday ? programs.filter(event => event.day === weekday) : [];
  const ticketedPrograms = programs.filter(event => event.admission === 'Ticketed');
  const creativeInterests = pathways.filter(pathway => savedPathwayIds.includes(pathway.id));
  const tournamentInterests = tournamentGames.filter(game => tournamentInterest?.gameIds.includes(game.id));
  const hasPlans = programs.length > 0 || creativeInterests.length > 0 || reservationDraft !== null || membershipInterest !== null || tournamentInterests.length > 0;
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
      ...(reservationDraft.notes?.trim() ? [`Dinner note: ${reservationDraft.notes} (planning only; not submitted)`] : []),
      ...(isPastDate(reservationDraft.date) ? ['This preferred date has passed. Update your dinner draft.'] : []),
      'No reservation has been placed.',
    ] : ['No dinner draft saved.']),
    '',
    'MEMBERSHIP INTEREST',
    membershipInterest ? `${membershipInterest === 'vip' ? 'VIP Society' : 'PTown community'} (interest only; not enrolled)` : 'None saved.',
    '',
    'TOURNAMENT INTERESTS',
    ...(tournamentInterests.length ? tournamentInterests.map(game => `- ${game.title} (interest only; not registered and no place reserved)`) : ['None saved.']),
    '',
    'CREATIVE INTERESTS',
    ...(creativeInterests.length ? creativeInterests.map(pathway => `- ${pathway.title} · ${pathway.division} (interest only; no application submitted)`) : ['None saved.']),
    '',
    'Plans are stored only on this device. Copying or sharing this summary does not sync plans to another device.',
  ];
  return { programs, weekday, matchingPrograms, ticketedPrograms, creativeInterests, tournamentInterests, hasPlans, text: lines.join('\n') };
}
