"use client"

import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"

interface MarkdownRendererProps {
    content: string
    className?: string
    variant?: "patient" | "doctor" | "user"
}

export function MarkdownRenderer({ content, className, variant = "patient" }: MarkdownRendererProps) {
    const variantClasses = {
        patient: "prose-p:text-slate-200 prose-headings:text-white prose-strong:text-white prose-code:text-teal-300 text-slate-200",
        doctor: "text-slate-800 prose-p:text-slate-700 prose-headings:text-rose-950 prose-strong:text-rose-600 prose-code:text-rose-600",
        user: "text-white prose-p:text-white prose-headings:text-white prose-strong:text-white prose-code:text-white"
    }

    const isDark = variant === "patient" || variant === "user"

    return (
        <div className={cn(
            "prose prose-sm max-w-none break-words",
            variantClasses[variant],
            className
        )}>
            <ReactMarkdown
                components={{
                    p: ({ node, ...props }) => <p className="mb-0 last:mb-0 inline-block" {...props} />,
                    h1: ({ node, ...props }) => <h1 className={cn("text-2xl font-black mt-3 mb-2 uppercase tracking-tight", isDark ? "text-white" : "text-rose-950")} {...props} />,
                    h2: ({ node, ...props }) => <h2 className={cn("text-xl font-black mt-2 mb-1 uppercase tracking-tight", isDark ? "text-white" : "text-rose-900")} {...props} />,
                    h3: ({ node, ...props }) => <h3 className={cn("text-lg font-black mt-1 mb-0 uppercase tracking-tight", isDark ? "text-white" : "text-rose-800")} {...props} />,
                    h4: ({ node, ...props }) => <h4 className={cn("text-base font-black mt-1 mb-0 uppercase tracking-tight", isDark ? "text-white" : "text-rose-700")} {...props} />,
                    ul: ({ node, ...props }) => <ul className={cn("my-2 pl-4 space-y-1 list-disc", isDark ? "marker:text-teal-500" : "marker:text-rose-500")} {...props} />,
                    ol: ({ node, ...props }) => <ol className={cn("my-2 pl-4 space-y-1 list-decimal", isDark ? "marker:text-teal-500" : "marker:text-rose-500")} {...props} />,
                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                    blockquote: ({ node, ...props }) => (
                        <blockquote className={cn("border-l-4 pl-4 italic my-2", isDark ? "border-teal-500/40 text-slate-400" : "border-rose-200 text-slate-500 bg-rose-50/30 py-2 rounded-r-lg")} {...props} />
                    ),
                    code: ({ node, inline, ...props }: any) => (
                        <code className={cn("px-1.5 py-0.5 rounded font-mono text-xs", isDark ? "bg-slate-900 border border-teal-500/30 text-teal-300" : "bg-rose-50 border border-rose-100 text-rose-600")} {...props} />
                    ),
                    hr: ({ node, ...props }) => <hr className={cn("my-4", isDark ? "border-slate-700" : "border-rose-100")} {...props} />,
                    table: ({ node, ...props }) => (
                        <div className={cn("overflow-x-auto my-4 rounded-xl border shadow-sm", isDark ? "border-slate-700" : "border-rose-100")}>
                            <table className="w-full text-left text-sm" {...props} />
                        </div>
                    ),
                    th: ({ node, ...props }) => (
                        <th className={cn("p-3 font-black uppercase tracking-widest text-[10px] border-b", isDark ? "bg-slate-800 text-teal-400 border-slate-700" : "bg-rose-50 text-rose-600 border-rose-100")} {...props} />
                    ),
                    td: ({ node, ...props }) => (
                        <td className={cn("p-3 border-b text-xs font-medium", isDark ? "border-slate-700/50 text-slate-300" : "border-rose-50 text-slate-700")} {...props} />
                    ),
                    a: ({ node, ...props }) => (
                        <a className={cn("underline underline-offset-4 font-bold transition-colors", isDark ? "text-teal-400 hover:text-teal-300" : "text-rose-600 hover:text-rose-700 decoration-rose-200 hover:decoration-rose-500")} {...props} />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
