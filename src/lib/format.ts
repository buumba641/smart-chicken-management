import type { Timestamp } from 'firebase/firestore'
import type { RelayStatus, SensorReading } from '../types/sensor'

function toDate(value: unknown): Date {
  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as Timestamp).toDate()
  }
  if (value instanceof Date) return value
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }
  return new Date()
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function toRelayStatus(value: unknown): RelayStatus {
  return String(value).toUpperCase() === 'ON' ? 'ON' : 'OFF'
}

export function mapSensorReading(id: string, data: Record<string, unknown>): SensorReading {
  return {
    id,
    sensorId: typeof data.sensorId === 'string' ? data.sensorId : 'unknown',
    temperature: toNumber(data.temperature),
    humidity: toNumber(data.humidity),
    waterLevel: toNumber(data.waterLevel),
    feedLevel: toNumber(data.feedLevel),
    relayStatus: toRelayStatus(data.relayStatus),
    timestamp: toDate(data.timestamp),
  }
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(date)
}

export function formatChartTime(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

export function formatNumber(value: number, digits = 1): string {
  return value.toFixed(digits)
}
