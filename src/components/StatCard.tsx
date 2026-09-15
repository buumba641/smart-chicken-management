import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  unit: string
  icon: LucideIcon
  accent: string
}

export function StatCard({ title, value, unit, icon: Icon, accent }: StatCardProps) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-stone-500">{title}</p>
        <span className={`rounded-xl p-2 ${accent}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-4 flex items-end gap-2">
        <p className="text-4xl font-semibold tracking-tight text-stone-900">{value}</p>
        <p className="mb-1 text-sm font-medium text-stone-500">{unit}</p>
      </div>
    </article>
  )
}
