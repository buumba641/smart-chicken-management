import { Zap } from 'lucide-react'
import type { RelayStatus } from '../types/sensor'

export function RelayCard({ status }: { status: RelayStatus | null }) {
  const isOn = status === 'ON'

  return (
    <article className="rounded-2xl bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-stone-500">Relay status</p>
        <span className="rounded-xl bg-amber-50 p-2 text-warm-600">
          <Zap className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-5">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
            isOn ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-600'
          }`}
        >
          {status ?? '—'}
        </span>
        <p className="mt-3 text-sm text-stone-500">
          {isOn ? 'Actuator circuit is energized.' : 'Actuator circuit is idle.'}
        </p>
      </div>
    </article>
  )
}
