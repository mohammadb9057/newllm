export default function AnalyticsLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">در حال بارگذاری تحلیل‌ها...</p>
    </div>
  )
}
