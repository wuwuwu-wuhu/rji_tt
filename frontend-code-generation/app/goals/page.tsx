import { GoalsBoard } from "@/components/goals/goals-board"

export default function GoalsPage() {
  return (
    <div className="container max-w-md mx-auto p-4 pb-24 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-stone-800">Goals</h1>
          <p className="text-stone-500 text-sm">Track your journey</p>
        </div>
      </header>

      <GoalsBoard />
    </div>
  )
}
