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
                "flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors",
                locked
                    ? "border-slate-200 bg-slate-50 opacity-80"
                    : disabled
                        ? "border-slate-200 bg-white opacity-50 cursor-not-allowed"
                        : "border-slate-200 bg-white hover:border-slate-300"
            )}
        >
            <div className="flex items-center gap-3 min-w-0">
                <span className={cn("shrink-0", locked || disabled ? "text-slate-400" : "text-slate-500")}>
                    {icon}
                </span>
                <div className="min-w-0">
                    <p className={cn("text-sm font-medium leading-none", locked ? "text-slate-500" : "text-slate-700")}>
                        {label}
                    </p>
                    {description && (
                        <p className="mt-0.5 text-xs text-slate-400 truncate">{description}</p>
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
                        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
                        checked
                            ? disabled || locked
                                ? "bg-slate-400"
                                : "bg-blue-600"
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
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* ── Header ─────────────────────────────────────────────────────── */}
                <header className="mb-8">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
                            <ClipboardList className="size-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                AI Clinical Note
                            </h1>
                            <div className="mt-1 flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-100">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                    AI-assisted
                                </span>
                                <span className="text-slate-300">·</span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-100">
                                    <CheckCircle2 className="size-3" />
                                    Doctor-approved
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
                    <div className="space-y-5">

                        {/* Note Type Selector */}
                        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                                Note Type
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
                                            "rounded-lg border px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
                                            noteType === value
                                                ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                        )}
                                    >
                                        <span className="hidden sm:inline">{label}</span>
                                        <span className="sm:hidden">{abbr}</span>
                                    </button>
                                ))}
                            </div>
                            {!noteType && (
                                <p className="mt-2.5 text-xs text-slate-400">
                                    Select a note type to continue
                                </p>
                            )}
                        </section>

                        {/* Patient & Doctor Info */}
                        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                                Metadata
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label htmlFor="patient-name" className="text-xs font-medium text-slate-500">
                                        Patient Name / ID
                                    </label>
                                    <input
                                        id="patient-name"
                                        type="text"
                                        value={patientName}
                                        onChange={(e) => setPatientName(e.target.value)}
                                        placeholder="e.g. John Doe / 984521"
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="doctor-name" className="text-xs font-medium text-slate-500">
                                        Doctor Name
                                    </label>
                                    <input
                                        id="doctor-name"
                                        type="text"
                                        value={doctorName}
                                        onChange={(e) => setDoctorName(e.target.value)}
                                        placeholder="e.g. Smith"
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Input Panel */}
                        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-3 flex items-center justify-between">
                                <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                                    Clinical Input
                                </h2>
                                <button
                                    id="voice-input-btn"
                                    onClick={toggleVoice}
                                    title={isListening ? "Stop recording" : "Start voice input"}
                                    className={cn(
                                        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                                        isListening
                                            ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                    )}
                                >
                                    {isListening ? (
                                        <>
                                            <MicOff className="size-3.5" />
                                            <span>Stop</span>
                                            <span className="ml-1 h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                                        </>
                                    ) : (
                                        <>
                                            <Mic className="size-3.5" />
                                            <span>Dictate</span>
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
                                placeholder="Enter bullets, shorthand, or dictated notes…

Example:
• 45M, chest pain 2h, radiation to left arm
• Diaphoresis, dyspnea on exertion
• Hx: HTN, T2DM, smoker 20pk-yr
• BP 155/92, HR 98 irregular"
                                rows={9}
                                className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-700 placeholder:font-sans placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors"
                            />

                            {/* File Upload Zone */}
                            <div
                                id="file-upload-zone"
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                    "mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors",
                                    isDragging
                                        ? "border-blue-400 bg-blue-50"
                                        : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
                                )}
                            >
                                <Upload className={cn("size-5", isDragging ? "text-blue-500" : "text-slate-400")} />
                                <div>
                                    <p className="text-sm font-medium text-slate-600">
                                        {isDragging ? "Drop files here" : "Drag & drop or click to upload"}
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-400">
                                        PDF · Image (PNG, JPG) · Text — ECG and Lab reports auto-detected
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
                        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                                Context Options
                            </h2>
                            <div className="space-y-2">
                                <ToggleSwitch
                                    id="toggle-ecg"
                                    checked={toggles.ecgInterpretation}
                                    disabled={!hasECG}
                                    label="Include ECG Interpretation"
                                    description={hasECG ? "ECG file detected" : "Upload an ECG file to enable"}
                                    icon={<Activity className="size-4" />}
                                    onChange={(v) => setToggles((p) => ({ ...p, ecgInterpretation: v }))}
                                />
                                <ToggleSwitch
                                    id="toggle-lab"
                                    checked={toggles.labResults}
                                    disabled={!hasLab}
                                    label="Include Lab Results"
                                    description={hasLab ? "Lab report detected" : "Upload a lab report to enable"}
                                    icon={<FlaskConical className="size-4" />}
                                    onChange={(v) => setToggles((p) => ({ ...p, labResults: v }))}
                                />
                                <ToggleSwitch
                                    id="toggle-guidelines"
                                    checked={toggles.clinicalGuidelines}
                                    locked
                                    label="Use Clinical Guidelines"
                                    description="Always applied — per institutional policy"
                                    icon={<FileText className="size-4" />}
                                />
                                <ToggleSwitch
                                    id="toggle-conservative"
                                    checked={toggles.conservativeWording}
                                    locked
                                    label="Conservative / Legal Wording"
                                    description="Always applied — medicolegal compliance"
                                    icon={<Lock className="size-4" />}
                                />
                                <ToggleSwitch
                                    id="toggle-ddx"
                                    checked={toggles.differentialDiagnosis}
                                    label="Include Differential Diagnosis"
                                    description="Add DDx section to the generated note"
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
                                "w-full rounded-xl px-6 py-3.5 text-sm font-semibold tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                                canGenerate && !isGenerating
                                    ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:scale-[0.99]"
                                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                            )}
                        >
                            {isGenerating ? (
                                <span className="inline-flex items-center gap-2 justify-center">
                                    <Loader2 className="size-4 animate-spin" />
                                    Generating note…
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-2 justify-center">
                                    <ClipboardList className="size-4" />
                                    Generate Note
                                </span>
                            )}
                        </button>

                        {!noteType && (
                            <p className="text-center text-xs text-slate-400">
                                Select a note type and provide input to generate
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
                                    className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
                                >
                                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                                    <div>
                                        <p className="text-sm font-semibold text-amber-800">AI-generated content</p>
                                        <p className="mt-0.5 text-xs text-amber-700">
                                            This note has been generated by an AI model. It must be reviewed, verified,
                                            and approved by a licensed clinician before being used in any clinical
                                            context, patient record, or medicolegal document.
                                        </p>
                                    </div>
                                </div>

                                {/* Output Note */}
                                <div className="flex flex-1 flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                            <span className="text-xs font-semibold text-slate-500">
                                                {NOTE_TYPES.find((n) => n.value === noteType)?.label ?? "Clinical Note"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setIsPreview(!isPreview)}
                                                className={cn(
                                                    "flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                                                    isPreview
                                                        ? "bg-blue-600 text-white shadow-sm"
                                                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                                )}
                                            >
                                                {isPreview ? <><Edit3 className="size-3" /> Edit Mode</> : <><Eye className="size-3" /> Preview Mode</>}
                                            </button>
                                            <span className="text-xs text-slate-400">Review before use</span>
                                        </div>
                                    </div>

                                    {isPreview ? (
                                        <div className="flex-1 bg-white px-8 py-8 overflow-y-auto min-h-[480px] prose prose-slate prose-sm max-w-none">
                                            {outputNote.split('\n').map((line, i) => {
                                                if (!line.trim()) return <div key={i} className="h-4" />

                                                const leadingSpaces = line.match(/^(\s*)/)?.[1]?.length || 0
                                                const indent = leadingSpaces * 8
                                                const trimmed = line.trim()
                                                const isHeader = trimmed.toUpperCase() === trimmed && trimmed.length > 4 && !trimmed.includes('•')

                                                // Simple bolt parser for UI
                                                const renderBold = (txt: string) => {
                                                    const parts = txt.split(/(\*\*.*?\*\*)/g)
                                                    return parts.map((p, j) => {
                                                        if (p.startsWith('**') && p.endsWith('**')) {
                                                            return <strong key={j} className="text-slate-900 font-bold">{p.slice(2, -2)}</strong>
                                                        }
                                                        return p
                                                    })
                                                }

                                                if (isHeader) {
                                                    return <h3 key={i} className="text-slate-900 font-bold mt-6 mb-2 text-sm border-b border-slate-100 pb-1">{trimmed}</h3>
                                                }

                                                return (
                                                    <div key={i} className="flex gap-2 text-slate-700 leading-relaxed mb-1" style={{ paddingLeft: `${indent}px` }}>
                                                        {(trimmed.startsWith('•') || trimmed.startsWith('-')) && <span className="text-blue-500">•</span>}
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
                                            className="flex-1 resize-none bg-white px-5 py-4 font-mono text-[13px] leading-relaxed text-slate-700 focus:outline-none min-h-[480px]"
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
                                            "inline-flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                                            isApproved
                                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 cursor-default"
                                                : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 shadow-sm"
                                        )}
                                    >
                                        {isApproved ? (
                                            <>
                                                <CheckCircle2 className="size-4" />
                                                Approved & Finalized
                                            </>
                                        ) : (
                                            <>
                                                <FileCheck className="size-4" />
                                                Approve & Finalize
                                            </>
                                        )}
                                    </button>

                                    <button
                                        id="copy-to-emr-btn"
                                        onClick={handleCopy}
                                        title="Copy to EMR"
                                        className={cn(
                                            "inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                                            copySuccess
                                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                                        )}
                                    >
                                        {copySuccess ? (
                                            <CheckCircle2 className="size-4" />
                                        ) : (
                                            <Copy className="size-4" />
                                        )}
                                    </button>

                                    <button
                                        id="download-pdf-btn"
                                        onClick={handleDownloadPDF}
                                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                    >
                                        <Download className="size-4" />
                                        Export PDF (EU Report)
                                    </button>

                                    <button
                                        id="clear-note-btn"
                                        onClick={handleClear}
                                        title="Clear all"
                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Empty state */
                            <div className="flex h-full min-h-[480px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                                    <ClipboardList className="size-8 text-slate-300" />
                                </div>
                                <h3 className="mt-5 text-base font-semibold text-slate-600">
                                    Note will appear here
                                </h3>
                                <p className="mt-2 max-w-xs text-sm text-slate-400">
                                    {isGenerating ? (
                                        <span className="inline-flex items-center gap-2">
                                            <Loader2 className="size-4 animate-spin" />
                                            Generating your clinical note…
                                        </span>
                                    ) : (
                                        "Select a note type, provide clinical details, and click Generate Note."
                                    )}
                                </p>
                                {isGenerating && (
                                    <div className="mt-5 flex gap-1.5">
                                        {[0, 1, 2].map((i) => (
                                            <div
                                                key={i}
                                                className="h-2 w-2 rounded-full bg-blue-400"
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
