"use client"

import React, { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  User, Heart, Stethoscope, Activity, FlaskConical,
  FileCheck, ClipboardList, Plus, Trash2, ChevronLeft,
  ChevronRight, Upload, X, Loader2, AlertTriangle, CheckCircle, Info
} from "lucide-react"
import {
  PatientClinicalData, ThreeWay, LabInterpretResponse, LabInterpretation, defaultPatientData, MissingField
} from "./types"
import apiClient from "@/lib/api-client"

// ── Shared UI atoms ─────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
      {children}
    </label>
  )
}

function TextInput({
  value, onChange, placeholder, disabled,
}: {
  value?: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean
}) {
  return (
    <input
      type="text"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all disabled:opacity-50"
    />
  )
}

function NumberInput({
  value, onChange, placeholder,
}: {
  value?: number; onChange: (v: number | undefined) => void; placeholder?: string
}) {
  return (
    <input
      type="number"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all"
    />
  )
}

function DateInput({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  return (
    <input
      type="date"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all"
    />
  )
}

function SelectInput({
  value, onChange, options,
}: {
  value?: string; onChange: (v: string) => void; options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all"
    >
      <option value="">Select…</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

function TextArea({ value, onChange, placeholder, rows = 4 }: {
  value?: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all resize-none"
    />
  )
}

function CheckGroup({
  items, values, onChange,
}: {
  items: { key: string; label: string }[]
  values: Record<string, boolean>
  onChange: (key: string, val: boolean) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(item.key, !values[item.key])}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
            values[item.key]
              ? "bg-rose-500 text-white border-rose-500 shadow-sm shadow-rose-500/20"
              : "bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-600"
          )}
        >
          {values[item.key] ? "✓ " : ""}{item.label}
        </button>
      ))}
    </div>
  )
}

function ThreeWayToggle({
  value, onChange,
}: {
  value?: ThreeWay; onChange: (v: ThreeWay) => void
}) {
  const opts: ThreeWay[] = ["Yes", "No", "Not assessed"]
  return (
    <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
      {opts.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={cn(
            "px-3 py-1.5 text-xs font-bold transition-all border-r last:border-r-0 border-slate-200",
            value === o
              ? "bg-rose-500 text-white"
              : "bg-white text-slate-500 hover:bg-rose-50"
          )}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-black uppercase tracking-widest text-rose-600 mb-3 flex items-center gap-2">
      <span className="h-px flex-1 bg-rose-100" />
      {children}
      <span className="h-px flex-1 bg-rose-100" />
    </h3>
  )
}

// ── Lab interpretation card ─────────────────────────────────────────────────

function LabCard({ name, data }: { name: string; data: LabInterpretation }) {
  const flagColor =
    !data.flag || data.flag === "NORMAL"
      ? "border-emerald-200 bg-emerald-50"
      : data.flag === "BORDERLINE"
      ? "border-amber-200 bg-amber-50"
      : "border-red-200 bg-red-50"
  const flagText =
    !data.flag || data.flag === "NORMAL"
      ? "text-emerald-700"
      : data.flag === "BORDERLINE"
      ? "text-amber-700"
      : "text-red-700"
  const icon =
    !data.flag || data.flag === "NORMAL" ? "🟢" : data.flag === "BORDERLINE" ? "🟡" : "🔴"
  return (
    <div className={cn("rounded-xl border p-3 text-xs space-y-1", flagColor)}>
      <div className={cn("font-black uppercase tracking-wide", flagText)}>
        {icon} {name} — {data.value} {data.unit}
      </div>
      {data.stage && <div className={cn("font-bold", flagText)}>{data.stage}</div>}
      <div className="text-slate-600">{data.interpretation}</div>
    </div>
  )
}

// ── Step definitions ─────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Patient ID", icon: User },
  { id: 2, label: "Complaint", icon: Heart },
  { id: 3, label: "Hx & Risk", icon: ClipboardList },
  { id: 4, label: "Exam & ECG", icon: Stethoscope },
  { id: 5, label: "Investigations", icon: FlaskConical },
  { id: 6, label: "Diagnosis", icon: FileCheck },
  { id: 7, label: "Discharge", icon: Activity },
]

