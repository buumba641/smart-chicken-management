import { useEffect, useState } from 'react'
import { subscribeActiveCycle, subscribeMortality, subscribeReminders, type Cycle, type MortalityRecord, type ReminderRecord } from '../services/cycles'

export function useCycle() {
  const [cycle, setCycle] = useState<Cycle | null>(null)
  const [mortality, setMortality] = useState<MortalityRecord[]>([])
  const [reminders, setReminders] = useState<ReminderRecord[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => subscribeActiveCycle(setCycle, (next) => setError(next.message)), [])
  useEffect(() => {
    if (!cycle) { setMortality([]); setReminders([]); return }
    const stopMortality = subscribeMortality(cycle.id, setMortality, (next) => setError(next.message))
    const stopReminders = subscribeReminders(cycle.id, setReminders, (next) => setError(next.message))
    return () => { stopMortality(); stopReminders() }
  }, [cycle])

  return { cycle, mortality, reminders, error }
}