'use client';

import { motion } from "framer-motion";
import {
    FileSearch,
    Database,
    BarChart3,
    Microscope,
    Users2,
    ShieldCheck,
    Globe2,
    Stethoscope,
    ArrowLeft,
    Search
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

export default function ResearchPage() {
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
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black uppercase tracking-[0.2em] mb-6"
                        >
                            <Search className="h-4 w-4" />
                            Research Foundations
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-extrabold mb-8 leading-tight font-primary tracking-tight"
                        >
                            Methodologically rigorous. <br />
                            <span className="text-rose-500">Clinically meaningful.</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-slate-400 leading-relaxed mb-8 font-secondary"
                        >
                            CLARA™ is grounded in the principle that high-quality clinical research must reflect real-world complexity while maintaining scientific validity and transparency.
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* Research Principles Grid */}
            <section className="py-32 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Research driven by reality",
                                desc: "Designed to support pragmatic, clinically embedded research, capturing the heterogeneity, comorbidity, and longitudinal trajectories that characterise real-world care.",
                                icon: Microscope,
                                color: "rose"
                            },
                            {
                                title: "Structure before scale",
                                desc: "Prioritising structured data capture and standardised clinical definitions. Consistent data models and validated scores support reproducibility and comparability.",
                                icon: Database,
                                color: "rose"
                            },
                            {
                                title: "Transparency",
                                desc: "Analytical outputs are traceable back to clearly defined inputs, supporting methodological transparency, peer review, and regulatory scrutiny.",
                                icon: FileSearch,
                                color: "rose"
                            },
                            {
                                title: "Longitudinal insight",
                                desc: "Capturing repeated measures of physiology, symptoms, and functional status enables investigation of disease progression and treatment response over time.",
                                icon: BarChart3,
                                color: "rose"
                            },
                            {
                                title: "Patient perspective",
                                desc: "Incorporating patient-reported outcomes and functional measures to support research that reflects both clinical and experiential dimensions of health.",
                                icon: Users2,
                                color: "rose"
                            },
                            {
                                title: "Ethical use of data",
                                desc: "Guided by principles of data minimisation, proportionality, and respect for patient autonomy, aligning with GDPR and ethical approximations.",
                                icon: ShieldCheck,
                                color: "rose"
                            },
                            {
                                title: "Collaboration",
                                desc: "Standardised data structures and transparent methodologies facilitate data sharing, meta-analysis, and replication across institutions.",
                                icon: Globe2,
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
                                className="p-10 rounded-[40px] border border-rose-50 bg-white hover:border-rose-200 hover:shadow-[0_30px_60px_rgba(244,63,94,0.06)] transition-all group lg:min-h-[320px]"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-8 group-hover:bg-rose-500 group-hover:rotate-6 transition-all duration-500 ease-out">
                                    <item.icon className="h-7 w-7 text-rose-500 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-2xl font-extrabold text-slate-800 mb-4 tracking-tight group-hover:text-rose-600 transition-colors">{item.title}</h3>
                                <p className="text-slate-500 leading-relaxed text-sm font-medium">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Discovery Section */}
            <section className="py-32 bg-rose-50/20 relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-6xl mx-auto bg-white p-16 rounded-[60px] border border-rose-100 shadow-[0_40px_100px_rgba(244,63,94,0.08)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

                        <div className="flex flex-col md:flex-row gap-20 items-center">
                            <div className="flex-1">
                                <h2 className="text-4xl font-extrabold text-slate-800 mb-8 tracking-tight">Supporting discovery <br />without overclaiming</h2>
                                <p className="text-slate-600 text-lg leading-relaxed mb-8 font-medium">
                                    CLARA™ is designed to support hypothesis generation, observational research, and evaluation of clinical processes and outcomes.
                                </p>
                                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                                    The platform does not presuppose causal inference where it cannot be justified, and is intended to complement—rather than replace—traditional experimental and clinical trial methodologies.
                                </p>
                            </div>
                            <div className="w-full md:w-80 aspect-square bg-[#1A0A0E] rounded-[60px] flex items-center justify-center relative group shadow-2xl">
                                <div className="absolute inset-0 bg-rose-500/20 rounded-[60px] blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <BarChart3 className="h-24 w-24 text-rose-500 relative z-10 group-hover:scale-110 transition-transform duration-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Back to Home CTA */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6 text-center">
                    <Link href="/">
                        <Button variant="ghost" className="gap-2 text-slate-600 hover:text-rose-600 font-extrabold h-12 px-8 rounded-full">
                            <ArrowLeft className="h-4 w-4" /> Back to Home
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
