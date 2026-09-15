import { Clock3 } from 'lucide-react'
import { formatDateTime } from '../lib/format'

export function LastUpdateCard({ timestamp }: { timestamp: Date | null }) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-stone-500">Latest reading</p>
        <span className="rounded-xl bg-stone-100 p-2 text-stone-600">
          <Clock3 className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-5 text-lg font-semibold leading-snug text-stone-900">
        {timestamp ? formatDateTime(timestamp) : 'No readings yet'}
      </p>
      <p className="mt-2 text-sm text-stone-500">Updated from Firestore in real time.</p>
    </article>
  )
}
