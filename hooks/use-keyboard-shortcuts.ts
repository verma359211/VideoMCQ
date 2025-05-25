"use client"

import { useEffect } from "react"

interface KeyboardShortcuts {
  onExportPDF?: () => void
  onCopyMCQs?: () => void
  onGenerateTranscript?: () => void
  onGenerateMCQs?: () => void
  onToggleTheme?: () => void
}

export function useKeyboardShortcuts({
  onExportPDF,
  onCopyMCQs,
  onGenerateTranscript,
  onGenerateMCQs,
  onToggleTheme,
}: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return
      }

      const { ctrlKey, metaKey, shiftKey, key } = event
      const isModifierPressed = ctrlKey || metaKey

      if (isModifierPressed) {
        switch (key.toLowerCase()) {
          case "e":
            event.preventDefault()
            onExportPDF?.()
            break
          case "c":
            if (shiftKey) {
              event.preventDefault()
              onCopyMCQs?.()
            }
            break
          case "t":
            event.preventDefault()
            onGenerateTranscript?.()
            break
          case "m":
            event.preventDefault()
            onGenerateMCQs?.()
            break
          case "d":
            event.preventDefault()
            onToggleTheme?.()
            break
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onExportPDF, onCopyMCQs, onGenerateTranscript, onGenerateMCQs, onToggleTheme])
}
