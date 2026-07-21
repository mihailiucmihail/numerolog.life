/**
 * Comprehensive error logging with full stack traces and detailed context
 */

export interface ErrorDetails {
  step: string
  success: boolean
  timestamp: string
  duration?: number
  error?: {
    message: string
    code?: string
    details?: string
    stack?: string
    fileName?: string
    functionName?: string
    lineNumber?: number
    columnNumber?: number
  }
  context?: Record<string, any>
}

export interface StepLog {
  step: string
  startTime: number
  success?: boolean
  error?: string
  duration?: number
  details?: Record<string, any>
}

/**
 * Extract detailed error information from an error object
 */
export function extractErrorDetails(
  error: unknown,
  step: string,
  context?: Record<string, any>
): ErrorDetails {
  let message = "Unknown error"
  let stack = ""
  let code = ""

  if (error instanceof Error) {
    message = error.message
    stack = error.stack || ""
    code = (error as any).code || ""
  } else if (typeof error === "string") {
    message = error
  } else if (error && typeof error === "object") {
    message = (error as any).message || JSON.stringify(error)
    stack = (error as any).stack || ""
    code = (error as any).code || ""
  }

  // Parse stack trace to extract file, function, line number
  let fileName = ""
  let functionName = ""
  let lineNumber: number | undefined
  let columnNumber: number | undefined

  if (stack) {
    const stackLines = stack.split("\n")
    // Look for the first meaningful stack frame (not node internals)
    for (const line of stackLines.slice(1)) {
      if (!line.includes("node_modules") && !line.includes("internal")) {
        // Extract file:line:column from format like "at functionName (/path/to/file.ts:123:45)"
        const match = line.match(/at\s+(\w+)?\s*\(([^:]+):(\d+):(\d+)\)/)
        if (match) {
          functionName = match[1] || "unknown"
          fileName = match[2]
          lineNumber = parseInt(match[3], 10)
          columnNumber = parseInt(match[4], 10)
          break
        }
      }
    }
  }

  return {
    step,
    success: false,
    timestamp: new Date().toISOString(),
    error: {
      message,
      code: code || undefined,
      stack: stack || undefined,
      fileName: fileName || undefined,
      functionName: functionName || undefined,
      lineNumber: lineNumber || undefined,
      columnNumber: columnNumber || undefined
    },
    context
  }
}

/**
 * Format error details for console output and API responses
 */
export function formatErrorDetails(errorDetails: ErrorDetails): string {
  const parts: string[] = []

  parts.push(`\n${"=".repeat(70)}`)
  parts.push(`ERROR IN STEP: ${errorDetails.step}`)
  parts.push(`${"=".repeat(70)}`)
  parts.push(`Timestamp: ${errorDetails.timestamp}`)

  if (errorDetails.error) {
    parts.push(`\nERROR MESSAGE:\n${errorDetails.error.message}`)

    if (errorDetails.error.code) {
      parts.push(`\nError Code: ${errorDetails.error.code}`)
    }

    if (errorDetails.error.fileName) {
      parts.push(`\nLocation:`)
      parts.push(`  File: ${errorDetails.error.fileName}`)
      if (errorDetails.error.functionName) {
        parts.push(`  Function: ${errorDetails.error.functionName}`)
      }
      if (errorDetails.error.lineNumber) {
        parts.push(`  Line: ${errorDetails.error.lineNumber}:${errorDetails.error.columnNumber || 0}`)
      }
    }

    if (errorDetails.error.stack) {
      parts.push(`\nFull Stack Trace:\n${errorDetails.error.stack}`)
    }
  }

  if (errorDetails.context && Object.keys(errorDetails.context).length > 0) {
    parts.push(`\nContext:`)
    parts.push(JSON.stringify(errorDetails.context, null, 2))
  }

  if (errorDetails.duration) {
    parts.push(`\nDuration: ${errorDetails.duration}ms`)
  }

  parts.push(`${"=".repeat(70)}\n`)

  return parts.join("\n")
}

/**
 * Create a step logger for tracking progress through multi-step operations
 */
export class StepLogger {
  private steps: StepLog[] = []
  private currentStep: StepLog | null = null
  private traceId: string

  constructor(traceId: string) {
    this.traceId = traceId
  }

  startStep(step: string, details?: Record<string, any>) {
    if (this.currentStep) {
      this.endStep()
    }

    this.currentStep = {
      step,
      startTime: Date.now(),
      details
    }

    console.log(`[v0] [${this.traceId}] START: ${step}`)
    if (details) {
      console.log(`[v0] [${this.traceId}]   Details:`, JSON.stringify(details, null, 2))
    }
  }

  endStep(success: boolean = true, error?: string) {
    if (!this.currentStep) return

    const duration = Date.now() - this.currentStep.startTime
    this.currentStep.success = success
    this.currentStep.error = error
    this.currentStep.duration = duration

    const status = success ? "✓" : "✗"
    const message = success
      ? `${status} END: ${this.currentStep.step} (${duration}ms)`
      : `${status} FAILED: ${this.currentStep.step} (${duration}ms) - ${error}`

    console.log(`[v0] [${this.traceId}] ${message}`)

    this.steps.push(this.currentStep)
    this.currentStep = null
  }

  logError(error: unknown, stepName?: string) {
    const step = stepName || this.currentStep?.step || "unknown"
    const errorDetails = extractErrorDetails(error, step)
    const formatted = formatErrorDetails(errorDetails)
    console.error(formatted)
    return errorDetails
  }

  getSummary() {
    return {
      traceId: this.traceId,
      totalSteps: this.steps.length,
      successCount: this.steps.filter(s => s.success).length,
      failureCount: this.steps.filter(s => !s.success).length,
      totalDuration: this.steps.reduce((sum, s) => sum + (s.duration || 0), 0),
      steps: this.steps
    }
  }

  getSteps() {
    return this.steps
  }
}

/**
 * Utility to throw error with full context
 */
export function throwDetailedError(message: string, context?: Record<string, any>, code?: string) {
  const error = new Error(message)
  if (context) {
    (error as any).context = context
  }
  if (code) {
    (error as any).code = code
  }
  throw error
}
