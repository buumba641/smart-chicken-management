import { useEffect, useState } from 'react'
import type { FirestoreError } from 'firebase/firestore'
import { subscribeLatestReading } from '../services/sensorReadings'
import type { SensorReading } from '../types/sensor'

export function useLatestReading() {
  const [reading, setReading] = useState<SensorReading | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = subscribeLatestReading(
      (next) => {
        setReading(next)
        setError(null)
        setLoading(false)
      },
      (firestoreError: FirestoreError) => {
        setError(firestoreError.message || 'Failed to load the latest sensor reading.')
        setLoading(false)
      },
    )

    return unsubscribe
  }, [])

  return { reading, loading, error }
}
