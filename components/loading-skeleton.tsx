"use client"

export function QuestionSkeleton() {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 bg-gray-50/50 dark:bg-gray-700/20 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
        <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>

      <div className="space-y-3">
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>

        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-2 p-2 rounded bg-gray-100 dark:bg-gray-700/50">
              <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded flex-1"></div>
            </div>
          ))}
        </div>

        <div className="h-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
    </div>
  )
}

export function TranscriptSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse">
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/5"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/5"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
