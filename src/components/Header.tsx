export function Header({ live }: { live: boolean }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="text-3xl leading-none" aria-hidden="true">
          🐔
        </span>
        <div>
          <p className="text-sm font-medium text-warm-600">Poultry house monitor</p>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
            Smart Chicken Management
          </h1>
        </div>
      </div>
      <div
        className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${
          live
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-stone-200 bg-white text-stone-500'
        }`}
        aria-live="polite"
      >
        <span
          className={`h-2 w-2 rounded-full ${live ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`}
        />
        {live ? 'LIVE' : 'WAITING'}
      </div>
    </header>
  )
}
