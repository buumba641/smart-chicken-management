import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  type FirestoreError,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { mapSensorReading } from '../lib/format'
import type { SensorReading } from '../types/sensor'

const COLLECTION = 'sensorReadings'

export function subscribeLatestReading(
  onData: (reading: SensorReading | null) => void,
  onError: (error: FirestoreError) => void,
): Unsubscribe {
  const latestQuery = query(
    collection(db, COLLECTION),
    orderBy('timestamp', 'desc'),
    limit(1),
  )

  return onSnapshot(
    latestQuery,
    (snapshot) => {
      if (snapshot.empty) {
        onData(null)
        return
      }
      const doc = snapshot.docs[0]
      onData(mapSensorReading(doc.id, doc.data() as Record<string, unknown>))
    },
    onError,
  )
}

export function subscribeReadingHistory(
  onData: (readings: SensorReading[]) => void,
  onError: (error: FirestoreError) => void,
): Unsubscribe {
  const historyQuery = query(
    collection(db, COLLECTION),
    orderBy('timestamp', 'desc'),
    limit(50),
  )

  return onSnapshot(
    historyQuery,
    (snapshot) => {
      const newestFirst = snapshot.docs.map((doc) =>
        mapSensorReading(doc.id, doc.data() as Record<string, unknown>),
      )
      onData([...newestFirst].reverse())
    },
    onError,
  )
}
