import { useMemo, useState } from 'react'
import { Activity, CalendarDays, CheckCircle2, ClipboardList, Droplets, FileText, HeartPulse, MessageCircle, Plus, Thermometer, Trash2, Wheat, X, Zap } from 'lucide-react'
import { ChartsSection } from './components/ChartsSection'
import { useLatestReading } from './hooks/useLatestReading'
import { useReadingHistory } from './hooks/useReadingHistory'
import { useCycle } from './hooks/useCycle'
import { calculateChickAge, calculateFeedPhase, generateCycleEvents, type CalendarEvent } from './lib/cycle'
import { calculateHealthStatus, heaterLabel, type HealthLevel } from './lib/health'
import { addMortality, addReminder, createCycle, deleteCurrentCycle, ensureCycleArrivalDate, clearReminder } from './services/cycles'
import { formatDateTime, formatNumber } from './lib/format'

type Page = 'Dashboard' | 'Calendar' | 'Diagnosis' | 'Records'
type ChatMessage = { role: 'user' | 'assistant'; text: string }

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <article className={`rounded-2xl border border-stone-200/80 bg-white p-5 shadow-card ${className}`}>{children}</article>
}

function HealthBanner({ level, reasons }: { level: HealthLevel; reasons: string[] }) {
  const styles = { HEALTHY: 'border-emerald-200 bg-emerald-50 text-emerald-950', WARNING: 'border-amber-200 bg-amber-50 text-amber-950', CRITICAL: 'border-red-200 bg-red-50 text-red-950' }
  const icons = { HEALTHY: CheckCircle2, WARNING: Activity, CRITICAL: HeartPulse }
  const Icon = icons[level]
  return <section className={`rounded-2xl border p-6 ${styles[level]}`}><div className="flex items-start gap-4"><Icon className="mt-1 h-8 w-8 shrink-0" aria-hidden="true" /><div><p className="text-xs font-bold uppercase tracking-[0.18em] opacity-70">House health</p><h2 className="mt-1 text-3xl font-bold">{level}</h2><ul className="mt-3 space-y-1 text-sm">{reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></div></div></section>
}

function SensorCard({ title, value, unit, icon: Icon, color, progress }: { title: string; value: string; unit: string; icon: typeof Thermometer; color: string; progress?: number }) {
  return <Card><div className="flex items-center justify-between"><p className="text-sm font-semibold text-stone-500">{title}</p><span className={`rounded-xl p-2 ${color}`}><Icon className="h-5 w-5" aria-hidden="true" /></span></div><p className="mt-5 text-4xl font-bold tracking-tight text-stone-900">{value}<span className="ml-1 text-base font-semibold text-stone-500">{unit}</span></p>{progress !== undefined ? <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-sky-600 transition-all" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} /></div> : null}</Card>
}

function Dashboard({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const latest = useLatestReading()
  const history = useReadingHistory()
  const { cycle, mortality, reminders } = useCycle()
  const reading = latest.reading
  const health = calculateHealthStatus(reading)
  const age = calculateChickAge(cycle?.arrivalDate ?? null)
  const phase = calculateFeedPhase(age)
  const [cycleBusy, setCycleBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  async function startNewCycle() {
    if (!window.confirm('Start a new chicken cycle?\n\nThis will permanently delete all data belonging to the current cycle, including mortality records, reminders, vaccination state and feed-phase information.\n\nThis action cannot be undone.')) return
    setCycleBusy(true)
    try {
      if (cycle) await deleteCurrentCycle(cycle)
      const date = window.prompt('Enter the chick arrival date (YYYY-MM-DD):', new Date().toISOString().slice(0, 10))
      if (date) await createCycle(new Date(`${date}T00:00:00`))
      setNotice('New cycle started successfully.')
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Could not start a new cycle.') } finally { setCycleBusy(false) }
  }

  async function setArrivalDate() {
    const date = window.prompt('When did the chicks arrive? (YYYY-MM-DD)', new Date().toISOString().slice(0, 10))
    if (!date) return
    try { if (cycle) await ensureCycleArrivalDate(cycle, new Date(`${date}T00:00:00`)); else await createCycle(new Date(`${date}T00:00:00`)); setNotice('Arrival date saved.') } catch { setNotice('Could not save the arrival date.') }
  }

  return <div className="space-y-6">
    {notice ? <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><span>{notice}</span><button onClick={() => setNotice(null)} aria-label="Dismiss notification"><X className="h-4 w-4" /></button></div> : null}
    <HealthBanner level={health.level} reasons={health.reasons} />
    {!reading && !latest.loading ? <Card><p className="font-semibold text-stone-800">Waiting for the chicken-house monitoring system...</p><p className="mt-1 text-sm text-stone-500">No sensor reading is available yet.</p></Card> : null}
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SensorCard title="Temperature" value={reading ? formatNumber(reading.temperature) : '—'} unit="°C" icon={Thermometer} color="bg-orange-50 text-orange-700" />
      <SensorCard title="Humidity" value={reading ? formatNumber(reading.humidity) : '—'} unit="%" icon={Activity} color="bg-teal-50 text-teal-700" />
      <SensorCard title="Water level" value={reading ? formatNumber(reading.waterLevel) : '—'} unit="%" icon={Droplets} color="bg-sky-50 text-sky-700" progress={reading?.waterLevel} />
      <SensorCard title="Feed level" value={reading ? formatNumber(reading.feedLevel) : '—'} unit="%" icon={Wheat} color="bg-lime-50 text-lime-700" progress={reading?.feedLevel} />
    </section>
    <section className="grid gap-4 md:grid-cols-4">
      <Card><p className="text-sm font-semibold text-stone-500">Heater</p><p className="mt-4 flex items-center gap-2 text-2xl font-bold text-stone-900"><Zap className="h-6 w-6 text-amber-600" />{heaterLabel(reading?.relayStatus ?? null)}</p><p className="mt-1 text-xs text-stone-500">Live relay state</p></Card>
      <Card><p className="text-sm font-semibold text-stone-500">Mortality</p><div className="mt-4 flex gap-6"><div><p className="text-2xl font-bold">{mortality.reduce((sum, item) => sum + item.count, 0)}</p><p className="text-xs text-stone-500">Total</p></div><div><p className="text-2xl font-bold">{mortality.filter((item) => item.recordedAt.toDateString() === new Date().toDateString()).reduce((sum, item) => sum + item.count, 0)}</p><p className="text-xs text-stone-500">Today</p></div></div></Card>
      <Card><p className="text-sm font-semibold text-stone-500">Chick age</p><p className="mt-4 text-2xl font-bold">{age === null ? 'Not set' : `${age} weeks`}</p><p className="mt-1 text-xs text-stone-500">{cycle?.arrivalDate ? `Arrived ${cycle.arrivalDate.toLocaleDateString()}` : 'Add an arrival date'}</p></Card>
      <Card><p className="text-sm font-semibold text-stone-500">Feed phase</p><p className="mt-4 text-2xl font-bold">{phase ?? 'Not set'}</p><p className="mt-1 text-xs text-stone-500">Starter, grower, finisher</p></Card>
    </section>
    <div className="flex flex-wrap items-center gap-3"><button className="button-primary" onClick={setArrivalDate}><CalendarDays className="h-4 w-4" />{cycle?.arrivalDate ? 'Change arrival date' : 'Set arrival date'}</button><button className="button-secondary" onClick={startNewCycle} disabled={cycleBusy}><Trash2 className="h-4 w-4" />{cycleBusy ? 'Deleting current cycle...' : 'Start New Cycle'}</button><button className="button-secondary" onClick={() => onNavigate('Records')}><ClipboardList className="h-4 w-4" />View records</button></div>
    {reading ? <p className="text-xs text-stone-500">Last updated {formatDateTime(reading.timestamp)} · {reminders.length} cycle reminders</p> : null}
    <ChartsSection readings={history.readings} />
  </div>
}

function CalendarPage() {
  const { cycle, reminders, error } = useCycle()
  const events = useMemo(() => generateCycleEvents(cycle?.arrivalDate ?? null, reminders), [cycle?.arrivalDate, reminders])
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  async function saveReminder(event: React.FormEvent) { event.preventDefault(); if (!cycle || !title || !date) return; await addReminder(cycle.id, title, new Date(`${date}T00:00:00`)); setTitle(''); setDate('') }
  return <div className="space-y-6"><div><p className="eyebrow">Planning</p><h2 className="page-title">Cycle calendar</h2><p className="mt-1 text-sm text-stone-500">Vaccinations, feed phases, recommendations and your reminders.</p></div>{error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">Unable to connect to cycle data.</p> : null}<div className="grid gap-6 lg:grid-cols-[1fr_340px]"><Card><div className="space-y-3">{events.length ? events.map((event) => <CalendarRow key={event.id} event={event} onDelete={event.kind === 'reminder' && cycle ? () => clearReminder(cycle.id, event.id) : undefined} />) : <p className="py-10 text-center text-sm text-stone-500">Set an arrival date to generate cycle events.</p>}</div></Card><Card><h3 className="font-bold">Add reminder</h3><form className="mt-4 space-y-3" onSubmit={saveReminder}><input className="field" placeholder="Reminder title" value={title} onChange={(event) => setTitle(event.target.value)} /><input className="field" type="date" value={date} onChange={(event) => setDate(event.target.value)} /><button className="button-primary w-full" disabled={!cycle}><Plus className="h-4 w-4" />Save reminder</button></form></Card></div></div>
}

function CalendarRow({ event, onDelete }: { event: CalendarEvent; onDelete?: () => void }) { return <div className="flex items-center justify-between gap-3 rounded-xl border border-stone-100 p-3"><div><p className="font-semibold text-stone-800">{event.title}</p><p className="text-sm text-stone-500">{event.date.toLocaleDateString(undefined, { dateStyle: 'medium' })}</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-sky-50 px-2 py-1 text-xs font-semibold capitalize text-sky-700">{event.kind}</span>{onDelete ? <button onClick={onDelete} aria-label="Delete reminder" className="text-stone-400 hover:text-red-600"><X className="h-4 w-4" /></button> : null}</div></div> }

function RecordsPage() {
  const { cycle, mortality } = useCycle()
  const [count, setCount] = useState('')
  const [note, setNote] = useState('')
  async function submit(event: React.FormEvent) { event.preventDefault(); const value = Number(count); if (!cycle || !Number.isInteger(value) || value <= 0) return; await addMortality(cycle.id, value, note); setCount(''); setNote('') }
  return <div className="space-y-6"><div><p className="eyebrow">Current cycle</p><h2 className="page-title">Records</h2></div><div className="grid gap-6 lg:grid-cols-[340px_1fr]"><Card><h3 className="font-bold">Record mortality</h3><form className="mt-4 space-y-3" onSubmit={submit}><input className="field" type="number" min="1" step="1" placeholder="Number of birds" value={count} onChange={(event) => setCount(event.target.value)} /><input className="field" placeholder="Optional note" value={note} onChange={(event) => setNote(event.target.value)} /><button className="button-primary w-full" disabled={!cycle}><Plus className="h-4 w-4" />Save mortality</button></form></Card><Card><h3 className="font-bold">Mortality history</h3><div className="mt-4 divide-y divide-stone-100">{mortality.length ? mortality.map((item) => <div className="flex justify-between py-3" key={item.id}><div><p className="font-semibold">{item.count} birds</p><p className="text-sm text-stone-500">{item.note || 'No note'}</p></div><p className="text-sm text-stone-500">{item.recordedAt.toLocaleString()}</p></div>) : <p className="py-8 text-sm text-stone-500">No mortality recorded for the current cycle.</p>}</div></Card></div></div>
}

function DiagnosisPage() {
  const latest = useLatestReading()
  const { cycle } = useCycle()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const questions = ['Why are my chickens panting at 33°C?', 'Why is the water finishing so quickly?', 'When is the next vaccination?', 'Some birds look weak. What should I check?']
  async function send(text = input) { if (!text.trim() || busy) return; const userMessage = text.trim(); setInput(''); setMessages((items) => [...items, { role: 'user', text: userMessage }]); setBusy(true); try { const response = await fetch('/api/chicdoc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: userMessage, context: { reading: latest.reading, arrivalDate: cycle?.arrivalDate?.toISOString() ?? null } }) }); const data = await response.json(); setMessages((items) => [...items, { role: 'assistant', text: response.ok ? data.text : data.error || 'ChicDoc is temporarily unavailable. Please try again shortly.' }]) } catch { setMessages((items) => [...items, { role: 'assistant', text: 'ChicDoc is temporarily unavailable. Please try again shortly.' }]) } finally { setBusy(false) } }
  return <div className="mx-auto max-w-3xl space-y-6"><div><p className="eyebrow">Poultry health assistant</p><h2 className="page-title">ChicDoc</h2><p className="mt-1 text-sm text-stone-500">Practical guidance grounded in your current house conditions. ChicDoc does not replace a qualified veterinarian.</p></div><Card className="min-h-[420px]"><div className="space-y-4">{messages.length === 0 ? <div className="py-8 text-center"><MessageCircle className="mx-auto h-10 w-10 text-emerald-600" /><p className="mt-3 font-semibold">What would you like to check?</p><div className="mt-5 grid gap-2 text-left sm:grid-cols-2">{questions.map((question) => <button key={question} className="rounded-xl border border-stone-200 p-3 text-left text-sm hover:border-emerald-400" onClick={() => send(question)}>{question}</button>)}</div></div> : messages.map((message, index) => <div key={`${message.role}-${index}`} className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm ${message.role === 'user' ? 'ml-auto bg-emerald-700 text-white' : 'bg-stone-100 text-stone-800'}`}>{message.text}</div>)}{busy ? <div className="text-sm text-stone-500">ChicDoc is thinking...</div> : null}</div><form className="mt-8 flex gap-2" onSubmit={(event) => { event.preventDefault(); void send() }}><input className="field" placeholder="Ask ChicDoc about your flock..." value={input} onChange={(event) => setInput(event.target.value)} /><button className="button-primary shrink-0" disabled={busy}><MessageCircle className="h-4 w-4" />Send</button></form></Card></div>
}

export default function App() {
  const [page, setPage] = useState<Page>('Dashboard')
  const pages: Array<{ name: Page; icon: typeof Activity }> = [{ name: 'Dashboard', icon: Activity }, { name: 'Calendar', icon: CalendarDays }, { name: 'Diagnosis', icon: MessageCircle }, { name: 'Records', icon: FileText }]
  return <div className="min-h-screen bg-warm-50"><header className="border-b border-stone-200 bg-white"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"><button className="flex items-center gap-3 text-left" onClick={() => setPage('Dashboard')}><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-700 text-xl text-white">🐔</span><span><span className="block text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Poultry house</span><span className="block text-lg font-bold text-stone-900">Smart Chicken</span></span></button><nav className="flex gap-1 overflow-x-auto">{pages.map(({ name, icon: Icon }) => <button key={name} className={`nav-item ${page === name ? 'nav-item-active' : ''}`} onClick={() => setPage(name)}><Icon className="h-4 w-4" />{name}</button>)}</nav></div></header><main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">{page === 'Dashboard' ? <Dashboard onNavigate={setPage} /> : page === 'Calendar' ? <CalendarPage /> : page === 'Records' ? <RecordsPage /> : <DiagnosisPage />}</main>{page !== 'Diagnosis' ? <button className="fixed bottom-5 right-5 flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-3 font-semibold text-white shadow-lg transition hover:bg-emerald-800" onClick={() => setPage('Diagnosis')}><MessageCircle className="h-5 w-5" />ChicDoc</button> : null}</div>
}
