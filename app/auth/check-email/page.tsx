import { motion } from "framer-motion"
import { Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CheckEmailPage() {
    return (
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-teal-500/10 rounded-full flex items-center justify-center ring-1 ring-teal-500/20">
                        <Mail className="w-10 h-10 text-teal-400" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl font-bold text-white">Check your email</h1>
                    <p className="text-slate-400 leading-relaxed">
                        We've sent a temporary login link or confirmation to your email address.
                        Please check your inbox and click the link to continue.
                    </p>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 backdrop-blur-xl">
                    <p className="text-sm text-slate-300">
                        Didn't receive an email? Check your spam folder or
                        <button className="text-teal-400 font-semibold hover:text-teal-300 ml-1 transition-colors">
                            try again
                        </button>
                    </p>
                </div>

                <Link href="/login" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to login
                </Link>
            </div>
        </div>
    )
}
