"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { HelpCircle, Edit3, Check, X, Copy, Sparkles, Loader2, CheckCircle2, FileText } from "lucide-react"
import type { MCQQuestion } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface MCQPanelProps {
  questions: MCQQuestion[]
  onUpdateQuestion: (questionId: string, updatedQuestion: Partial<MCQQuestion>) => void
  onGenerateMCQs: () => void
  isLoading: boolean
  hasTranscript: boolean
  mcqProgress: { current: number; total: number }
  totalSegments: number
}

export default function MCQPanel({
  questions,
  onUpdateQuestion,
  onGenerateMCQs,
  isLoading,
  hasTranscript,
  mcqProgress,
  totalSegments,
}: MCQPanelProps) {
  const { toast } = useToast()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<MCQQuestion>>({})

  const startEditing = (question: MCQQuestion) => {
    setEditingId(question.id)
    setEditForm(question)
  }

  const saveEdit = () => {
    if (editingId && editForm) {
      onUpdateQuestion(editingId, editForm)
      setEditingId(null)
      setEditForm({})
      toast({
        title: "Question updated",
        description: "Your changes have been saved successfully.",
      })
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const copyAllMCQs = () => {
    const formattedText = questions
      .map((q, index) => {
        const options = q.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join("\n")
        return `Question ${index + 1}: ${q.question}\n\n${options}\n\n---\n`
      })
      .join("\n")

    const answerKey = questions
      .map((q, index) => `${index + 1}. ${String.fromCharCode(65 + q.correctAnswer)} - ${q.explanation}`)
      .join("\n")

    const fullText = `${formattedText}\n\nANSWER KEY:\n${answerKey}`

    navigator.clipboard.writeText(fullText)
    toast({
      title: "MCQs copied to clipboard",
      description: `${questions.length} questions copied with answer key.`,
    })
  }

  const exportAsPDF = async () => {
    try {
      const jsPDF = (await import("jspdf")).default

      const doc = new jsPDF()
      const pageHeight = doc.internal.pageSize.height
      let yPosition = 20

      doc.setFontSize(18)
      doc.setFont(undefined, "bold")
      doc.text("MCQ Questions", 20, yPosition)
      yPosition += 20

      doc.setFontSize(12)
      doc.setFont(undefined, "normal")

      questions.forEach((question, index) => {
        if (yPosition > pageHeight - 60) {
          doc.addPage()
          yPosition = 20
        }

        doc.setFont(undefined, "bold")
        const questionText = `${index + 1}. ${question.question}`
        const questionLines = doc.splitTextToSize(questionText, 170)
        doc.text(questionLines, 20, yPosition)
        yPosition += questionLines.length * 7 + 5

        doc.setFont(undefined, "normal")
        question.options.forEach((option, optIndex) => {
          const optionText = `${String.fromCharCode(65 + optIndex)}. ${option}`
          const optionLines = doc.splitTextToSize(optionText, 160)
          doc.text(optionLines, 30, yPosition)
          yPosition += optionLines.length * 6
        })
        yPosition += 10
      })

      doc.addPage()
      yPosition = 20

      doc.setFontSize(18)
      doc.setFont(undefined, "bold")
      doc.text("Answer Key", 20, yPosition)
      yPosition += 20

      doc.setFontSize(12)
      doc.setFont(undefined, "normal")

      questions.forEach((question, index) => {
        if (yPosition > pageHeight - 40) {
          doc.addPage()
          yPosition = 20
        }

        const answerText = `${index + 1}. Correct Answer: ${String.fromCharCode(65 + question.correctAnswer)}`
        doc.setFont(undefined, "bold")
        doc.text(answerText, 20, yPosition)
        yPosition += 10

        if (question.explanation) {
          doc.setFont(undefined, "normal")
          const explanationText = `Explanation: ${question.explanation}`
          const explanationLines = doc.splitTextToSize(explanationText, 170)
          doc.text(explanationLines, 20, yPosition)
          yPosition += explanationLines.length * 6 + 10
        }
      })

      doc.save("mcq-questions.pdf")

      toast({
        title: "PDF exported successfully",
        description: "Questions and answers exported to PDF file.",
      })
    } catch (error) {
      console.error("PDF export failed:", error)
      toast({
        title: "Export failed",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updateEditForm = (field: string, value: any) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(editForm.options || [])]
    newOptions[index] = value
    updateEditForm("options", newOptions)
  }

  const isCompleted = questions.length === totalSegments && !isLoading
  const progressPercentage = totalSegments > 0 ? (questions.length / totalSegments) * 100 : 0

  return (
    <Card className="h-full flex flex-col bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
            <div className="relative">
              <HelpCircle className="h-5 w-5" />
              {isCompleted && <CheckCircle2 className="h-3 w-3 text-green-500 absolute -top-1 -right-1" />}
            </div>
            <span>MCQ Questions</span>
            {questions.length > 0 && <Badge variant="secondary">{questions.length}</Badge>}
            {isCompleted && (
              <Badge
                variant="secondary"
                className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
              >
                Complete
              </Badge>
            )}
          </CardTitle>

          <div className="flex items-center space-x-2">
            {questions.length === 0 && hasTranscript && (
              <Button
                onClick={onGenerateMCQs}
                disabled={isLoading || !hasTranscript}
                className="flex items-center space-x-2"
                size="sm"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>{isLoading ? "Generating..." : "Generate MCQs"}</span>
              </Button>
            )}

            {questions.length > 0 && (
              <>
                <Button onClick={copyAllMCQs} variant="outline" size="sm" className="flex items-center space-x-1">
                  <Copy className="h-4 w-4" />
                  <span className="hidden sm:inline">Copy</span>
                </Button>
                <Button onClick={exportAsPDF} variant="outline" size="sm" className="flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">PDF</span>
                </Button>
                {!isCompleted && (
                  <Button onClick={onGenerateMCQs} variant="outline" size="sm" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>
                  Generating MCQs... ({mcqProgress.current}/{mcqProgress.total})
                </span>
              </span>
              <span className="text-gray-600 dark:text-gray-400">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        {!hasTranscript ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <HelpCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p>Generate transcript first</p>
            <p className="text-sm">Upload a video and generate transcript to create MCQs</p>
          </div>
        ) : isLoading && questions.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <div className="relative mx-auto mb-4 w-12 h-12">
              <Sparkles className="h-12 w-12 text-purple-400 animate-pulse" />
              <div className="absolute inset-0 animate-spin">
                <Loader2 className="h-12 w-12 text-blue-400" />
              </div>
            </div>
            <p>Generating MCQ questions...</p>
            <p className="text-sm">AI is analyzing the transcript segments</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <HelpCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p>No questions generated yet</p>
            <p className="text-sm">Click "Generate MCQs" to create questions</p>
          </div>
        ) : (
          <div className="space-y-6 max-h-[600px] overflow-y-auto">
            {questions.map((question, questionIndex) => (
              <div
                key={question.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 bg-gray-50/50 dark:bg-gray-700/20"
              >
                <div className="flex items-start justify-between">
                  <Badge variant="outline" className="text-xs">
                    Segment {question.segmentId.split("-")[1]} • Question {questionIndex + 1}
                  </Badge>

                  {editingId === question.id ? (
                    <div className="flex items-center space-x-1">
                      <Button onClick={saveEdit} size="sm" variant="outline">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button onClick={cancelEdit} size="sm" variant="outline">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => startEditing(question)} size="sm" variant="ghost">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {editingId === question.id ? (
                  <div className="space-y-4">
                    <Textarea
                      value={editForm.question || ""}
                      onChange={(e) => updateEditForm("question", e.target.value)}
                      placeholder="Question text"
                      className="min-h-[60px] bg-white dark:bg-gray-800"
                    />

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Options:</label>
                      {editForm.options?.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="text-sm font-medium w-6 text-gray-700 dark:text-gray-300">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <Input
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            className="flex-1 bg-white dark:bg-gray-800"
                          />
                          <div className="flex items-center space-x-1">
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              checked={editForm.correctAnswer === index}
                              onChange={() => updateEditForm("correctAnswer", index)}
                              className="w-4 h-4"
                            />
                            <span className="text-xs text-gray-500 dark:text-gray-400">Correct</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Textarea
                      value={editForm.explanation || ""}
                      onChange={(e) => updateEditForm("explanation", e.target.value)}
                      placeholder="Explanation"
                      className="min-h-[60px] bg-white dark:bg-gray-800"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{question.question}</h4>

                    <div className="space-y-2">
                      {question.options.map((option, index) => (
                        <div
                          key={index}
                          className={`flex items-center space-x-2 p-2 rounded ${
                            index === question.correctAnswer
                              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                              : "bg-gray-50 dark:bg-gray-700/50"
                          }`}
                        >
                          <span className="font-medium text-sm w-6 text-gray-700 dark:text-gray-300">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <span className="text-sm flex-1 text-gray-700 dark:text-gray-300">{option}</span>
                          {index === question.correctAnswer && (
                            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                          )}
                        </div>
                      ))}
                    </div>

                    {question.explanation && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>Explanation:</strong> {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Generating more questions... ({mcqProgress.current}/{mcqProgress.total})
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
