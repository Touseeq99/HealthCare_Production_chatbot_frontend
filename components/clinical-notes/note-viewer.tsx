"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Copy, Check, Printer, AlertTriangle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { GenerateResponse } from "./types"

interface NoteViewerProps {
  result: GenerateResponse
  onClose: () => void
}

export function NoteViewer({ result, onClose }: NoteViewerProps) {
  const [copied, setCopied] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const handleCopy = () => {
    navigator.clipboard.writeText(result.generated_note).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handlePrint = () => {
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>${result.output_type} — ${result.note_type}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; color: #1e293b; line-height: 1.6; }
            h1 { color: #be123c; border-bottom: 2px solid #be123c; padding-bottom: 8px; }
            pre { white-space: pre-wrap; font-family: Arial, sans-serif; }
            .disclaimer { background: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 8px; color: #991b1b; font-size: 12px; margin-top: 24px; }
            .warning { background: #fffbeb; border: 1px solid #fde68a; padding: 8px 12px; border-radius: 8px; color: #92400e; font-size: 12px; margin: 8px 0; }
          </style>
        </head>
        <body>
          <h1>${result.output_type.replace(/_/g, " ")}</h1>
          ${result.warnings.map(w => `<div class="warning">⚠️ ${w}</div>`).join("")}
          <pre>${result.generated_note}</pre>
          <div class="disclaimer">⚕️ ${result.disclaimer}</div>
        </body>
      </html>
    `)
    win.document.close()
    win.print()
  }

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const outputLabel =
    result.output_type === "CLINICAL_NOTE"
      ? "📄 Clinical Note"
      : result.output_type === "HANDOVER_NOTE"
      ? "🔄 Handover Note"
      : "📧 Discharge Letter"

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100 bg-rose-50/50 shrink-0">
          <div>
            <h2 className="font-black text-rose-950 text-lg uppercase tracking-tight">
              {outputLabel}
            </h2>
            <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-0.5">
              {result.note_type} · AI Generated
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="space-y-2">
              {result.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-xs font-bold text-amber-800">{w}</span>
                </div>
              ))}
            </div>
          )}

          {/* Sections accordion */}
          {Object.keys(result.sections).length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">
                Expandable Sections
              </p>
              {Object.entries(result.sections).map(([title, content]) => {
                const isOpen = expandedSections.has(title)
                return (
                  <div key={title} className="border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection(title)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-rose-50 transition-all text-left"
                    >
                      <span className="text-xs font-black uppercase tracking-wide text-slate-700">
                        {title}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-3.5 h-3.5 text-rose-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 py-3 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap border-t border-slate-100">
                            {content}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          )}

          {/* Full Note */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-2">
              Full Note
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <pre className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
                {result.generated_note}
              </pre>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="text-xs text-red-700 leading-relaxed">{result.disclaimer}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
