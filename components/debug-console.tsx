"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Terminal, X, Trash2, ChevronUp, ChevronDown } from "lucide-react"

interface LogEntry {
  id: string
  timestamp: Date
  message: string
  type: "info" | "warn" | "error" | "success"
}

export function DebugConsole() {
  const [isOpen, setIsOpen] = useState(true) // Start open by default
  const [isMinimized, setIsMinimized] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
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

  // Intercept console methods
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

      // Capture ALL logs that contain wallet/swap related emojis
      if (
        message.includes("🔗") ||
        message.includes("🔄") ||
        message.includes("✅") ||
        message.includes("❌") ||
        message.includes("💰") ||
        message.includes("💱") ||
        message.includes("🚀") ||
        message.includes("🧪") ||
        message.includes("🎯") ||
        message.includes("⚠️") ||
        message.includes("🟡") ||
        message.includes("🔴")
      ) {
        addLog(message, "info")
      }
    }

    console.warn = (...args: any[]) => {
      originalConsole.current?.warn(...args)
      const message = args.join(" ")
      addLog(message, "warn")
    }

    console.error = (...args: any[]) => {
      originalConsole.current?.error(...args)
      const message = args.join(" ")
      addLog(message, "error")
    }

    // Add initial log
    addLog("🔗 Debug Console initialized", "success")

    // Cleanup on unmount
    return () => {
      if (originalConsole.current) {
        console.log = originalConsole.current.log
        console.warn = originalConsole.current.warn
        console.error = originalConsole.current.error
      }
    }
  }, [])

  const addLog = (message: string, type: LogEntry["type"]) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      message,
      type,
    }
    setLogs((prev) => [...prev.slice(-99), newLog]) // Keep last 100 logs
  }

  const clearLogs = () => {
    setLogs([])
    addLog("🔗 Debug Console cleared", "info")
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
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

  const getLogBg = (type: LogEntry["type"]) => {
    switch (type) {
      case "info":
        return "bg-blue-500/10 border-blue-500/20"
      case "warn":
        return "bg-yellow-500/10 border-yellow-500/20"
      case "error":
        return "bg-red-500/10 border-red-500/20"
      case "success":
        return "bg-green-500/10 border-green-500/20"
      default:
        return "bg-gray-500/10 border-gray-500/20"
    }
  }

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-4 left-4 z-[9999]"
      >
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-full p-3 shadow-lg hover:bg-gray-800/90 transition-colors relative group"
        >
          <Terminal className="w-5 h-5 text-green-400" />
          {logs.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {logs.length > 99 ? "99+" : logs.length}
            </span>
          )}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Debug Console ({logs.length} logs)
          </div>
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-4 left-4 z-[9999] bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-lg shadow-2xl ${
        isMinimized ? "w-80 h-12" : "w-96 h-96"
      } transition-all duration-300 flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800/50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-green-400" />
          <span className="text-white text-sm font-medium">Debug Console</span>
          {logs.length > 0 && (
            <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">{logs.length}</span>
          )}
        </div>
        <div className="flex items-center space-x-1">
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
            {isMinimized ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
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

      {/* Logs */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex-1 overflow-y-auto p-2 space-y-1 bg-black/20"
          >
            {logs.length === 0 ? (
              <div className="text-gray-500 text-xs text-center py-8">
                <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Waiting for debug logs...</p>
                <p className="text-xs mt-1 opacity-70">Wallet operations will appear here</p>
              </div>
            ) : (
              logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`text-xs font-mono leading-relaxed p-2 rounded border ${getLogBg(log.type)}`}
                >
                  <div className="flex items-start space-x-2">
                    <span className="text-gray-500 text-xs flex-shrink-0">[{formatTime(log.timestamp)}]</span>
                    <span className={`${getLogColor(log.type)} flex-1 break-words`}>{log.message}</span>
                  </div>
                </motion.div>
              ))
            )}
            <div ref={logsEndRef} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Bar */}
      {!isMinimized && (
        <div className="px-3 py-1 bg-gray-800/30 border-t border-gray-700 rounded-b-lg">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Ready for debugging</span>
            <span>{logs.length} logs</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}
