"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"

// ─── Web Speech API types (not in TS DOM lib by default) ─────────────────────
declare global {
    interface Window {
        SpeechRecognition: new () => ISpeechRecognition
        webkitSpeechRecognition: new () => ISpeechRecognition
    }
}

interface ISpeechRecognition extends EventTarget {
    lang: string
    continuous: boolean
    interimResults: boolean
    maxAlternatives: number
    start(): void
    stop(): void
    abort(): void
    onresult: ((event: ISpeechRecognitionEvent) => void) | null
    onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null
    onend: (() => void) | null
    onstart: (() => void) | null
}

interface ISpeechRecognitionEvent {
    resultIndex: number
    results: ISpeechRecognitionResultList
}

interface ISpeechRecognitionResultList {
    length: number
    [index: number]: ISpeechRecognitionResult
    item(index: number): ISpeechRecognitionResult
}

interface ISpeechRecognitionResult {
    isFinal: boolean
    length: number
    [index: number]: ISpeechRecognitionAlternative
    item(index: number): ISpeechRecognitionAlternative
}

interface ISpeechRecognitionAlternative {
    transcript: string
    confidence: number
}

interface ISpeechRecognitionErrorEvent {
    error: string
    message: string
}
// ──────────────────────────────────────────────────────────────────────────────
import {
    Mic,
    MicOff,
    Upload,
    X,
    FileText,
    Activity,
    FlaskConical,
    Copy,
    Download,
    Trash2,
    Loader2,
    AlertTriangle,
    CheckCircle2,
    ChevronRight,
    Lock,
    ClipboardList,
    FileCheck,
    Eye,
    Edit3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import apiClient from "@/lib/api-client"

// ─── Web Speech API types (not in TS DOM lib by default) ─────────────────────
// ... existing declarations ...

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type NoteType = "soap" | "progress" | "discharge" | "referral" | "opd"

interface UploadedFile {
    id: string
    name: string
    type: "ecg" | "lab" | "other"
    file: File
}

interface ToggleState {
    ecgInterpretation: boolean
    labResults: boolean
    clinicalGuidelines: boolean
    conservativeWording: boolean
    differentialDiagnosis: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const NOTE_TYPES: { value: NoteType; label: string; abbr: string }[] = [
    { value: "soap", label: "SOAP Note", abbr: "SOAP" },
    { value: "progress", label: "Progress Note", abbr: "Progress" },
    { value: "discharge", label: "Discharge Summary", abbr: "Discharge" },
    { value: "referral", label: "Referral Letter", abbr: "Referral" },
    { value: "opd", label: "OPD Note", abbr: "OPD" },
]

// ─────────────────────────────────────────────────────────────────────────────
// generateNote — real API call
// ─────────────────────────────────────────────────────────────────────────────

async function generateNote(
    noteType: string,
    inputText: string,
    uploadedFiles: UploadedFile[],
    toggles: { differentialDiagnosis: boolean }
): Promise<string> {
    const formData = new FormData()
    formData.append("note_type", noteType.toUpperCase())
    formData.append("raw_input", inputText)
    formData.append("include_differential", toggles.differentialDiagnosis.toString())

    const clinicalFile = uploadedFiles.find((f) => f.type === "other")?.file
    const ecgFile = uploadedFiles.find((f) => f.type === "ecg")?.file
    const labFile = uploadedFiles.find((f) => f.type === "lab")?.file

    if (clinicalFile) formData.append("clinical_file", clinicalFile)
    if (ecgFile) formData.append("ecg_file", ecgFile)
    if (labFile) formData.append("lab_file", labFile)

    try {
        const response = await apiClient.post("/proxy/clinical-note/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })

        if (response.data && response.data.generated_note) {
            return response.data.generated_note
        }
        throw new Error("Invalid response format")
    } catch (error) {
        console.error("API Error:", error)
        throw error
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: detect file type from name / MIME
// ─────────────────────────────────────────────────────────────────────────────

function detectFileType(file: File): "ecg" | "lab" | "other" {
    const name = file.name.toLowerCase()
    if (name.includes("ecg") || name.includes("ekg") || name.includes("electrocardiogram")) return "ecg"
    if (
        name.includes("lab") ||
        name.includes("result") ||
        name.includes("blood") ||
        name.includes("cbc") ||
        name.includes("fbc") ||
        name.includes("lft") ||
        name.includes("rft") ||
        name.includes("report")
    )
        return "lab"
    return "other"
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function ToggleSwitch({
    id,
    checked,
    disabled,
    locked,
    label,
    description,
    icon,
    onChange,
}: {
    id: string
    checked: boolean
    disabled?: boolean
    locked?: boolean
    label: string
    description?: string
    icon?: React.ReactNode
    onChange?: (checked: boolean) => void
}) {
    return (
        <div
            className={cn(
                "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-all duration-300",
                locked
                    ? "border-rose-100 bg-rose-50/30 opacity-80"
                    : disabled
                        ? "border-slate-100 bg-white opacity-50 cursor-not-allowed"
                        : "border-slate-200 bg-white hover:border-rose-300 shadow-sm hover:shadow-md"
            )}
        >
            <div className="flex items-center gap-3 min-w-0">
                <span className={cn("shrink-0", locked || disabled ? "text-slate-400" : "text-rose-500")}>
                    {icon}
                </span>
                <div className="min-w-0">
                    <p className={cn("text-sm font-black uppercase tracking-tight", locked ? "text-slate-500" : "text-slate-800")}>
                        {label}
                    </p>
                    {description && (
                        <p className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{description}</p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {locked && <Lock className="size-3 text-slate-400" />}
                <button
                    id={id}
                    role="switch"
                    aria-checked={checked}
                    disabled={disabled || locked}
                    onClick={() => !disabled && !locked && onChange?.(!checked)}
                    className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1",
                        checked
                            ? disabled || locked
                                ? "bg-slate-400"
                                : "bg-rose-500"
                            : "bg-slate-200",
                        (disabled || locked) ? "cursor-not-allowed" : "cursor-pointer"
                    )}
                >
                    <span
                        className={cn(
                            "pointer-events-none block size-4 rounded-full bg-white shadow-sm ring-0 transition-transform",
                            checked ? "translate-x-4" : "translate-x-0"
                        )}
                    />
                </button>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function AIClinicalNote() {
    // State
    const [noteType, setNoteType] = useState<NoteType | null>(null)
    const [inputText, setInputText] = useState("")
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [outputNote, setOutputNote] = useState("")
    const [isApproved, setIsApproved] = useState(false)
    const [copySuccess, setCopySuccess] = useState(false)
    const [micError, setMicError] = useState<string | null>(null)
    const [patientName, setPatientName] = useState("")
    const [doctorName, setDoctorName] = useState("")
    const [isPreview, setIsPreview] = useState(false)

    const [toggles, setToggles] = useState<ToggleState>({
        ecgInterpretation: false,
        labResults: false,
        clinicalGuidelines: true,
        conservativeWording: true,
        differentialDiagnosis: false,
    })

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const outputRef = useRef<HTMLTextAreaElement>(null)
    const recognitionRef = useRef<ISpeechRecognition | null>(null)

    // Derived state
    const hasECG = uploadedFiles.some((f) => f.type === "ecg")
    const hasLab = uploadedFiles.some((f) => f.type === "lab")
    const canGenerate = noteType !== null && (inputText.trim().length > 0 || uploadedFiles.length > 0)

    // Keep toggles in sync with file uploads
    useEffect(() => {
        setToggles((prev) => ({
            ...prev,
            ecgInterpretation: hasECG ? prev.ecgInterpretation : false,
            labResults: hasLab ? prev.labResults : false,
        }))
    }, [hasECG, hasLab])

    // ── File handling ──────────────────────────────────────────────────────────

    const addFiles = useCallback((files: FileList | File[]) => {
        const arr = Array.from(files)
        const allowed = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "text/plain"]
        const valid = arr.filter((f) => allowed.includes(f.type) || f.name.endsWith(".txt"))

        const mapped: UploadedFile[] = valid.map((f) => ({
            id: crypto.randomUUID(),
            name: f.name,
            type: detectFileType(f),
            file: f,
        }))
        setUploadedFiles((prev) => [...prev, ...mapped])
    }, [])

    const removeFile = (id: string) => {
        setUploadedFiles((prev) => prev.filter((f) => f.id !== id))
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        addFiles(e.dataTransfer.files)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => setIsDragging(false)

    // ── Voice input (Web Speech API) ──────────────────────────────────────────

    const toggleVoice = () => {
        setMicError(null)

        // Stop if already listening
        if (isListening) {
            recognitionRef.current?.stop()
            setIsListening(false)
            return
        }

        // Resolve SpeechRecognition constructor (vendor-prefixed in some browsers)
        const SpeechRecognitionCtor: (new () => ISpeechRecognition) | undefined =
            window.SpeechRecognition ?? window.webkitSpeechRecognition

        if (!SpeechRecognitionCtor) {
            setMicError("Speech recognition is not supported in this browser. Use Chrome or Edge.")
            return
        }

        const recognition = new SpeechRecognitionCtor()
        recognition.lang = "en-GB"
        recognition.continuous = true        // keep listening until manually stopped
        recognition.interimResults = false   // only append final transcripts
        recognition.maxAlternatives = 1

        recognition.onresult = (event: ISpeechRecognitionEvent) => {
            // Collect new results from this event batch only
            let transcript = ""
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i]
                if (result.isFinal) {
                    transcript += result[0].transcript
                }
            }
            if (transcript) {
                setInputText((prev) => prev ? prev.trimEnd() + "\n" + transcript : transcript)
            }
        }

        recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
            if (event.error === "aborted") return // user stopped manually, not an error
            setMicError(`Microphone error: ${event.error}. Please allow microphone access.`)
            setIsListening(false)
        }

        recognition.onend = () => {
            // Auto-restart if user hasn't manually stopped (for continuous dictation)
            // We check via ref to avoid stale closure
            setIsListening((current) => {
                if (current) {
                    // Still supposed to be listening — restart
                    try { recognition.start() } catch { /* ignore restart race */ }
                    return true
                }
                return false
            })
        }

        recognitionRef.current = recognition
        recognition.start()
        setIsListening(true)
    }

    // ── Generate ───────────────────────────────────────────────────────────────

    const handleGenerate = async () => {
        if (!canGenerate || isGenerating) return
        setIsGenerating(true)
        setOutputNote("")
        setIsApproved(false) // Reset approval on new generation
        try {
            let note = await generateNote(noteType!, inputText, uploadedFiles, toggles)
            // Replace hyphens or asterisks with proper bullets, preserving indentation
            note = note.replace(/^(\s*)[-\*]\s+/gm, "$1• ")
            setOutputNote(note)
        } catch {
            setOutputNote("Error generating note. Please try again.")
        } finally {
            setIsGenerating(false)
        }
    }

    // ── Output actions ─────────────────────────────────────────────────────────

    const handleCopy = () => {
        navigator.clipboard.writeText(outputNote).then(() => {
            setCopySuccess(true)
            setTimeout(() => setCopySuccess(false), 2000)
        })
    }

    const handleDownloadPDF = () => {
        const doc = new jsPDF({
            orientation: "p",
            unit: "mm",
            format: "a4",
        })

        const pageWidth = doc.internal.pageSize.getWidth()
        const pageHeight = doc.internal.pageSize.getHeight()
        const marginL = 20
        const marginR = 20
        const marginT = 25
        const contentWidth = pageWidth - marginL - marginR
        const dateStr = new Date().toLocaleDateString("en-GB") // DD/MM/YYYY
        const timeStr = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })

        // Helper: Add Watermark
        const addWatermark = () => {
            if (!isApproved) {
                doc.saveGraphicsState()
                const gState = (doc as any).GState ? new (doc as any).GState({ opacity: 0.05 }) : { opacity: 0.05 }
                doc.setGState(gState)
                doc.setTextColor(220, 220, 220)
                doc.setFont("helvetica", "bold")
                doc.setFontSize(40)
                doc.text("DRAFT REPORT", pageWidth / 2, pageHeight / 2 + 30, {
                    align: "center",
                    angle: 30,
                })
                doc.restoreGraphicsState()
            }
        }

        // Helper: Footer
        const addFooter = (currPage: number, totalPages: number) => {
            doc.setDrawColor(220, 220, 220)
            doc.line(marginL, pageHeight - 20, pageWidth - marginR, pageHeight - 20)
            doc.setFontSize(8)
            doc.setFont("helvetica", "normal")
            doc.setTextColor(120, 120, 120)
            doc.text(`Digitally Generated: ${dateStr} ${timeStr}`, marginL, pageHeight - 15)
            doc.text(`Physician: ${doctorName || "Pending Signature"}`, marginL, pageHeight - 11)
            doc.text("Confidentially Statement: This document contains protected health information.", marginL, pageHeight - 7)
            doc.text(`Page ${currPage} of ${totalPages}`, pageWidth - marginR, pageHeight - 11, { align: "right" })
        }

        // --- PAGE 1 HEADER ---
        addWatermark()
        doc.setFillColor(30, 41, 59) // Slate-800
        doc.rect(marginL, marginT, contentWidth, 25, "F")

        doc.setFontSize(16)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(255, 255, 255)
        doc.text("CLINICAL DOCUMENTATION", marginL + 8, marginT + 12)

        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(200, 210, 230)
        doc.text("Generated via Intelligent Clinical Assistant", marginL + 8, marginT + 18)

        doc.setFontSize(10)
        doc.setTextColor(255, 255, 255)
        doc.text(`Date: ${dateStr}`, pageWidth - marginR - 8, marginT + 12, { align: "right" })
        doc.text(`ID: ${Math.floor(Math.random() * 900000) + 100000}`, pageWidth - marginR - 8, marginT + 18, { align: "right" })

        // --- PATIENT INFO BLOCK ---
        let y = marginT + 32
        doc.setDrawColor(226, 232, 240) // Slate-200
        doc.setFillColor(248, 250, 252) // Slate-50
        doc.rect(marginL, y, contentWidth, 24, "FD")

        doc.setFontSize(9)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(71, 85, 105) // Slate-600
        doc.text("PATIENT INFORMATION", marginL + 6, y + 7)
        doc.text("PHYSICIAN", marginL + (contentWidth / 2) + 6, y + 7)

        doc.setFontSize(11)
        doc.setTextColor(15, 23, 42) // Slate-900
        doc.text(patientName || "Not Specified", marginL + 6, y + 14)
        doc.text(`Dr. ${doctorName || "Not Specified"}`, marginL + (contentWidth / 2) + 6, y + 14)

        doc.setFontSize(8)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(100, 116, 139) // Slate-500
        doc.text("Full Name / MRN", marginL + 6, y + 19)
        doc.text("Attending Physician", marginL + (contentWidth / 2) + 6, y + 19)

        // --- DOCUMENT TITLE ---
        y += 35
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(30, 41, 59)
        const title = (noteType ?? "Clinical Note").toUpperCase() + " SUMMARY"
        doc.text(title, marginL, y)

        doc.setDrawColor(59, 130, 246) // Blue-500
        doc.setLineWidth(1)
        doc.line(marginL, y + 2, marginL + 30, y + 2)

        y += 12

        // Robust Section Parser: Splits by lines that look like headers (e.g. "SUBJECTIVE:", "PLAN:", "**ASSESSMENT**")
        const sectionRegex = /^(\*\*|__)?([A-Z\s\-]{3,}|[A-Z][a-z]+(\s[A-Z][a-z]+)*):?(\*\*|__)?\s*$/gm
        const rawSections = outputNote.split(sectionRegex)

        // Improve section parsing logic
        const sections: { title: string; content: string }[] = []

        // If the above split doesn't work well, try a simpler fallback of splitting by double newlines or bold markers
        if (outputNote.includes("─────────────────────────────────────────────")) {
            outputNote.split(/[\n\r]─────────────────────────────────────────────[\n\r]/).forEach(s => {
                const lines = s.trim().split("\n")
                if (lines.length > 0) {
                    sections.push({
                        title: lines[0].trim(),
                        content: lines.slice(1).join("\n").trim()
                    })
                }
            })
        } else {
            // Find indices of headers
            const lines = outputNote.split("\n")
            let currentTitle = "Clinical Record"
            let currentContent: string[] = []

            lines.forEach((line) => {
                const trimmed = line.trim()
                const isHeader = (trimmed.toUpperCase() === trimmed && trimmed.length > 3 && !trimmed.includes(" ") && isNaN(Number(trimmed))) ||
                    (trimmed.endsWith(":") && trimmed.length < 30) ||
                    (trimmed.startsWith("**") && trimmed.endsWith("**"))

                if (isHeader) {
                    if (currentContent.length > 0 || currentTitle !== "Clinical Record") {
                        sections.push({ title: currentTitle.replace(/[\*:]/g, ""), content: currentContent.join("\n").trim() })
                    }
                    currentTitle = trimmed
                    currentContent = []
                } else {
                    currentContent.push(line)
                }
            })
            sections.push({ title: currentTitle.replace(/[\*:]/g, ""), content: currentContent.join("\n").trim() })
        }

        sections.forEach((section) => {
            if (!section.content) return

            // Check for page break
            if (y > pageHeight - 40) {
                doc.addPage()
                y = marginT
                addWatermark()
            }

            // Draw Section Title
            doc.setFontSize(10)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(30, 41, 59)
            doc.text(section.title.toUpperCase(), marginL, y)

            y += 1.5
            doc.setDrawColor(226, 232, 240)
            doc.setLineWidth(0.1)
            doc.line(marginL, y, pageWidth - marginR, y)
            y += 5.5

            // Draw Section Body
            doc.setFontSize(10)
            doc.setFont("helvetica", "normal")
            doc.setTextColor(51, 65, 85) // Slate-700

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

            const rawBody = section.content || ""
            const lines = rawBody.split("\n")

            lines.forEach((line) => {
                if (!line.trim()) {
                    y += 3
                    return
                }

                if (y > pageHeight - 25) {
                    doc.addPage()
                    y = marginT
                    addWatermark()
                }

                // Detect indentation and bullet type
                const leadingSpaces = line.match(/^(\s*)/)?.[1]?.length || 0
                const nestedLevel = Math.floor(leadingSpaces / 2)
                const trimmed = line.trim()
                const isBullet = trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")

                const baseIndent = marginL + (nestedLevel * 6)
                const textIndent = isBullet ? baseIndent + 5 : baseIndent

                if (isBullet) {
                    const cleanText = trimmed.replace(/^[\•\-\*]\s*/, "")
                    doc.setFont("helvetica", "bold")
                    doc.text("•", baseIndent + 2, y)
                    doc.setFont("helvetica", "normal")

                    const wrappedPart = doc.splitTextToSize(cleanText, pageWidth - marginR - textIndent)
                    wrappedPart.forEach((wLine: string) => {
                        if (y > pageHeight - 20) {
                            doc.addPage()
                            y = marginT
                            addWatermark()
                        }
                        drawStyledLine(wLine, textIndent, y)
                        y += 5
                    })
                } else {
                    const wrappedPart = doc.splitTextToSize(line, pageWidth - marginR - textIndent)
                    wrappedPart.forEach((wLine: string) => {
                        if (y > pageHeight - 20) {
                            doc.addPage()
                            y = marginT
                            addWatermark()
                        }
                        drawStyledLine(wLine, textIndent, y)
                        y += 5
                    })
                }
            })
            y += 6
        })

        // --- SIGNATURE BLOCK ---
        if (y > pageHeight - 50) {
            doc.addPage()
            y = marginT
            addWatermark()
        }

        y += 10
        doc.setDrawColor(203, 213, 225) // Slate-300
        doc.setLineWidth(0.5)
        doc.line(marginL, y, marginL + 60, y)

        doc.setFontSize(9)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(30, 41, 59)
        doc.text(`Dr. ${doctorName || "____________________"}`, marginL, y + 5)

        doc.setFontSize(8)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(100, 116, 139)
        doc.text("Electronic Signature / Stamp", marginL, y + 9)

        if (isApproved) {
            doc.setTextColor(22, 163, 74) // Green-600
            doc.setFont("helvetica", "bold")
            doc.text("VERIFIED & APPROVED", pageWidth - marginR, y + 5, { align: "right" })
            doc.setFontSize(7)
            doc.text(`Timestamp: ${dateStr} ${timeStr}`, pageWidth - marginR, y + 9, { align: "right" })
        }

        // Finalize Footers
        const totalPages = (doc as any).internal.pages.length - 1
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i)
            addFooter(i, totalPages)
        }

        doc.save(`Clinical_Note_${patientName.replace(/\s+/g, "_") || "Report"}.pdf`)
    }

    const handleClear = () => {
        setOutputNote("")
        setNoteType(null)
        setInputText("")
        setUploadedFiles([])
        setIsApproved(false)
        setPatientName("")
        setDoctorName("")
        setToggles({
            ecgInterpretation: false,
            labResults: false,
            clinicalGuidelines: true,
            conservativeWording: true,
            differentialDiagnosis: false,
        })
    }

    // ── File tag icon ──────────────────────────────────────────────────────────

    const FileTag = ({ file }: { file: UploadedFile }) => (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium",
                file.type === "ecg"
                    ? "border-violet-200 bg-violet-50 text-violet-700"
                    : file.type === "lab"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-50 text-slate-600"
            )}
        >
            {file.type === "ecg" ? (
                <Activity className="size-3" />
            ) : file.type === "lab" ? (
                <FlaskConical className="size-3" />
            ) : (
                <FileText className="size-3" />
            )}
            <span className="max-w-[120px] truncate">{file.name}</span>
            <span
                className={cn(
                    "ml-0.5 text-xs font-semibold",
                    file.type === "ecg" ? "text-violet-500" : file.type === "lab" ? "text-emerald-500" : "text-slate-400"
                )}
            >
                ✓
            </span>
            <button
                onClick={() => removeFile(file.id)}
                className="ml-0.5 rounded hover:opacity-70 transition-opacity"
                aria-label={`Remove ${file.name}`}
            >
                <X className="size-3" />
            </button>
        </span>
    )

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-white font-sans">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

                {/* ── Header ─────────────────────────────────────────────────────── */}
                <header className="mb-12">
                    <div className="flex items-end justify-between">
                        <div className="flex items-start gap-5">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-rose-500 shadow-xl shadow-rose-500/20 rotate-3">
                                <ClipboardList className="size-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">
                                    AI Clinical <span className="text-rose-500">Note</span>
                                </h1>
                                <div className="mt-3 flex items-center gap-3">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-rose-600 border border-rose-100">
                                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                                        Advanced AI Engine
                                    </span>
                                    <span className="text-slate-300">/</span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600 border border-slate-200">
                                        <CheckCircle2 className="size-3" />
                                        Certified Clinical Format
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
                    <div className="space-y-5">

                        {/* Note Type Selector */}
                        <section className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Output Framework
                            </h2>
                            <div
                                role="radiogroup"
                                aria-label="Note type selector"
                                className="flex flex-wrap gap-2"
                            >
                                {NOTE_TYPES.map(({ value, label, abbr }) => (
                                    <button
                                        key={value}
                                        id={`note-type-${value}`}
                                        role="radio"
                                        aria-checked={noteType === value}
                                        onClick={() => setNoteType(value)}
                                        className={cn(
                                            "rounded-xl border px-5 py-3 text-xs font-black uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1",
                                            noteType === value
                                                ? "border-rose-500 bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                                                : "border-slate-100 bg-rose-50/20 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                                        )}
                                    >
                                        <span className="hidden sm:inline">{label}</span>
                                        <span className="sm:hidden">{abbr}</span>
                                    </button>
                                ))}
                            </div>
                            {!noteType && (
                                <p className="mt-3 text-[10px] font-bold text-rose-400/70 border-l border-rose-200 pl-2 uppercase tracking-widest">
                                    Selection required for processing
                                </p>
                            )}
                        </section>

                        {/* Patient & Doctor Info */}
                        <section className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Clinical Context
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="patient-name" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                                        Identifier / MRN
                                    </label>
                                    <input
                                        id="patient-name"
                                        type="text"
                                        value={patientName}
                                        onChange={(e) => setPatientName(e.target.value)}
                                        placeholder="JS-9845 / Anonymous"
                                        className="w-full rounded-xl border border-rose-100 bg-rose-50/20 px-4 py-3 text-sm text-slate-800 font-medium focus:border-rose-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-rose-500/5 transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="doctor-name" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                                        Clinical Staff
                                    </label>
                                    <input
                                        id="doctor-name"
                                        type="text"
                                        value={doctorName}
                                        onChange={(e) => setDoctorName(e.target.value)}
                                        placeholder="Dr. Resident / NP"
                                        className="w-full rounded-xl border border-rose-100 bg-rose-50/20 px-4 py-3 text-sm text-slate-800 font-medium focus:border-rose-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-rose-500/5 transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Input Panel */}
                        <section className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm overflow-hidden">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    Clinical Insight
                                </h2>
                                <button
                                    id="voice-input-btn"
                                    onClick={toggleVoice}
                                    title={isListening ? "Stop recording" : "Start voice input"}
                                    className={cn(
                                        "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500",
                                        isListening
                                            ? "border-red-500 bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20"
                                            : "border-rose-100 bg-rose-50/50 text-rose-600 hover:border-rose-200 hover:bg-rose-50"
                                    )}
                                >
                                    {isListening ? (
                                        <>
                                            <MicOff className="size-3.5" />
                                            <span>Recording...</span>
                                            <span className="ml-1 h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                                        </>
                                    ) : (
                                        <>
                                            <Mic className="size-3.5" />
                                            <span>Voice Input</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {micError && (
                                <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                                    <AlertTriangle className="size-3.5 shrink-0" />
                                    {micError}
                                </div>
                            )}

                            <textarea
                                id="clinical-input-textarea"
                                ref={textareaRef}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="DICTATE OR TYPE CLINICAL FINDINGS..."
                                rows={8}
                                className="w-full resize-none rounded-2xl border border-rose-100 bg-rose-50/20 px-5 py-4 font-mono text-sm text-slate-700 placeholder:text-rose-300 placeholder:font-black placeholder:uppercase placeholder:tracking-widest focus:border-rose-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-rose-500/5 transition-all outline-none leading-relaxed"
                            />

                            {/* File Upload Zone */}
                            <div
                                id="file-upload-zone"
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                    "mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-all duration-300",
                                    isDragging
                                        ? "border-rose-400 bg-rose-50"
                                        : "border-rose-100 bg-rose-50/10 hover:border-rose-300 hover:bg-rose-50/50"
                                )}
                            >
                                <div className="p-3 rounded-xl bg-white shadow-sm">
                                    <Upload className={cn("size-6", isDragging ? "text-rose-500" : "text-rose-300")} />
                                </div>
                                <div className="mt-2">
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-600">
                                        {isDragging ? "Process Documents" : "Clinical Source Files"}
                                    </p>
                                    <p className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        EU GDPR Compliant Processing
                                    </p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    id="file-upload-input"
                                    multiple
                                    accept=".pdf,.png,.jpg,.jpeg,.txt"
                                    className="hidden"
                                    onChange={(e) => e.target.files && addFiles(e.target.files)}
                                />
                            </div>

                            {/* File Tags */}
                            {uploadedFiles.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {uploadedFiles.map((file) => (
                                        <FileTag key={file.id} file={file} />
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Context Switches */}
                        <section className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                AI Augmentation
                            </h2>
                            <div className="grid grid-cols-1 gap-3">
                                <ToggleSwitch
                                    id="toggle-ecg"
                                    checked={toggles.ecgInterpretation}
                                    disabled={!hasECG}
                                    label="ECG Engine"
                                    description={hasECG ? "Clinical waveform detected" : "Source missing"}
                                    icon={<Activity className="size-4" />}
                                    onChange={(v) => setToggles((p) => ({ ...p, ecgInterpretation: v }))}
                                />
                                <ToggleSwitch
                                    id="toggle-lab"
                                    checked={toggles.labResults}
                                    disabled={!hasLab}
                                    label="Lab Analyzer"
                                    description={hasLab ? "Panel data extraction" : "Source missing"}
                                    icon={<FlaskConical className="size-4" />}
                                    onChange={(v) => setToggles((p) => ({ ...p, labResults: v }))}
                                />
                                <ToggleSwitch
                                    id="toggle-guidelines"
                                    checked={toggles.clinicalGuidelines}
                                    locked
                                    label="EBM Guidelines"
                                    description="Mandatory Compliance"
                                    icon={<FileText className="size-4" />}
                                />
                                <ToggleSwitch
                                    id="toggle-ddx"
                                    checked={toggles.differentialDiagnosis}
                                    label="Clinical DDx"
                                    description="Generate Differential analysis"
                                    icon={<ChevronRight className="size-4" />}
                                    onChange={(v) => setToggles((p) => ({ ...p, differentialDiagnosis: v }))}
                                />
                            </div>
                        </section>

                        {/* Generate Button */}
                        <button
                            id="generate-note-btn"
                            onClick={handleGenerate}
                            disabled={!canGenerate || isGenerating}
                            className={cn(
                                "w-full rounded-2xl px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/20",
                                canGenerate && !isGenerating
                                    ? "bg-rose-500 text-white shadow-xl shadow-rose-500/20 hover:bg-rose-600 hover:-translate-y-0.5 active:translate-y-0"
                                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            )}
                        >
                            {isGenerating ? (
                                <span className="inline-flex items-center gap-3 justify-center">
                                    <Loader2 className="size-4 animate-spin" />
                                    Synthesizing Record...
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-3 justify-center">
                                    <ClipboardList className="size-4" />
                                    Generate Clinical Record
                                </span>
                            )}
                        </button>

                        {!noteType && (
                            <p className="text-center text-[10px] font-black uppercase tracking-[0.15em] text-slate-300">
                                System Standby · Awaiting Framework
                            </p>
                        )}
                    </div>

                    {/* ── RIGHT PANEL ─────────────────────────────────────────── */}
                    <div className="flex flex-col">
                        {outputNote ? (
                            <div className="flex flex-col gap-4 h-full">
                                {/* Disclaimer */}
                                <div
                                    role="alert"
                                    className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/50 px-5 py-4"
                                >
                                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rose-500" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-rose-600">AI Synthesized Content</p>
                                        <p className="mt-1 text-[10px] font-bold text-slate-500 uppercase tracking-tight leading-normal">
                                            European clinical standards. Professional verification required.
                                            Final clinical responsibility remains with the attending physician.
                                        </p>
                                    </div>
                                </div>

                                {/* Output Note */}
                                <div className="flex flex-1 flex-col rounded-3xl border border-rose-100 bg-white shadow-xl shadow-rose-500/5 overflow-hidden">
                                    <div className="flex items-center justify-between border-b border-rose-50 px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-800">
                                                {NOTE_TYPES.find((n) => n.value === noteType)?.label ?? "Clinical Note"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => setIsPreview(!isPreview)}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                    isPreview
                                                        ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                                                        : "bg-rose-50 text-rose-500 hover:bg-rose-100"
                                                )}
                                            >
                                                {isPreview ? <><Edit3 className="size-3" /> Edit</> : <><Eye className="size-3" /> Preview</>}
                                            </button>
                                        </div>
                                    </div>

                                    {isPreview ? (
                                        <div className="flex-1 bg-white px-10 py-10 overflow-y-auto min-h-[520px] prose prose-slate max-w-none">
                                            {outputNote.split('\n').map((line, i) => {
                                                if (!line.trim()) return <div key={i} className="h-6" />

                                                const leadingSpaces = line.match(/^(\s*)/)?.[1]?.length || 0
                                                const indent = leadingSpaces * 12
                                                const trimmed = line.trim()
                                                const isHeader = trimmed.toUpperCase() === trimmed && trimmed.length > 4 && !trimmed.includes('•')

                                                // Simple bolt parser for UI
                                                const renderBold = (txt: string) => {
                                                    const parts = txt.split(/(\*\*.*?\*\*)/g)
                                                    return parts.map((p, j) => {
                                                        if (p.startsWith('**') && p.endsWith('**')) {
                                                            return <strong key={j} className="text-slate-900 font-black">{p.slice(2, -2)}</strong>
                                                        }
                                                        return p
                                                    })
                                                }

                                                if (isHeader) {
                                                    return <h3 key={i} className="text-slate-900 font-black mt-10 mb-4 text-xs uppercase tracking-[0.2em] border-b-2 border-rose-500 w-fit pb-1">{trimmed}</h3>
                                                }

                                                return (
                                                    <div key={i} className="flex gap-3 text-slate-700 leading-relaxed mb-2 font-medium" style={{ paddingLeft: `${indent}px` }}>
                                                        {(trimmed.startsWith('•') || trimmed.startsWith('-')) && <span className="text-rose-500 font-bold">•</span>}
                                                        <span>{renderBold(trimmed.replace(/^[•-]\s*/, ''))}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <textarea
                                            id="note-output-textarea"
                                            ref={outputRef}
                                            value={outputNote}
                                            onChange={(e) => setOutputNote(e.target.value)}
                                            className="flex-1 resize-none bg-white px-8 py-8 font-mono text-sm leading-relaxed text-slate-700 focus:outline-none min-h-[520px]"
                                            spellCheck={false}
                                            aria-label="Generated clinical note — editable"
                                        />
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        id="approve-note-btn"
                                        onClick={() => setIsApproved(true)}
                                        disabled={isApproved}
                                        className={cn(
                                            "inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20",
                                            isApproved
                                                ? "border-emerald-100 bg-emerald-50 text-emerald-600 shadow-inner"
                                                : "border-rose-100 bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20"
                                        )}
                                    >
                                        {isApproved ? (
                                            <>
                                                <CheckCircle2 className="size-4" />
                                                Verified & Validated
                                            </>
                                        ) : (
                                            <>
                                                <FileCheck className="size-4" />
                                                Authorize Record
                                            </>
                                        )}
                                    </button>

                                    <button
                                        id="copy-to-emr-btn"
                                        onClick={handleCopy}
                                        title="Copy to Clipboard"
                                        className={cn(
                                            "inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-4 text-[10px] font-black transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/10",
                                            copySuccess
                                                ? "border-rose-100 bg-rose-50 text-rose-500"
                                                : "border-rose-100 bg-white text-rose-500 hover:bg-rose-50"
                                        )}
                                    >
                                        {copySuccess ? (
                                            <CheckCircle2 className="size-5" />
                                        ) : (
                                            <Copy className="size-5" />
                                        )}
                                    </button>

                                    <button
                                        id="download-pdf-btn"
                                        onClick={handleDownloadPDF}
                                        className="inline-flex flex-1 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-800 transition-all hover:border-rose-200 hover:bg-rose-50 shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/10"
                                    >
                                        <Download className="size-4 text-rose-500" />
                                        EU Clinical Report (PDF)
                                    </button>

                                    <button
                                        id="clear-note-btn"
                                        onClick={handleClear}
                                        title="Purge Current Data"
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-50 bg-red-50 px-5 py-4 text-red-600 transition-all hover:bg-red-500 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-400/20"
                                    >
                                        <Trash2 className="size-5" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Empty state */
                            <div className="flex h-full min-h-[520px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-rose-100 bg-rose-50/10 p-12 text-center">
                                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl shadow-rose-500/5 rotate-6">
                                    <ClipboardList className="size-10 text-rose-200" />
                                </div>
                                <h3 className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-slate-800">
                                    Awaiting Synthesizer
                                </h3>
                                <p className="mt-3 max-w-xs text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
                                    {isGenerating ? (
                                        <span className="inline-flex items-center gap-3">
                                            <Loader2 className="size-4 animate-spin text-rose-500" />
                                            Reconstructing Clinical Timeline...
                                        </span>
                                    ) : (
                                        "Framework selection and clinical input required to begin generation."
                                    )}
                                </p>
                                {isGenerating && (
                                    <div className="mt-8 flex gap-2">
                                        {[0, 1, 2].map((i) => (
                                            <div
                                                key={i}
                                                className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.3)]"
                                                style={{
                                                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bounce animation for loading dots */}
            <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
        </div>
    )
}
