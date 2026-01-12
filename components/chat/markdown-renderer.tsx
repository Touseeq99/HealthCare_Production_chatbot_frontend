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
        doctor: "dark:prose-invert text-gray-700 dark:text-gray-300",
        user: "text-white prose-p:text-white prose-headings:text-white prose-strong:text-white prose-code:text-white"
    }

    return (
        <div className={cn(
            "prose prose-sm max-w-none break-words",
            variantClasses[variant],
            className
        )}>
            <ReactMarkdown
                components={{
                    p: ({ node, ...props }) => <p className="mb-0 last:mb-0 inline-block" {...props} />,
                    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-3 mb-2" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-2 mb-1" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-1 mb-0" {...props} />,
                    h4: ({ node, ...props }) => <h4 className="text-base font-semibold mt-1 mb-0" {...props} />,
                    ul: ({ node, ...props }) => <ul className="my-2 pl-4 space-y-1 list-disc marker:text-teal-500" {...props} />,
                    ol: ({ node, ...props }) => <ol className="my-2 pl-4 space-y-1 list-decimal marker:text-teal-500" {...props} />,
                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                    blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-4 border-teal-500/40 pl-4 italic my-2 text-slate-400" {...props} />
                    ),
                    code: ({ node, inline, ...props }: any) => (
                        <code className="bg-slate-900 border border-teal-500/30 px-1 py-0.5 rounded font-mono text-xs text-teal-300" {...props} />
                    ),
                    hr: ({ node, ...props }) => <hr className="my-4 border-slate-700" {...props} />,
                    table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-4 rounded-lg border border-slate-700">
                            <table className="w-full text-left text-sm" {...props} />
                        </div>
                    ),
                    th: ({ node, ...props }) => (
                        <th className="bg-slate-800 p-2 font-semibold text-teal-400 border-b border-slate-700" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                        <td className="p-2 border-b border-slate-700/50 text-slate-300" {...props} />
                    ),
                    a: ({ node, ...props }) => (
                        <a className="text-teal-400 hover:text-teal-300 underline underline-offset-2" {...props} />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
