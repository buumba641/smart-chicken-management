import { useEffect, useState } from 'react'
import type { FirestoreError } from 'firebase/firestore'
import { subscribeReadingHistory } from '../services/sensorReadings'
import type { SensorReading } from '../types/sensor'

export function useReadingHistory() {
  const [readings, setReadings] = useState<SensorReading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = subscribeReadingHistory(
      (next) => {
        setReadings(next)
        setError(null)
        setLoading(false)
      },
      (firestoreError: FirestoreError) => {
        setError(firestoreError.message || 'Failed to load sensor history.')
        setLoading(false)
      },
    )

    return unsubscribe
  }, [])

  return { readings, loading, error }
}
