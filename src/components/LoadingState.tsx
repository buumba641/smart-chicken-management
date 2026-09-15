export function LoadingState() {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-card">
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 animate-pulse rounded-full bg-warm-500" />
        <p className="font-medium text-stone-800">Connecting to the poultry house…</p>
      </div>
      <p className="mt-2 text-sm text-stone-500">
        Waiting for the first live reading from Firestore.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-xl bg-stone-100" />
        ))}
      </div>
    </div>
  )
}
