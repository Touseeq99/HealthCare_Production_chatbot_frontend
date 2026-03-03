"use client"

import React, {
    useState,
    useRef,
    useCallback,
    useEffect,
} from "react"
import {
    AlertTriangle,
    Lock,
    Upload,
    X,
    Activity,
    FlaskConical,
    ChevronDown,
    ChevronUp,
    Loader2,
    Copy,
    Download,
    RefreshCw,
    CheckCircle2,
    Plus,
    ClipboardList,
    Stethoscope,
    ShieldAlert,
    FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import apiClient from "@/lib/api-client"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Differential {
    rank: number
    condition: string
    likelihood: "High" | "Moderate" | "Low-Moderate" | "Low"
    likelihoodPct: number
    supports: string[]
    against: string[]
    guidelineNote: string
    icdCode?: string
}

interface OutputData {
    differentials: Differential[]
    redFlags: string[]
    nextSteps: string[]
    uncertainty: string
}

interface OptionalFields {
    symptoms: string
    vitals: string
    history: string
    riskFactors: string
    ecgData: string
    labData: string
}

interface OptionalFieldOpen {
    symptoms: boolean
    vitals: boolean
    history: boolean
    riskFactors: boolean
    ecgData: boolean
    labData: boolean
}

interface UploadedFile {
    id: string
    name: string
    type: "ecg" | "labs" | "other"
    file: File
}

interface ToggleState {
    ecg: boolean
    labs: boolean
    conservative: boolean
    guidelines: boolean
    redFlags: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock API — replace with real backend call
// ─────────────────────────────────────────────────────────────────────────────

async function generateDifferential(
    caseText: string,
    optional: OptionalFields,
    files: UploadedFile[],
    toggles: ToggleState
): Promise<OutputData> {
    const formData = new FormData()
    const joinedCase = [
        caseText,
        optional.symptoms ? `Symptoms: ${optional.symptoms}` : "",
        optional.vitals ? `Vitals: ${optional.vitals}` : "",
        optional.history ? `History: ${optional.history}` : "",
        optional.riskFactors ? `Risk Factors: ${optional.riskFactors}` : "",
    ]
        .filter(Boolean)
        .join("\n\n")

    formData.append("case_summary", joinedCase)

    // Specific text data for ECG and Labs if provided in optional fields
    if (optional.ecgData) formData.append("ecg_data", optional.ecgData)
    if (optional.labData) formData.append("lab_data", optional.labData)

    const clinicalFile = files.find((f) => f.type === "other")?.file
    const ecgFile = files.find((f) => f.type === "ecg")?.file
    const labFile = files.find((f) => f.type === "labs")?.file

    if (clinicalFile) formData.append("clinical_file", clinicalFile)
    if (ecgFile) formData.append("ecg_file", ecgFile)
    if (labFile) formData.append("lab_file", labFile)

    try {
        const response = await apiClient.post("/proxy/ddx/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })

        const data = response.data

        // Map backend response to frontend UI types
        return {
            differentials: (data.differentials || []).map((d: any) => ({
                rank: d.rank || 0,
                condition: d.condition || "Unknown Condition",
                likelihood: d.likelihood?.includes("High")
                    ? "High"
                    : d.likelihood?.includes("Moderate")
                        ? "Moderate"
                        : d.likelihood?.includes("Low-Moderate")
                            ? "Low-Moderate"
                            : "Low",
                likelihoodPct: d.likelihood?.includes("High")
                    ? 85
                    : d.likelihood?.includes("Moderate")
                        ? 50
                        : d.likelihood?.includes("Low-Moderate")
                            ? 30
                            : 15,
                supports: d.supporting_evidence || [],
                against: d.contradicting_evidence || [],
                guidelineNote: d.guideline_note || "Standard clinical protocol",
            })),
            redFlags: data.red_flags || [],
            nextSteps: data.suggested_next_steps || [],
            uncertainty: data.uncertainty_statement || "Clinical reasoning statement from AI.",
        }
    } catch (error) {
        console.error("DDx API Error:", error)
        throw error
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function detectUploadType(file: File): "ecg" | "labs" | "other" {
    const name = file.name.toLowerCase()
    if (name.includes("ecg") || name.includes("ekg") || name.includes("electrocardiogram")) return "ecg"
    if (
        name.includes("lab") || name.includes("blood") || name.includes("result") ||
        name.includes("cbc") || name.includes("fbc") || name.includes("report")
    ) return "labs"
    return "other"
}

const LIKELIHOOD_CONFIG: Record<string, { bar: string; badge: string; label: string }> = {
    High: { bar: "bg-rose-500", badge: "bg-rose-50 text-rose-600 border border-rose-100", label: "High" },
    Moderate: { bar: "bg-amber-500", badge: "bg-amber-50 text-amber-600 border border-amber-100", label: "Moderate" },
    "Low-Moderate": { bar: "bg-yellow-500", badge: "bg-yellow-50 text-yellow-600 border border-yellow-100", label: "Low–Moderate" },
    Low: { bar: "bg-slate-400", badge: "bg-slate-50 text-slate-500 border border-slate-100", label: "Low" },
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function LockedToggle({ id, label, description }: { id: string; label: string; description?: string }) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-rose-50 bg-rose-50/20 px-5 py-4">
            <div className="flex items-center gap-4 min-w-0">
                <Lock className="size-4 shrink-0 text-rose-400" />
                <div>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{label}</p>
                    {description && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{description}</p>}
                </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
                <span className="text-[9px] text-rose-500 font-black uppercase tracking-[0.2em]">Mandatory</span>
                <div className="h-6 w-10 rounded-full bg-rose-500/80 relative flex items-center cursor-not-allowed">
                    <span className="absolute right-0.5 block size-5 rounded-full bg-white shadow-sm" />
                </div>
            </div>
        </div>
    )
}

function Toggle({
    id, checked, disabled, label, description, icon, onChange,
}: {
    id: string; checked: boolean; disabled?: boolean; label: string
    description?: string; icon?: React.ReactNode; onChange?: (v: boolean) => void
}) {
    return (
        <div className={cn(
            "flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 transition-all duration-300",
            disabled
                ? "border-slate-100 bg-slate-50/50 opacity-50 cursor-not-allowed"
                : checked
                    ? "border-rose-200 bg-rose-50/30"
                    : "border-slate-100 bg-white hover:border-rose-100"
        )}>
            <div className="flex items-center gap-4 min-w-0">
                {icon && <span className={cn("shrink-0", checked ? "text-rose-500" : "text-slate-400")}>{icon}</span>}
                <div>
                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{label}</p>
                    {description && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">{description}</p>}
                </div>
            </div>
            <button
                id={id} role="switch" aria-checked={checked}
                disabled={disabled}
                onClick={() => !disabled && onChange?.(!checked)}
                className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors",
                    checked ? "bg-rose-500" : "bg-slate-200",
                    disabled ? "cursor-not-allowed" : "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                )}
            >
                <span className={cn(
                    "pointer-events-none block size-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
                    checked ? "translate-x-5" : "translate-x-0"
                )} />
            </button>
        </div>
    )
}

function DifferentialCard({ diff }: { diff: Differential }) {
    const config = LIKELIHOOD_CONFIG[diff.likelihood]

    const renderBold = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g)
        return parts.map((p, i) => {
            if (p.startsWith("**") && p.endsWith("**")) {
                return (
                    <strong key={i} className="font-black text-slate-900">
                        {p.slice(2, -2)}
                    </strong>
                )
            }
            return p
        })
    }

    return (
        <div className="rounded-[2.5rem] border border-rose-50 bg-white overflow-hidden shadow-xl shadow-rose-500/5 transition-all duration-500 hover:shadow-2xl hover:shadow-rose-500/10">
            {/* Card Header */}
            <div className="flex items-start justify-between gap-6 px-8 py-6 border-b border-rose-50">
                <div className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-[10px] font-black text-white uppercase tracking-widest">
                        {diff.rank}
                    </span>
                    <div>
                        <h3 className="font-black text-slate-900 text-xl leading-tight uppercase tracking-tight">
                            {diff.condition}
                        </h3>
                        {diff.icdCode && (
                            <span className="text-[10px] font-black text-rose-400 mt-1 uppercase tracking-widest block">
                                ICD-10 Assets: {diff.icdCode}
                            </span>
                        )}
                    </div>
                </div>
                <span className={cn("shrink-0 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] border-2", config.badge)}>
                    {config.label}
                </span>
            </div>

            {/* Likelihood Bar */}
            <div className="px-8 pt-6 pb-4">
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 w-24 shrink-0">Discovery Path</span>
                    <div className="flex-1 h-3 rounded-full bg-slate-50 overflow-hidden border border-slate-100 p-0.5">
                        <div
                            className={cn("h-full rounded-full transition-all duration-1000 ease-out", config.bar)}
                            style={{ width: `${diff.likelihoodPct}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-black text-slate-900 w-10 text-right uppercase tracking-widest">
                        {diff.likelihoodPct}%
                    </span>
                </div>
            </div>

            {/* Evidence Grid */}
            <div className="grid grid-cols-2 gap-px bg-rose-50 border-t border-rose-50">
                <div className="px-8 py-6 bg-white">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="size-3" /> Supporting
                    </p>
                    <ul className="space-y-3">
                        {diff.supports.map((s, i) => (
                            <li key={i} className="flex items-start gap-3 text-[11px] font-bold text-slate-600 leading-relaxed">
                                <span className="mt-1 size-1.5 rounded-full bg-emerald-500 shrink-0" />
                                <span>{renderBold(s)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="px-8 py-6 bg-white">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 mb-4 flex items-center gap-2">
                        <AlertTriangle className="size-3" /> Contradicting
                    </p>
                    <ul className="space-y-3">
                        {diff.against.length > 0 ? (
                            diff.against.map((a, i) => (
                                <li key={i} className="flex items-start gap-3 text-[11px] font-bold text-slate-500 leading-relaxed">
                                    <span className="mt-1 size-1.5 rounded-full bg-rose-400 shrink-0" />
                                    <span>{renderBold(a)}</span>
                                </li>
                            ))
                        ) : (
                            <li className="text-[10px] font-bold text-rose-300 italic uppercase tracking-widest">Pure Discovery Path</li>
                        )}
                    </ul>
                </div>
            </div>

            {/* Guideline Footer */}
            <div className="px-8 py-4 border-t border-rose-50 bg-rose-50/10">
                <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
                    <span className="text-rose-500 font-black uppercase tracking-widest mr-2 underline decoration-rose-200 underline-offset-4">Protocol:</span>
                    {diff.guidelineNote}
                </p>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF Export
// ─────────────────────────────────────────────────────────────────────────────

function exportPDF(caseText: string, output: OutputData, patientName: string, doctorName: string) {
    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const marginL = 20, marginR = 20, marginT = 25
    const contentWidth = pageWidth - marginL - marginR
    const dateStr = new Date().toLocaleDateString("en-GB")
    const timeStr = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    const addWatermark = () => {
        doc.saveGraphicsState()
        const gState = (doc as any).GState ? new (doc as any).GState({ opacity: 0.05 }) : { opacity: 0.05 }
        doc.setGState(gState)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(35)
        doc.setTextColor(220, 220, 220)
        doc.text("DECISION SUPPORT", pageWidth / 2, pageHeight / 2 + 20, { align: "center", angle: 30 })
        doc.restoreGraphicsState()
    }

    const addFooter = (page: number, total: number) => {
        doc.setDrawColor(226, 232, 240)
        doc.line(marginL, pageHeight - 18, pageWidth - marginR, pageHeight - 18)
        doc.setFontSize(8)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(100, 116, 139)
        doc.text(`Digitally Generated: ${dateStr} ${timeStr}`, marginL, pageHeight - 13)
        doc.text(`Physician: Dr. ${doctorName || "_________________"}`, marginL, pageHeight - 9)
        doc.text("Clinical Decision Support Tool - Not for patient record without review.", marginL, pageHeight - 5)
        doc.text(`Page ${page} of ${total}`, pageWidth - marginR, pageHeight - 9, { align: "right" })
    }

    // PAGE 1
    addWatermark()

    // Header Block
    doc.setFillColor(30, 41, 59) // Slate-800
    doc.rect(marginL, marginT, contentWidth, 25, "F")

    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(255, 255, 255)
    doc.text("DIFFERENTIAL DIAGNOSIS REPORT", marginL + 8, marginT + 12)

    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(200, 210, 230)
    doc.text("Intelligent Diagnostic Decision Support", marginL + 8, marginT + 18)

    doc.setFontSize(10)
    doc.setTextColor(255, 255, 255)
    doc.text(`Date: ${dateStr}`, pageWidth - marginR - 8, marginT + 12, { align: "right" })
    doc.text(`Doc ID: DDX-${Math.floor(Math.random() * 900000) + 100000}`, pageWidth - marginR - 8, marginT + 18, { align: "right" })

    // Patient/Physician Info Block
    let y = marginT + 32
    doc.setDrawColor(226, 232, 240)
    doc.setFillColor(248, 250, 252)
    doc.rect(marginL, y, contentWidth, 24, "FD")

    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(71, 85, 105)
    doc.text("PATIENT INFORMATION", marginL + 6, y + 7)
    doc.text("ORDERING PHYSICIAN", marginL + (contentWidth / 2) + 6, y + 7)

    doc.setFontSize(11)
    doc.setTextColor(15, 23, 42)
    doc.text(patientName || "Not Provided", marginL + 6, y + 14)
    doc.text(`Dr. ${doctorName || "Not Provided"}`, marginL + (contentWidth / 2) + 6, y + 14)

    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(100, 116, 139)
    doc.text("Full Name / MRN", marginL + 6, y + 19)
    doc.text("Reviewing Clinician", marginL + (contentWidth / 2) + 6, y + 19)

    // Case Summary
    y += 35
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.setTextColor(30, 41, 59)
    doc.text("CASE SUMMARY", marginL, y)

    y += 4
    doc.setDrawColor(59, 130, 246)
    doc.setLineWidth(1)
    doc.line(marginL, y, marginL + 25, y)

    y += 6
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(51, 65, 85)
    const caseLines = doc.splitTextToSize(caseText, contentWidth)
    doc.text(caseLines, marginL, y)
    y += caseLines.length * 5 + 12

    // Differentials Table
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.setTextColor(30, 41, 59)
    doc.text("RANKED DIFFERENTIALS", marginL, y)

    y += 4
    doc.line(marginL, y, marginL + 25, y)
    y += 5

    autoTable(doc, {
        startY: y,
        head: [["#", "Condition", "ICD-10", "Likelihood", "Confidence"]],
        body: output.differentials.map((d) => [d.rank, d.condition, d.icdCode ?? "—", d.likelihood, `${d.likelihoodPct}%`]),
        margin: { left: marginL, right: marginR },
        headStyles: { fillColor: [30, 41, 59], fontSize: 9, font: "helvetica" },
        bodyStyles: { fontSize: 9, font: "helvetica" },
        theme: "striped",
    })
    y = (doc as any).lastAutoTable.finalY + 12

    // Helper: Draw Markdown Text (Supports **bold**)
    const drawStyledLine = (text: string, x: number, lineY: number) => {
        const parts = text.split(/(\*\*.*?\*\*)/g)
        let currentX = x
        parts.forEach((part) => {
            if (part.startsWith("**") && part.endsWith("**")) {
                const clean = part.slice(2, -2)
                doc.setFont("helvetica", "bold")
                doc.text(clean, currentX, lineY)
                currentX += doc.getTextWidth(clean)
            } else {
                doc.setFont("helvetica", "normal")
                doc.text(part, currentX, lineY)
                currentX += doc.getTextWidth(part)
            }
        })
    }

    // Detail Sections
    output.differentials.forEach((d) => {
        if (y > pageHeight - 50) {
            doc.addPage()
            addWatermark()
            y = marginT
        }

        doc.setFillColor(241, 245, 249) // Slate-100
        doc.rect(marginL, y, contentWidth, 8, "F")

        doc.setFont("helvetica", "bold")
        doc.setFontSize(10)
        doc.setTextColor(30, 41, 59)
        doc.text(`#${d.rank} — ${d.condition.toUpperCase()}`, marginL + 4, y + 5.5)

        y += 12

        doc.setFontSize(9)
        doc.setTextColor(22, 163, 74) // Emerald-600
        doc.text("SUPPORTING EVIDENCE:", marginL, y)
        y += 5
        doc.setFont("helvetica", "normal")
        doc.setTextColor(51, 65, 85)

        d.supports.forEach((sup) => {
            if (y > pageHeight - 20) { doc.addPage(); addWatermark(); y = marginT }
            doc.setFont("helvetica", "bold")
            doc.text("•", marginL + 2, y)
            doc.setFont("helvetica", "normal")
            const lines = doc.splitTextToSize(sup, contentWidth - 8)
            lines.forEach((l: string) => {
                drawStyledLine(l, marginL + 6, y)
                y += 5
            })
        })
        y += 4

        doc.setFont("helvetica", "bold")
        doc.setTextColor(220, 38, 38) // Red-600
        doc.text("CONTRADICTING:", marginL, y)
        y += 5
        doc.setFont("helvetica", "normal")
        doc.setTextColor(51, 65, 85)

        if (d.against.length === 0) {
            doc.text("No significant contradicting findings noted.", marginL + 6, y)
            y += 8
        } else {
            d.against.forEach((aga) => {
                if (y > pageHeight - 20) { doc.addPage(); addWatermark(); y = marginT }
                doc.setFont("helvetica", "bold")
                doc.text("•", marginL + 2, y)
                doc.setFont("helvetica", "normal")
                const lines = doc.splitTextToSize(aga, contentWidth - 8)
                lines.forEach((l: string) => {
                    drawStyledLine(l, marginL + 6, y)
                    y += 5
                })
            })
            y += 8
        }
    })

    // Red Flags
    if (output.redFlags.length > 0) {
        if (y > pageHeight - 50) { doc.addPage(); addWatermark(); y = marginT }
        doc.setFont("helvetica", "bold")
        doc.setFontSize(12)
        doc.setTextColor(220, 38, 38)
        doc.text("🚨 RED FLAGS / URGENCY", marginL, y)
        y += 4
        doc.line(marginL, y, marginL + 25, y)
        y += 6

        doc.setFillColor(254, 242, 242) // Red-50
        doc.setDrawColor(252, 165, 165) // Red-300
        const rfHeight = (output.redFlags.length * 5) + 6
        doc.rect(marginL, y, contentWidth, rfHeight, "FD")

        doc.setFont("helvetica", "normal")
        doc.setFontSize(9)
        doc.setTextColor(153, 27, 27)
        output.redFlags.forEach((rf, i) => {
            doc.text(`• ${rf}`, marginL + 4, y + 6 + i * 5)
        })
        y += rfHeight + 12
    }

    // Next Steps
    if (y > pageHeight - 50) { doc.addPage(); addWatermark(); y = marginT }
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.setTextColor(30, 41, 59)
    doc.text("RECOMMENDED NEXT STEPS", marginL, y)
    y += 4
    doc.line(marginL, y, marginL + 25, y)
    y += 6

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(51, 65, 85)
    output.nextSteps.forEach((s, i) => {
        doc.text(`• ${s}`, marginL, y + i * 5)
    })
    y += (output.nextSteps.length * 5) + 12

    // Signature Area
    if (y > pageHeight - 40) { doc.addPage(); addWatermark(); y = marginT }
    y += 10
    doc.setDrawColor(203, 213, 225)
    doc.line(marginL, y, marginL + 50, y)
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text(`Dr. ${doctorName || "_________________"}`, marginL, y + 5)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(100, 116, 139)
    doc.text("Reviewing Clinician Digital Confirmation", marginL, y + 9)

    // Finalize footers
    const totalPages = (doc as any).internal.pages.length - 1
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        addFooter(i, totalPages)
    }

    doc.save(`Diagnostic_Report_${patientName.replace(/\s+/g, "_") || "DDX"}.pdf`)
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function DifferentialDiagnosis() {
    // ── Core state ──────────────────────────────────────────────────────────────
    const [caseText, setCaseText] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [output, setOutput] = useState<OutputData | null>(null)
    const [copySuccess, setCopySuccess] = useState(false)
    const [patientName, setPatientName] = useState("")
    const [doctorName, setDoctorName] = useState("")

    // ── Optional fields ─────────────────────────────────────────────────────────
    const [optOpen, setOptOpen] = useState(false)
    const [fieldOpen, setFieldOpen] = useState<OptionalFieldOpen>({
        symptoms: false,
        vitals: false,
        history: false,
        riskFactors: false,
        ecgData: false,
        labData: false,
    })
    const [optFields, setOptFields] = useState<OptionalFields>({
        symptoms: "",
        vitals: "",
        history: "",
        riskFactors: "",
        ecgData: "",
        labData: "",
    })

    // ── Files ───────────────────────────────────────────────────────────────────
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const hasECG = uploadedFiles.some((f) => f.type === "ecg")
    const hasLabs = uploadedFiles.some((f) => f.type === "labs")

    // ── Toggles ─────────────────────────────────────────────────────────────────
    const [toggles, setToggles] = useState<ToggleState>({
        ecg: false, labs: false,
        conservative: true, guidelines: true, redFlags: true,
    })

    useEffect(() => {
        setToggles((p) => ({
            ...p,
            ecg: hasECG ? p.ecg : false,
            labs: hasLabs ? p.labs : false,
        }))
    }, [hasECG, hasLabs])

    // ── File upload ─────────────────────────────────────────────────────────────
    const addFiles = useCallback((files: FileList | File[]) => {
        const valid = Array.from(files).filter(
            (f) => ["application/pdf", "image/png", "image/jpeg", "text/plain"].includes(f.type) || f.name.endsWith(".txt")
        )
        setUploadedFiles((prev) => [
            ...prev,
            ...valid.map((f) => ({ id: crypto.randomUUID(), name: f.name, type: detectUploadType(f), file: f })),
        ])
    }, [])

    const removeFile = (id: string) => setUploadedFiles((p) => p.filter((f) => f.id !== id))

    // ── Generate ────────────────────────────────────────────────────────────────
    const handleGenerate = async () => {
        if (!caseText.trim() || isGenerating) return
        setIsGenerating(true)
        setOutput(null)
        try {
            const result = await generateDifferential(caseText, optFields, uploadedFiles, toggles)
            // Clean up the output by normalizing bullet points in uncertainty and next steps if they are text
            if (result.uncertainty) {
                result.uncertainty = result.uncertainty.replace(/^(\s*)[-\*]\s+/gm, "$1• ")
            }
            setOutput(result)
        } catch {
            console.error("Generation failed")
        } finally {
            setIsGenerating(false)
        }
    }

    // ── Copy ─────────────────────────────────────────────────────────────────────
    const handleCopy = () => {
        if (!output) return
        const text = [
            "DIFFERENTIAL DIAGNOSIS — DECISION SUPPORT",
            `Case: ${caseText}`,
            "",
            "DIFFERENTIALS:",
            ...output.differentials.map(
                (d) => `#${d.rank} ${d.condition} (${d.likelihood} — ${d.likelihoodPct}%)\n  Supports: ${d.supports.join(", ")}\n  Against: ${d.against.join(", ")}`
            ),
            "",
            "RED FLAGS:",
            ...output.redFlags.map((r) => `• ${r}`),
            "",
            "NEXT STEPS:",
            ...output.nextSteps.map((s) => `• ${s}`),
            "",
            `Uncertainty: ${output.uncertainty}`,
            "",
            "This is not a diagnosis. AI-assisted decision support for physician use only.",
        ].join("\n")
        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess(true)
            setTimeout(() => setCopySuccess(false), 2000)
        })
    }

    const handleReset = () => {
        setCaseText("")
        setOutput(null)
        setUploadedFiles([])
        setOptFields({
            symptoms: "",
            vitals: "",
            history: "",
            riskFactors: "",
            ecgData: "",
            labData: "",
        })
        setFieldOpen({
            symptoms: false,
            vitals: false,
            history: false,
            riskFactors: false,
            ecgData: false,
            labData: false,
        })
        setToggles({ ecg: false, labs: false, conservative: true, guidelines: true, redFlags: true })
        setOptOpen(false)
        setPatientName("")
        setDoctorName("")
    }

    // ── Render ───────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans">

            {/* ── Persistent Disclaimer Bar ─────────────────────────────────────────── */}
            <div className="sticky top-0 z-50 border-b border-rose-100 bg-rose-50/95 backdrop-blur-md px-8 py-4 flex items-center gap-6 shadow-xl shadow-rose-500/5">
                <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20 rotate-3 shrink-0">
                    <Stethoscope className="size-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-rose-600 uppercase tracking-[0.2em] mb-1">Clinical Decision Intelligence · Active Session</p>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                        Precision analytical support. Internal physician use only.
                        Do not disclose diagnostic probabilities without clinical verification.
                    </p>
                </div>
                <div className="flex gap-3 shrink-0">
                    <span className="rounded-full bg-slate-900 px-5 py-2 text-[9px] font-black text-white uppercase tracking-[0.2em]">Restricted Access</span>
                    <span className="rounded-full bg-rose-100 border border-rose-200 px-5 py-2 text-[9px] font-black text-rose-600 uppercase tracking-[0.2em]">Verified Clinician</span>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* ── Page Title ──────────────────────────────────────────────────────── */}
                <div className="mb-12">
                    <div className="flex items-center gap-6">
                        <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-rose-50 border-2 border-rose-100 shadow-xl shadow-rose-500/5 -rotate-6">
                            <ClipboardList className="size-8 text-rose-500" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Differential <span className="text-rose-500 text-3xl block md:inline md:text-4xl italic font-serif lowercase tracking-normal font-medium">Intelligence</span></h1>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Precision Decision Support · Anchoring Mitigation · Digital Checklist</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr]">

                    {/* ═══════════════════════════════════════════════════════════════════ */}
                    {/* LEFT — Input Panel                                                  */}
                    {/* ═══════════════════════════════════════════════════════════════════ */}
                    <div className="space-y-4">

                        {/* Metadata Input */}
                        <section className="rounded-[2rem] border border-rose-50 bg-white p-7 shadow-xl shadow-rose-500/5">
                            <h2 className="mb-5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Metadata assets</h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="patient-name" className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1">Patient ID / Reference</label>
                                    <input
                                        id="patient-name"
                                        type="text"
                                        value={patientName}
                                        onChange={(e) => setPatientName(e.target.value)}
                                        placeholder="E.G. JOHN DOE"
                                        className="w-full rounded-2xl border border-rose-50 bg-rose-50/20 px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-rose-200 focus:border-rose-300 focus:outline-none focus:ring-4 focus:ring-rose-500/5 transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="doctor-name" className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1">Clinician Authority</label>
                                    <input
                                        id="doctor-name"
                                        type="text"
                                        value={doctorName}
                                        onChange={(e) => setDoctorName(e.target.value)}
                                        placeholder="E.G. DR. HOUSE"
                                        className="w-full rounded-2xl border border-rose-50 bg-rose-50/20 px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-rose-200 focus:border-rose-300 focus:outline-none focus:ring-4 focus:ring-rose-500/5 transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Core Input */}
                        <section className="rounded-[2.5rem] border border-rose-50 bg-white p-7 shadow-xl shadow-rose-500/5">
                            <label htmlFor="case-summary" className="block mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                                Case Matrix Data <span className="text-rose-500">*</span>
                            </label>
                            <p className="text-[10px] font-bold text-rose-300 uppercase tracking-widest mb-4 ml-1">Synthesis: Age, Sex, Symptoms, Vitals, Duration</p>
                            <textarea
                                id="case-summary"
                                value={caseText}
                                onChange={(e) => setCaseText(e.target.value)}
                                placeholder={"E.G. 45M, CHEST PAIN FOR 2 HOURS, SWEATING, NAUSEA, PAIN RADIATES TO LEFT ARM. HISTORY OF HTN. BP 150/90, HR 105 IRREGULAR ON PALPATION."}
                                rows={8}
                                className="w-full resize-none rounded-[2rem] border border-rose-50 bg-rose-50/10 px-6 py-5 font-black text-sm text-slate-900 placeholder:text-rose-200 placeholder:font-black placeholder:uppercase placeholder:tracking-widest focus:border-rose-300 focus:outline-none focus:ring-4 focus:ring-rose-500/5 transition-all outline-none leading-loose"
                            />
                        </section>

                        {/* Optional Inputs */}
                        <section className="rounded-[2rem] border border-rose-50 bg-white shadow-xl shadow-rose-500/5 overflow-hidden">
                            <button
                                onClick={() => setOptOpen(!optOpen)}
                                className="w-full flex items-center justify-between px-7 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:bg-rose-50/30 transition-all"
                            >
                                <span className="flex items-center gap-3">
                                    <Plus className="size-4 text-rose-500" />
                                    Inject Extended Context
                                </span>
                                {optOpen ? <ChevronUp className="size-4 text-rose-400" /> : <ChevronDown className="size-4 text-rose-400" />}
                            </button>

                            {optOpen && (
                                <div className="px-7 pb-6 space-y-4 border-t border-rose-50 pt-5">
                                    {([
                                        { key: "symptoms", label: "Symptom Cluster" },
                                        { key: "vitals", label: "Vital Assets" },
                                        { key: "history", label: "PMH Matrix" },
                                        { key: "riskFactors", label: "Risk Vectors" },
                                        { key: "ecgData", label: "ECG Findings (TEXT)" },
                                        { key: "labData", label: "Lab Data (TEXT)" },
                                    ] as { key: keyof OptionalFields; label: string }[]).map(({ key, label }) => (
                                        <div key={key}>
                                            {!fieldOpen[key] ? (
                                                <button
                                                    onClick={() => setFieldOpen((p) => ({ ...p, [key]: true }))}
                                                    className="flex items-center gap-2 text-[10px] font-black text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-widest bg-rose-50 px-3 py-2 rounded-full border border-rose-100/50"
                                                >
                                                    <Plus className="size-3.5" /> {label}
                                                </button>
                                            ) : (
                                                <div className="animate-in slide-in-from-top-2 duration-300">
                                                    <div className="flex items-center justify-between mb-2 px-1">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
                                                        <button
                                                            onClick={() => { setFieldOpen((p) => ({ ...p, [key]: false })); setOptFields((p) => ({ ...p, [key]: "" })) }}
                                                            className="text-rose-200 hover:text-rose-500 transition-colors"
                                                        >
                                                            <X className="size-4" />
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        value={optFields[key]}
                                                        onChange={(e) => setOptFields((p) => ({ ...p, [key]: e.target.value }))}
                                                        rows={2}
                                                        placeholder={`INJECT ${label.toUpperCase()}...`}
                                                        className="w-full resize-none rounded-2xl border border-rose-50 bg-rose-50/10 px-4 py-3 text-sm font-black text-slate-900 placeholder:text-rose-200 placeholder:font-black placeholder:uppercase placeholder:tracking-widest focus:border-rose-300 focus:outline-none focus:ring-4 focus:ring-rose-500/5 transition-all outline-none"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* File Upload */}
                        <section className="rounded-[2.5rem] border border-rose-50 bg-white p-7 shadow-xl shadow-rose-500/5">
                            <h2 className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Investigations Payload</h2>
                            <div
                                onDrop={(e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files) }}
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                                onDragLeave={() => setIsDragging(false)}
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                    "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[2rem] border-2 border-dashed px-6 py-8 text-center transition-all duration-500 group",
                                    isDragging
                                        ? "border-rose-500 bg-rose-50 shadow-inner"
                                        : "border-rose-100 bg-rose-50/10 hover:border-rose-300 hover:bg-rose-50/30"
                                )}
                            >
                                <div className="w-14 h-14 rounded-2xl bg-white border border-rose-100 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 shadow-rose-500/5">
                                    <Upload className={cn("size-6", isDragging ? "text-rose-500" : "text-rose-300")} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Transmit ECG or Lab Assets</p>
                                    <p className="text-[9px] font-bold text-rose-300 uppercase tracking-[0.15em] mt-1">PDF · PNG · JPG · TXT — AUTO-SORTING ACTIVE</p>
                                </div>
                                <input ref={fileInputRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.txt" className="hidden"
                                    onChange={(e) => e.target.files && addFiles(e.target.files)} />
                            </div>
                            {uploadedFiles.length > 0 && (
                                <div className="mt-5 flex flex-wrap gap-2">
                                    {uploadedFiles.map((f) => (
                                        <span key={f.id} className={cn(
                                            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-sm transition-all animate-in zoom-in-50 duration-300",
                                            f.type === "ecg" ? "border-rose-200 bg-rose-500 text-white"
                                                : f.type === "labs" ? "border-emerald-200 bg-emerald-500 text-white"
                                                    : "border-slate-200 bg-slate-900 text-white"
                                        )}>
                                            {f.type === "ecg" ? <Activity className="size-3" /> : f.type === "labs" ? <FlaskConical className="size-3" /> : <FileText className="size-3" />}
                                            <span className="max-w-[120px] truncate">{f.name}</span>
                                            <CheckCircle2 className="size-3 opacity-70" />
                                            <button onClick={(e) => { e.stopPropagation(); removeFile(f.id) }} className="hover:scale-125 transition-transform"><X className="size-3" /></button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Context Toggles */}
                        <section className="rounded-[2.5rem] border border-rose-50 bg-white p-7 shadow-xl shadow-rose-500/5">
                            <h2 className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Intelligence Matrix Switches</h2>
                            <div className="space-y-3">
                                <Toggle id="t-ecg" checked={toggles.ecg} disabled={!hasECG}
                                    label="Activate ECG Synthesis" description={hasECG ? "Asset Synchronized" : "Transmit ECG to Activate"}
                                    icon={<Activity className="size-5" />}
                                    onChange={(v) => setToggles((p) => ({ ...p, ecg: v }))} />
                                <Toggle id="t-labs" checked={toggles.labs} disabled={!hasLabs}
                                    label="Activate Lab Core" description={hasLabs ? "Asset Synchronized" : "Transmit Labs to Activate"}
                                    icon={<FlaskConical className="size-5" />}
                                    onChange={(v) => setToggles((p) => ({ ...p, labs: v }))} />
                                <LockedToggle id="t-conservative" label="High-Fidelity Reasoning" description="Always Active for Clinical Safety" />
                                <LockedToggle id="t-guidelines" label="Protocol Alignment" description="ESC / WHO / NICE Frameworks Active" />
                                <LockedToggle id="t-redflags" label="Lethal Pattern Detection" description="Cannot be Suppressed — 100% Surface Rate" />
                            </div>
                        </section>

                        {/* Generate CTA */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 to-rose-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <button
                                id="generate-differential-btn"
                                onClick={handleGenerate}
                                disabled={!caseText.trim() || isGenerating}
                                className={cn(
                                    "relative w-full rounded-[2rem] px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-rose-500/20",
                                    caseText.trim() && !isGenerating
                                        ? "bg-slate-900 text-white shadow-2xl hover:bg-rose-600 hover:scale-[1.02] active:scale-[0.98]"
                                        : "bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200"
                                )}
                            >
                                {isGenerating ? (
                                    <span className="inline-flex items-center gap-3 justify-center">
                                        <Loader2 className="size-5 animate-spin" />
                                        Synthesizing Differential Matrix...
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-3 justify-center">
                                        <RefreshCw className="size-5" />
                                        Execute Diagnostic Probe
                                    </span>
                                )}
                            </button>
                        </div>
                        {!caseText.trim() && (
                            <p className="text-center text-[9px] font-black text-rose-300 uppercase tracking-widest animate-pulse">Enter Matrix Data to Execute</p>
                        )}
                    </div>

                    {/* ═══════════════════════════════════════════════════════════════════ */}
                    {/* RIGHT — Output Panel                                                */}
                    {/* ═══════════════════════════════════════════════════════════════════ */}
                    <div>
                        {output ? (
                            <div className="space-y-4">

                                {/* Disclaimer Banner */}
                                <div className="flex items-start gap-5 rounded-[2rem] border border-rose-100 bg-rose-50/50 px-8 py-6 shadow-xl shadow-rose-500/5">
                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-rose-500/10 shrink-0">
                                        <AlertTriangle className="size-6 text-rose-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-1">Intelligence Matrix Output · Purely Advisory</p>
                                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                                            Synthesized probabilities based on ingested data. Review all condition paths critically.
                                            Final diagnostic authority resides with the human clinician.
                                        </p>
                                    </div>
                                </div>

                                {/* Ranked Differentials */}
                                <div>
                                    <h2 className="mb-5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3 ml-1">
                                        <ClipboardList className="size-4 text-rose-500" /> RANKED CONDITION MATRIX
                                    </h2>
                                    <div className="space-y-6">
                                        {output.differentials.map((d) => (
                                            <DifferentialCard key={d.rank} diff={d} />
                                        ))}
                                    </div>
                                </div>

                                {/* Red Flags */}
                                <div className="rounded-[2.5rem] border-2 border-rose-500 bg-rose-50 p-8 shadow-2xl shadow-rose-500/10">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                                            <ShieldAlert className="size-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-[10px] font-black text-rose-600 uppercase tracking-[0.3em]">Lethal Patterns Detected</h2>
                                            <p className="text-lg font-black text-slate-900 uppercase tracking-tight mt-0.5">Urgent Clinical Alerts</p>
                                        </div>
                                    </div>
                                    <ul className="space-y-4">
                                        {output.redFlags.map((rf, i) => (
                                            <li key={i} className="flex items-start gap-4 text-[11px] font-black text-slate-800 uppercase tracking-widest leading-loose bg-white/50 p-4 rounded-2xl border border-rose-100">
                                                <AlertTriangle className="size-4 text-rose-500 shrink-0" />
                                                {rf}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Suggested Next Steps */}
                                <div className="rounded-[2.5rem] border border-rose-50 bg-white p-8 shadow-xl shadow-rose-500/5">
                                    <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-2 flex items-center gap-3">
                                        <Activity className="size-4 text-rose-500" />
                                        Inquiry Trajectory
                                    </h2>
                                    <p className="text-[10px] font-bold text-rose-300 uppercase tracking-widest mb-6 ml-7 leading-relaxed">
                                        Non-prescriptive trajectory for clinical verification only.
                                    </p>
                                    <ul className="space-y-3 ml-1">
                                        {output.nextSteps.map((s, i) => (
                                            <li key={i} className="flex items-start gap-4 text-[11px] font-bold text-slate-600 leading-relaxed group">
                                                <div className="mt-1 size-2 rounded-full bg-rose-100 group-hover:bg-rose-500 transition-colors shrink-0" />
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Uncertainty Statement */}
                                <div className="rounded-[2rem] border border-rose-50 bg-rose-50/20 px-8 py-6">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
                                        <span className="text-rose-500 font-black mr-2">⚠ Precision Limitations:</span>
                                        {output.uncertainty}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-4 pt-4">
                                    <button id="copy-ddx-btn" onClick={handleCopy}
                                        className={cn(
                                            "inline-flex flex-1 items-center justify-center gap-3 rounded-[1.5rem] border-2 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 focus:outline-none focus:ring-4",
                                            copySuccess
                                                ? "border-emerald-500 bg-emerald-50 text-emerald-600 focus:ring-emerald-500/20"
                                                : "border-rose-100 bg-white text-rose-500 hover:border-rose-300 hover:bg-rose-50 shadow-xl shadow-rose-500/5 focus:ring-rose-500/10"
                                        )}>
                                        {copySuccess ? <><CheckCircle2 className="size-4" /> Assets Copied</> : <><Copy className="size-4" /> Copy To Nexus</>}
                                    </button>
                                    <button id="download-ddx-pdf-btn" onClick={() => exportPDF(caseText, output, patientName, doctorName)}
                                        className="inline-flex flex-1 items-center justify-center gap-3 rounded-[1.5rem] border-2 border-slate-900 bg-slate-900 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all duration-500 hover:bg-rose-600 hover:border-rose-600 shadow-xl shadow-rose-500/10 focus:outline-none focus:ring-4 focus:ring-rose-500/20">
                                        <Download className="size-4" /> Export Report (A4)
                                    </button>
                                    <button id="reset-ddx-btn" onClick={handleReset}
                                        className="inline-flex items-center justify-center gap-3 rounded-[1.5rem] border-2 border-rose-50 bg-rose-50/50 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-rose-300 transition-all duration-500 hover:text-rose-600 hover:border-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-500/10">
                                        <RefreshCw className="size-4" /> Clear Matrix
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Empty / Loading State */
                            <div className="flex h-full min-h-[600px] flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-rose-100 bg-rose-50/10 p-12 text-center animate-in fade-in duration-1000">
                                <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-white border border-rose-50 shadow-2xl shadow-rose-500/10 rotate-6 mb-8">
                                    <ClipboardList className="size-10 text-rose-200" />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-800">Knowledge Waiting Area</h3>
                                {isGenerating ? (
                                    <div className="mt-6 space-y-4">
                                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] flex items-center gap-3 justify-center">
                                            <Loader2 className="size-5 animate-spin" />
                                            Synthesizing Differential Matrix...
                                        </p>
                                        <div className="flex gap-2 justify-center">
                                            {[0, 1, 2].map((i) => (
                                                <div key={i} className="h-2 w-2 rounded-full bg-rose-500/40"
                                                    style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="mt-4 max-w-xs text-[10px] font-bold text-rose-300 uppercase tracking-widest leading-loose">
                                        Transmit matrix data and execute diagnostic probe to surface clinical differentials.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
        </div>
    )
}
