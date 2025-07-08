"use client"

import { useState, useEffect } from "react"
import { Copy, Minimize2, Maximize2 } from "lucide-react"

interface LogEntry {
  id: string
  timestamp: string
  level: "log" | "error" | "warn" | "info"
  message: string
  stack?: string
}

export function DebugConsole() {
  const [isMinimized, setIsMinimized] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    // Interceptar console.log, console.error, etc.
    const originalLog = console.log
    const originalError = console.error
    const originalWarn = console.warn
    const originalInfo = console.info

    const addLog = (level: LogEntry["level"], args: any[]) => {
      const message = args
        .map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
        .join(" ")

      const logEntry: LogEntry = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        level,
        message,
        stack: level === "error" && args[0] instanceof Error ? args[0].stack : undefined,
      }

      setLogs((prev) => [...prev.slice(-99), logEntry]) // Manter apenas os últimos 100 logs
    }

    console.log = (...args) => {
      originalLog(...args)
      addLog("log", args)
    }

    console.error = (...args) => {
      originalError(...args)
      addLog("error", args)
    }

    console.warn = (...args) => {
      originalWarn(...args)
      addLog("warn", args)
    }

    console.info = (...args) => {
      originalInfo(...args)
      addLog("info", args)
    }

    // Interceptar erros não capturados
    const handleError = (event: ErrorEvent) => {
      addLog("error", [event.error || event.message])
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      addLog("error", [event.reason])
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    return () => {
      console.log = originalLog
      console.error = originalError
      console.warn = originalWarn
      console.info = originalInfo
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [])

  const copyLogs = async () => {
    const logsText = logs
      .map((log) => `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}${log.stack ? "\n" + log.stack : ""}`)
      .join("\n")

    try {
      await navigator.clipboard.writeText(logsText)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error("Failed to copy logs:", err)
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  const getLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "error":
        return "text-red-400"
      case "warn":
        return "text-yellow-400"
      case "info":
        return "text-blue-400"
      default:
        return "text-gray-300"
    }
  }

  const getLevelBg = (level: LogEntry["level"]) => {
    switch (level) {
      case "error":
        return "bg-red-900/20"
      case "warn":
        return "bg-yellow-900/20"
      case "info":
        return "bg-blue-900/20"
      default:
        return "bg-gray-900/20"
    }
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-[9999] bg-gray-900 border border-gray-700 rounded-lg shadow-xl transition-all duration-300 ${
        isMinimized ? "w-80 h-12" : "w-96 h-80"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-300">Debug Console</span>
          {logs.length > 0 && <span className="text-xs text-gray-500">({logs.length})</span>}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={copyLogs}
            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
            title="Copy all logs"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
            title={isMinimized ? "Maximize" : "Minimize"}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <>
          {/* Controls */}
          <div className="flex items-center justify-between p-2 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <button
                onClick={clearLogs}
                className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
              >
                Clear
              </button>
              {copySuccess && <span className="text-xs text-green-400">Copied!</span>}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                {logs.filter((log) => log.level === "error").length}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                {logs.filter((log) => log.level === "warn").length}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                {logs.filter((log) => log.level === "log").length}
              </span>
            </div>
          </div>

          {/* Logs */}
          <div className="h-56 overflow-y-auto p-2 space-y-1">
            {logs.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">No logs yet</div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`text-xs p-2 rounded ${getLevelBg(log.level)} border-l-2 ${
                    log.level === "error"
                      ? "border-red-400"
                      : log.level === "warn"
                        ? "border-yellow-400"
                        : log.level === "info"
                          ? "border-blue-400"
                          : "border-gray-400"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 shrink-0">{log.timestamp}</span>
                    <span className={`font-medium shrink-0 ${getLevelColor(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                    <span className="text-gray-300 break-all">{log.message}</span>
                  </div>
                  {log.stack && (
                    <pre className="mt-1 text-gray-400 text-xs whitespace-pre-wrap break-all">{log.stack}</pre>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
