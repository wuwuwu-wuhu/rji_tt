import { ScheduleView } from "@/components/schedule/schedule-view"

export default function SchedulePage() {
  return (
    <div className="container max-w-md mx-auto p-4 pb-24 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-stone-800">Schedule</h1>
          <p className="text-stone-500 text-sm">Manage your classes and work</p>
        </div>
      </header>

      <ScheduleView />
    </div>
  )
}
