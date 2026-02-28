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
    High: { bar: "bg-red-500", badge: "bg-red-900/60 text-red-300 border border-red-700", label: "High" },
    Moderate: { bar: "bg-amber-500", badge: "bg-amber-900/60 text-amber-300 border border-amber-700", label: "Moderate" },
    "Low-Moderate": { bar: "bg-yellow-600", badge: "bg-yellow-900/60 text-yellow-300 border border-yellow-700", label: "Low–Moderate" },
    Low: { bar: "bg-slate-500", badge: "bg-slate-700 text-slate-300 border border-slate-600", label: "Low" },
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function LockedToggle({ id, label, description }: { id: string; label: string; description?: string }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-700/60 bg-slate-800/40 px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
                <Lock className="size-3.5 shrink-0 text-amber-500" />
                <div>
                    <p className="text-sm font-medium text-slate-300">{label}</p>
                    {description && <p className="text-xs text-slate-500">{description}</p>}
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider">Always Active</span>
                <div className="h-5 w-9 rounded-full bg-amber-600/70 relative flex items-center cursor-not-allowed">
                    <span className="absolute right-0.5 block size-4 rounded-full bg-white shadow-sm" />
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
            "flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors",
            disabled
                ? "border-slate-700/40 bg-slate-800/20 opacity-40 cursor-not-allowed"
                : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
        )}>
            <div className="flex items-center gap-3 min-w-0">
                {icon && <span className="shrink-0 text-slate-400">{icon}</span>}
                <div>
                    <p className="text-sm font-medium text-slate-300">{label}</p>
                    {description && <p className="text-xs text-slate-500 truncate">{description}</p>}
                </div>
            </div>
            <button
                id={id} role="switch" aria-checked={checked}
                disabled={disabled}
                onClick={() => !disabled && onChange?.(!checked)}
                className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors",
                    checked ? "bg-blue-600" : "bg-slate-600",
                    disabled ? "cursor-not-allowed" : "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                )}
            >
                <span className={cn(
                    "pointer-events-none block size-4 rounded-full bg-white shadow-sm ring-0 transition-transform",
                    checked ? "translate-x-4" : "translate-x-0"
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
                    <strong key={i} className="font-bold text-white">
                        {p.slice(2, -2)}
                    </strong>
                )
            }
            return p
        })
    }

    return (
        <div className="rounded-xl border border-slate-700 bg-slate-800/70 overflow-hidden shadow-lg animate-in fade-in duration-300">
            {/* Card Header */}
            <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-700/60">
                <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-xs font-bold text-slate-300">
                        #{diff.rank}
                    </span>
                    <div>
                        <h3 className="font-semibold text-white text-base leading-tight">
                            {diff.condition}
                        </h3>
                        {diff.icdCode && (
                            <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">
                                ICD-10: {diff.icdCode}
                            </span>
                        )}
                    </div>
                </div>
                <span className={cn("shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold", config.badge)}>
                    {config.label}
                </span>
            </div>

            {/* Likelihood Bar */}
            <div className="px-5 pt-4 pb-3">
                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-20 shrink-0">Likelihood</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-700 overflow-hidden">
                        <div
                            className={cn("h-full rounded-full transition-all duration-700", config.bar)}
                            style={{ width: `${diff.likelihoodPct}%` }}
                        />
                    </div>
                    <span className="text-xs font-mono text-slate-400 w-8 text-right">
                        {diff.likelihoodPct}%
                    </span>
                </div>
            </div>

            {/* Evidence Grid */}
            <div className="grid grid-cols-2 gap-px bg-slate-700/30 border-t border-slate-700/60">
                <div className="px-4 py-3 bg-slate-800/50">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-500 mb-2">
                        ✓ Supports
                    </p>
                    <ul className="space-y-1">
                        {diff.supports.map((s, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
                                <span className="mt-1.5 h-1 w-1 rounded-full bg-emerald-500 shrink-0" />
                                <span>{renderBold(s)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="px-4 py-3 bg-slate-800/50">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-red-400 mb-2">
                        ✗ Against
                    </p>
                    <ul className="space-y-1">
                        {diff.against.length > 0 ? (
                            diff.against.map((a, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-400">
                                    <span className="mt-1.5 h-1 w-1 rounded-full bg-red-500/60 shrink-0" />
                                    <span>{renderBold(a)}</span>
                                </li>
                            ))
                        ) : (
                            <li className="text-[10px] text-slate-500 italic">No significant findings</li>
                        )}
                    </ul>
                </div>
            </div>

            {/* Guideline Footer */}
            <div className="px-5 py-3 border-t border-slate-700/60 bg-slate-900/40">
                <p className="text-[11px] italic text-slate-500">
                    <span className="text-blue-400 not-italic font-semibold">📋 Guideline Note: </span>
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
        <div className="min-h-screen bg-[#0B1523] text-slate-200 font-sans">

            {/* ── Persistent Disclaimer Bar ─────────────────────────────────────────── */}
            <div className="sticky top-0 z-50 border-l-4 border-amber-500 bg-amber-950/90 backdrop-blur-md px-6 py-3 flex items-center gap-4 shadow-md">
                <Stethoscope className="size-5 shrink-0 text-amber-400" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-amber-200">Differential Diagnosis Assistant &nbsp;·&nbsp; Clinical Decision Support</p>
                    <p className="text-xs text-amber-400/80">
                        This tool supports clinical reasoning and does not provide diagnoses or treatment decisions.
                        Physician use only — not for patient viewing.
                    </p>
                </div>
                <div className="flex gap-2 shrink-0">
                    <span className="rounded-md bg-amber-900 border border-amber-700 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 uppercase tracking-wider">Not for Patient Use</span>
                    <span className="rounded-md bg-red-950 border border-red-800 px-2.5 py-0.5 text-[10px] font-bold text-red-400 uppercase tracking-wider">Physician Access Only</span>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* ── Page Title ──────────────────────────────────────────────────────── */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/30">
                            <ClipboardList className="size-6 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Differential Diagnosis Assistant</h1>
                            <p className="text-sm text-slate-400">Decision Support · Reduce Anchoring Bias · Second Checklist</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr]">

                    {/* ═══════════════════════════════════════════════════════════════════ */}
                    {/* LEFT — Input Panel                                                  */}
                    {/* ═══════════════════════════════════════════════════════════════════ */}
                    <div className="space-y-4">

                        {/* Metadata Input */}
                        <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-5 shadow-lg">
                            <h2 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Metadata</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label htmlFor="patient-name" className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Patient Name / ID</label>
                                    <input
                                        id="patient-name"
                                        type="text"
                                        value={patientName}
                                        onChange={(e) => setPatientName(e.target.value)}
                                        placeholder="e.g. John Doe"
                                        className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="doctor-name" className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Ordering Doctor</label>
                                    <input
                                        id="doctor-name"
                                        type="text"
                                        value={doctorName}
                                        onChange={(e) => setDoctorName(e.target.value)}
                                        placeholder="e.g. Dr. House"
                                        className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Core Input */}
                        <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-5 shadow-lg">
                            <label htmlFor="case-summary" className="block mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                                Case Summary <span className="text-red-400">*</span>
                            </label>
                            <p className="text-xs text-slate-500 mb-3">Age, Sex, Chief Complaint, Duration — free text, no rigid fields</p>
                            <textarea
                                id="case-summary"
                                value={caseText}
                                onChange={(e) => setCaseText(e.target.value)}
                                placeholder={"e.g. 45M, chest pain for 2 hours, sweating, nausea, pain radiates to left arm. History of HTN. BP 150/90, HR 105 irregular on palpation."}
                                rows={6}
                                className="w-full resize-none rounded-lg border border-slate-600 bg-slate-900/70 px-4 py-3 font-mono text-sm text-slate-200 placeholder:text-slate-600 placeholder:font-sans focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors leading-relaxed"
                            />
                        </section>

                        {/* Optional Inputs */}
                        <section className="rounded-xl border border-slate-700 bg-slate-800/50 shadow-lg overflow-hidden">
                            <button
                                onClick={() => setOptOpen(!optOpen)}
                                className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium text-slate-300 hover:bg-slate-700/40 transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <Plus className="size-4 text-blue-400" />
                                    Add More Context (Optional)
                                </span>
                                {optOpen ? <ChevronUp className="size-4 text-slate-500" /> : <ChevronDown className="size-4 text-slate-500" />}
                            </button>

                            {optOpen && (
                                <div className="px-5 pb-5 space-y-3 border-t border-slate-700/60 pt-4">
                                    {([
                                        { key: "symptoms", label: "Symptoms" },
                                        { key: "vitals", label: "Vital Signs" },
                                        { key: "history", label: "Past Medical History / PMH" },
                                        { key: "riskFactors", label: "Risk Factors" },
                                        { key: "ecgData", label: "ECG Findings (Text)" },
                                        { key: "labData", label: "Lab Results (Text)" },
                                    ] as { key: keyof OptionalFields; label: string }[]).map(({ key, label }) => (
                                        <div key={key}>
                                            {!fieldOpen[key] ? (
                                                <button
                                                    onClick={() => setFieldOpen((p) => ({ ...p, [key]: true }))}
                                                    className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                                >
                                                    <Plus className="size-3.5" /> {label}
                                                </button>
                                            ) : (
                                                <div>
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <label className="text-xs font-medium text-slate-400">{label}</label>
                                                        <button
                                                            onClick={() => { setFieldOpen((p) => ({ ...p, [key]: false })); setOptFields((p) => ({ ...p, [key]: "" })) }}
                                                            className="text-slate-500 hover:text-red-400"
                                                        >
                                                            <X className="size-3.5" />
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        value={optFields[key]}
                                                        onChange={(e) => setOptFields((p) => ({ ...p, [key]: e.target.value }))}
                                                        rows={2}
                                                        placeholder={`Enter ${label.toLowerCase()}…`}
                                                        className="w-full resize-none rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-sm font-mono text-slate-300 placeholder:text-slate-600 placeholder:font-sans focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* File Upload */}
                        <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-5 shadow-lg">
                            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Upload Investigations</h2>
                            <div
                                onDrop={(e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files) }}
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                                onDragLeave={() => setIsDragging(false)}
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                    "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors",
                                    isDragging
                                        ? "border-blue-500 bg-blue-900/20"
                                        : "border-slate-600 hover:border-slate-500 hover:bg-slate-700/20"
                                )}
                            >
                                <Upload className={cn("size-5", isDragging ? "text-blue-400" : "text-slate-500")} />
                                <p className="text-sm font-medium text-slate-400">Upload ECG or Lab files</p>
                                <p className="text-xs text-slate-600">PDF · PNG · JPG · TXT — auto-categorised</p>
                                <input ref={fileInputRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.txt" className="hidden"
                                    onChange={(e) => e.target.files && addFiles(e.target.files)} />
                            </div>
                            {uploadedFiles.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {uploadedFiles.map((f) => (
                                        <span key={f.id} className={cn(
                                            "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium",
                                            f.type === "ecg" ? "border-violet-600/60 bg-violet-900/30 text-violet-300"
                                                : f.type === "labs" ? "border-emerald-600/60 bg-emerald-900/30 text-emerald-300"
                                                    : "border-slate-600 bg-slate-700 text-slate-300"
                                        )}>
                                            {f.type === "ecg" ? <Activity className="size-3" /> : f.type === "labs" ? <FlaskConical className="size-3" /> : <FileText className="size-3" />}
                                            <span className="max-w-[120px] truncate">{f.name}</span>
                                            <CheckCircle2 className="size-3 opacity-70" />
                                            <button onClick={() => removeFile(f.id)} className="hover:opacity-60"><X className="size-3" /></button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Context Toggles */}
                        <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-5 shadow-lg">
                            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Context Switches</h2>
                            <div className="space-y-2">
                                <Toggle id="t-ecg" checked={toggles.ecg} disabled={!hasECG}
                                    label="Include ECG Analysis" description={hasECG ? "ECG file detected" : "Upload ECG to enable"}
                                    icon={<Activity className="size-4" />}
                                    onChange={(v) => setToggles((p) => ({ ...p, ecg: v }))} />
                                <Toggle id="t-labs" checked={toggles.labs} disabled={!hasLabs}
                                    label="Include Lab Results" description={hasLabs ? "Lab file detected" : "Upload labs to enable"}
                                    icon={<FlaskConical className="size-4" />}
                                    onChange={(v) => setToggles((p) => ({ ...p, labs: v }))} />
                                <LockedToggle id="t-conservative" label="Conservative Reasoning" description="Always active for safety" />
                                <LockedToggle id="t-guidelines" label="Use Clinical Guidelines" description="ESC / WHO / NICE protocols" />
                                <LockedToggle id="t-redflags" label="Include Red Flags" description="Always surfaced — cannot be suppressed" />
                            </div>
                        </section>

                        {/* Generate CTA */}
                        <button
                            id="generate-differential-btn"
                            onClick={handleGenerate}
                            disabled={!caseText.trim() || isGenerating}
                            className={cn(
                                "w-full rounded-xl px-6 py-4 text-sm font-bold tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                                caseText.trim() && !isGenerating
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40 hover:bg-blue-500 active:scale-[0.99]"
                                    : "bg-slate-700 text-slate-500 cursor-not-allowed"
                            )}
                        >
                            {isGenerating ? (
                                <span className="inline-flex items-center gap-2 justify-center">
                                    <Loader2 className="size-4 animate-spin" />
                                    Reasoning through differentials…
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-2 justify-center">
                                    <ClipboardList className="size-4" />
                                    Generate Differential
                                </span>
                            )}
                        </button>
                        {!caseText.trim() && (
                            <p className="text-center text-xs text-slate-600">Enter a case summary to continue</p>
                        )}
                    </div>

                    {/* ═══════════════════════════════════════════════════════════════════ */}
                    {/* RIGHT — Output Panel                                                */}
                    {/* ═══════════════════════════════════════════════════════════════════ */}
                    <div>
                        {output ? (
                            <div className="space-y-4">

                                {/* Disclaimer Banner */}
                                <div className="flex items-start gap-3 rounded-xl border border-amber-700/40 bg-amber-950/50 px-4 py-3">
                                    <AlertTriangle className="size-4 mt-0.5 shrink-0 text-amber-500" />
                                    <div>
                                        <p className="text-sm font-semibold text-amber-300">Differential Diagnosis Assistant — Decision Support Only</p>
                                        <p className="text-xs text-amber-500/80 mt-0.5">
                                            Review all differentials critically. No diagnosis is confirmed by this tool.
                                            Clinical gestalt and direct patient evaluation remain paramount.
                                        </p>
                                    </div>
                                </div>

                                {/* Ranked Differentials */}
                                <div>
                                    <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <ClipboardList className="size-3.5" /> Ranked Differentials
                                    </h2>
                                    <div className="space-y-3">
                                        {output.differentials.map((d) => (
                                            <DifferentialCard key={d.rank} diff={d} />
                                        ))}
                                    </div>
                                </div>

                                {/* Red Flags */}
                                <div className="rounded-xl border-l-4 border-red-600 bg-red-950/40 border border-red-800/30 px-5 py-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <ShieldAlert className="size-5 text-red-400" />
                                        <h2 className="text-sm font-bold text-red-300 uppercase tracking-wider">Red Flags Identified</h2>
                                    </div>
                                    <ul className="space-y-1.5">
                                        {output.redFlags.map((rf, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-red-300/90">
                                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                                                {rf}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Suggested Next Steps */}
                                <div className="rounded-xl border border-slate-700 bg-slate-800/50 px-5 py-4">
                                    <h2 className="text-sm font-bold text-slate-300 mb-1 flex items-center gap-2">
                                        <Activity className="size-4 text-blue-400" />
                                        Suggested Next Steps
                                    </h2>
                                    <p className="text-[11px] text-slate-500 italic mb-3">
                                        Non-prescriptive suggestions for clinical consideration. Never: Start, Diagnose, Give.
                                    </p>
                                    <ul className="space-y-1.5">
                                        {output.nextSteps.map((s, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Uncertainty Statement */}
                                <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 px-5 py-4">
                                    <p className="text-xs italic text-slate-500">
                                        <span className="text-amber-500 not-italic font-semibold">⚠ Reasoning Limitations: </span>
                                        {output.uncertainty}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-2 pt-1">
                                    <button id="copy-ddx-btn" onClick={handleCopy}
                                        className={cn(
                                            "inline-flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                                            copySuccess
                                                ? "border-emerald-700 bg-emerald-900/40 text-emerald-300"
                                                : "border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500 hover:bg-slate-700"
                                        )}>
                                        {copySuccess ? <><CheckCircle2 className="size-4" /> Copied!</> : <><Copy className="size-4" /> Copy to Clipboard</>}
                                    </button>
                                    <button id="download-ddx-pdf-btn" onClick={() => exportPDF(caseText, output, patientName, doctorName)}
                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:border-slate-500 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                        <Download className="size-4" /> Export PDF (EU A4)
                                    </button>
                                    <button id="reset-ddx-btn" onClick={handleReset}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-400 transition-all hover:border-red-800 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                                        <RefreshCw className="size-4" /> New Case
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Empty / Loading State */
                            <div className="flex h-full min-h-[500px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/20 p-10 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700">
                                    <ClipboardList className="size-8 text-slate-600" />
                                </div>
                                <h3 className="mt-5 text-base font-semibold text-slate-500">Differentials will appear here</h3>
                                {isGenerating ? (
                                    <div className="mt-4 space-y-3">
                                        <p className="text-sm text-blue-400 flex items-center gap-2 justify-center">
                                            <Loader2 className="size-4 animate-spin" />
                                            Reasoning through differentials…
                                        </p>
                                        <div className="flex gap-1.5 justify-center">
                                            {[0, 1, 2].map((i) => (
                                                <div key={i} className="h-2 w-2 rounded-full bg-blue-500/60"
                                                    style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="mt-2 max-w-xs text-sm text-slate-600">
                                        Enter a case summary and click "Generate Differential" to begin.
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
