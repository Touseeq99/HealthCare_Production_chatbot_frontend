"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    AlertTriangle,
    CheckCircle2,
    AlertCircle,
    Plus,
    Download,
    Share2,
    Activity,
    History,
    User,
    Stethoscope,
    Brain,
    X,
    Maximize2,
    FileText,
    BadgeCheck,
    TrendingUp,
    Heart,
    Scale,
    Upload,
    Loader2,
    ImageIcon,
    ShieldAlert,
    Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

// Status Color Constants
const COLORS = {
    normal: "#00D4AA",
    borderline: "#F5A623",
    abnormal: "#FF4D4D",
    info: "#0095FF"
}

interface ECGMetric {
    label: string
    value: string
    status: "normal" | "borderline" | "abnormal" | "info"
    note: string
}

interface ECGFeature {
    label: string
    value: string
    status: "normal" | "borderline" | "abnormal" | "info"
    note: string
}

interface ECGData {
    structured_data: {
        technical_quality: string
        rate: {
            ventricular_bpm: string
            atrial_bpm: string
        }
        rhythm: string
        axis: {
            qrs_degrees: string
            classification: string // normal | LAD | RAD | extreme
        }
        intervals: {
            pr_ms: string
            qrs_ms: string
            qt_ms: string
            qtc_ms: string
            qtc_formula: string
        }
        p_wave: string
        qrs_morphology: string
        st_segments: string
        t_waves: string
        u_waves: string
        specific_patterns: string[]
        final_interpretation: string
        differential: string[]
        urgency: "routine" | "urgent" | "critical"
        confidence: "low" | "medium" | "high"
        caveats: string | null
    }
    clinical_summary: string
    raw_content?: string
}


