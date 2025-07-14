"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Terminal,
  X,
  Minimize2,
  Maximize2,
  Trash2,
  Download,
  Filter,
  Search,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Zap,
} from "lucide-react"

interface LogEntry {
  id: string
  timestamp: Date
  message: string
  type: "info" | "warn" | "error" | "success" | "debug" | "performance"
  category?: string
  stackTrace?: string
  context?: Record<string, any>
  duration?: number
  source?: string
}

interface ErrorDetails {
  name: string
  message: string
  stack?: string
  cause?: any
  code?: string | number
}

export function DebugConsole() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(
    new Set(["info", "warn", "error", "success", "debug", "performance"]),
  )
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const originalConsole = useRef<{
    log: typeof console.log
    warn: typeof console.warn
    error: typeof console.error
    debug: typeof console.debug
    time: typeof console.time
    timeEnd: typeof console.timeEnd
  }>()
  const performanceTimers = useRef<Map<string, number>>(new Map())

  // Scroll to bottom when new logs are added
  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [filteredLogs])

  // Filter logs based on selected types and search term
  useEffect(() => {
    let filtered = logs.filter((log) => selectedTypes.has(log.type))

    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.source?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredLogs(filtered)
  }, [logs, selectedTypes, searchTerm])

  // Enhanced error parsing
  const parseError = (error: any): ErrorDetails => {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
      }
    }

    if (typeof error === "object" && error !== null) {
      return {
        name: error.name || "Unknown Error",
        message: error.message || JSON.stringify(error),
        stack: error.stack,
        code: error.code || error.status,
      }
    }

    return {
      name: "Error",
      message: String(error),
    }
  }

  // Extract category from message
  const extractCategory = (message: string): string => {
    if (message.includes("🔗 BLOCKCHAIN")) return "Blockchain"
    if (message.includes("💰 WALLET")) return "Wallet"
    if (message.includes("💱 SWAP")) return "Swap"
    if (message.includes("📊 PRICE")) return "Price"
    if (message.includes("🔄 API")) return "API"
    if (message.includes("🚀 MINIKIT")) return "MiniKit"
    if (message.includes("🌐 I18N")) return "Translation"
    if (message.includes("📈 CHART")) return "Chart"
    if (message.includes("🔐 AUTH")) return "Auth"
    if (message.includes("💾 STORAGE")) return "Storage"
    return "General"
  }

  // Extract source from stack trace
  const extractSource = (stack?: string): string => {
    if (!stack) return "Unknown"

    const lines = stack.split("\n")
    for (const line of lines) {
      if (line.includes(".tsx") || line.includes(".ts")) {
        const match = line.match(/([^/\\]+\.(tsx?|jsx?))/)
        if (match) return match[1]
      }
    }
    return "Unknown"
  }

  // Intercept console methods with enhanced logging
  useEffect(() => {
    // Store original console methods
    originalConsole.current = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
      time: console.time,
      timeEnd: console.timeEnd,
    }

    // Override console methods
    console.log = (...args: any[]) => {
      originalConsole.current?.log(...args)
      const message = args.join(" ")

      if (
        message.includes("🔗") ||
        message.includes("🔄") ||
        message.includes("✅") ||
        message.includes("❌") ||
        message.includes("💰") ||
        message.includes("💱") ||
        message.includes("🚀") ||
        message.includes("📊") ||
        message.includes("🌐") ||
        message.includes("📈") ||
        message.includes("🔐") ||
        message.includes("💾")
      ) {
        addLog(message, "info", { args })
      }
    }

    console.warn = (...args: any[]) => {
      originalConsole.current?.warn(...args)
      const message = args.join(" ")

      addLog(message, "warn", {
        args,
        warning: true,
        stack: new Error().stack,
      })
    }

    console.error = (...args: any[]) => {
      originalConsole.current?.error(...args)

      let message = ""
      let errorDetails: ErrorDetails | null = null
      const context: any = {}

      args.forEach((arg, index) => {
        if (arg instanceof Error || (typeof arg === "object" && arg?.message)) {
          errorDetails = parseError(arg)
          message += `${errorDetails.name}: ${errorDetails.message}`
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
      })
    }

    console.debug = (...args: any[]) => {
      originalConsole.current?.debug(...args)
      const message = args.join(" ")

      addLog(message, "debug", {
        args,
        stack: new Error().stack,
      })
    }

    // Performance timing
    console.time = (label?: string) => {
      originalConsole.current?.time(label)
      if (label) {
        performanceTimers.current.set(label, performance.now())
      }
    }

    console.timeEnd = (label?: string) => {
      originalConsole.current?.timeEnd(label)
      if (label && performanceTimers.current.has(label)) {
        const startTime = performanceTimers.current.get(label)!
        const duration = performance.now() - startTime
        performanceTimers.current.delete(label)

        addLog(`⏱️ ${label}: ${duration.toFixed(2)}ms`, "performance", {
          duration,
          label,
        })
      }
    }

    // Global error handler
    const handleGlobalError = (event: ErrorEvent) => {
      const errorDetails = parseError(
        event.error || {
          name: "Global Error",
          message: event.message,
          stack: `${event.filename}:${event.lineno}:${event.colno}`,
        },
      )

      addLog(`🚨 Global Error: ${errorDetails.message}`, "error", {
        error: errorDetails,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: errorDetails.stack,
      })
    }

    // Unhandled promise rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorDetails = parseError(event.reason)

      addLog(`🚨 Unhandled Promise Rejection: ${errorDetails.message}`, "error", {
        error: errorDetails,
        reason: event.reason,
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
        console.debug = originalConsole.current.debug
        console.time = originalConsole.current.time
        console.timeEnd = originalConsole.current.timeEnd
      }

      window.removeEventListener("error", handleGlobalError)
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [])

  const addLog = (message: string, type: LogEntry["type"], context?: any) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      message,
      type,
      category: extractCategory(message),
      stackTrace: context?.stack,
      context: context,
      duration: context?.duration,
      source: extractSource(context?.stack),
    }
    setLogs((prev) => [...prev.slice(-199), newLog]) // Keep last 200 logs
  }

  const clearLogs = () => {
    setLogs([])
    setFilteredLogs([])
  }

  const exportLogs = () => {
    const logData = {
      timestamp: new Date().toISOString(),
      logs: logs.map((log) => ({
        ...log,
        timestamp: log.timestamp.toISOString(),
      })),
    }

    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `debug-logs-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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

  const getLogIcon = (type: LogEntry["type"]) => {
    switch (type) {
      case "info":
        return <Info className="w-3 h-3" />
      case "warn":
        return <AlertTriangle className="w-3 h-3" />
      case "error":
        return <XCircle className="w-3 h-3" />
      case "success":
        return <CheckCircle className="w-3 h-3" />
      case "debug":
        return <Terminal className="w-3 h-3" />
      case "performance":
        return <Zap className="w-3 h-3" />
      default:
        return <Info className="w-3 h-3" />
    }
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
      case "debug":
        return "text-purple-300"
      case "performance":
        return "text-orange-300"
      default:
        return "text-gray-300"
    }
  }

  const getBgColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "info":
        return "bg-blue-900/20"
      case "warn":
        return "bg-yellow-900/20"
      case "error":
        return "bg-red-900/20"
      case "success":
        return "bg-green-900/20"
      case "debug":
        return "bg-purple-900/20"
      case "performance":
        return "bg-orange-900/20"
      default:
        return "bg-gray-900/20"
    }
  }

  const toggleTypeFilter = (type: string) => {
    const newSelected = new Set(selectedTypes)
    if (newSelected.has(type)) {
      newSelected.delete(type)
    } else {
      newSelected.add(type)
    }
    setSelectedTypes(newSelected)
  }

  const logTypeCounts = logs.reduce(
    (acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

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
        isMinimized ? "w-96 h-12" : "w-[500px] h-[600px]"
      } transition-all duration-300 flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700 shrink-0">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-green-400" />
          <span className="text-white text-sm font-medium">Debug Console</span>
          {logs.length > 0 && (
            <div className="flex items-center space-x-1">
              <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">{logs.length}</span>
              {logTypeCounts.error > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {logTypeCounts.error} errors
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1 transition-colors rounded ${showFilters ? "text-blue-400" : "text-gray-400 hover:text-white"}`}
            title="Toggle filters"
          >
            <Filter className="w-3 h-3" />
          </button>
          <button
            onClick={exportLogs}
            className="p-1 text-gray-400 hover:text-white transition-colors rounded"
            title="Export logs"
          >
            <Download className="w-3 h-3" />
          </button>
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

      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* Filters */}
            {showFilters && (
              <div className="p-3 border-b border-gray-700 space-y-2">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-7 pr-3 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Type filters */}
                <div className="flex flex-wrap gap-1">
                  {["info", "warn", "error", "success", "debug", "performance"].map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleTypeFilter(type)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        selectedTypes.has(type)
                          ? `${getBgColor(type as LogEntry["type"])} ${getLogColor(type as LogEntry["type"])} border border-current`
                          : "bg-gray-700 text-gray-400 hover:text-white"
                      }`}
                    >
                      {type} {logTypeCounts[type] ? `(${logTypeCounts[type]})` : ""}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Logs */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0">
              {filteredLogs.length === 0 ? (
                <div className="text-gray-500 text-xs text-center py-8">
                  {logs.length === 0 ? "No debug logs yet..." : "No logs match current filters"}
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`text-xs font-mono leading-relaxed p-2 rounded ${getBgColor(log.type)} border-l-2 ${
                      log.type === "error"
                        ? "border-red-500"
                        : log.type === "warn"
                          ? "border-yellow-500"
                          : log.type === "success"
                            ? "border-green-500"
                            : log.type === "performance"
                              ? "border-orange-500"
                              : "border-blue-500"
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <div className={`${getLogColor(log.type)} mt-0.5`}>{getLogIcon(log.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-gray-500">[{formatTime(log.timestamp)}]</span>
                          {log.category && (
                            <span className="bg-gray-700 text-gray-300 px-1 py-0.5 rounded text-xs">
                              {log.category}
                            </span>
                          )}
                          {log.source && log.source !== "Unknown" && (
                            <span className="text-gray-400 text-xs">{log.source}</span>
                          )}
                          {log.duration && <span className="text-orange-400 text-xs">{log.duration.toFixed(2)}ms</span>}
                        </div>
                        <div className={`${getLogColor(log.type)} break-words`}>{log.message}</div>

                        {/* Error details */}
                        {log.context?.error && (
                          <div className="mt-2 p-2 bg-red-900/30 rounded border border-red-700/50">
                            <div className="text-red-300 font-semibold">Error Details:</div>
                            <div className="text-red-200 text-xs mt-1">
                              <div>
                                <strong>Name:</strong> {log.context.error.name}
                              </div>
                              <div>
                                <strong>Message:</strong> {log.context.error.message}
                              </div>
                              {log.context.error.code && (
                                <div>
                                  <strong>Code:</strong> {log.context.error.code}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Stack trace */}
                        {log.stackTrace && log.type === "error" && (
                          <details className="mt-2">
                            <summary className="text-gray-400 cursor-pointer hover:text-white">Stack Trace</summary>
                            <pre className="text-xs text-gray-300 mt-1 p-2 bg-gray-800 rounded overflow-x-auto">
                              {log.stackTrace}
                            </pre>
                          </details>
                        )}

                        {/* Context */}
                        {log.context && Object.keys(log.context).length > 0 && log.type === "error" && (
                          <details className="mt-2">
                            <summary className="text-gray-400 cursor-pointer hover:text-white">Context</summary>
                            <pre className="text-xs text-gray-300 mt-1 p-2 bg-gray-800 rounded overflow-x-auto">
                              {JSON.stringify(log.context, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
