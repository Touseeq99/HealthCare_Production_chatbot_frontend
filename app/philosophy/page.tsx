'use client';

import { motion } from "framer-motion";
import {
    Brain,
    Users,
    Eye,
    Shield,
    Activity,
    Scale,
    Heart,
    ArrowLeft,
    ChevronRight
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

export default function PhilosophyPage() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? "bg-white/90 backdrop-blur-md shadow-sm py-4 border-b border-slate-100"
                    : "bg-white/50 backdrop-blur-sm py-6"
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
                            <span className="font-bold text-lg leading-none text-slate-900">
                                CLARA
                            </span>
                            <span className="text-[10px] leading-none text-slate-500">
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
            <section className="pt-40 pb-20 bg-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-600 text-sm font-semibold mb-6"
                        >
                            <Brain className="h-4 w-4" />
                            Clinical Philosophy
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-bold text-slate-900 mb-8 leading-tight"
                        >
                            Technology should strengthen <span className="text-teal-500">clinical judgement</span>, not replace it.
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-slate-600 leading-relaxed mb-8"
                        >
                            CLARA™ is built on a simple but rigorous clinical principle: Modern medicine requires clinicians to synthesise large volumes of information under time pressure while remaining aligned with best-practice guidance and individual patient context.
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* Core Principles Grid */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Clinician-in-the-loop by design",
                                desc: "CLARA™ is intentionally designed as a clinician-in-the-loop system. It does not generate autonomous diagnoses or treatment decisions. Final decisions always remain with the treating healthcare professional.",
                                icon: Users,
                                color: "teal"
                            },
                            {
                                title: "Structured reasoning over automation",
                                desc: "Rather than prioritising automation, CLARA™ prioritises structured clinical reasoning, integrating symptoms, physiology, comorbidities, and risk stratification tools.",
                                icon: Brain,
                                color: "blue"
                            },
                            {
                                title: "Transparency and explainability",
                                desc: "Clinical trust depends on understanding why a recommendation is presented. CLARA™ emphasises explainable outputs that allow clinicians to see how inputs contribute to clinical considerations.",
                                icon: Eye,
                                color: "indigo"
                            },
                            {
                                title: "Patient-centred, not data-centred",
                                desc: "Incorporating patient-reported outcomes, functional status, and patient perspective alongside traditional clinical data, supporting a more holistic view of health.",
                                icon: Heart,
                                color: "rose"
                            },
                            {
                                title: "Longitudinal care, not snapshot medicine",
                                desc: "Designed to support longitudinal assessment—tracking trends in physiology, symptoms, mobility, and patient-reported wellbeing over time.",
                                icon: Activity,
                                color: "emerald"
                            },
                            {
                                title: "Safety, governance, and responsibility",
                                desc: "Developed with a strong emphasis on clinical safety, governance, and regulatory alignment, intended to be used within established clinical governance frameworks.",
                                icon: Shield,
                                color: "slate"
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={item.title}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={sectionVariants}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-2xl border border-slate-100 bg-white hover:border-teal-100 hover:shadow-xl hover:shadow-teal-500/5 transition-all group"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-${item.color}-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <item.icon className={`h-6 w-6 text-${item.color}-500`} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
                                <p className="text-slate-600 leading-relaxed text-sm">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Deep Dive Section */}
            <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[120px]" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-8">Augmenting care, not redefining it</h2>
                        <p className="text-xl text-slate-400 leading-relaxed">
                            At its core, CLARA™ is a clinical support tool designed to augment good medical practice: improving consistency, reducing cognitive burden, and supporting thoughtful, patient-centred decision-making.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold">1</div>
                                <div>
                                    <h4 className="text-lg font-bold mb-2 text-white">Methodological Rigor</h4>
                                    <p className="text-slate-400 text-sm">Every reasoning step is grounded in validated medical frameworks and evidence-based guidelines.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold">2</div>
                                <div>
                                    <h4 className="text-lg font-bold mb-2 text-white">Clinical Context</h4>
                                    <p className="text-slate-400 text-sm">CLARA avoids generic outputs by prioritising individual patient trajectories and multimorbid complexity.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold">3</div>
                                <div>
                                    <h4 className="text-lg font-bold mb-2 text-white">Professional Accountability</h4>
                                    <p className="text-slate-400 text-sm">The platform supports documentation and traceability, ensuring clinical decisions are well-supported and auditable.</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl border border-slate-700 shadow-2xl relative">
                                <div className="absolute -top-4 -right-4 w-24 h-24 bg-teal-500/20 rounded-full blur-2xl" />
                                <blockquote className="text-lg text-slate-300 italic mb-6">
                                    "The goal is not to redefine clinical care, but to support clinicians in delivering it more reliably, safely, and humanely."
                                </blockquote>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                                        <Brain className="h-6 w-6 text-teal-400" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">CLARA Design Team</div>
                                        <div className="text-xs text-teal-500 font-semibold tracking-wider uppercase">MetaMedMD</div>
                                    </div>
                                </div>
                            </div>
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