export function ECGReport() {
    const [isDismissed, setIsDismissed] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [reportData, setReportData] = useState<ECGData | null>(null)
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const [isConfirmed, setIsConfirmed] = useState(false)
    const [showNotes, setShowNotes] = useState(false)
    const [notes, setNotes] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()

    const parseECGReportText = (text: string): ECGData['structured_data'] | null => {
        if (!text || !text.includes("ECG ANALYSIS REPORT")) return null;

        const getField = (regex: RegExp) => {
            const match = text.match(regex);
            return (match && match[1]) ? match[1].trim().replace(/_{2,}/g, '') : "N/A";
        };

        const isChecked = (sectionMarker: string, label: string) => {
            const startIdx = text.indexOf(sectionMarker);
            if (startIdx === -1) return false;

            const markerNum = parseInt(sectionMarker.replace(/[\[\]]/g, ''));
            const nextMarker = `[${markerNum + 1}]`;
            let endIdx = text.indexOf(nextMarker, startIdx);
            if (endIdx === -1) endIdx = text.length;

            const sectionText = text.slice(startIdx, endIdx);
            const labelIdx = sectionText.indexOf(label);
            if (labelIdx === -1) return false;

            // Look for [✓], [x], [X], [*], [v] within 15 chars of the label
            const searchArea = sectionText.slice(Math.max(0, labelIdx - 15), Math.min(sectionText.length, labelIdx + 5));
            return /\[[✓vxX\*]\]/.test(searchArea);
        };

        try {
            const getNumericValue = (regex: RegExp) => {
                const match = text.match(regex);
                return match ? match[1].trim() : "N/A";
            };

            return {
                technical_quality: "Extracted from text",
                rate: {
                    ventricular_bpm: getNumericValue(/Rate:\s*~?(\d+)/),
                    atrial_bpm: getNumericValue(/Rate:\s*~?(\d+)/)
                },
                rhythm: getField(/Rhythm:\s*([^\n\[]+)/),
                axis: {
                    qrs_degrees: getField(/QRS Axis:\s*~?([+-]?\d+)/),
                    classification: isChecked("[5]", "Normal") ? "normal" : "LAD"
                },
                intervals: {
                    pr_ms: getField(/PR Interval:\s*~?([^\n\[\|]+)/),
                    qrs_ms: getField(/QRS Duration:\s*~?([^\n\[\|]+)/),
                    qt_ms: getField(/QT Interval:\s*~?([^\n\[\|]+)/),
                    qtc_ms: getField(/QTc:\s*~?([^\n\[\|]+)/),
                    qtc_formula: "Bazett"
                },
                p_wave: isChecked("[6]", "Normal") ? "Normal" : "Abnormal",
                qrs_morphology: isChecked("[6]", "Narrow") ? "Narrow" : "Wide",
                st_segments: isChecked("[6]", "Normal") ? "Normal" : "Changes Detected",
                t_waves: isChecked("[6]", "Normal") ? "Normal" : "Abnormal",
                u_waves: "None",
                specific_patterns: [
                    isChecked("[7]", "LVH") ? "LVH" : "",
                    isChecked("[7]", "RVH") ? "RVH" : "",
                    isChecked("[7]", "STEMI") ? "STEMI" : "",
                    isChecked("[7]", "WPW") ? "WPW" : "",
                    isChecked("[7]", "Brugada") ? "Brugada" : "",
                ].filter(Boolean),
                final_interpretation: getField(/Primary Diagnosis:\s*([^\n]+)/),
                differential: [getField(/Secondary Findings:\s*([^\n]+)/)].filter(Boolean),
                urgency: isChecked("[8]", "URGENT") ? "critical" : isChecked("[8]", "Soon") ? "urgent" : "routine",
                confidence: "medium",
                caveats: null
            } as any;
        } catch (e) {
            console.error("Manual parse failed:", e);
            return null;
        }
    };

    const handleConfirm = () => {

        setIsConfirmed(true)
        toast({
            title: "Report Signed",
            description: "The ECG interpretation has been confirmed and signed.",
        })
    }

    const handleExport = () => {
        if (!reportData) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "ecg-report-" + new Date().getTime() + ".json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        toast({
            title: "Export Successful",
            description: "The ECG report has been downloaded.",
        });
    }

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        setPreviewImage(URL.createObjectURL(file))

        const formData = new FormData()
        formData.append("file", file)

        try {
            const response = await fetch("/api/proxy/ecg/interpret", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) throw new Error("Failed to interpret ECG")
            const data = await response.json()

            // If API didn't return structured data but has a clinical summary, try to parse it
            if (!data.structured_data && data.clinical_summary) {
                const parsed = parseECGReportText(data.clinical_summary);
                if (parsed) {
                    data.structured_data = parsed;
                }
            }

            setReportData(data)
            toast({
                title: "Interpretation Complete",
                description: "ECG has been successfully analyzed by AI.",
            })
        } catch (error) {
            console.error("Upload error:", error)
            toast({
                title: "Upload Failed",
                description: "There was an error processing the ECG image.",
                variant: "destructive",
            })
        } finally {
            setIsUploading(false)
        }
    }

    const getStatusFromInterpretation = (interpretation: string): "normal" | "borderline" | "abnormal" | "info" => {
        const lower = interpretation.toLowerCase()
        if (lower.includes("abnormal") || lower.includes("prolonged") || lower.includes("short") || lower.includes("irregular")) return "abnormal"
        if (lower.includes("borderline") || lower.includes("note") || lower.includes("watch")) return "borderline"
        return "normal"
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "normal": return COLORS.normal
            case "borderline": return COLORS.borderline
            case "abnormal": return COLORS.abnormal
            case "info": return COLORS.info
            default: return "#94A3B8"
        }
    }

    const getStatusPill = (status: string) => {
        const color = getStatusColor(status)
        return (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase transition-all"
                style={{ borderColor: color, color: color, backgroundColor: `${color}10` }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                {status}
            </div>
        )
    }

    if (isUploading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 space-y-8">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-slate-100 border-t-rose-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Activity className="w-10 h-10 text-rose-500" />
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black text-rose-950 tracking-tight">Analyzing Waveforms...</h3>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto">
                        Extracting Intervals (PR, QRS, QTc), determining axis orientation, and rhythm classification.
                    </p>
                </div>
                <div className="w-full max-w-xs bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3, ease: "easeInOut" }}
                        className="bg-rose-500 h-full"
                    />
                </div>
            </div>
        )
    }

    if (!reportData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full text-center space-y-8"
                >
                    <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto shadow-inner relative group">
                        <div className="absolute inset-0 bg-rose-500/10 rounded-full blur-xl animate-pulse" />
                        <Activity className="w-12 h-12 text-rose-500 relative z-10" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-rose-950 tracking-tight underline decoration-rose-500/30 decoration-4 underline-offset-4">ECG Intelligence</h2>
                        <p className="text-slate-500 font-medium">Upload a 12-lead ECG tracing for instant AI interpretation and clinical metrics.</p>
                    </div>

                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="group relative cursor-pointer"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 to-amber-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                        <div className="relative flex flex-col items-center gap-4 p-12 bg-white border-2 border-dashed border-slate-200 rounded-2xl hover:border-rose-300 transition-all">
                            <Upload className="w-10 h-10 text-slate-400 group-hover:text-rose-500 transition-colors" />
                            <div className="space-y-1">
                                <p className="text-sm font-black text-slate-700">Click to upload or drag & drop</p>
                                <p className="text-xs text-slate-400">PNG, JPG or PDF (Max 10MB)</p>
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleUpload}
                            className="hidden"
                            accept="image/*,.pdf"
                        />
                    </div>

                    <div className="flex items-center justify-center gap-6 pt-4">
                        <div className="flex flex-col items-center gap-1">
                            <BadgeCheck className="w-5 h-5 text-emerald-500" />
                            <span className="text-[10px] font-black uppercase text-slate-400">Validated</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <Brain className="w-5 h-5 text-rose-500" />
                            <span className="text-[10px] font-black uppercase text-slate-400">GPT-5 AI</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <Scale className="w-5 h-5 text-amber-500" />
                            <span className="text-[10px] font-black uppercase text-slate-400">Compliance</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        )
    }

    if (!reportData.structured_data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-6">
                <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto" />
                <h2 className="text-2xl font-black text-rose-950">Incomplete Analysis</h2>
                <p className="text-slate-500 max-w-md mx-auto">
                    The AI was unable to extract structured metrics from the provided image. Please ensure the image is a clear, standard 12-lead ECG.
                </p>
                <div className="text-sm text-slate-400 bg-slate-100 p-4 rounded-lg w-full max-w-md overflow-auto text-left">
                    <p className="font-bold mb-2">Raw Clinical Summary:</p>
                    {reportData.clinical_summary || "No summary available."}
                </div>
                <Button
                    onClick={() => { setReportData(null); setPreviewImage(null); }}
                    className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-8 py-2 rounded-xl"
                >
                    Try Another Image
                </Button>
            </div>
        )
    }

    // Map API Data to UI structure
    const structured = reportData.structured_data
    const metrics: ECGMetric[] = [
        {
            label: "Ventricular Rate",
            value: structured.rate.ventricular_bpm,
            status: getStatusFromInterpretation(structured.final_interpretation),
            note: `Atrial: ${structured.rate.atrial_bpm} bpm`
        },
        {
            label: "Rhythm",
            value: structured.rhythm,
            status: getStatusFromInterpretation(structured.rhythm),
            note: structured.rhythm
        },
        {
            label: "QTc Interval",
            value: structured.intervals.qtc_ms,
            status: getStatusFromInterpretation(structured.intervals.qtc_ms > "450" ? "prolonged" : "normal"),
            note: `Formula: ${structured.intervals.qtc_formula}`
        }
    ]

    const formatAxis = (val: string) => {
        if (!val || val === "N/A") return "N/A";
        const match = val.match(/([+-]?\d+)/);
        return match ? `${match[1]}°` : val;
    }

    const features: ECGFeature[] = [
        {
            label: "P Wave",
            value: structured.p_wave,
            status: getStatusFromInterpretation(structured.p_wave),
            note: structured.p_wave
        },
        {
            label: "PR Interval",
            value: structured.intervals.pr_ms,
            status: getStatusFromInterpretation(parseInt(structured.intervals.pr_ms) > 200 ? "prolonged" : "normal"),
            note: structured.intervals.pr_ms + " ms"
        },
        {
            label: "QRS Duration",
            value: structured.intervals.qrs_ms,
            status: getStatusFromInterpretation(parseInt(structured.intervals.qrs_ms) > 120 ? "wide" : "normal"),
            note: structured.intervals.qrs_ms + " ms"
        },
        {
            label: "QRS Axis",
            value: formatAxis(structured.axis.qrs_degrees),
            status: getStatusFromInterpretation(structured.axis.classification),
            note: structured.axis.classification
        },
        {
            label: "ST Segment",
            value: structured.st_segments,
            status: getStatusFromInterpretation(structured.st_segments),
            note: structured.st_segments
        },
        {
            label: "T Waves",
            value: structured.t_waves,
            status: getStatusFromInterpretation(structured.t_waves),
            note: structured.t_waves
        },
        {
            label: "U Waves",
            value: structured.u_waves,
            status: "info",
            note: structured.u_waves
        }
    ]

    return (

        <div className="flex flex-col gap-6 p-4 lg:p-8 max-w-7xl mx-auto bg-[#F8FAFC]">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-rose-950 tracking-tight">ECG Interpretation Report</h1>
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge className={cn(
                            "text-white border-0 py-1 font-bold",
                            structured.urgency === "critical" ? "bg-[#FF4D4D]" : structured.urgency === "urgent" ? "bg-[#F5A623]" : "bg-[#00D4AA]"
                        )}>
                            <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                            {structured.urgency.toUpperCase()}
                        </Badge>
                        <span className="flex items-center text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-full">
                            <History className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
                            {new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="flex items-center text-xs text-rose-500 font-bold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100 uppercase tracking-wider">
                            <Brain className="w-3.5 h-3.5 mr-1.5" />
                            AI Confidence: {structured.confidence}
                        </span>
                    </div>
                </div>
                <Button
                    variant="outline"
                    onClick={() => { setReportData(null); setPreviewImage(null); }}
                    className="border-rose-200 text-rose-600 hover:bg-rose-50 font-black uppercase tracking-tight"
                >
                    <Upload className="w-4 h-4 mr-2" />
                    New Analysis
                </Button>
            </div>

            {/* Patient Info Strip */}
            <Card className="border-l-4 border-l-rose-500 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
                        {[
                            { label: "Case ID", value: "CASE-" + (Math.random().toString(36).substr(2, 6).toUpperCase()), icon: User },
                            { label: "Quality", value: structured.technical_quality, icon: Stethoscope },
                            { label: "Confidence", value: structured.confidence.toUpperCase(), icon: Brain },
                            { label: "Formula", value: structured.intervals.qtc_formula, icon: Activity },
                        ].map((field, i) => (
                            <div key={i} className="p-4 lg:p-6 space-y-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <field.icon className="w-3 h-3 text-rose-500" />
                                    {field.label}
                                </p>
                                <p className="text-sm font-black text-slate-900 tracking-tight">{field.value}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Banner */}
            <AnimatePresence>
                {!isDismissed && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center justify-between gap-4 p-4 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-500/20"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-sm font-bold leading-tight">
                                AI-generated. Must be reviewed by a qualified clinician before clinical action.
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsDismissed(true)}
                            className="text-white hover:bg-white/20"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3 print:hidden">
                    <Button
                        onClick={handleConfirm}
                        disabled={isConfirmed}
                        className={cn(
                            "text-white font-black uppercase tracking-tight rounded-xl px-6 shadow-lg",
                            isConfirmed ? "bg-slate-400" : "bg-[#00D4AA] hover:bg-[#00B894] shadow-emerald-500/20"
                        )}
                    >
                        <BadgeCheck className="w-4 h-4 mr-2" />
                        {isConfirmed ? "Confirmed & Signed" : "Confirm & Sign"}
                    </Button>
                    <Button
                        onClick={() => setShowNotes(!showNotes)}
                        variant="outline"
                        className={cn(
                            "border-slate-200 text-slate-700 font-bold rounded-xl px-6 bg-white hover:bg-slate-50",
                            showNotes && "bg-slate-100 border-slate-300"
                        )}
                    >
                        <Plus className={cn("w-4 h-4 mr-2 transition-transform", showNotes && "rotate-45")} />
                        {showNotes ? "Hide Notes" : "Add Notes"}
                    </Button>
                    <Button onClick={handleExport} variant="outline" className="border-slate-200 text-slate-700 font-bold rounded-xl px-6 bg-white hover:bg-slate-50">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>

                <AnimatePresence>
                    {(showNotes || notes.trim()) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="w-full print:block"
                        >
                            <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                                <CardHeader className="p-4 border-b border-slate-50 bg-slate-50/50 flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-[12px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-rose-500" />
                                        Clinical Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add your clinical observations, differential diagnosis, or treatment plan here..."
                                        className="w-full min-h-[120px] p-6 text-sm text-slate-700 resize-y focus:outline-none focus:ring-2 focus:ring-rose-500/20 border-0 bg-transparent"
                                    />
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 8-Section Systematic Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* [1] HEART RATE */}
                <Card className="border-slate-100 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="p-4 border-b border-slate-50 bg-slate-50/30">
                        <CardTitle className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5" /> [1] HEART RATE
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-black text-slate-900">{structured.rate.ventricular_bpm} <span className="text-sm font-bold text-slate-400">bpm</span></p>
                            <p className="text-xs font-bold text-slate-500 mt-1">Atrial Rate: {structured.rate.atrial_bpm} bpm</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            {["Bradycardia <60", "Normal 60-100", "Tachycardia >100"].map((cat) => {
                                const rate = parseInt(structured.rate.ventricular_bpm);
                                const isBrady = rate < 60 && cat.includes("Brady");
                                const isNormal = rate >= 60 && rate <= 100 && cat.includes("Normal");
                                const isTachy = rate > 100 && cat.includes("Tachy");
                                const isActive = isBrady || isNormal || isTachy;
                                return (
                                    <div key={cat} className={cn(
                                        "flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase transition-all",
                                        isActive ? "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20" : "bg-slate-50 border-slate-100 text-slate-600 opacity-70"
                                    )}>
                                        <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-white" : "bg-slate-400")} />
                                        {cat}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* [2] PRIMARY RHYTHM */}
                <Card className="border-slate-100 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="p-4 border-b border-slate-50 bg-slate-50/30">
                        <CardTitle className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5" /> [2] PRIMARY RHYTHM
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="mb-4">
                            <p className="text-xl font-black text-slate-900 underline decoration-rose-500/20 decoration-4 underline-offset-4">{structured.rhythm}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                "Normal Sinus Rhythm",
                                "Sinus Tachycardia",
                                "Sinus Bradycardia",
                                "Ventricular Bigeminy",
                                "Ventricular Trigeminy",
                                "Atrial Fibrillation"
                            ].map((rit) => (
                                <div key={rit} className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all",
                                    structured.rhythm.toLowerCase().includes(rit.toLowerCase())
                                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                        : "bg-slate-50 border-slate-100 text-slate-600 opacity-60"
                                )}>
                                    {structured.rhythm.toLowerCase().includes(rit.toLowerCase()) ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-3 h-3 border rounded-sm" />}
                                    {rit}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* [3] PVC ANALYSIS */}
                <Card className="border-slate-100 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="p-4 border-b border-slate-50 bg-slate-50/30">
                        <CardTitle className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5" /> [3] PVC ANALYSIS
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                            Differential Diagnoses:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {structured.differential.map((diff, i) => (
                                <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-700 border-0 font-bold px-3 py-1">
                                    {diff}
                                </Badge>
                            ))}
                        </div>
                        {structured.caveats && (
                            <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-100">
                                <p className="text-[10px] font-black text-amber-600 uppercase mb-1">Caveats</p>
                                <p className="text-xs font-bold text-amber-700">{structured.caveats}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* [4] INTERVALS */}
                <Card className="border-slate-100 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="p-4 border-b border-slate-50 bg-slate-50/30">
                        <CardTitle className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5" /> [4] INTERVALS
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "PR", value: structured.intervals.pr_ms, unit: "ms" },
                                { label: "QRS", value: structured.intervals.qrs_ms, unit: "ms" },
                                { label: "QT", value: structured.intervals.qt_ms, unit: "ms" },
                                { label: "QTc", value: structured.intervals.qtc_ms, unit: "ms" },
                            ].map((interval) => (
                                <div key={interval.label} className="text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-600 uppercase mb-1">{interval.label}</p>
                                    <p className="text-lg font-black text-slate-900 tracking-tight">{interval.value} <span className="text-[10px] text-slate-400">{interval.unit}</span></p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* [5] CARDIAC AXIS */}
                <Card className="border-slate-100 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="p-4 border-b border-slate-50 bg-slate-50/30">
                        <CardTitle className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5" /> [5] CARDIAC AXIS
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-8">
                            <div className="w-20 h-20 rounded-full border-4 border-slate-100 flex items-center justify-center relative">
                                <div
                                    className="absolute w-1 h-10 bg-rose-500 rounded-full origin-bottom"
                                    style={{ transform: `rotate(${parseInt(structured.axis.qrs_degrees) || 0}deg) translateY(-20px)` }}
                                />
                                <span className="text-xl font-black text-slate-800 z-10">{formatAxis(structured.axis.qrs_degrees)}</span>
                            </div>
                            <div className="space-y-1">
                                {[
                                    { label: "Normal (-30 to +90)", id: "normal" },
                                    { label: "Left Axis Deviation", id: "LAD" },
                                    { label: "Right Axis Deviation", id: "RAD" },
                                    { label: "Extreme Axis", id: "extreme" },
                                ].map((ax) => (
                                    <div key={ax.id} className={cn(
                                        "text-[10px] font-bold px-3 py-1 rounded-full border mb-1",
                                        structured.axis.classification === ax.id ? "bg-rose-500 border-rose-500 text-white" : "bg-slate-50 border-slate-100 text-slate-400 opacity-50"
                                    )}>
                                        {ax.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* [6] WAVEFORM FINDINGS */}
                <Card className="lg:col-span-1 border-slate-100 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="p-4 border-b border-slate-50 bg-slate-50/30">
                        <CardTitle className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5" /> [6] WAVEFORM FINDINGS
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableBody>
                                {[
                                    { label: "P Waves", val: structured.p_wave },
                                    { label: "QRS Complex", val: structured.qrs_morphology },
                                    { label: "ST Segment", val: structured.st_segments },
                                    { label: "T Waves", val: structured.t_waves },
                                    { label: "U Waves", val: structured.u_waves },
                                ].map((wave) => (
                                    <TableRow key={wave.label} className="border-slate-50 hover:bg-slate-50/50">
                                        <TableCell className="text-[10px] font-black text-slate-500 uppercase px-6 py-3">{wave.label}</TableCell>
                                        <TableCell className="text-xs font-bold text-slate-800 px-6 py-3">{wave.val}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* [7] SPECIAL PATTERNS */}
                <Card className="border-slate-100 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="p-4 border-b border-slate-50 bg-slate-50/30">
                        <CardTitle className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5" /> [7] SPECIAL PATTERNS
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex flex-wrap gap-2">
                            {[
                                "LVH", "RVH", "LBBB", "RBBB", "WPW", "Brugada", "Early Repol", "STEMI", "Infarction", "Ischemia"
                            ].map((pat) => {
                                const isPresent = structured.specific_patterns?.some(p => p.toUpperCase().includes(pat.toUpperCase()));
                                return (
                                    <div key={pat} className={cn(
                                        "px-4 py-2 rounded-xl border text-xs font-black uppercase transition-all",
                                        isPresent ? "bg-amber-500 border-amber-600 text-white shadow-lg shadow-amber-500/20" : "bg-slate-50 border-slate-100 text-slate-500 opacity-60"
                                    )}>
                                        {isPresent ? <AlertCircle className="w-3 h-3 inline mr-1" /> : null}
                                        {pat}
                                    </div>
                                );
                            })}
                            {(!structured.specific_patterns?.length) && (
                                <div className="text-slate-400 text-xs font-bold italic">No special patterns identified</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* [8] FINAL IMPRESSION */}
                <Card className="lg:col-span-2 border-slate-200 border-2 shadow-xl overflow-hidden bg-white relative">
                    <div className="absolute top-0 left-0 w-2 h-full bg-rose-500" />
                    <CardHeader className="p-6 border-b border-slate-100 bg-rose-50/30">
                        <CardTitle className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Brain className="w-5 h-5" /> [8] FINAL IMPRESSION
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Primary Diagnosis</p>
                                    <p className="text-2xl font-black text-slate-900 tracking-tight leading-tight underline decoration-rose-500/20 decoration-8 underline-offset-4">
                                        {structured.final_interpretation}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Differential Diagnoses</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {structured.differential.map((diff, i) => (
                                            <Badge key={i} variant="outline" className="border-rose-200 text-rose-700 bg-rose-50/50">
                                                {diff}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 group-hover:scale-110 transition-transform">
                                        <AlertTriangle className="w-20 h-20" />
                                    </div>
                                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] mb-4">Urgency Level</p>
                                    <div className="flex items-center gap-4">
                                        {[
                                            { label: "Routine", id: "routine" },
                                            { label: "Urgent", id: "urgent" },
                                            { label: "Critical", id: "critical" }
                                        ].map((level) => {
                                            const active = structured.urgency === level.id;
                                            return (
                                                <div key={level.id} className={cn(
                                                    "flex flex-col items-center gap-2 flex-1 pt-2 pb-4 rounded-xl transition-all border",
                                                    active ? "bg-rose-500 border-rose-400 scale-110 shadow-2xl z-10" : "bg-slate-800 border-slate-700 opacity-40 grayscale"
                                                )}>
                                                    {level.id === "critical" ? <AlertCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                                    <span className="text-[10px] font-black uppercase tracking-tighter">{level.label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                {structured.caveats && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Caveats & Notes</p>
                                        <p className="text-xs font-bold text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-100">{structured.caveats}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100">
                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                                <FileText className="w-4 h-4" /> Full Clinical Narrative
                            </p>
                            <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap bg-slate-50 p-6 rounded-2xl border border-slate-100 font-mono">
                                {reportData.clinical_summary}
                            </p>
                        </div>
                    </CardContent>
                </Card>

            </div>

            {/* Disclaimer */}
            <div className="mt-8 p-8 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="flex gap-6 relative z-10">
                    <div className="p-3 bg-rose-500/10 rounded-2xl shrink-0 flex items-center justify-center h-12 w-12 border border-rose-500/20">
                        <ShieldAlert className="w-6 h-6 text-rose-500" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                            ⚠️ DISCLAIMER: For clinical reference only.
                        </p>
                        <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-4xl">
                            Final interpretation must be confirmed by a licensed physician before any treatment. This AI analysis follows a systematic electrophysiology workflow but cannot replace human clinical judgment. The manufacturer is not liable for clinical actions taken based on this output.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    )
}
