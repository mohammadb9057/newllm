'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Plus, 
  Trash2, 
  Play, 
  Save, 
  Download, 
  Upload,
  ArrowRight,
  Settings,
  Zap,
  Brain
} from 'lucide-react'
import { toast } from 'sonner'

interface WorkflowStep {
  id: string
  type: 'input' | 'process' | 'output'
  name: string
  config: {
    model?: string
    prompt?: string
    temperature?: number
    maxTokens?: number
    inputField?: string
    outputField?: string
  }
}

interface Workflow {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  isActive: boolean
}

const STEP_TYPES = [
  { value: 'input', label: 'ورودی', icon: '📥' },
  { value: 'process', label: 'پردازش', icon: '⚙️' },
  { value: 'output', label: 'خروجی', icon: '📤' }
]

const AI_MODELS = [
  'OpenAI GPT-4 (Persian)',
  'PersianMind',
  'Maral-7B'
]

export function AIWorkflowBuilder() {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: '1',
      name: 'تحلیل احساسات خبر',
      description: 'تحلیل احساسات اخبار و طبقه‌بندی آنها',
      steps: [
        {
          id: 'step1',
          type: 'input',
          name: 'دریافت متن خبر',
          config: { inputField: 'news_text' }
        },
        {
          id: 'step2',
          type: 'process',
          name: 'تحلیل احساسات',
          config: {
            model: 'OpenAI GPT-4 (Persian)',
            prompt: 'احساس کلی این خبر را تحلیل کن: مثبت، منفی یا خنثی',
            temperature: 0.3,
            maxTokens: 100
          }
        },
        {
          id: 'step3',
          type: 'output',
          name: 'نتیجه تحلیل',
          config: { outputField: 'sentiment_result' }
        }
      ],
      isActive: true
    }
  ])

  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(workflows[0])
  const [isRunning, setIsRunning] = useState(false)

  const createNewWorkflow = () => {
    const newWorkflow: Workflow = {
      id: Date.now().toString(),
      name: 'گردش کار جدید',
      description: 'توضیح گردش کار',
      steps: [],
      isActive: false
    }
    setWorkflows(prev => [...prev, newWorkflow])
    setSelectedWorkflow(newWorkflow)
  }

  const addStep = () => {
    if (!selectedWorkflow) return

    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      type: 'process',
      name: 'مرحله جدید',
      config: {}
    }

    const updatedWorkflow = {
      ...selectedWorkflow,
      steps: [...selectedWorkflow.steps, newStep]
    }

    setSelectedWorkflow(updatedWorkflow)
    setWorkflows(prev => prev.map(w => w.id === selectedWorkflow.id ? updatedWorkflow : w))
  }

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    if (!selectedWorkflow) return

    const updatedWorkflow = {
      ...selectedWorkflow,
      steps: selectedWorkflow.steps.map(step =>
        step.id === stepId ? { ...step, ...updates } : step
      )
    }

    setSelectedWorkflow(updatedWorkflow)
    setWorkflows(prev => prev.map(w => w.id === selectedWorkflow.id ? updatedWorkflow : w))
  }

  const removeStep = (stepId: string) => {
    if (!selectedWorkflow) return

    const updatedWorkflow = {
      ...selectedWorkflow,
      steps: selectedWorkflow.steps.filter(step => step.id !== stepId)
    }

    setSelectedWorkflow(updatedWorkflow)
    setWorkflows(prev => prev.map(w => w.id === selectedWorkflow.id ? updatedWorkflow : w))
  }

  const runWorkflow = async () => {
    if (!selectedWorkflow) return

    setIsRunning(true)
    toast.info('شروع اجرای گردش کار...')

    // Simulate workflow execution
    for (let i = 0; i < selectedWorkflow.steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.info(`اجرای مرحله ${i + 1}: ${selectedWorkflow.steps[i].name}`)
    }

    setIsRunning(false)
    toast.success('گردش کار با موفقیت اجرا شد!')
  }

  const saveWorkflow = () => {
    if (!selectedWorkflow) return
    toast.success('گردش کار ذخیره شد')
  }

  const exportWorkflow = () => {
    if (!selectedWorkflow) return

    const dataStr = JSON.stringify(selectedWorkflow, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `workflow_${selectedWorkflow.name}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('گردش کار صادر شد')
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            سازنده گردش کار هوش مصنوعی
          </h1>
          <p className="text-muted-foreground mt-1">
            گردش کارهای پیچیده هوش مصنوعی را بصورت بصری طراحی کنید
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={createNewWorkflow}>
            <Plus className="h-4 w-4 mr-2" />
            گردش کار جدید
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Workflow List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>گردش کارها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {workflows.map(workflow => (
              <div
                key={workflow.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedWorkflow?.id === workflow.id
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedWorkflow(workflow)}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{workflow.name}</h4>
                  {workflow.isActive && (
                    <Badge variant="secondary" className="text-xs">
                      فعال
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {workflow.description}
                </p>
                <div className="text-xs text-muted-foreground mt-2">
                  {workflow.steps.length} مرحله
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Workflow Builder */}
        <Card className="lg:col-span-3">
          {selectedWorkflow ? (
            <>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedWorkflow.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedWorkflow.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={saveWorkflow}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportWorkflow}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={runWorkflow}
                      disabled={isRunning || selectedWorkflow.steps.length === 0}
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {isRunning ? 'در حال اجرا...' : 'اجرا'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Workflow Steps */}
                <div className="space-y-4">
                  {selectedWorkflow.steps.map((step, index) => (
                    <div key={step.id}>
                      <Card className="relative">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </div>
                              <div>
                                <Input
                                  value={step.name}
                                  onChange={(e) => updateStep(step.id, { name: e.target.value })}
                                  className="font-medium border-none p-0 h-auto"
                                />
                                <Select
                                  value={step.type}
                                  onValueChange={(value: 'input' | 'process' | 'output') =>
                                    updateStep(step.id, { type: value })
                                  }
                                >
                                  <SelectTrigger className="w-32 h-6 text-xs mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {STEP_TYPES.map(type => (
                                      <SelectItem key={type.value} value={type.value}>
                                        {type.icon} {type.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeStep(step.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {step.type === 'process' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs">مدل هوش مصنوعی</Label>
                                <Select
                                  value={step.config.model || ''}
                                  onValueChange={(value) =>
                                    updateStep(step.id, {
                                      config: { ...step.config, model: value }
                                    })
                                  }
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="انتخاب مدل" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {AI_MODELS.map(model => (
                                      <SelectItem key={model} value={model}>
                                        {model}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs">دما (Temperature)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="2"
                                  step="0.1"
                                  value={step.config.temperature || 0.7}
                                  onChange={(e) =>
                                    updateStep(step.id, {
                                      config: { ...step.config, temperature: parseFloat(e.target.value) }
                                    })
                                  }
                                  className="h-8"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <Label className="text-xs">پرامپت</Label>
                                <Textarea
                                  value={step.config.prompt || ''}
                                  onChange={(e) =>
                                    updateStep(step.id, {
                                      config: { ...step.config, prompt: e.target.value }
                                    })
                                  }
                                  placeholder="پرامپت خود را وارد کنید..."
                                  rows={3}
                                />
                              </div>
                            </div>
                          )}

                          {step.type === 'input' && (
                            <div>
                              <Label className="text-xs">فیلد ورودی</Label>
                              <Input
                                value={step.config.inputField || ''}
                                onChange={(e) =>
                                  updateStep(step.id, {
                                    config: { ...step.config, inputField: e.target.value }
                                  })
                                }
                                placeholder="نام فیلد ورودی"
                                className="h-8"
                              />
                            </div>
                          )}

                          {step.type === 'output' && (
                            <div>
                              <Label className="text-xs">فیلد خروجی</Label>
                              <Input
                                value={step.config.outputField || ''}
                                onChange={(e) =>
                                  updateStep(step.id, {
                                    config: { ...step.config, outputField: e.target.value }
                                  })
                                }
                                placeholder="نام فیلد خروجی"
                                className="h-8"
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {index < selectedWorkflow.steps.length - 1 && (
                        <div className="flex justify-center py-2">
                          <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Step Button */}
                <Button
                  variant="dashed"
                  onClick={addStep}
                  className="w-full border-dashed border-2 h-12"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  افزودن مرحله
                </Button>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  گردش کاری را انتخاب کنید یا یکی جدید ایجاد کنید
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}

