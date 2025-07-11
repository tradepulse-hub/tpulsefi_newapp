"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Terminal, X, Minimize2, Maximize2, Trash2 } from "lucide-react"

interface LogEntry {
  id: string
  timestamp: Date
  level: "info" | "warn" | "error" | "success"
  message: string
  data?: any
}

export function DebugConsole() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const logsEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [logs])

  useEffect(() => {
    // Override console methods to capture logs
    const originalLog = console.log
    const originalWarn = console.warn
    const originalError = console.error

    console.log = (...args) => {
      originalLog(...args)
      const message = args
        .map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
        .join(" ")

      if (
        message.includes("🔄") ||
        message.includes("✅") ||
        message.includes("❌") ||
        message.includes("💰") ||
        message.includes("💱") ||
        message.includes("🔗") ||
        message.includes("🚀")
      ) {
        addLog("info", message, args.length > 1 ? args.slice(1) : undefined)
      }
    }

    console.warn = (...args) => {
      originalWarn(...args)
      const message = args
        .map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
        .join(" ")
      addLog("warn", message, args.length > 1 ? args.slice(1) : undefined)
    }

    console.error = (...args) => {
      originalError(...args)
      const message = args
        .map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
        .join(" ")
      addLog("error", message, args.length > 1 ? args.slice(1) : undefined)
    }

    return () => {
      console.log = originalLog
      console.warn = originalWarn
      console.error = originalError
    }
  }, [])

  const addLog = (level: LogEntry["level"], message: string, data?: any) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      level,
      message,
      data,
    }
    setLogs((prev) => [...prev.slice(-99), newLog]) // Keep only last 100 logs
  }

  const clearLogs = () => {
    setLogs([])
  }

  const getLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "info":
        return "text-blue-400"
      case "warn":
        return "text-yellow-400"
      case "error":
        return "text-red-400"
      case "success":
        return "text-green-400"
      default:
        return "text-gray-400"
    }
  }

  const getLevelBg = (level: LogEntry["level"]) => {
    switch (level) {
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-[9999] bg-gray-900/90 backdrop-blur-sm border border-gray-600/50 rounded-full p-3 shadow-2xl hover:bg-gray-800/90 transition-all duration-200"
        title="Open Debug Console"
      >
        <Terminal className="w-5 h-5 text-green-400" />
        {logs.length > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {logs.length > 99 ? "99+" : logs.length}
          </div>
        )}
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-4 left-4 z-[9999] bg-gray-900/95 backdrop-blur-xl border border-gray-600/50 rounded-lg shadow-2xl ${
        isMinimized ? "w-80 h-12" : "w-96 h-80"
      } transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-600/30">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-green-400" />
          <span className="text-white text-sm font-medium">Debug Console</span>
          {logs.length > 0 && (
            <span className="bg-gray-700/50 text-gray-300 text-xs px-2 py-0.5 rounded-full">{logs.length}</span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={clearLogs}
            className="p-1 text-gray-400 hover:text-white transition-colors rounded hover:bg-gray-700/50"
            title="Clear logs"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-gray-400 hover:text-white transition-colors rounded hover:bg-gray-700/50"
            title={isMinimized ? "Maximize" : "Minimize"}
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-gray-400 hover:text-white transition-colors rounded hover:bg-gray-700/50"
            title="Close"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex-1 overflow-hidden"
          >
            <div className="h-64 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              {logs.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">No logs yet...</div>
              ) : (
                logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`text-xs p-2 rounded border ${getLevelBg(log.level)} ${getLevelColor(log.level)}`}
                  >
                    <div className="flex items-start space-x-2">
                      <span className="text-gray-500 font-mono text-[10px] flex-shrink-0">
                        {formatTime(log.timestamp)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="break-words">{log.message}</div>
                        {log.data && (
                          <pre className="mt-1 text-[10px] text-gray-400 overflow-x-auto">
                            {typeof log.data === "object" ? JSON.stringify(log.data, null, 2) : String(log.data)}
                          </pre>
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