// ── Main Wizard ──────────────────────────────────────────────────────────────

interface PatientFormWizardProps {
  form: PatientClinicalData
  onChange: (form: PatientClinicalData) => void
  missingFields: MissingField[]
  renderSubmitActions?: () => React.ReactNode
}

export function PatientFormWizard({ form, onChange, missingFields, renderSubmitActions }: PatientFormWizardProps) {
  const [step, setStep] = useState(1)
  const [labResult, setLabResult] = useState<LabInterpretResponse | null>(null)
  const [isInterpretingLabs, setIsInterpretingLabs] = useState(false)
  const [labError, setLabError] = useState<string | null>(null)
  const ecgFileRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof PatientClinicalData>(
    key: K,
    val: PatientClinicalData[K]
  ) => onChange({ ...form, [key]: val })

  const setNested = <K extends keyof PatientClinicalData>(
    key: K,
    sub: Partial<PatientClinicalData[K]>
  ) => onChange({ ...form, [key]: { ...(form[key] as object), ...sub } })

  // ── Interpret Labs ──
  const handleInterpretLabs = async () => {
    setIsInterpretingLabs(true)
    setLabError(null)
    setLabResult(null)
    const labs = form.key_investigations.laboratory_tests
    const payload: Record<string, string | number | undefined> = {}

    const extractNum = (val: string | undefined): number | undefined => {
      if (!val) return undefined;
      // Strip out non-numeric leading characters (e.g. '<0.01' -> '0.01', '>100' -> '100')
      const cleaned = val.replace(/^[^\d.-]+/, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? undefined : num;
    };

    const egfrVal = extractNum(labs.egfr);
    if (egfrVal !== undefined) { payload.egfr = egfrVal; payload.egfr_unit = "mL/min/1.73m²" }

    const tropVal = extractNum(labs.troponin);
    if (tropVal !== undefined) { payload.troponin = tropVal; payload.troponin_unit = "ng/mL" }

    const tropLimit = extractNum(labs.troponin_upper_limit);
    if (tropLimit !== undefined) { 
      payload.troponin_upper_limit = tropLimit; 
      payload.troponin_url = tropLimit; 
    }

    const crpVal = extractNum(labs.crp);
    if (crpVal !== undefined) { payload.crp = crpVal; payload.crp_unit = "mg/L" }

    const ddimerVal = extractNum(labs.d_dimer);
    if (ddimerVal !== undefined) { payload.d_dimer = ddimerVal; payload.d_dimer_unit = "mg/L FEU" }

    if (form.patient_identification.age) {
      payload.patient_age = form.patient_identification.age
    }

    try {
      const res = await apiClient.post("/proxy/clinical-note/interpret-labs", payload)
      setLabResult(res.data)
    } catch {
      setLabError("Lab interpretation failed. Please try again.")
    } finally {
      setIsInterpretingLabs(false)
    }
  }

  // ── Steps ────────────────────────────────────────────────────────────────

  const renderStep = () => {
    switch (step) {
      // ─── Step 1: Patient Identification ─────────────────────────────────
      case 1: {
        const pi = form.patient_identification || {}
        const upd = (k: keyof typeof pi, v: any) => setNested("patient_identification", { [k]: v })
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FieldLabel>Patient Initials *</FieldLabel>
                <TextInput value={pi.initials} onChange={(v) => upd("initials", v)} placeholder="J.D." />
              </div>
              <div>
                <FieldLabel>MRN *</FieldLabel>
                <TextInput value={pi.mrn} onChange={(v) => upd("mrn", v)} placeholder="MRN-001" />
              </div>
              <div>
                <FieldLabel>Date of Birth</FieldLabel>
                <DateInput value={pi.dob} onChange={(v) => upd("dob", v)} />
              </div>
              <div>
                <FieldLabel>Age</FieldLabel>
                <NumberInput value={pi.age} onChange={(v) => upd("age", v)} placeholder="68" />
              </div>
              <div>
                <FieldLabel>Sex</FieldLabel>
                <SelectInput
                  value={pi.sex}
                  onChange={(v) => upd("sex", v)}
                  options={[
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                    { value: "Other", label: "Other" },
                    { value: "Prefer not to say", label: "Prefer not to say" },
                  ]}
                />
              </div>
              <div>
                <FieldLabel>Location / Ward</FieldLabel>
                <TextInput value={pi.location} onChange={(v) => upd("location", v)} placeholder="Cardiology Ward 3" />
              </div>
              <div>
                <FieldLabel>Date of Admission *</FieldLabel>
                <DateInput value={pi.date_of_admission} onChange={(v) => upd("date_of_admission", v)} />
              </div>
              <div>
                <FieldLabel>Date of Discharge</FieldLabel>
                <DateInput value={pi.date_of_discharge} onChange={(v) => upd("date_of_discharge", v)} />
              </div>
              <div className="md:col-span-2">
                <FieldLabel>Responsible Consultant</FieldLabel>
                <TextInput value={pi.responsible_consultant} onChange={(v) => upd("responsible_consultant", v)} placeholder="Dr. Smith" />
              </div>
            </div>
          </div>
        )
      }

      // ─── Step 2: Presenting Complaint ────────────────────────────────────
      case 2: {
        const pc = form.presenting_complaint || { complaints: {} }
        const complaints = pc.complaints || {}
        const COMPLAINT_ITEMS = [
          { key: "chest_pain", label: "Chest Pain" },
          { key: "dyspnoea", label: "Dyspnoea" },
          { key: "syncope", label: "Syncope" },
          { key: "palpitations", label: "Palpitations" },
          { key: "heart_failure_symptoms", label: "Heart Failure Symptoms" },
          { key: "stroke_embolic_event", label: "Stroke / Embolic Event" },
          { key: "other", label: "Other" },
        ]
        return (
          <div className="space-y-5">
            <div>
              <FieldLabel>Presenting Complaints (tick all that apply)</FieldLabel>
              <CheckGroup
                items={COMPLAINT_ITEMS}
                values={complaints as unknown as Record<string, boolean>}
                onChange={(k, v) =>
                  set("presenting_complaint", {
                    ...pc,
                    complaints: { ...complaints, [k]: v },
                  })
                }
              />
            </div>
            {complaints.other && (
              <div>
                <FieldLabel>Other Complaint Detail</FieldLabel>
                <TextArea
                  value={pc.other_complaint}
                  onChange={(v) => set("presenting_complaint", { ...pc, other_complaint: v })}
                  placeholder="Describe other complaint..."
                  rows={3}
                />
              </div>
            )}
            <div>
              <FieldLabel>Duration of Symptoms</FieldLabel>
              <TextInput
                value={pc.duration}
                onChange={(v) => set("presenting_complaint", { ...pc, duration: v })}
                placeholder="e.g. 2 days, onset this morning"
              />
            </div>
          </div>
        )
      }

      // ─── Step 3: Symptoms & History ──────────────────────────────────────
      case 3: {
        const symptoms = form.symptoms || {}
        const rmh = form.relevant_medical_history || {}
        const cvrf = form.cardiovascular_risk_factors || {}

        const SYMPTOM_GROUPS = [
          {
            title: "Chest Pain / Pressure",
            items: [
              { key: "chest_pain_pressure", label: "Chest pain or pressure" },
              { key: "chest_tightness_heaviness", label: "Chest tightness or heaviness" },
              { key: "chest_pain_radiating", label: "Chest pain radiating to arm, jaw, or back" },
            ]
          },
          {
            title: "Breathlessness",
            items: [
              { key: "shortness_of_breath", label: "Shortness of breath" },
              { key: "breathlessness_on_exertion", label: "Breathlessness on exertion" },
              { key: "breathlessness_at_rest", label: "Breathlessness at rest" },
              { key: "orthopnoea", label: "Orthopnoea (breathlessness when lying flat)" },
              { key: "paroxysmal_nocturnal_dyspnoea", label: "Paroxysmal nocturnal dyspnoea" },
            ]
          },
          {
            title: "Palpitations",
            items: [
              { key: "rapid_irregular_heartbeat", label: "Rapid or irregular heartbeat" },
              { key: "skipped_heartbeats", label: "Sensation of skipped heartbeats" },
            ]
          },
          {
            title: "Syncope / Cerebral Hypoperfusion",
            items: [
              { key: "syncope", label: "Syncope (fainting)" },
              { key: "presyncope", label: "Presyncope / near fainting" },
              { key: "dizziness_lightheadedness", label: "Dizziness or lightheadedness" },
            ]
          },
          {
            title: "Heart Failure Symptoms",
            items: [
              { key: "fatigue", label: "Fatigue" },
              { key: "reduced_exercise_tolerance", label: "Reduced exercise tolerance" },
              { key: "peripheral_oedema", label: "Peripheral oedema (leg or ankle swelling)" },
              { key: "abdominal_swelling", label: "Abdominal swelling or fluid retention" },
              { key: "sudden_weight_gain", label: "Sudden weight gain from fluid retention" },
            ]
          },
          {
            title: "Ischaemic / ACS Associated Symptoms",
            items: [
              { key: "nausea_vomiting", label: "Nausea or vomiting" },
              { key: "diaphoresis", label: "Diaphoresis (sweating)" },
              { key: "unexplained_weakness", label: "Unexplained weakness" },
            ]
          },
          {
            title: "Structural / Valvular Disease Symptoms",
            items: [
              { key: "exertional_chest_pain", label: "Exertional chest pain" },
              { key: "exertional_syncope", label: "Exertional syncope" },
              { key: "exertional_dyspnoea", label: "Exertional dyspnoea" },
            ]
          },
          {
            title: "Cardiogenic Shock / Low Output",
            items: [
              { key: "confusion_altered_state", label: "Confusion or altered mental state" },
              { key: "cold_clammy_extremities", label: "Cold or clammy extremities" },
              { key: "reduced_urine_output", label: "Reduced urine output" },
            ]
          },
          {
            title: "Embolic or Neurological Symptoms",
            items: [
              { key: "stroke_tia_symptoms", label: "Stroke or TIA symptoms" },
              { key: "sudden_vision_speech_disturbance", label: "Sudden vision or speech disturbance" },
            ]
          }
        ]

        const RMH_ITEMS = [
          { key: "coronary_artery_disease", label: "Coronary Artery Disease" },
          { key: "atrial_fibrillation", label: "Atrial Fibrillation" },
          { key: "heart_failure", label: "Heart Failure" },
          { key: "hypertension", label: "Hypertension" },
          { key: "diabetes", label: "Diabetes" },
          { key: "hyperlipidaemia", label: "Hyperlipidaemia" },
          { key: "stroke_tia", label: "Stroke / TIA" },
          { key: "chronic_kidney_disease", label: "CKD" },
          { key: "obesity", label: "Obesity" },
          { key: "sleep_apnoea", label: "Sleep Apnoea" },
          { key: "prior_cardiac_surgery", label: "Prior Cardiac Surgery" },
          { key: "prior_pci", label: "Prior PCI" },
        ]
        const CVRF_ITEMS = [
          { key: "smoking_history", label: "Smoking History" },
          { key: "family_history_premature_cvd", label: "Family Hx Premature CVD" },
          { key: "hypertension", label: "Hypertension" },
          { key: "diabetes", label: "Diabetes" },
          { key: "dyslipidaemia", label: "Dyslipidaemia" },
          { key: "sedentary_lifestyle", label: "Sedentary Lifestyle" },
        ]
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <SectionTitle>Symptoms</SectionTitle>
              {SYMPTOM_GROUPS.map((group, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter ml-1">{group.title}</h4>
                  <CheckGroup items={group.items} values={symptoms as unknown as Record<string, boolean>}
                    onChange={(k, v) => setNested("symptoms", { [k]: v })} />
                </div>
              ))}
            </div>
            <div>
              <SectionTitle>Relevant Medical History</SectionTitle>
              <CheckGroup items={RMH_ITEMS} values={rmh as unknown as Record<string, boolean>}
                onChange={(k, v) => setNested("relevant_medical_history", { [k]: v })} />
            </div>
            <div>
              <SectionTitle>Cardiovascular Risk Factors</SectionTitle>
              <CheckGroup items={CVRF_ITEMS} values={cvrf as unknown as Record<string, boolean>}
                onChange={(k, v) => setNested("cardiovascular_risk_factors", { [k]: v })} />
            </div>
          </div>
        )
      }

      // ─── Step 4: Examination & ECG ───────────────────────────────────────
      case 4: {
        const ef = form.examination_findings || { vitals: {}, clinical_findings: {} }
        const vitals = ef.vitals || {}
        const cf = ef.clinical_findings || {}
        const ecg = form.ecg || {}

        const CF_ITEMS = [
          { key: "signs_of_heart_failure", label: "Signs of Heart Failure" },
          { key: "murmur", label: "Murmur" },
          { key: "peripheral_oedema", label: "Peripheral Oedema" },
          { key: "raised_jvp", label: "Raised JVP" },
          { key: "lung_crepitations", label: "Lung Crepitations" },
        ]

        const updateVitals = (k: keyof typeof vitals, v: string) =>
          set("examination_findings", { ...ef, vitals: { ...vitals, [k]: v } })
        const updateCF = (k: string, v: boolean) =>
          set("examination_findings", { ...ef, clinical_findings: { ...cf, [k]: v } })
        const updateECG = (k: keyof typeof ecg, v: any) =>
          setNested("ecg", { [k]: v })

        return (
          <div className="space-y-6">
            <div>
              <SectionTitle>Vital Signs</SectionTitle>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "heart_rate", label: "Heart Rate", placeholder: "72 bpm" },
                  { key: "blood_pressure", label: "Blood Pressure", placeholder: "120/80 mmHg" },
                  { key: "oxygen_saturation", label: "O₂ Saturation", placeholder: "98%" },
                  { key: "temperature", label: "Temperature", placeholder: "36.8°C" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <FieldLabel>{label}</FieldLabel>
                    <TextInput
                      value={(vitals as any)[key]}
                      onChange={(v) => updateVitals(key as keyof typeof vitals, v)}
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <SectionTitle>Clinical Findings</SectionTitle>
              <CheckGroup items={CF_ITEMS} values={cf as unknown as Record<string, boolean>}
                onChange={(k, v) => updateCF(k, v)} />
            </div>
            <div>
              <SectionTitle>ECG</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: "rhythm", label: "Rhythm", placeholder: "Sinus rhythm" },
                  { key: "heart_rate", label: "Heart Rate", placeholder: "70 bpm" },
                  { key: "conduction_abnormalities", label: "Conduction Abnormalities", placeholder: "None" },
                  { key: "st_t_changes", label: "ST/T Changes", placeholder: "None" },
                  { key: "qt_interval", label: "QT Interval", placeholder: "440ms" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <FieldLabel>{label}</FieldLabel>
                    <TextInput value={(ecg as any)[key]} onChange={(v) => updateECG(key as keyof typeof ecg, v)} placeholder={placeholder} />
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <FieldLabel>Upload ECG Image</FieldLabel>
                <div
                  onClick={() => ecgFileRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all",
                    ecg.image_uploaded
                      ? "border-emerald-400 bg-emerald-50"
                      : "border-slate-200 hover:border-rose-300 hover:bg-rose-50"
                  )}
                >
                  {ecg.image_uploaded ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-bold">ECG uploaded: {ecg.ecg_image_path}</span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setNested("ecg", { image_uploaded: false, ecg_image_path: undefined }) }}
                        className="ml-2 text-red-400 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-slate-400">
                      <Upload className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs font-bold">Click to upload ECG image</span>
                    </div>
                  )}
                </div>
                <input
                  ref={ecgFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    // Store file name as path placeholder (actual upload would go to Supabase)
                    updateECG("image_uploaded", true)
                    updateECG("ecg_image_path", file.name)
                  }}
                />
              </div>
            </div>
          </div>
        )
      }

      // ─── Step 5: Investigations & Labs ───────────────────────────────────
      case 5: {
        const echo = form.cardiac_imaging?.echocardiography || {}
        const labs = form.key_investigations?.laboratory_tests || {}
        const otherInv = form.key_investigations?.other_investigations || {}

        const updateEcho = (k: keyof typeof echo, v: any) =>
          set("cardiac_imaging", { echocardiography: { ...echo, [k]: v } })
        const updateLabs = (k: keyof typeof labs, v: string) =>
          set("key_investigations", { ...form.key_investigations, laboratory_tests: { ...labs, [k]: v } })
        const updateOther = (k: string, v: boolean) =>
          set("key_investigations", {
            ...form.key_investigations,
            other_investigations: { ...otherInv, [k]: v },
          })

        const OTHER_INV = [
          { key: "ct_coronary_angiography", label: "CT Coronary Angiography" },
          { key: "invasive_coronary_angiography", label: "Invasive Coronary Angiography" },
          { key: "cardiac_mri", label: "Cardiac MRI" },
        ]

        return (
          <div className="space-y-6">
            <div>
              <SectionTitle>Echocardiography</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: "lvef", label: "LVEF (%)", placeholder: "55" },
                  { key: "lv_size", label: "LV Size", placeholder: "Normal" },
                  { key: "rv_function", label: "RV Function", placeholder: "Normal" },
                  { key: "valvular_disease", label: "Valvular Disease Detail", placeholder: "Mild AR" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <FieldLabel>{label}</FieldLabel>
                    <TextInput value={(echo as any)[key]} onChange={(v) => updateEcho(key as keyof typeof echo, v)} placeholder={placeholder} />
                  </div>
                ))}
                {[
                  { key: "lv_dilation", label: "LV Dilation" },
                  { key: "rwma", label: "RWMA" },
                  { key: "significant_valve_disease", label: "Significant Valve Disease" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <FieldLabel>{label}</FieldLabel>
                    <ThreeWayToggle value={(echo as any)[key]} onChange={(v) => updateEcho(key as keyof typeof echo, v)} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <SectionTitle>Laboratory Tests</SectionTitle>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: "troponin", label: "Troponin *", placeholder: "0.04 ng/mL" },
                  { key: "troponin_upper_limit", label: "Troponin URL", placeholder: "0.014" },
                  { key: "bnp_nt_probnp", label: "BNP/NT-proBNP", placeholder: "500 pg/mL" },
                  { key: "creatinine", label: "Creatinine", placeholder: "110 μmol/L" },
                  { key: "egfr", label: "eGFR *", placeholder: "65 ml/min/1.73m²" },
                  { key: "haemoglobin", label: "Haemoglobin", placeholder: "130 g/L" },
                  { key: "sodium", label: "Sodium *", placeholder: "140 mmol/L" },
                  { key: "potassium", label: "Potassium *", placeholder: "4.1 mmol/L" },
                  { key: "crp", label: "CRP", placeholder: "8 mg/L" },
                  { key: "d_dimer", label: "D-Dimer", placeholder: "0.5 mg/L FEU" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <FieldLabel>{label}</FieldLabel>
                    <TextInput value={(labs as any)[key]} onChange={(v) => updateLabs(key as keyof typeof labs, v)} placeholder={placeholder} />
                  </div>
                ))}
              </div>

              {/* Interpret Labs Button */}
              <button
                type="button"
                onClick={handleInterpretLabs}
                disabled={isInterpretingLabs}
                className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
              >
                {isInterpretingLabs ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FlaskConical className="w-3.5 h-3.5" />
                )}
                {isInterpretingLabs ? "Interpreting…" : "Interpret Labs"}
              </button>

              {/* Lab Error */}
              {labError && (
                <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {labError}
                </div>
              )}

              {/* Lab Results */}
              {labResult && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black text-violet-700 bg-violet-50 rounded-lg px-3 py-2 border border-violet-200">
                    <Info className="w-3.5 h-3.5" />
                    {labResult.overall_summary}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(labResult.interpretations).map(([k, v]) =>
                      v ? <LabCard key={k} name={k} data={v} /> : null
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <SectionTitle>Other Investigations</SectionTitle>
              <CheckGroup
                items={OTHER_INV}
                values={otherInv as unknown as Record<string, boolean>}
                onChange={(k, v) => updateOther(k, v)}
              />
            </div>
          </div>
        )
      }

      // ─── Step 6: Diagnosis & Treatment ──────────────────────────────────
      case 6: {
        const tx = form.treatment_during_admission || {}
        const meds = form.medication_list_at_discharge || []

        const TX_ITEMS = [
          { key: "pci", label: "PCI" },
          { key: "antiarrhythmic_therapy", label: "Antiarrhythmic Therapy" },
          { key: "diuretics", label: "Diuretics" },
          { key: "anticoagulation", label: "Anticoagulation" },
          { key: "cardioversion", label: "Cardioversion" },
          { key: "ablation", label: "Ablation" },
        ]

        const addMed = () => set("medication_list_at_discharge", [...meds, { name: "", dose: "", frequency: "" }])
        const removeMed = (i: number) => set("medication_list_at_discharge", meds.filter((_, idx) => idx !== i))
        const updateMed = (i: number, k: string, v: string) =>
          set("medication_list_at_discharge", meds.map((m, idx) => idx === i ? { ...m, [k]: v } : m))

        return (
          <div className="space-y-6">
            <div>
              <FieldLabel>Primary Diagnosis *</FieldLabel>
              <TextInput
                value={form.primary_diagnosis}
                onChange={(v) => set("primary_diagnosis", v)}
                placeholder="e.g. NSTEMI, Atrial Fibrillation, Heart Failure"
              />
            </div>
            <div>
              <SectionTitle>Treatment During Admission</SectionTitle>
              <CheckGroup items={TX_ITEMS} values={tx as unknown as Record<string, boolean>}
                onChange={(k, v) => setNested("treatment_during_admission", { [k]: v })} />
            </div>
            <div>
              <SectionTitle>Medication List at Discharge</SectionTitle>
              <div className="space-y-2">
                {meds.map((med, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <TextInput value={med.name} onChange={(v) => updateMed(i, "name", v)} placeholder="Medication name" />
                      <TextInput value={med.dose} onChange={(v) => updateMed(i, "dose", v)} placeholder="Dose" />
                      <TextInput value={med.frequency} onChange={(v) => updateMed(i, "frequency", v)} placeholder="Frequency" />
                    </div>
                    <button type="button" onClick={() => removeMed(i)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addMed}
                  className="flex items-center gap-2 text-xs font-bold text-rose-600 hover:text-rose-700 border border-dashed border-rose-300 hover:border-rose-400 rounded-lg px-3 py-2 transition-all hover:bg-rose-50">
                  <Plus className="w-3.5 h-3.5" /> Add Medication
                </button>
              </div>
            </div>
          </div>
        )
      }

      // ─── Step 7: Clinical Course & Discharge ─────────────────────────────
      case 7: {
        const cc = form.clinical_course || {}
        const dp = form.discharge_plan || {}
        const la = form.lifestyle_advice || {}

        const DP_ITEMS = [
          { key: "follow_up_clinic", label: "Follow-up Clinic" },
          { key: "cardiology_review", label: "Cardiology Review" },
          { key: "gp_follow_up", label: "GP Follow-up" },
          { key: "repeat_investigations", label: "Repeat Investigations" },
        ]
        const LA_ITEMS = [
          { key: "smoking_cessation", label: "Smoking Cessation" },
          { key: "exercise", label: "Exercise" },
          { key: "diet", label: "Diet" },
          { key: "weight_management", label: "Weight Management" },
          { key: "alcohol_reduction", label: "Alcohol Reduction" },
        ]

        return (
          <div className="space-y-6">
            <div>
              <SectionTitle>Clinical Course</SectionTitle>
              <div className="space-y-3">
                <div>
                  <FieldLabel>Hospital Course Summary</FieldLabel>
                  <TextArea
                    value={cc.hospital_course_summary}
                    onChange={(v) => setNested("clinical_course", { hospital_course_summary: v })}
                    placeholder="Describe the hospital course..."
                    rows={4}
                  />
                </div>
                <div>
                  <FieldLabel>Complications During Admission</FieldLabel>
                  <TextArea
                    value={cc.complications}
                    onChange={(v) => setNested("clinical_course", { complications: v })}
                    placeholder="Any complications..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <div>
              <SectionTitle>Discharge Plan</SectionTitle>
              <CheckGroup items={DP_ITEMS} values={dp as unknown as Record<string, boolean>}
                onChange={(k, v) => setNested("discharge_plan", { [k]: v })} />
            </div>
            <div>
              <SectionTitle>Lifestyle Advice</SectionTitle>
              <CheckGroup items={LA_ITEMS} values={la as unknown as Record<string, boolean>}
                onChange={(k, v) => setNested("lifestyle_advice", { [k]: v })} />
            </div>
            <div>
              <FieldLabel>Additional Clinical Notes</FieldLabel>
              <TextArea
                value={form.additional_clinical_notes}
                onChange={(v) => set("additional_clinical_notes", v)}
                placeholder="Any additional notes for the clinical record..."
                rows={4}
              />
            </div>
          </div>
        )
      }

      default:
        return null
    }
  }

  // ── Progress Bar ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* Step Indicator */}
      <div className="px-6 pt-5 pb-4 border-b border-rose-100">
        <div className="flex items-center gap-1 overflow-x-auto">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const isActive = step === s.id
            const isDone = step > s.id
            const isInvalid = missingFields.some(f => f.step === s.id)
            
            return (
              <React.Fragment key={s.id}>
                <button
                  type="button"
                  onClick={() => setStep(s.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all whitespace-nowrap relative",
                    isActive
                      ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                      : isDone
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                  )}
                >
                  {isDone ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <Icon className="w-3 h-3" />
                  )}
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{s.id}</span>
                  {!isActive && isInvalid && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 border border-white shadow-sm" />
                  )}
                </button>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-lg font-black uppercase tracking-tight text-rose-950 mb-5 flex items-center gap-2">
              {React.createElement(STEPS[step - 1].icon, { className: "w-5 h-5 text-rose-500" })}
              Step {step}: {STEPS[step - 1].label}
            </h2>
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="px-6 py-4 border-t border-rose-100 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-200 text-rose-600 text-xs font-black uppercase tracking-wider hover:bg-rose-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Previous
        </button>
        <span className="text-xs font-bold text-slate-400">
          {step} / {STEPS.length}
        </span>
        {step === STEPS.length && renderSubmitActions ? (
          renderSubmitActions()
        ) : (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}
            disabled={step === STEPS.length}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-black uppercase tracking-wider hover:bg-rose-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-rose-500/20"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
