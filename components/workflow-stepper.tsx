"use client"

import React from "react"
import { CheckCircle2 } from "lucide-react"

interface WorkflowStepperProps {
  currentStep: number
  steps: {
    id: number
    title: string
    description: string
    icon: React.ReactNode
    completed: boolean
  }[]
}

export default function WorkflowStepper({ currentStep, steps }: WorkflowStepperProps) {
  return (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg p-3 mb-6">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                  step.completed
                    ? "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-600 dark:text-green-400"
                    : currentStep === step.id
                      ? "bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400"
                      : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400"
                }`}
              >
                {step.completed ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  React.cloneElement(step.icon as React.ReactElement, { className: "h-4 w-4" })
                )}
              </div>
              <div className="ml-2 hidden sm:block">
                <p
                  className={`text-xs font-medium ${
                    step.completed || currentStep === step.id
                      ? "text-gray-900 dark:text-gray-100"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {step.title}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 sm:w-12 h-0.5 mx-2 ${
                  steps[index + 1].completed || currentStep > step.id ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
