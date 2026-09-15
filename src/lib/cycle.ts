export type FeedPhase = 'Starter' | 'Grower' | 'Finisher'

export interface CalendarEvent {
  id: string
  title: string
  date: Date
  kind: 'feed' | 'vaccine' | 'stress' | 'reminder'
}

export const FEED_PHASES: Array<{ name: FeedPhase; startWeek: number; endWeek: number }> = [
  { name: 'Starter', startWeek: 0, endWeek: 3 },
  { name: 'Grower', startWeek: 4, endWeek: 6 },
  { name: 'Finisher', startWeek: 7, endWeek: 99 },
]

export const VACCINATION_SCHEDULE = [
  { week: 1, title: 'Newcastle vaccination' },
  { week: 2, title: 'Gumboro vaccination' },
  { week: 4, title: 'Booster vaccination' },
]

export const STRESS_PACK_RECOMMENDATIONS = [
  { week: 1, title: 'Stress-pack recommendation: arrival support' },
  { week: 4, title: 'Stress-pack recommendation: phase change' },
]

export function calculateChickAge(arrivalDate: Date | null, now = new Date()): number | null {
  if (!arrivalDate) return null
  return Math.max(0, Math.floor((now.getTime() - arrivalDate.getTime()) / 604800000))
}

export function calculateFeedPhase(ageWeeks: number | null): FeedPhase | null {
  if (ageWeeks === null) return null
  return FEED_PHASES.find((phase) => ageWeeks >= phase.startWeek && ageWeeks <= phase.endWeek)?.name ?? 'Finisher'
}

export function generateCycleEvents(arrivalDate: Date | null, reminders: Array<{ id: string; title: string; date: Date }>): CalendarEvent[] {
  if (!arrivalDate) return reminders.map((reminder) => ({ ...reminder, kind: 'reminder' }))
  const eventDate = (week: number) => new Date(arrivalDate.getTime() + week * 604800000)
  const feedEvents = FEED_PHASES.filter((phase) => phase.startWeek > 0).map((phase) => ({
    id: `feed-${phase.name}`,
    title: `${phase.name} feed phase begins`,
    date: eventDate(phase.startWeek),
    kind: 'feed' as const,
  }))
  const vaccineEvents = VACCINATION_SCHEDULE.map((event) => ({ ...event, id: `vaccine-${event.week}`, date: eventDate(event.week), kind: 'vaccine' as const }))
  const stressEvents = STRESS_PACK_RECOMMENDATIONS.map((event) => ({ ...event, id: `stress-${event.week}`, date: eventDate(event.week), kind: 'stress' as const }))
  const reminderEvents = reminders.map((reminder) => ({ ...reminder, kind: 'reminder' as const }))
  return [...feedEvents, ...vaccineEvents, ...stressEvents, ...reminderEvents].sort((a, b) => a.date.getTime() - b.date.getTime())
}