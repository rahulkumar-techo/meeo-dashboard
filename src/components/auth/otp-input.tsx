"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: boolean
  autoFocus?: boolean
}

export function OtpInput({
  length = 4,
  value,
  onChange,
  disabled = false,
  error = false,
  autoFocus = true,
}: OtpInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  // Split value into characters array
  const digits = React.useMemo(() => {
    const arr = value.split("").slice(0, length)
    while (arr.length < length) {
      arr.push("")
    }
    return arr
  }, [value, length])

  React.useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value
    const lastChar = rawVal.slice(-1)

    if (lastChar && !/^\d$/.test(lastChar)) {
      return
    }

    const newDigits = [...digits]
    newDigits[index] = lastChar || ""
    const newVal = newDigits.join("")
    onChange(newVal)

    // Auto-advance focus to next field if a digit was entered
    if (lastChar && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // Move back to previous box and clear it
        inputRefs.current[index - 1]?.focus()
        const newDigits = [...digits]
        newDigits[index - 1] = ""
        onChange(newDigits.join(""))
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()
    const numericChars = pastedData.replace(/\D/g, "").slice(0, length)
    if (numericChars) {
      onChange(numericChars)
      const targetIndex = Math.min(numericChars.length, length - 1)
      inputRefs.current[targetIndex]?.focus()
    }
  }

  return (
    <div className="flex items-center justify-center gap-2.5 sm:gap-3.5">
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputRefs.current[idx] = el
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digits[idx] || ""}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          className={cn(
            "flex size-12 sm:size-14 items-center justify-center rounded-lg border text-center font-mono text-xl font-bold tracking-widest text-foreground shadow-2xs transition-all outline-hidden select-none",
            "bg-background/80 hover:border-indigo-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20",
            error
              ? "border-rose-500 text-rose-600 focus:border-rose-500 focus:ring-rose-500/20"
              : "border-border/80",
            disabled && "opacity-50 cursor-not-allowed bg-muted/40"
          )}
        />
      ))}
    </div>
  )
}
