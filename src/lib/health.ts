import type { RelayStatus, SensorReading } from '../types/sensor'

export type HealthLevel = 'HEALTHY' | 'WARNING' | 'CRITICAL'

export interface HealthStatus {
  level: HealthLevel
  reasons: string[]
}

export function calculateHealthStatus(reading: SensorReading | null): HealthStatus {
  if (!reading) return { level: 'WARNING', reasons: ['Waiting for the first sensor reading.'] }

  const critical: string[] = []
  const warnings: string[] = []
  if (reading.temperature < 24 && reading.relayStatus === 'OFF') {
    critical.push('Temperature is below the recommended range and the heater is OFF.')
  }
  if (reading.temperature > 28 && reading.relayStatus === 'ON') {
    critical.push('Temperature is above the recommended range while the heater is ON.')
  }
  if (reading.waterLevel < 20) warnings.push('Water level is low.')
  if (reading.feedLevel < 15) warnings.push('Feed level is low.')

  if (critical.length) return { level: 'CRITICAL', reasons: [...critical, ...warnings] }
  if (warnings.length) return { level: 'WARNING', reasons: warnings }
  return { level: 'HEALTHY', reasons: ['Temperature, water and feed levels are within safe limits.'] }
}

export function heaterLabel(status: RelayStatus | null): string {
  return status === 'ON' ? 'ON' : status === 'OFF' ? 'OFF' : 'Unknown'
}