"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Terminal,
  X,
  Minimize2,
  Maximize2,
  Trash2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Check,
} from "lucide-react"

interface LogEntry {
  id: string
  timestamp: Date
  message: string
  type: "info" | "warn" | "error" | "success"
  details?: {
    error?: any
    stack?: string
    context?: any
    args?: any[]
  }
}

export function DebugConsole() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())
  const [copiedLogs, setCopiedLogs] = useState<Set<string>>(new Set())
  const logsEndRef = useRef<HTMLDivElement>(null)
  const originalConsole = useRef<{
    log: typeof console.log
    warn: typeof console.warn
    error: typeof console.error
  }>()

  // Scroll to bottom when new logs are added
  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [logs])

  // Intercept console methods with enhanced error details
  useEffect(() => {
    // Store original console methods
    originalConsole.current = {
      log: console.log,
      warn: console.warn,
      error: console.error,
    }

    // Override console methods
    console.log = (...args: any[]) => {
      originalConsole.current?.log(...args)
      const message = args.join(" ")

      // Capture wallet and swap operations
      if (
        message.includes("🔗") ||
        message.includes("🔄") ||
        message.includes("✅") ||
        message.includes("❌") ||
        message.includes("💰") ||
        message.includes("💱") ||
        message.includes("🚀") ||
        message.includes("SWAP") ||
        message.includes("QUOTE") ||
        message.includes("HOLDSTATION")
      ) {
        addLog(message, "info", { args })
      }
    }

    console.warn = (...args: any[]) => {
      originalConsole.current?.warn(...args)
      const message = args.join(" ")

      addLog(message, "warn", {
        args,
        stack: new Error().stack,
      })
    }

    console.error = (...args: any[]) => {
      originalConsole.current?.error(...args)

      let message = ""
      let errorDetails: any = null
      const context: any = {}

      args.forEach((arg, index) => {
        if (arg instanceof Error) {
          errorDetails = {
            name: arg.name,
            message: arg.message,
            stack: arg.stack,
            cause: arg.cause,
          }
          message += `${arg.name}: ${arg.message}`
        } else if (typeof arg === "object" && arg?.message) {
          errorDetails = {
            name: arg.name || "Error",
            message: arg.message,
            stack: arg.stack,
            code: arg.code || arg.status,
            ...arg,
          }
          message += `${arg.name || "Error"}: ${arg.message}`
        } else if (typeof arg === "string") {
          message += arg
        } else {
          context[`arg${index}`] = arg
          message += JSON.stringify(arg, null, 2)
        }
        if (index < args.length - 1) message += " "
      })

      addLog(message, "error", {
        error: errorDetails,
        context,
        stack: errorDetails?.stack || new Error().stack,
        args,
      })
    }

    // Global error handler for unhandled errors
    const handleGlobalError = (event: ErrorEvent) => {
      addLog(`🚨 Global Error: ${event.message}`, "error", {
        error: {
          name: "Global Error",
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
        stack: `${event.filename}:${event.lineno}:${event.colno}`,
      })
    }

    // Unhandled promise rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      let errorDetails: any = null

      if (reason instanceof Error) {
        errorDetails = {
          name: reason.name,
          message: reason.message,
          stack: reason.stack,
        }
      } else if (typeof reason === "object" && reason?.message) {
        errorDetails = reason
      } else {
        errorDetails = {
          name: "Promise Rejection",
          message: String(reason),
        }
      }

      addLog(`🚨 Unhandled Promise Rejection: ${errorDetails.message}`, "error", {
        error: errorDetails,
        context: { reason },
        stack: errorDetails.stack,
      })
    }

    window.addEventListener("error", handleGlobalError)
    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    // Cleanup on unmount
    return () => {
      if (originalConsole.current) {
        console.log = originalConsole.current.log
        console.warn = originalConsole.current.warn
        console.error = originalConsole.current.error
      }

      window.removeEventListener("error", handleGlobalError)
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [])

  const addLog = (message: string, type: LogEntry["type"], details?: LogEntry["details"]) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      message,
      type,
      details,
    }
    setLogs((prev) => [...prev.slice(-99), newLog]) // Keep last 100 logs
  }

  const clearLogs = () => {
    setLogs([])
    setExpandedLogs(new Set())
  }

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs)
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId)
    } else {
      newExpanded.add(logId)
    }
    setExpandedLogs(newExpanded)
  }

  const copyLogToClipboard = async (log: LogEntry) => {
    let copyText = `[${formatTime(log.timestamp)}] ${log.type.toUpperCase()}: ${log.message}\n`

    if (log.details?.error) {
      copyText += `\nError Details:\n`
      copyText += `Type: ${log.details.error.name || "Unknown"}\n`
      copyText += `Message: ${log.details.error.message || "No message"}\n`
      if (log.details.error.code) copyText += `Code: ${log.details.error.code}\n`
      if (log.details.error.cause) copyText += `Cause: ${JSON.stringify(log.details.error.cause)}\n`
    }

    if (log.details?.context && Object.keys(log.details.context).length > 0) {
      copyText += `\nContext:\n${JSON.stringify(log.details.context, null, 2)}\n`
    }

    if (log.details?.stack) {
      copyText += `\nStack Trace:\n${log.details.stack}\n`
    }

    if (log.details?.args && log.details.args.length > 0) {
      copyText += `\nArguments:\n${JSON.stringify(log.details.args, null, 2)}\n`
    }

    try {
      await navigator.clipboard.writeText(copyText)
      setCopiedLogs((prev) => new Set([...prev, log.id]))
      setTimeout(() => {
        setCopiedLogs((prev) => {
          const newSet = new Set(prev)
          newSet.delete(log.id)
          return newSet
        })
      }, 1500)
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
    }
  }

  const handleErrorTriangleClick = async (log: LogEntry) => {
    if (log.type === "error") {
      await copyLogToClipboard(log)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    })
  }

  const getLogColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "info":
        return "text-blue-300"
      case "warn":
        return "text-yellow-300"
      case "error":
        return "text-red-300"
      case "success":
        return "text-green-300"
      default:
        return "text-gray-300"
    }
  }

  const getBorderColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "info":
        return "border-l-blue-500"
      case "warn":
        return "border-l-yellow-500"
      case "error":
        return "border-l-red-500"
      case "success":
        return "border-l-green-500"
      default:
        return "border-l-gray-500"
    }
  }

  const isSwapError = (message: string) => {
    return (
      message.toLowerCase().includes("swap") &&
      (message.toLowerCase().includes("failed") ||
        message.toLowerCase().includes("error") ||
        message.toLowerCase().includes("simulation"))
    )
  }

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-[9999]"
      >
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-full p-3 shadow-lg hover:bg-gray-800/90 transition-colors relative"
        >
          <Terminal className="w-5 h-5 text-green-400" />
          {logs.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {logs.length > 99 ? "99+" : logs.length}
            </span>
          )}
          {logs.some((log) => log.type === "error") && (
            <span className="absolute -bottom-1 -right-1 bg-red-600 rounded-full w-2 h-2 animate-pulse" />
          )}
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      className={`fixed left-4 top-1/2 -translate-y-1/2 z-[9999] bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-lg shadow-2xl ${
        isMinimized ? "w-80 h-10" : "w-[450px] h-[400px]"
      } transition-all duration-300 flex flex-col`}
    >
      {/* Header - More Compact */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-gray-700 shrink-0">
        <div className="flex items-center space-x-1.5">
          <Terminal className="w-3.5 h-3.5 text-green-400" />
          <span className="text-white text-xs font-medium">Debug</span>
          {logs.length > 0 && (
            <div className="flex items-center space-x-1">
              <span className="bg-gray-700 text-gray-300 text-xs px-1.5 py-0.5 rounded-full">{logs.length}</span>
              {logs.filter((log) => log.type === "error").length > 0 && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center space-x-1">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  <span>{logs.filter((log) => log.type === "error").length}</span>
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-0.5">
          <button
            onClick={clearLogs}
            className="p-1 text-gray-400 hover:text-white transition-colors rounded"
            title="Clear logs"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-gray-400 hover:text-white transition-colors rounded"
            title={isMinimized ? "Maximize" : "Minimize"}
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-gray-400 hover:text-white transition-colors rounded"
            title="Close"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Logs - More Compact */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex-1 overflow-y-auto p-1.5 space-y-1 min-h-0"
          >
            {logs.length === 0 ? (
              <div className="text-gray-500 text-xs text-center py-6">No debug logs yet...</div>
            ) : (
              logs.map((log) => {
                const isExpanded = expandedLogs.has(log.id)
                const hasDetails = log.details && (log.details.error || log.details.stack || log.details.context)
                const isSwapRelated = isSwapError(log.message)

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`text-xs font-mono leading-tight border-l-2 ${getBorderColor(log.type)} ${
                      isSwapRelated ? "bg-red-900/20" : "bg-gray-800/30"
                    } rounded-r p-1.5`}
                  >
                    {/* Compact Header */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-gray-500 text-xs">{formatTime(log.timestamp).slice(0, 8)}</span>
                        {log.type === "error" && (
                          <button
                            onClick={() => handleErrorTriangleClick(log)}
                            className="p-0.5 text-red-400 hover:text-red-300 transition-colors rounded"
                            title="Click to copy error details"
                          >
                            {copiedLogs.has(log.id) ? (
                              <Check className="w-3 h-3 text-green-400" />
                            ) : (
                              <AlertTriangle className="w-3 h-3" />
                            )}
                          </button>
                        )}
                        {isSwapRelated && (
                          <span className="bg-red-600 text-white text-xs px-1 py-0.5 rounded">SWAP</span>
                        )}
                      </div>
                      {hasDetails && (
                        <button
                          onClick={() => toggleLogExpansion(log.id)}
                          className="p-0.5 text-gray-400 hover:text-white transition-colors"
                        >
                          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                      )}
                    </div>

                    {/* Compact Message */}
                    <div className={`${getLogColor(log.type)} break-words text-xs leading-tight`}>
                      {log.message.length > 100 ? `${log.message.slice(0, 100)}...` : log.message}
                    </div>

                    {/* Compact Error Details */}
                    {log.details?.error && (
                      <div className="mt-1 p-1.5 bg-red-900/40 rounded border border-red-700/50">
                        <div className="text-red-300 font-semibold text-xs">Error:</div>
                        <div className="text-red-200 text-xs mt-0.5">
                          {log.details.error.name && <span className="font-medium">{log.details.error.name}: </span>}
                          {log.details.error.message}
                        </div>
                      </div>
                    )}

                    {/* Expanded Details - Compact */}
                    {isExpanded && (
                      <div className="mt-1 space-y-1">
                        {log.details?.context && Object.keys(log.details.context).length > 0 && (
                          <div className="p-1.5 bg-blue-900/20 rounded border border-blue-700/50">
                            <div className="text-blue-300 font-semibold text-xs">Context:</div>
                            <pre className="text-blue-200 text-xs mt-0.5 overflow-x-auto max-h-20">
                              {JSON.stringify(log.details.context, null, 2)}
                            </pre>
                          </div>
                        )}

                        {log.details?.stack && (
                          <div className="p-1.5 bg-gray-800 rounded border border-gray-600">
                            <div className="text-gray-300 font-semibold text-xs">Stack:</div>
                            <pre className="text-gray-400 text-xs mt-0.5 overflow-x-auto whitespace-pre-wrap max-h-20">
                              {log.details.stack.split("\n").slice(0, 5).join("\n")}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )
              })
            )}
            <div ref={logsEndRef} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
