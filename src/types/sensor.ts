export type RelayStatus = 'ON' | 'OFF'

export interface SensorReading {
  id: string
  sensorId: string
  temperature: number
  humidity: number
  waterLevel: number
  feedLevel: number
  relayStatus: RelayStatus
  timestamp: Date
}
