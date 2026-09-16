import { useEffect, useState } from 'react';
import { events, weekDays } from '../data/events';
import { usePreviewStore } from '../state/PreviewStore';
export type EventFilter = 'All' | 'Free' | 'Ticketed' | 'Saved';
export type DayFilter = 'Any day' | typeof weekDays[number];
export function useEventFilter(routeDay?: string | string[]) {
  const normalizedDay: DayFilter = weekDays.find(day => day === routeDay) ?? 'Any day';
  const { savedEventIds } = usePreviewStore();
  const [filter, setFilter] = useState<EventFilter>('All');
  const [query, setQuery] = useState('');
  const [day, setDay] = useState<DayFilter>(normalizedDay);
  useEffect(() => { setDay(normalizedDay); }, [normalizedDay]);
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = events.filter(event => {
    const admissionMatches = filter === 'All' || (filter === 'Saved' ? savedEventIds.includes(event.id) : event.admission === filter);
    const text = [event.title, event.day, event.category, event.description, event.opening, event.afterParty].filter(Boolean).join(' ').toLowerCase();
    return admissionMatches && (day === 'Any day' || event.day === day) && words.every(word => text.includes(word));
  });
  return { filter, setFilter, query, setQuery, day, setDay, events: matches };
}
