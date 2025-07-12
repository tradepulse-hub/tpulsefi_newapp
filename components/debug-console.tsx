"use client"

import { useState, useEffect } from "react"
import { Terminal, Minus, Trash2, Copy, Check } from "lucide-react"

interface LogEntry {
  id: string
  timestamp: string
  message: string
  type: "info" | "error" | "success" | "warning"
  emoji: string
}

export default function DebugConsole() {
  const [isMinimized, setIsMinimized] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Override console methods to capture logs
    const originalLog = console.log
    const originalError = console.error
    const originalWarn = console.warn

    const addLog = (message: string, type: "info" | "error" | "success" | "warning", emoji: string) => {
      const logEntry: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        message: typeof message === "object" ? JSON.stringify(message, null, 2) : String(message),
        type,
        emoji,
      }

      setLogs((prev) => [...prev.slice(-49), logEntry]) // Keep last 50 logs
    }

    console.log = (...args) => {
      const message = args.join(" ")
      let emoji = "📝"
      let type: "info" | "error" | "success" | "warning" = "info"

      // Categorize logs based on content
      if (message.includes("✅") || message.includes("successful") || message.includes("completed")) {
        emoji = "✅"
        type = "success"
      } else if (message.includes("❌") || message.includes("error") || message.includes("failed")) {
        emoji = "❌"
        type = "error"
      } else if (message.includes("🔄") || message.includes("Getting") || message.includes("Starting")) {
        emoji = "🔄"
        type = "info"
      } else if (message.includes("💰") || message.includes("Amount") || message.includes("Balance")) {
        emoji = "💰"
        type = "info"
      } else if (message.includes("🚀") || message.includes("Executing") || message.includes("swap")) {
        emoji = "🚀"
        type = "info"
      } else if (message.includes("🔗") || message.includes("contract") || message.includes("Transaction")) {
        emoji = "🔗"
        type = "info"
      } else if (message.includes("🧪") || message.includes("Testing") || message.includes("Debug")) {
        emoji = "🧪"
        type = "info"
      } else if (message.includes("💱") || message.includes("Quote") || message.includes("Updated")) {
        emoji = "💱"
        type = "success"
      } else if (message.includes("🔍") || message.includes("Fetching") || message.includes("Validating")) {
        emoji = "🔍"
        type = "info"
      } else if (message.includes("📋") || message.includes("Using") || message.includes("Provider")) {
        emoji = "📋"
        type = "info"
      }

      addLog(message, type, emoji)
      originalLog.apply(console, args)
    }

    console.error = (...args) => {
      const message = args.join(" ")
      addLog(message, "error", "❌")
      originalError.apply(console, args)
    }

    console.warn = (...args) => {
      const message = args.join(" ")
      addLog(message, "warning", "⚠️")
      originalWarn.apply(console, args)
    }

    // Cleanup
    return () => {
      console.log = originalLog
      console.error = originalError
      console.warn = originalWarn
    }
  }, [])

  const clearLogs = () => {
    setLogs([])
  }

  const copyLogs = async () => {
    const logsText = logs.map((log) => `[${log.timestamp}] ${log.emoji} ${log.message}`).join("\n")

    try {
      await navigator.clipboard.writeText(logsText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy logs:", err)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-600"
      case "error":
        return "text-red-600"
      case "warning":
        return "text-yellow-600"
      default:
        return "text-blue-600"
    }
  }

  if (isMinimized) {
    return (
      <div className="fixed top-20 left-4 z-40">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-black/80 text-white border border-gray-600 hover:bg-black/90 px-3 py-2 rounded-lg text-sm flex items-center gap-2"
        >
          <Terminal className="w-4 h-4" />
          Debug ({logs.length})
        </button>
      </div>
    )
  }

  return (
    <div className="fixed top-20 left-4 z-40 w-96 max-h-96">
      <div className="bg-black/90 text-white border border-gray-600 rounded-lg">
        <div className="p-3 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Debug Console
              <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">{logs.length}</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={copyLogs}
                disabled={logs.length === 0}
                className="h-6 w-6 p-0 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                title="Copy all logs"
              >
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              </button>
              <button onClick={clearLogs} className="h-6 w-6 p-0 text-gray-400 hover:text-white" title="Clear logs">
                <Trash2 className="w-3 h-3" />
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                title="Minimize"
              >
                <Minus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-2">
          <div className="h-64 overflow-y-auto">
            <div className="space-y-1">
              {logs.length === 0 ? (
                <div className="text-gray-400 text-xs text-center py-4">
                  No logs yet. Interact with the wallet to see debug information.
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="text-xs p-2 rounded bg-gray-800/50 border border-gray-700">
                    <div className="flex items-start gap-2">
                      <span className="text-lg leading-none">{log.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-400 text-xs">{log.timestamp}</span>
                          <span
                            className={`text-xs px-1 py-0.5 rounded border ${getTypeColor(log.type)} border-current`}
                          >
                            {log.type}
                          </span>
                        </div>
                        <div className="text-white break-words whitespace-pre-wrap">{log.message}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
