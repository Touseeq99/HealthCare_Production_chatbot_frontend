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
        patient: "prose-p:text-blue-100 prose-headings:text-white prose-strong:text-white prose-code:text-cyan-300 text-blue-100",
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
                    ul: ({ node, ...props }) => <ul className="my-2 pl-4 space-y-1 list-disc" {...props} />,
                    ol: ({ node, ...props }) => <ol className="my-2 pl-4 space-y-1 list-decimal" {...props} />,
                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                    blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-4 border-blue-600/40 pl-4 italic my-2" {...props} />
                    ),
                    code: ({ node, inline, ...props }: any) => (
                        <code className="bg-slate-700/60 border border-blue-600/40 px-1 rounded font-mono text-xs" {...props} />
                    ),
                    hr: ({ node, ...props }) => <hr className="my-4 border-blue-700/40" {...props} />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
