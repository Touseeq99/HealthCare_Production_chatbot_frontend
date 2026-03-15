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
interface MissingField { label: string; step: number }

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
  const [showValidationConfirm, setShowValidationConfirm] = useState<{ type: OutputType } | null>(null)
  const { toasts, show: toast } = useToasts()

  // ── Validation ──────────────────────────────────────────────────────────
  const getMissingFields = (data: PatientClinicalData): MissingField[] => {
    const missing: MissingField[] = []
    const pi = data.patient_identification || {}
    const symptoms = data.symptoms || {}
    const labs = data.key_investigations?.laboratory_tests || {}

    if (!pi.initials?.trim()) missing.push({ label: "Patient Initials", step: 1 })
    if (!pi.mrn?.trim()) missing.push({ label: "MRN", step: 1 })
    if (!pi.date_of_admission) missing.push({ label: "Date of Admission", step: 1 })
    if (Object.values(symptoms).every(v => v === false)) missing.push({ label: "At least one Symptom", step: 3 })
    if (!labs.troponin?.trim()) missing.push({ label: "Troponin", step: 5 })
    if (!labs.egfr?.trim()) missing.push({ label: "eGFR", step: 5 })
    if (!labs.sodium?.trim()) missing.push({ label: "Sodium", step: 5 })
    if (!labs.potassium?.trim()) missing.push({ label: "Potassium", step: 5 })
    if (!data.primary_diagnosis?.trim()) missing.push({ label: "Primary Diagnosis", step: 6 })
    return missing
  }

  const missingFields = getMissingFields(form)

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
      // Merge with defaults to ensure all fields exist
      const loadedData = record.patient_data || {}
      setForm({ ...defaultPatientData(), ...loadedData })
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
  const handleGenerate = async (outputType: OutputType, force = false) => {
    setGenerateDropdownOpen(false)
    
    if (!force && missingFields.length > 0) {
      setShowValidationConfirm({ type: outputType })
      return
    }

    setShowValidationConfirm(null)
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
      if (saved) {
        const parsed = JSON.parse(saved)
        setForm({ ...defaultPatientData(), ...parsed })
      }
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
            {missingFields.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full animate-pulse">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                <span className="text-[9px] font-black text-amber-700 uppercase tracking-tighter">
                  {missingFields.length} Required Fields Remaining
                </span>
              </div>
            )}
          </div>

        </div>

        {/* Form Wizard */}
        <div className="flex-1 overflow-hidden">
          <PatientFormWizard 
            form={form} 
            onChange={setForm} 
            missingFields={missingFields} 
            renderSubmitActions={() => (
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
                        initial={{ opacity: 0, scale: 0.95, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 4 }}
                        className="absolute right-0 bottom-full mb-2 w-52 bg-white rounded-xl shadow-xl border border-rose-100 overflow-hidden z-50"
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
                            <div className="flex-1 flex items-center gap-3">
                              <span className="text-base">{icon}</span>
                              {label}
                            </div>
                            {missingFields.length > 0 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            )}
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
            )}
          />
        </div>
      </div>

      {/* ── Note Viewer Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {noteResult && (
          <NoteViewer result={noteResult} onClose={() => setNoteResult(null)} />
        )}
      </AnimatePresence>

      {/* ── Validation Confirmation Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {showValidationConfirm && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-rose-100 bg-rose-50/50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h2 className="font-black text-rose-950 text-xs uppercase tracking-widest">
                    Missing Information
                  </h2>
                  <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-0.5">
                    {missingFields.length} required fields are empty
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-600 font-medium">
                  The following required fields are still missing. You can generate the document now, but it may be incomplete.
                </p>
                
                <div className="space-y-1 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {missingFields.map((field, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 border border-slate-100 rounded-lg text-xs font-bold text-slate-700 bg-slate-50">
                      <span>{field.label}</span>
                      <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-tighter">
                        Step {field.step}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowValidationConfirm(null)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition-all"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={() => handleGenerate(showValidationConfirm.type, true)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-rose-500/20"
                  >
                    Generate Anyway
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Toast Messages ─────────────────────────────────────────────── */}
      <ToastContainer toasts={toasts} />
    </div>
  )
}
