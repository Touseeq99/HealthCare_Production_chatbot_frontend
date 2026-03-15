"use client"

import { useState, useEffect, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Save, ChevronDown, FileText, ArrowLeftRight, Mail,
  Loader2, CheckCircle, AlertTriangle, Heart
} from "lucide-react"
import { cn } from "@/lib/utils"
import apiClient from "@/lib/api-client"

import { PatientList } from "./patient-list"
import { PatientFormWizard } from "./patient-form-wizard"
import { NoteViewer } from "./note-viewer"
import {
  PatientClinicalData,
  PatientListItem,
  GenerateResponse,
  OutputType,
  defaultPatientData,
} from "./types"

type ToastType = "success" | "error" | "info"
interface Toast { id: number; message: string; type: ToastType }

function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([])
  let nextId = 0
  const show = useCallback((message: string, type: ToastType = "info") => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])
  return { toasts, show }
}

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 10, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-3 shadow-xl text-xs font-bold text-white pointer-events-auto",
              t.type === "success" && "bg-emerald-600",
              t.type === "error" && "bg-red-600",
              t.type === "info" && "bg-slate-700"
            )}
          >
            {t.type === "success" && <CheckCircle className="w-4 h-4 shrink-0" />}
            {t.type === "error" && <AlertTriangle className="w-4 h-4 shrink-0" />}
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export function ClinicalNotes() {
  // ── State ────────────────────────────────────────────────────────────────
  const [patients, setPatients] = useState<PatientListItem[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [recordId, setRecordId] = useState<string | null>(null)
  const [form, setForm] = useState<PatientClinicalData>(defaultPatientData())
  const [isLoadingPatients, setIsLoadingPatients] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateDropdownOpen, setGenerateDropdownOpen] = useState(false)
  const [noteResult, setNoteResult] = useState<GenerateResponse | null>(null)
  const { toasts, show: toast } = useToasts()

  // ── Load patient list ────────────────────────────────────────────────────
  const fetchPatients = useCallback(async () => {
    setIsLoadingPatients(true)
    try {
      const res = await apiClient.get("/proxy/clinical-note/patients")
      setPatients(res.data.patients ?? [])
    } catch {
      // silently fail — list stays empty
    } finally {
      setIsLoadingPatients(false)
    }
  }, [])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  // ── Load single patient ──────────────────────────────────────────────────
  const loadPatient = async (id: string) => {
    setSelectedPatientId(id)
    try {
      const res = await apiClient.get(`/proxy/clinical-note/patients/${id}`)
      const record = res.data
      setRecordId(record.id ?? id)
      setForm(record.patient_data ?? defaultPatientData())
    } catch {
      toast("Failed to load patient record.", "error")
    }
  }

  // ── New Patient ──────────────────────────────────────────────────────────
  const handleNewPatient = () => {
    setSelectedPatientId(null)
    setRecordId(null)
    setForm(defaultPatientData())
    setNoteResult(null)
  }

  // ── Save Patient ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.patient_identification.initials.trim()) {
      toast("Patient initials are required.", "error")
      return
    }
    setIsSaving(true)
    try {
      const res = await apiClient.post("/proxy/clinical-note/save-patient", {
        patient_data: form,
        record_id: recordId ?? null,
      })
      const newId = res.data.record_id
      setRecordId(newId)
      setSelectedPatientId(newId)
      toast("Patient record saved successfully.", "success")
      await fetchPatients()
    } catch {
      toast("Failed to save patient record.", "error")
    } finally {
      setIsSaving(false)
    }
  }

  // ── Generate Document ────────────────────────────────────────────────────
  const handleGenerate = async (outputType: OutputType) => {
    setGenerateDropdownOpen(false)
    setIsGenerating(true)
    setNoteResult(null)
    try {
      const res = await apiClient.post("/proxy/clinical-note/generate", {
        output_type: outputType,
        patient_data: form,
        record_id: recordId ?? null,
      })
      setNoteResult(res.data)
    } catch {
      toast("Document generation failed. Please retry.", "error")
    } finally {
      setIsGenerating(false)
    }
  }

  // ── Persist draft to localStorage ─────────────────────────────────────--
  useEffect(() => {
    const key = `cn-draft-${recordId ?? "new"}`
    localStorage.setItem(key, JSON.stringify(form))
  }, [form, recordId])

  // ── Restore draft ─────────────────────────────────────────────────────--
  useEffect(() => {
    if (selectedPatientId) return // loaded from API, don't override
    const key = "cn-draft-new"
    try {
      const saved = localStorage.getItem(key)
      if (saved) setForm(JSON.parse(saved))
    } catch { /* ignore */ }
  }, []) // eslint-disable-line

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full bg-slate-50 overflow-hidden">
      {/* ── Patient Sidebar ──────────────────────────────────────────────── */}
      <div className="w-64 shrink-0 flex flex-col h-full border-r border-rose-100 bg-white">
        <PatientList
          patients={patients}
          selectedId={selectedPatientId}
          isLoading={isLoadingPatients}
          onSelect={loadPatient}
          onNewPatient={handleNewPatient}
        />
      </div>

      {/* ── Main Area ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Action Bar */}
        <div className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-rose-100 bg-white/90 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center shadow-md shadow-rose-500/20">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black text-rose-950 uppercase tracking-tight">
                Clinical Notes
                <span className="ml-2 text-[9px] font-bold text-rose-400 border border-rose-200 rounded-full px-2 py-0.5 normal-case tracking-widest">
                  Cardiology Edition
                </span>
              </h1>
              {form.patient_identification.initials && (
                <p className="text-[10px] text-slate-400 font-bold">
                  {form.patient_identification.initials}
                  {form.patient_identification.mrn ? ` · ${form.patient_identification.mrn}` : ""}
                  {recordId ? " · Saved" : " · Unsaved draft"}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-wider text-slate-700 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {isSaving ? "Saving…" : "Save Patient"}
            </button>

            {/* Generate Dropdown */}
            <div className="relative">
              <button
                onClick={() => setGenerateDropdownOpen((o) => !o)}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
              >
                {isGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileText className="w-3.5 h-3.5" />
                )}
                {isGenerating ? "Generating…" : "Generate"}
                {!isGenerating && <ChevronDown className="w-3 h-3" />}
              </button>

              <AnimatePresence>
                {generateDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-rose-100 overflow-hidden z-50"
                  >
                    {[
                      { type: "CLINICAL_NOTE" as OutputType, icon: "📄", label: "Clinical Note" },
                      { type: "HANDOVER_NOTE" as OutputType, icon: "🔄", label: "Handover Note" },
                      { type: "DISCHARGE_LETTER" as OutputType, icon: "📧", label: "Discharge Letter" },
                    ].map(({ type, icon, label }) => (
                      <button
                        key={type}
                        onClick={() => handleGenerate(type)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-all text-left border-b border-slate-100 last:border-0"
                      >
                        <span className="text-base">{icon}</span>
                        {label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Click-away overlay */}
              {generateDropdownOpen && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setGenerateDropdownOpen(false)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Form Wizard */}
        <div className="flex-1 overflow-hidden">
          <PatientFormWizard form={form} onChange={setForm} />
        </div>
      </div>

      {/* ── Note Viewer Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {noteResult && (
          <NoteViewer result={noteResult} onClose={() => setNoteResult(null)} />
        )}
      </AnimatePresence>

      {/* ── Toast Messages ─────────────────────────────────────────────── */}
      <ToastContainer toasts={toasts} />
    </div>
  )
}
