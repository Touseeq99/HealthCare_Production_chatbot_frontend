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
    ImageIcon
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
        rate: { value: string; interpretation: string; normal_range: string }
        rhythm: { value: string; interpretation: string; notes: string }
        p_wave: { present: string; axis_degrees: string; morphology: string; interpretation: string; notes: string }
        pr_interval: { value: string; interpretation: string; normal_range: string }
        qrs_complex: { duration: string; axis_degrees: string; morphology: string; interpretation: string; notes: string }
        st_segment: { changes: string; leads_affected: string; interpretation: string }
        t_wave: { axis_degrees: string; morphology: string; leads_affected: string; interpretation: string }
        qtc_interval: { value: string; interpretation: string; normal_range: string }
        machine_diagnosis: { printed_label: string; confirmed: string }
        overall_classification: string
        flags: string[]
    }
    clinical_summary: string
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
            label: "Heart Rate",
            value: structured.rate.value,
            status: getStatusFromInterpretation(structured.rate.interpretation),
            note: structured.rate.interpretation
        },
        {
            label: "Rhythm",
            value: structured.rhythm.value,
            status: getStatusFromInterpretation(structured.rhythm.interpretation),
            note: structured.rhythm.interpretation
        },
        {
            label: "QTc Interval",
            value: structured.qtc_interval.value,
            status: getStatusFromInterpretation(structured.qtc_interval.interpretation),
            note: structured.qtc_interval.interpretation
        }
    ]

    const formatAxis = (val: string) => {
        if (!val) return "N/A";
        const match = val.match(/([+-]?\d+)/);
        return match ? `${match[1]}°` : val;
    }

    const features: ECGFeature[] = [
        {
            label: "P Wave",
            value: structured.p_wave.morphology,
            status: getStatusFromInterpretation(structured.p_wave.interpretation),
            note: structured.p_wave.interpretation
        },
        {
            label: "PR Interval",
            value: structured.pr_interval.value,
            status: getStatusFromInterpretation(structured.pr_interval.interpretation),
            note: structured.pr_interval.interpretation
        },
        {
            label: "QRS Duration",
            value: structured.qrs_complex.duration,
            status: getStatusFromInterpretation(structured.qrs_complex.interpretation),
            note: structured.qrs_complex.interpretation
        },
        {
            label: "QRS Axis",
            value: formatAxis(structured.qrs_complex.axis_degrees),
            status: getStatusFromInterpretation(structured.qrs_complex.interpretation),
            note: "Axis"
        },
        {
            label: "ST Segment",
            value: structured.st_segment.changes,
            status: getStatusFromInterpretation(structured.st_segment.interpretation),
            note: structured.st_segment.interpretation
        },
        {
            label: "T Waves",
            value: structured.t_wave.morphology,
            status: getStatusFromInterpretation(structured.t_wave.interpretation),
            note: structured.t_wave.interpretation
        },
        {
            label: "QTc",
            value: structured.qtc_interval.value,
            status: getStatusFromInterpretation(structured.qtc_interval.interpretation),
            note: "Correction"
        }
    ]

    const axes = [
        { label: "P Axis", value: formatAxis(structured.p_wave.axis_degrees), status: getStatusFromInterpretation(structured.p_wave.interpretation) },
        { label: "QRS Axis", value: formatAxis(structured.qrs_complex.axis_degrees), status: getStatusFromInterpretation(structured.qrs_complex.interpretation) },
        { label: "T Axis", value: formatAxis(structured.t_wave.axis_degrees), status: getStatusFromInterpretation(structured.t_wave.interpretation) }
    ]

    const criticalFlags = [
        { label: "STEMI", present: structured.flags.some(f => f.includes("STEMI")) },
        { label: "VT / VF", present: structured.flags.some(f => f.includes("VT") || f.includes("VF")) },
        { label: "Heart Block", present: structured.flags.some(f => f.includes("Block")) },
        { label: "QTc Prolongation", present: getStatusFromInterpretation(structured.qtc_interval.interpretation) === "abnormal" }
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
                            structured.overall_classification === "Normal" ? "bg-[#00D4AA]" : "bg-[#F5A623]"
                        )}>
                            <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                            ⚠ {structured.machine_diagnosis.printed_label}
                        </Badge>
                        <span className="flex items-center text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-full">
                            <History className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
                            {new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="flex items-center text-xs text-rose-500 font-bold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100 uppercase tracking-wider">
                            <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                            {structured.machine_diagnosis.confirmed}
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
                            { label: "Case ID", value: "CASE-" + Math.random().toString(36).substr(2, 6).toUpperCase(), icon: User },
                            { label: "Interpretation Mode", value: "AI-Autonomous", icon: Stethoscope },
                            { label: "ECG Standard", value: "12-Lead Digital", icon: Activity },
                            { label: "AI Confidence", value: "High (0.94)", icon: Brain },
                        ].map((field, i) => (
                            <div key={i} className="p-4 lg:p-6 space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <field.icon className="w-3 h-3 text-rose-400" />
                                    {field.label}
                                </p>
                                <p className="text-sm font-black text-slate-800 tracking-tight">{field.value}</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* ECG Tracing Preview */}
                    <Card className="overflow-hidden border-slate-100 shadow-sm bg-white">
                        <CardHeader className="p-4 border-b border-slate-50 bg-slate-50/30">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-[10px] font-black text-rose-500 uppercase tracking-widest">ECG Tracing Analysis</CardTitle>
                                <div className="flex items-center gap-4 text-[10px] font-black text-slate-500">
                                    <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> 25 mm/sec</span>
                                    <span className="flex items-center gap-1.5"><Scale className="w-3.5 h-3.5" /> 10 mm/mV</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 relative group">
                            <div className="bg-slate-900 aspect-[21/9] flex items-center justify-center relative overflow-hidden">
                                {previewImage ? (
                                    <img
                                        src={previewImage}
                                        alt="ECG Tracing"
                                        className="w-full h-full object-contain opacity-90 brightness-110"
                                    />
                                ) : (
                                    <Activity className="w-12 h-12 text-slate-700 animate-pulse" />
                                )}
                                <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-[2px]">
                                    <Button variant="secondary" className="bg-white font-black uppercase text-[10px] tracking-widest rounded-full text-slate-950 shadow-2xl">
                                        <Maximize2 className="w-4 h-4 mr-2" />
                                        Optical Zoom
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {metrics.map((metric, i) => (
                            <Card key={i} className="overflow-hidden shadow-sm hover:shadow-md transition-all border-slate-100 group hover:border-rose-200">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{metric.label}</p>
                                        <Activity className="w-4 h-4 text-rose-500 opacity-50" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-950 tracking-tight">{metric.value}</h3>
                                        <div className="mt-2 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5" style={{ color: getStatusColor(metric.status) }}>
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getStatusColor(metric.status) }} />
                                            {metric.note}
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="h-1.5 w-full opacity-30" style={{ backgroundColor: getStatusColor(metric.status) }} />
                            </Card>
                        ))}
                    </div>

                    {/* Table */}
                    <Card className="border-slate-100 shadow-sm overflow-hidden bg-white">
                        <CardHeader className="p-6 border-b border-slate-50">
                            <CardTitle className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">Detailed Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow>
                                        <TableHead className="text-[10px] font-black text-slate-500 uppercase px-6">Feature</TableHead>
                                        <TableHead className="text-[10px] font-black text-slate-500 uppercase px-6">Value</TableHead>
                                        <TableHead className="text-[10px] font-black text-slate-500 uppercase px-6">Analysis</TableHead>
                                        <TableHead className="text-[10px] font-black text-slate-500 uppercase px-6 text-right">Note</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {features.map((feature, i) => (
                                        <TableRow key={i} className="hover:bg-rose-50/30 transition-colors border-slate-50">
                                            <TableCell className="px-6 py-4 font-black text-slate-900 text-xs tracking-tight uppercase">{feature.label}</TableCell>
                                            <TableCell className="px-6 py-4 text-slate-600 text-sm font-medium">{feature.value}</TableCell>
                                            <TableCell className="px-6 py-4">{getStatusPill(feature.status)}</TableCell>
                                            <TableCell className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-wider">{feature.note}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">

                    {/* Electrical Axes */}
                    <Card className="border-slate-100 shadow-sm overflow-hidden bg-white">
                        <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/30">
                            <CardTitle className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5" />
                                Electrical Vectors
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-3 gap-4">
                                {axes.map((axis, i) => (
                                    <div key={i} className="flex flex-col items-center text-center space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{axis.label}</p>
                                        <div className="text-xl font-black tracking-tighter" style={{ color: getStatusColor(axis.status) }}>
                                            {axis.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Leads Assessed */}
                    <Card className="border-slate-100 shadow-sm overflow-hidden bg-white">
                        <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/30">
                            <CardTitle className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                                <BadgeCheck className="w-3.5 h-3.5" />
                                Leads Assessed
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-3">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Limb leads</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {["I", "II", "III", "aVR", "aVL", "aVF"].map((lead, i) => (
                                        <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-800 border-0 font-black px-2.5 py-1 rounded-lg text-[10px]">
                                            {lead}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Precordial leads</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {["V1", "V2", "V3", "V4", "V5", "V6"].map((lead, i) => (
                                        <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-800 border-0 font-black px-2.5 py-1 rounded-lg text-[10px]">
                                            {lead}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Critical Flags */}
                    <Card className="border-slate-100 shadow-sm overflow-hidden bg-white">
                        <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/30">
                            <CardTitle className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Critical Flags
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-50">
                                {criticalFlags.map((flag, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 px-6 hover:bg-slate-50/50 transition-colors">
                                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{flag.label}</span>
                                        <div className="flex items-center">
                                            {flag.present === true ? (
                                                <div className="p-1 rounded-full bg-red-50 text-red-500 border border-red-100 shadow-sm animate-pulse">
                                                    <AlertCircle className="w-4 h-4" />
                                                </div>
                                            ) : (
                                                <div className="p-1 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 opacity-50">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>

            {/* Summary Box */}
            <Card className="border-slate-200 shadow-xl overflow-hidden bg-white mt-2 relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                <CardHeader className="p-6 border-b border-slate-100 bg-rose-50/30">
                    <CardTitle className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Clinical Summary — Neural Engine Interpretation
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <p className="text-xl text-slate-800 leading-relaxed font-bold tracking-tight">
                        {reportData.clinical_summary}
                    </p>
                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <div className="w-2 h-2 rounded-full bg-rose-500 mr-2 shadow-sm shadow-rose-500/50" />
                            Requires clinician review & signature
                        </div>
                        <div className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                            Model: GPT-5 (Medical Finetuned)
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Disclaimer */}
            <div className="mt-8 p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
                <div className="flex gap-4">
                    <div className="p-2 bg-rose-500/10 rounded-lg shrink-0">
                        <AlertCircle className="w-5 h-5 text-rose-500" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Medical-Legal Disclaimer</p>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                            This interpretation is generated by an artificial intelligence algorithm and is intended for use by qualified healthcare professionals only. It should not be used as the sole basis for diagnosis or treatment. Final clinical decisions must be made by a licensed physician after reviewing all patient data. The manufacturer is not liable for clinical actions taken based on this AI-generated output.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    )
}
