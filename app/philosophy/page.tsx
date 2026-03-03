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
                    ? "bg-white/90 backdrop-blur-md shadow-sm py-4 border-b border-rose-100"
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
                            <span className="font-bold text-lg leading-none text-rose-950">
                                CLARA
                            </span>
                            <span className="text-[10px] leading-none text-rose-500">
                                by MetaMedMD
                            </span>
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center space-x-8">
                        {["How It Works", "Clinical Evidence", "Use Cases", "About"].map((item) => (
                            <Link
                                key={item}
                                href={item === "About" ? "/about" : `/#${item.toLowerCase().replace(/\s+/g, "-")}`}
                                className="text-sm font-medium text-slate-600 transition-colors hover:text-rose-600"
                            >
                                {item}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link href="/signup">
                            <Button className="bg-rose-500 hover:bg-rose-600 text-white border-0 shadow-lg shadow-rose-500/20 rounded-full font-bold">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-20 bg-rose-50/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-sm font-semibold mb-6 shadow-sm"
                        >
                            <Brain className="h-4 w-4" />
                            Clinical Philosophy
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-extrabold text-[#3D3D3D] mb-8 leading-tight font-primary tracking-tight"
                        >
                            Technology should strengthen <span className="text-rose-500">clinical judgement</span>, not replace it.
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-slate-600 leading-relaxed mb-8 font-secondary font-medium"
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
                                color: "rose"
                            },
                            {
                                title: "Structured reasoning over automation",
                                desc: "Rather than prioritising automation, CLARA™ prioritises structured clinical reasoning, integrating symptoms, physiology, comorbidities, and risk stratification tools.",
                                icon: Brain,
                                color: "rose"
                            },
                            {
                                title: "Transparency and explainability",
                                desc: "Clinical trust depends on understanding why a recommendation is presented. CLARA™ emphasises explainable outputs that allow clinicians to see how inputs contribute to clinical considerations.",
                                icon: Eye,
                                color: "rose"
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
                                color: "rose"
                            },
                            {
                                title: "Safety, governance, and responsibility",
                                desc: "Developed with a strong emphasis on clinical safety, governance, and regulatory alignment, intended to be used within established clinical governance frameworks.",
                                icon: Shield,
                                color: "rose"
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={item.title}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={sectionVariants}
                                transition={{ delay: i * 0.1 }}
                                className="p-10 rounded-[40px] border border-rose-50 bg-white hover:border-rose-200 hover:shadow-[0_30px_60px_rgba(244,63,94,0.06)] transition-all group lg:min-h-[300px]"
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-8 group-hover:bg-rose-500 group-hover:text-white transition-all duration-500 transform group-hover:-rotate-6`}>
                                    <item.icon className="h-7 w-7 text-rose-500 group-hover:text-white" />
                                </div>
                                <h3 className="text-xl font-extrabold text-slate-800 mb-4 tracking-tight">{item.title}</h3>
                                <p className="text-slate-500 leading-relaxed text-sm font-medium">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Deep Dive Section */}
            <section className="py-32 bg-[#1A0A0E] text-white overflow-hidden relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-rose-500/10 rounded-full blur-[150px]" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center mb-24">
                        <h2 className="text-3xl md:text-6xl font-extrabold mb-8 font-primary tracking-tight">Augmenting care, not redefining it</h2>
                        <p className="text-xl text-slate-400 leading-relaxed font-secondary">
                            At its core, CLARA™ is a clinical support tool designed to augment good medical practice: improving consistency, reducing cognitive burden, and supporting thoughtful, patient-centred decision-making.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-12">
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-extrabold shadow-lg shadow-rose-500/20">1</div>
                                <div>
                                    <h4 className="text-xl font-extrabold mb-3 text-white tracking-tight">Methodological Rigor</h4>
                                    <p className="text-slate-400 text-sm leading-relaxed font-medium">Every reasoning step is grounded in validated medical frameworks and evidence-based guidelines.</p>
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-extrabold shadow-lg shadow-rose-500/20">2</div>
                                <div>
                                    <h4 className="text-xl font-extrabold mb-3 text-white tracking-tight">Clinical Context</h4>
                                    <p className="text-slate-400 text-sm leading-relaxed font-medium">CLARA avoids generic outputs by prioritising individual patient trajectories and multimorbid complexity.</p>
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-extrabold shadow-lg shadow-rose-500/20">3</div>
                                <div>
                                    <h4 className="text-xl font-extrabold mb-3 text-white tracking-tight">Professional Accountability</h4>
                                    <p className="text-slate-400 text-sm leading-relaxed font-medium">The platform supports documentation and traceability, ensuring clinical decisions are well-supported and auditable.</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="bg-white/5 backdrop-blur-xl p-12 rounded-[50px] border border-white/10 shadow-2xl relative overflow-hidden group">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/20 rounded-full blur-[80px]" />
                                <blockquote className="text-2xl text-slate-100 italic mb-10 font-secondary leading-relaxed relative z-10">
                                    "The goal is not to redefine clinical care, but to support clinicians in delivering it more reliably, safely, and humanely."
                                </blockquote>
                                <div className="flex items-center gap-5 relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-rose-500 flex items-center justify-center shadow-xl shadow-rose-500/40">
                                        <Brain className="h-7 w-7 text-white" />
                                    </div>
                                    <div>
                                        <div className="font-extrabold text-white text-lg tracking-tight">CLARA Design Team</div>
                                        <div className="text-xs text-rose-400 font-black tracking-[0.2em] uppercase">MetaMedMD</div>
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
                        <Button variant="ghost" className="gap-2 text-slate-600 hover:text-rose-600 font-bold">
                            <ArrowLeft className="h-4 w-4" /> Back to Home
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
