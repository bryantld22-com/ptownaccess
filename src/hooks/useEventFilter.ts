import { useState } from 'react';
import { events } from '../data/events';
export type EventFilter = 'All' | 'Free' | 'Ticketed';
export function useEventFilter() {
  const [filter, setFilter] = useState<EventFilter>('All');
  return { filter, setFilter, events: events.filter(event => filter === 'All' || event.admission === filter) };
}
