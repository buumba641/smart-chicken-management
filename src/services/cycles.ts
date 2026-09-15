import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export interface Cycle {
  id: string
  arrivalDate: Date | null
  createdAt: Date | null
  active: boolean
}

export interface MortalityRecord {
  id: string
  count: number
  note: string
  recordedAt: Date
}

export interface ReminderRecord {
  id: string
  title: string
  date: Date
}

function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) return value.toDate()
  if (value instanceof Date) return value
  return null
}

function mapCycle(id: string, data: Record<string, unknown>): Cycle {
  return { id, arrivalDate: toDate(data.arrivalDate), createdAt: toDate(data.createdAt), active: data.active !== false }
}

export function subscribeActiveCycle(onData: (cycle: Cycle | null) => void, onError: (error: Error) => void): Unsubscribe {
  return onSnapshot(query(collection(db, 'cycles'), where('active', '==', true)), (snapshot) => {
    const active = snapshot.docs[0]
    onData(active ? mapCycle(active.id, active.data() as Record<string, unknown>) : null)
  }, onError)
}

export function subscribeMortality(cycleId: string, onData: (records: MortalityRecord[]) => void, onError: (error: Error) => void): Unsubscribe {
  return onSnapshot(collection(db, 'cycles', cycleId, 'mortality'), (snapshot) => {
    const records = snapshot.docs.map((item) => {
      const data = item.data()
      return { id: item.id, count: Number(data.count) || 0, note: typeof data.note === 'string' ? data.note : '', recordedAt: toDate(data.recordedAt) ?? new Date() }
    }).sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime())
    onData(records)
  }, onError)
}

export function subscribeReminders(cycleId: string, onData: (records: ReminderRecord[]) => void, onError: (error: Error) => void): Unsubscribe {
  return onSnapshot(collection(db, 'cycles', cycleId, 'reminders'), (snapshot) => {
    onData(snapshot.docs.map((item) => ({ id: item.id, title: String(item.data().title ?? ''), date: toDate(item.data().date) ?? new Date() })))
  }, onError)
}

export async function createCycle(arrivalDate: Date): Promise<void> {
  await addDoc(collection(db, 'cycles'), { arrivalDate: Timestamp.fromDate(arrivalDate), createdAt: serverTimestamp(), active: true })
}

export async function addMortality(cycleId: string, count: number, note: string): Promise<void> {
  await addDoc(collection(db, 'cycles', cycleId, 'mortality'), { count, note, recordedAt: serverTimestamp() })
}

export async function addReminder(cycleId: string, title: string, date: Date): Promise<void> {
  await addDoc(collection(db, 'cycles', cycleId, 'reminders'), { title, date: Timestamp.fromDate(date), createdAt: serverTimestamp() })
}

export async function deleteCurrentCycle(cycle: Cycle): Promise<void> {
  for (const subcollection of ['mortality', 'reminders']) {
    const snapshot = await getDocs(collection(db, 'cycles', cycle.id, subcollection))
    await Promise.all(snapshot.docs.map((item) => deleteDoc(item.ref)))
  }
  await deleteDoc(doc(db, 'cycles', cycle.id))
}

export async function clearReminder(cycleId: string, reminderId: string): Promise<void> {
  await deleteDoc(doc(db, 'cycles', cycleId, 'reminders', reminderId))
}

export async function ensureCycleArrivalDate(cycle: Cycle, arrivalDate: Date): Promise<void> {
  await setDoc(doc(db, 'cycles', cycle.id), { arrivalDate: Timestamp.fromDate(arrivalDate) }, { merge: true })
}