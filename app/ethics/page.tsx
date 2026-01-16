'use client';

import { motion } from "framer-motion";
import {
    ShieldCheck,
    Users,
    Lock,
    LineChart,
    Scale,
    Handshake,
    Eye,
    HeartPulse,
    RefreshCcw,
    ArrowLeft,
    Gavel
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" as const }
    }
};

export default function EthicsPage() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Navigation */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? "bg-white/90 backdrop-blur-md shadow-sm py-4 border-b border-slate-100"
                    : "bg-transparent py-6"
                    }`}
            >
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-10 h-10 transition-transform group-hover:scale-105">
                            <Image
                                src="/MetamedMDlogo (2).png"
                                alt="MetaMedMD Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className={`font-bold text-lg leading-none ${isScrolled ? 'text-slate-900' : 'text-slate-900'}`}>
                                CLARA
                            </span>
                            <span className={`text-[10px] leading-none ${isScrolled ? 'text-slate-500' : 'text-slate-500'}`}>
                                by MetaMedMD
                            </span>
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center space-x-8">
                        {["Platform", "Evidence", "Use Cases", "About"].map((item) => (
                            <Link
                                key={item}
                                href={item === "About" ? "/about" : `/#${item.toLowerCase().replace(" ", "-")}`}
                                className="text-sm font-medium text-slate-600 transition-colors hover:text-teal-600"
                            >
                                {item}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link href="/signup">
                            <Button className="bg-teal-500 hover:bg-teal-600 text-white border-0 shadow-lg shadow-teal-500/20">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-24 bg-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.05),transparent)] pointer-events-none" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-teal-400 text-sm font-bold mb-8 shadow-2xl shadow-slate-900/20"
                        >
                            <ShieldCheck className="h-4 w-4" />
                            Ethics & Safety
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-bold text-slate-900 mb-8 leading-[1.1]"
                        >
                            Committed to <span className="text-teal-500 underline decoration-teal-500/20 decoration-8 underline-offset-8">Accountability.</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-slate-600 leading-relaxed max-w-3xl"
                        >
                            CLARA™ is developed and deployed with a clear commitment to ethical clinical practice, patient safety, and professional responsibility, respecting patient autonomy and established standards of care.
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* Principles Section */}
            <section className="py-24">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
                        {[
                            {
                                title: "Primacy of patient welfare",
                                desc: "Patient welfare takes precedence over technological capability. The platform is designed to support, not direct, clinical decision-making. It does not replace clinical judgement.",
                                icon: HeartPulse,
                            },
                            {
                                title: "Clinician responsibility and oversight",
                                desc: "Clinicians retain full responsibility for interpretation and action. CLARA operates within a clinician-in-the-loop framework and does not override local clinical policies.",
                                icon: Users,
                            },
                            {
                                title: "Safety by design",
                                desc: "Structured data capture, transparent reasoning, and traceable outputs are embedded to support safe use. CLARA supports awareness and documentation of clinical risk.",
                                icon: ShieldCheck,
                            },
                            {
                                title: "Ethical use of AI",
                                desc: "Prioritising interpretability, proportionality, and accountability, CLARA avoids opaque or non-explainable outputs in clinical contexts.",
                                icon: Gavel,
                            },
                            {
                                title: "Data protection and confidentiality",
                                desc: "Aligned with GDPR, collection is guided by principles of data minimisation and purpose limitation. Access is governed by role-based controls and audit mechanisms.",
                                icon: Lock,
                            },
                            {
                                title: "Informed consent & governance",
                                desc: "Research and service evaluations are subject to appropriate ethical approval processes, maintaining transparency regarding data collection and use.",
                                icon: Scale,
                            },
                            {
                                title: "Bias, fairness, and equity",
                                desc: "Attention to inclusivity and representativeness across diverse patient populations. Outputs assist equitable clinical care without constraints.",
                                icon: Handshake,
                            },
                            {
                                title: "Professional accountability",
                                desc: "Used within established organisational governance structures, supporting documentation and auditability for quality assurance and continuous improvement.",
                                icon: LineChart,
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={item.title}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={sectionVariants}
                                transition={{ delay: i * 0.1 }}
                                className="flex gap-8 group"
                            >
                                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 flex items-center justify-center group-hover:bg-teal-500 group-hover:border-teal-400 group-hover:scale-110 transition-all duration-300">
                                    <item.icon className="h-8 w-8 text-slate-400 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors">{item.title}</h3>
                                    <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Continuous Improvement Section */}
            <section className="py-24 bg-slate-900 relative overflow-hidden">
                {/* Abstract shapes */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[80px] -translate-x-1/2 translate-y-1/2" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-500/20 border border-teal-500/30 mb-8">
                            <RefreshCcw className="h-10 w-10 text-teal-400" />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">Continuous evaluation and improvement</h2>
                        <p className="text-xl text-slate-400 leading-relaxed mb-12">
                            Ethics and safety are not static requirements. CLARA™ is designed to support ongoing monitoring, feedback, and refinement as clinical practice, evidence, and regulatory expectations evolve.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {["User Feedback", "Emerging Best Practice", "Incident Reporting"].map((tag) => (
                                <div key={tag} className="px-6 py-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-slate-300 font-medium whitespace-nowrap">
                                    {tag}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Back to Home CTA */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6 text-center">
                    <Link href="/">
                        <Button variant="ghost" className="gap-2 text-slate-600 hover:text-teal-600">
                            <ArrowLeft className="h-4 w-4" /> Back to Home
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
