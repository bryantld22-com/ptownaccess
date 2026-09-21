import { useEffect, useState } from 'react';
import { events, weekDays } from '../data/events';
import { usePreviewStore } from '../state/PreviewStore';
export type EventFilter = 'All' | 'Free' | 'Ticketed' | 'Saved';
export type DayFilter = 'Any day' | typeof weekDays[number];
export function useEventFilter(params: { day?: string | string[]; filter?: string | string[]; q?: string | string[] } = {}) {
  const normalizedDay: DayFilter = weekDays.find(day => day === params.day) ?? 'Any day';
  const normalizedFilter: EventFilter = (['All', 'Free', 'Ticketed', 'Saved'] as const).find(value => value === params.filter) ?? 'All';
  const normalizedQuery = typeof params.q === 'string' ? params.q.slice(0, 120) : '';
  const { savedEventIds } = usePreviewStore();
  const [filter, setFilter] = useState<EventFilter>('All');
  const [query, setQuery] = useState('');
  // Static HTML has no query parameters. Match it before applying the URL selection.
  const [day, setDay] = useState<DayFilter>('Any day');
  useEffect(() => { setDay(normalizedDay); }, [normalizedDay]);
  useEffect(() => { setFilter(normalizedFilter); }, [normalizedFilter]);
  useEffect(() => { setQuery(normalizedQuery); }, [normalizedQuery]);
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = events.filter(event => {
    const admissionMatches = filter === 'All' || (filter === 'Saved' ? savedEventIds.includes(event.id) : event.admission === filter);
    const text = [event.title, event.day, event.category, event.description, event.opening, event.afterParty, event.tournamentFeature?.title, event.tournamentFeature?.description].filter(Boolean).join(' ').toLowerCase();
    return admissionMatches && (day === 'Any day' || event.day === day) && words.every(word => text.includes(word));
  });
  return { filter, setFilter, query, setQuery, day, setDay, events: matches };
}
