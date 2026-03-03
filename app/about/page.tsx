'use client';

import { motion } from "framer-motion";
import {
    Info,
    Target,
    Users,
    Heart,
    ShieldCheck,
    Lightbulb,
    ArrowLeft,
    ChevronRight,
    Stethoscope,
    Building2,
    Globe
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

export default function AboutPage() {
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
            <section className="pt-40 pb-20 bg-[#1A0A0E] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-rose-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-rose-900/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold mb-6"
                        >
                            <Info className="h-4 w-4" />
                            About CLARA™
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-extrabold mb-8 leading-tight font-primary tracking-tight"
                        >
                            The Intelligent Partner in <br />
                            <span className="text-rose-500">Clinical Excellence.</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-slate-400 leading-relaxed mb-8 font-secondary"
                        >
                            CLARA™ is a clinician-led digital platform purpose-built to navigate the complexity of modern medicine. We bridge the gap between vast medical data and actionable clinical judgment.
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={sectionVariants}
                            className="p-12 rounded-[50px] bg-rose-50/30 border border-rose-100"
                        >
                            <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mb-10 shadow-sm">
                                <Target className="h-7 w-7 text-rose-600" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-slate-800 mb-6 tracking-tight">Our Mission</h2>
                            <p className="text-slate-600 text-lg leading-relaxed font-medium">
                                To augment medical practice by providing clinicians with structured, transparent, and evidence-based reasoning support. We believe that by reducing cognitive burden, we enable healthcare professionals to focus on what matters most: the patient.
                            </p>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={sectionVariants}
                            transition={{ delay: 0.2 }}
                            className="p-12 rounded-[50px] bg-[#2A0F14] text-white shadow-2xl shadow-rose-950/20"
                        >
                            <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center mb-10 shadow-lg shadow-rose-500/20">
                                <Lightbulb className="h-7 w-7 text-white" />
                            </div>
                            <h2 className="text-3xl font-extrabold mb-6 tracking-tight">Our Vision</h2>
                            <p className="text-rose-50/80 text-lg leading-relaxed font-medium">
                                A world where clinical decisions are consistently high-quality, fully explainable, and human-centered. We envision a future where technology and clinicians work in seamless harmony to deliver safer, more equitable care.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Key Identity Pillars */}
            <section className="py-24 bg-rose-50/20">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-800 mb-6 tracking-tight">Who is <span className="text-rose-500">CLARA™?</span></h2>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                            Built on the pillars of expertise, integrity, and innovation.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Clinician-Led",
                                desc: "Developed by medical professionals who understand the nuances, pressures, and realities of clinical practice.",
                                icon: Stethoscope,
                                color: "rose"
                            },
                            {
                                title: "Evidence-Grounded",
                                desc: "Every logic path and recommendation is traceable to validated medical literature and peer-reviewed trials.",
                                icon: ShieldCheck,
                                color: "rose"
                            },
                            {
                                title: "Patient-Focused",
                                desc: "We look beyond numbers to incorporate patient-reported outcomes and functional trajectories.",
                                icon: Heart,
                                color: "rose"
                            },
                            {
                                title: "Globally Active",
                                desc: "Operating from international offices to support clinical collaboration and research across jurisdictions.",
                                icon: Globe,
                                color: "rose"
                            },
                            {
                                title: "Governance-First",
                                desc: "Committed to the highest standards of safety, privacy, and regulatory compliance (GDPR, EU MDR).",
                                icon: Building2,
                                color: "rose"
                            },
                            {
                                title: "Transparent AI",
                                desc: "No black boxes. We prioritize interpretability so clinicians can trust and audit every output.",
                                icon: Info,
                                color: "rose"
                            }
                        ].map((pillar, i) => (
                            <motion.div
                                key={pillar.title}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={sectionVariants}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-10 rounded-[40px] border border-rose-100 shadow-[0_10px_40px_rgba(244,63,94,0.03)] hover:shadow-[0_30px_70px_rgba(244,63,94,0.08)] transition-all group lg:min-h-[320px]"
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-8 group-hover:bg-rose-500 transition-all duration-500 transform group-hover:rotate-6`}>
                                    <pillar.icon className={`h-7 w-7 text-rose-500 group-hover:text-white transition-colors duration-300`} />
                                </div>
                                <h3 className="text-xl font-extrabold text-slate-800 mb-4 tracking-tight">{pillar.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium">{pillar.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* MetaMedMD Connection */}
            <section className="py-32 bg-white relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-20">
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-4xl font-extrabold text-slate-800 mb-8 tracking-tight">Part of <span className="text-rose-500">MetaMedMD</span></h2>
                            <p className="text-slate-600 text-xl leading-relaxed mb-10 font-medium">
                                CLARA™ is the flagship clinical reasoning platform by MetaMedMD. Our organization is dedicated to pushing the boundaries of what's possible in digital health, while staying firmly rooted in clinical safety and methodological rigor.
                            </p>
                            <Link href="/contact">
                                <Button className="bg-rose-500 hover:bg-rose-600 text-white gap-2 h-14 px-8 rounded-full font-bold shadow-xl shadow-rose-500/25 transition-all hover:scale-105">
                                    Contact the Team <ChevronRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                        <div className="w-full md:w-[450px] aspect-square rounded-[80px] bg-gradient-to-br from-rose-400 via-rose-500 to-rose-700 p-1.5 flex items-center justify-center relative shadow-[0_50px_100px_rgba(244,63,94,0.2)]">
                            <div className="absolute inset-5 rounded-[65px] bg-[#1A0A0E] flex flex-col items-center justify-center text-center p-8">
                                <div className="relative w-28 h-28 mb-6">
                                    <Image
                                        src="/MetamedMDlogo (2).png"
                                        alt="MetaMedMD Logo"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <span className="text-white font-extrabold text-3xl tracking-tight">MetaMedMD</span>
                                <span className="text-rose-400 text-sm font-bold uppercase tracking-[0.3em] mt-3">Smarter Care.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Back to Home CTA */}
            <section className="py-20 bg-rose-50/20">
                <div className="container mx-auto px-6 text-center">
                    <Link href="/">
                        <Button variant="ghost" className="gap-2 text-slate-600 hover:text-rose-600 font-extrabold">
                            <ArrowLeft className="h-4 w-4" /> Back to Home
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
