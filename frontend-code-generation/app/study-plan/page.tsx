import { StudyPlanList } from "@/components/study/study-plan-list"

export default function StudyPlanPage() {
  return (
    <div className="container max-w-md mx-auto p-4 pb-24 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-stone-800">Study Plan</h1>
          <p className="text-stone-500 text-sm">AI-powered learning path</p>
        </div>
      </header>

      <StudyPlanList />
    </div>
  )
}
