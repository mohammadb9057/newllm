import { TextAnalysisTool } from '@/components/text-analysis-tool'

export default function ToolsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">ابزارهای تحلیل متن</h1>
        <p className="text-muted-foreground">
          از ابزارهای پیشرفته هوش مصنوعی برای تحلیل، خلاصه‌سازی و ترجمه متون فارسی استفاده کنید.
        </p>
      </div>
      
      <TextAnalysisTool />
    </div>
  )
}

