import type { ReactNode } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatChartTime } from '../lib/format'
import type { SensorReading } from '../types/sensor'

function ChartCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-card">
      <h2 className="mb-4 text-base font-semibold text-stone-900">{title}</h2>
      <div className="h-64 w-full">{children}</div>
    </article>
  )
}

export function ChartsSection({ readings }: { readings: SensorReading[] }) {
  const data = readings.map((reading) => ({
    time: formatChartTime(reading.timestamp),
    temperature: Number(reading.temperature.toFixed(2)),
    humidity: Number(reading.humidity.toFixed(2)),
    waterLevel: Number(reading.waterLevel.toFixed(2)),
    feedLevel: Number(reading.feedLevel.toFixed(2)),
  }))

  if (data.length === 0) {
    return (
      <article className="rounded-2xl bg-white p-8 text-center shadow-card">
        <p className="font-medium text-stone-800">No chart data yet</p>
        <p className="mt-1 text-sm text-stone-500">
          Charts will appear after the first 50 sensor readings arrive.
        </p>
      </article>
    )
  }

  return (
    <section className="grid gap-5 xl:grid-cols-2">
      <ChartCard title="Temperature · last 50 readings">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#78716c' }} minTickGap={24} />
            <YAxis tick={{ fontSize: 11, fill: '#78716c' }} unit="°C" width={48} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="temperature"
              name="Temperature °C"
              stroke="#c17a3a"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Humidity · last 50 readings">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#78716c' }} minTickGap={24} />
            <YAxis tick={{ fontSize: 11, fill: '#78716c' }} unit="%" width={48} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="humidity"
              name="Humidity %"
              stroke="#0f766e"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="xl:col-span-2">
        <ChartCard title="Water and feed levels · last 50 readings">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#78716c' }} minTickGap={24} />
              <YAxis tick={{ fontSize: 11, fill: '#78716c' }} unit="%" width={48} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="waterLevel"
                name="Water %"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="feedLevel"
                name="Feed %"
                stroke="#7c3aed"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  )
}
