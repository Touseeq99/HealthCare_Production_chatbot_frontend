"use client"

import { motion } from "framer-motion"
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
    Lightbulb
} from "lucide-react"
import { MarkdownRenderer } from "./markdown-renderer"
import { memo, useMemo } from "react"

interface StructuredResponseProps {
    content: string
}

const SECTION_CONFIG = {
    "Clinical Takeaway": {
        icon: ClipboardList,
        color: "bg-teal-50 border-teal-200 text-teal-900",
        darkColor: "dark:bg-teal-900/20 dark:border-teal-800 dark:text-teal-100",
        iconColor: "text-teal-600 dark:text-teal-400",
        colSpan: "md:col-span-2",
        // Multi-column layout for bullet points to maximize horizontal space
        contentClass: "columns-1 md:columns-2 gap-8 [&>ul]:mt-0 [&>ul]:mb-0 break-inside-avoid-column"
    },
    "Definition": {
        icon: BookOpen,
        color: "bg-indigo-50 border-indigo-200 text-indigo-900",
        darkColor: "dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-100",
        iconColor: "text-indigo-600 dark:text-indigo-400",
        colSpan: "md:col-span-1"
    },
    "Evidence-Based Overview": {
        icon: Activity,
        color: "bg-blue-50 border-blue-200 text-blue-900",
        darkColor: "dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100",
        iconColor: "text-blue-600 dark:text-blue-400",
        colSpan: "md:col-span-1"
    },
    "Clinical Decision Context": {
        icon: Stethoscope,
        color: "bg-amber-50 border-amber-200 text-amber-900",
        darkColor: "dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-100",
        iconColor: "text-amber-600 dark:text-amber-400",
        colSpan: "md:col-span-2"
    },
    "Limitations & Uncertainty": {
        icon: AlertTriangle,
        color: "bg-orange-50 border-orange-200 text-orange-900",
        darkColor: "dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-100",
        iconColor: "text-orange-600 dark:text-orange-400",
        colSpan: "md:col-span-1"
    },
    "When Immediate Medical Attention Is Required": {
        icon: ShieldAlert,
        color: "bg-red-50 border-red-200 text-red-900",
        darkColor: "dark:bg-red-900/20 dark:border-red-800 dark:text-red-100",
        iconColor: "text-red-600 dark:text-red-400",
        colSpan: "md:col-span-1"
    },
    "Sources Used": {
        icon: Info,
        color: "bg-slate-50 border-slate-200 text-slate-900",
        darkColor: "dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-100",
        iconColor: "text-slate-600 dark:text-slate-400",
        colSpan: "md:col-span-2"
    },
    "Guideline Concordance Color Rating": {
        icon: Scale,
        color: "bg-violet-50 border-violet-200 text-violet-900",
        darkColor: "dark:bg-violet-900/20 dark:border-violet-800 dark:text-violet-100",
        iconColor: "text-violet-600 dark:text-violet-400",
        colSpan: "md:col-span-1"
    },
    "Confidence Meter": {
        icon: CheckCircle2,
        color: "bg-sky-50 border-sky-200 text-sky-900",
        darkColor: "dark:bg-sky-900/20 dark:border-sky-800 dark:text-sky-100",
        iconColor: "text-sky-600 dark:text-sky-400",
        colSpan: "md:col-span-1"
    },
    "Conclusion": {
        icon: Lightbulb,
        color: "bg-purple-50 border-purple-200 text-purple-900",
        darkColor: "dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-100",
        iconColor: "text-purple-600 dark:text-purple-400",
        colSpan: "md:col-span-2"
    },
    // Backwards compatibility / Fallbacks
    "Key Summary": {
        icon: FileText,
        color: "bg-blue-50 border-blue-200 text-blue-900",
        darkColor: "dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100",
        iconColor: "text-blue-600 dark:text-blue-400",
        colSpan: "md:col-span-2"
    },
    "Practical Considerations": {
        icon: Stethoscope,
        color: "bg-amber-50 border-amber-200 text-amber-900",
        darkColor: "dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-100",
        iconColor: "text-amber-600 dark:text-amber-400",
        colSpan: "md:col-span-2"
    },
    "Next Steps": {
        icon: ArrowRight,
        color: "bg-emerald-50 border-emerald-200 text-emerald-900",
        darkColor: "dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-100",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        colSpan: "md:col-span-2"
    }
}

export const StructuredResponse = memo(({ content }: StructuredResponseProps) => {
    // Parse the content into sections
    const sections = useMemo(() => parseSections(content), [content])

    if (sections.length === 0) {
        // Fallback for non-structured content
        return (
            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                <MarkdownRenderer content={content} variant="doctor" />
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {sections.map((section, index) => {
                // Find config by matching known keys
                const configKey = Object.keys(SECTION_CONFIG).find(key =>
                    section.title.toLowerCase().startsWith(key.toLowerCase())
                ) as keyof typeof SECTION_CONFIG | undefined

                const config = configKey ? SECTION_CONFIG[configKey] : SECTION_CONFIG["Key Summary"]

                const Icon = config.icon
                const isSingleSection = sections.length === 1
                const colSpanClass = config.colSpan || "md:col-span-1"

                return (
                    <motion.div
                        key={index}
                        initial={false} // Disable entry animation for existing sections
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                            "rounded-lg border p-4 backdrop-blur-sm shadow-sm transition-all hover:shadow-md flex flex-col h-full",
                            config.color,
                            config.darkColor,
                            isSingleSection ? "md:col-span-2" : colSpanClass
                        )}
                    >
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-black/5 dark:border-white/5 flex-shrink-0">
                            <Icon className={cn("h-5 w-5", config.iconColor)} />
                            <h3 className="font-bold text-lg leading-tight">{section.originalTitle}</h3>
                        </div>
                        <div className={cn("prose prose-sm dark:prose-invert max-w-none flex-grow", config.contentClass)}>
                            <MarkdownRenderer content={section.content} variant="doctor" />
                        </div>
                    </motion.div>
                )
            })}
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
