"use client"

import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
    AlertCircle,
    BookOpen,
    CheckCircle2,
    AlertTriangle,
    Stethoscope,
    FileText,
    Scale,
    Activity,
    ArrowRight,
    Info,
    ShieldAlert,
    ClipboardList,
    Lightbulb,
    Users,
    Brain,
    Microscope,
    ChevronDown,
    ChevronUp
} from "lucide-react"
import { MarkdownRenderer } from "./markdown-renderer"
import { memo, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"

interface StructuredResponseProps {
    content: string
}

interface SectionConfig {
    icon: any
    color: string
    darkColor: string
    iconColor: string
    colSpan: string
    contentClass?: string
}

const SECTION_CONFIG: Record<string, SectionConfig> = {
    "Clinical Takeaway": {
        icon: ClipboardList,
        color: "bg-rose-50 border-rose-100 text-rose-950 shadow-[0_4px_12px_rgba(244,63,94,0.05)]",
        darkColor: "",
        iconColor: "text-rose-500",
        colSpan: "md:col-span-2",
        contentClass: "columns-1 md:columns-2 gap-8 [&>ul]:mt-0 [&>ul]:mb-0 break-inside-avoid-column font-medium"
    },
    "Research Evidence": {
        icon: Microscope,
        color: "bg-white border-rose-100 text-slate-800",
        darkColor: "",
        iconColor: "text-rose-500",
        colSpan: "md:col-span-2"
    },
    "Expert Opinion": {
        icon: Brain,
        color: "bg-indigo-50/50 border-indigo-100 text-indigo-900",
        darkColor: "",
        iconColor: "text-indigo-600",
        colSpan: "md:col-span-1"
    },
    "Patient Perspectives": {
        icon: Users,
        color: "bg-rose-50 border-rose-100 text-rose-900",
        darkColor: "",
        iconColor: "text-rose-600",
        colSpan: "md:col-span-1"
    },
    "Definition": {
        icon: BookOpen,
        color: "bg-slate-50 border-rose-100 text-slate-900",
        darkColor: "",
        iconColor: "text-rose-500",
        colSpan: "md:col-span-1"
    },
    "Evidence-Based Overview": {
        icon: Activity,
        color: "bg-rose-50/30 border-rose-100 text-rose-900",
        darkColor: "",
        iconColor: "text-rose-600",
        colSpan: "md:col-span-1"
    },
    "Clinical Decision Context": {
        icon: Stethoscope,
        color: "bg-amber-50/50 border-amber-100 text-amber-900",
        darkColor: "",
        iconColor: "text-amber-600",
        colSpan: "md:col-span-2"
    },
    "Limitations & Uncertainty": {
        icon: AlertTriangle,
        color: "bg-orange-50/50 border-orange-100 text-orange-900",
        darkColor: "",
        iconColor: "text-orange-600",
        colSpan: "md:col-span-1"
    },
    "When Immediate Medical Attention Is Required": {
        icon: ShieldAlert,
        color: "bg-red-50 border-red-100 text-red-900",
        darkColor: "",
        iconColor: "text-red-600",
        colSpan: "md:col-span-1"
    },
    "Sources Used": {
        icon: Info,
        color: "bg-slate-50 border-slate-200 text-slate-700",
        darkColor: "",
        iconColor: "text-slate-500",
        colSpan: "md:col-span-2"
    },
    "Guideline Concordance Color Rating": {
        icon: Scale,
        color: "bg-violet-50/50 border-violet-100 text-violet-900",
        darkColor: "",
        iconColor: "text-violet-600",
        colSpan: "md:col-span-1"
    },
    "Confidence Meter": {
        icon: CheckCircle2,
        color: "bg-emerald-50/50 border-emerald-100 text-emerald-900",
        darkColor: "",
        iconColor: "text-emerald-600",
        colSpan: "md:col-span-1"
    },
    "Conclusion": {
        icon: Lightbulb,
        color: "bg-white border-rose-100 text-slate-800 shadow-sm",
        darkColor: "",
        iconColor: "text-rose-500",
        colSpan: "md:col-span-2"
    },
    // Backwards compatibility / Fallbacks
    "Key Summary": {
        icon: FileText,
        color: "bg-white border-rose-100 text-slate-800",
        darkColor: "",
        iconColor: "text-rose-500",
        colSpan: "md:col-span-2"
    },
    "Practical Considerations": {
        icon: Stethoscope,
        color: "bg-amber-50/30 border-amber-100 text-amber-900",
        darkColor: "",
        iconColor: "text-amber-600",
        colSpan: "md:col-span-2"
    },
    "Next Steps": {
        icon: ArrowRight,
        color: "bg-rose-50/50 border-rose-100 text-rose-900",
        darkColor: "",
        iconColor: "text-rose-500",
        colSpan: "md:col-span-2"
    }
}

export const StructuredResponse = memo(({ content }: StructuredResponseProps) => {
    // Parse the content into sections
    const sections = useMemo(() => parseSections(content), [content])
    const [isExpanded, setIsExpanded] = useState(false)

    // Group sections for specific layout
    const layoutGroups = useMemo(() => {
        const groups = {
            main: [] as typeof sections,
            hidden: [] as typeof sections,
            expert: null as typeof sections[0] | null,
            patient: null as typeof sections[0] | null,
            confidence: null as typeof sections[0] | null,
            conclusion: null as typeof sections[0] | null,
            others: [] as typeof sections
        }

        sections.forEach(section => {
            const title = section.title
            if (title === "Expert Opinion") groups.expert = section
            else if (title === "Patient Perspectives") groups.patient = section
            else if (title === "Confidence Meter") groups.confidence = section
            else if (title === "Conclusion") groups.conclusion = section
            else if (["Clinical Takeaway", "Research Evidence"].includes(title)) groups.main.push(section)
            else if ([
                "Clinical Decision Context",
                "Limitations & Uncertainty",
                "When Immediate Medical Attention Is Required",
                "Sources Used",
                "Guideline Concordance Color Rating",
                "Evidence-Based Overview",
                "Definition"
            ].includes(title)) groups.hidden.push(section)
            else groups.others.push(section)
        })

        return groups
    }, [sections])

    if (sections.length === 0) {
        return (
            <div className="prose prose-sm max-w-none text-slate-700">
                <MarkdownRenderer content={content} variant="doctor" />
            </div>
        )
    }

    const renderSection = (section: typeof sections[0], index?: number, forceColSpan?: string) => {
        const configKey = Object.keys(SECTION_CONFIG).find(key =>
            section.title.toLowerCase().startsWith(key.toLowerCase())
        ) as keyof typeof SECTION_CONFIG | undefined

        const config = configKey ? SECTION_CONFIG[configKey] : SECTION_CONFIG["Key Summary"]
        const Icon = config.icon
        const colSpanClass = forceColSpan || config.colSpan || "md:col-span-1"

        return (
            <motion.div
                key={index !== undefined ? index : section.title}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={cn(
                    "rounded-[2rem] border p-6 backdrop-blur-sm transition-all flex flex-col shadow-sm hover:shadow-md hover:border-rose-200 duration-300",
                    config.color,
                    colSpanClass
                )}
            >
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-rose-100/50 flex-shrink-0">
                    <div className="p-2 rounded-xl bg-white shadow-sm border border-rose-50">
                        <Icon className={cn("h-5 w-5", config.iconColor)} />
                    </div>
                    <h3 className="font-black text-base md:text-lg leading-tight tracking-tight uppercase tracking-widest text-inherit">{section.originalTitle}</h3>
                </div>
                <div className="flex-grow">
                    <MarkdownRenderer
                        content={section.content}
                        variant="doctor"
                        className={cn("prose-p:text-slate-700 prose-strong:text-inherit", config.contentClass)}
                    />
                </div>
            </motion.div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {/* Section 1: Main Analysis (Takeaway + Evidence + Hidden) */}
            {layoutGroups.main.length > 0 && (
                <div className="md:col-span-2 space-y-4 rounded-3xl border border-rose-100 bg-rose-50/20 p-1">
                    {layoutGroups.main.map((section, idx) => renderSection(section, idx, "md:col-span-2"))}

                    {layoutGroups.hidden.length > 0 && (
                        <div className="px-2">
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden pt-4 pb-2"
                                    >
                                        {layoutGroups.hidden.map((section, idx) => renderSection(section, idx + 100))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <Button
                                variant="ghost"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="w-full mt-2 flex items-center justify-center gap-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all font-black uppercase tracking-[0.1em] text-[10px] py-6"
                            >
                                {isExpanded ? (
                                    <>
                                        <ChevronUp className="h-4 w-4" />
                                        Show Less
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="h-4 w-4" />
                                        View Full Clinical Analysis ({layoutGroups.hidden.length} more sections)
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Section 2 & 3: Expert & Patient */}
            {layoutGroups.expert && renderSection(layoutGroups.expert)}
            {layoutGroups.patient && renderSection(layoutGroups.patient)}

            {/* Confidence & Conclusion */}
            {layoutGroups.confidence && renderSection(layoutGroups.confidence)}
            {layoutGroups.conclusion && renderSection(layoutGroups.conclusion, undefined, "md:col-span-2")}

            {/* Fallback for others */}
            {layoutGroups.others.map((section, idx) => renderSection(section, idx + 200))}
        </div>
    )
})

StructuredResponse.displayName = "StructuredResponse"

function parseSections(content: string) {
    const sections: { title: string; originalTitle: string; content: string }[] = []

    if (!content) return sections

    const lines = content.split('\n')
    let currentSection: { title: string; originalTitle: string; content: string[] } | null = null

    // Normalized keys for comparison
    const sectionKeys = Object.keys(SECTION_CONFIG)

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const trimmedLine = line.trim()

        // Skip empty lines at the start if no section is active
        if (!currentSection && !trimmedLine) continue

        let matchedKey: string | null = null

        for (const key of sectionKeys) {
            // Helper to check if line starts with key cleanly
            // Remove leadings numbers/bullets: "1. ", "1️⃣ ", "# ", "**"
            // Aggressively remove ANY non-letter character at start to handle complex emojis/formatting
            // This is safe because all our keys start with English letters.
            const cleanStart = trimmedLine.replace(/^[^a-zA-Z]+/, '').trim();

            // Check if matches key case-insensitive
            if (!cleanStart.toLowerCase().startsWith(key.toLowerCase())) continue;

            // Allow trailing chars like ":", " (MANDATORY)", " - described below"
            // The remainder must be "separator-like" or "parenthetical"
            const remainder = cleanStart.slice(key.length).trim();

            // Remainder pattern: 
            // - Empty
            // - Colon/Asterisks: : or ** or *
            // - Parentheses: (...)
            // - Dash: - ...
            if (!remainder || /^([:*]|\*{1,2}|\s*\(.*\)|\s*[-–—]\s*.*)*$/.test(remainder)) {
                matchedKey = key;
                break;
            }
        }

        if (matchedKey) {
            // Save previous section if exists
            if (currentSection) {
                sections.push({
                    title: currentSection.title,
                    originalTitle: currentSection.originalTitle,
                    content: currentSection.content.join('\n').trim()
                })
            }

            // Start new section
            currentSection = {
                title: matchedKey,
                originalTitle: trimmedLine,
                content: []
            }
        } else {
            if (currentSection) {
                currentSection.content.push(line)
            } else {
                if (formattedLineHasContent(line)) {
                    currentSection = {
                        title: "Key Summary",
                        originalTitle: "Summary",
                        content: [line]
                    }
                }
            }
        }
    }

    // Push the last section
    if (currentSection) {
        sections.push({
            title: currentSection.title,
            originalTitle: currentSection.originalTitle,
            content: currentSection.content.join('\n').trim()
        })
    }

    return sections
}

function formattedLineHasContent(line: string) {
    return line.trim().length > 0
}
