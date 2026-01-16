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
            <section className="pt-40 pb-20 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-semibold mb-6"
                        >
                            <Search className="h-4 w-4" />
                            Research Foundations
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-bold mb-8 leading-tight"
                        >
                            Methodologically rigorous. <br />
                            <span className="text-teal-400">Clinically meaningful.</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-slate-400 leading-relaxed mb-8"
                        >
                            CLARA™ is grounded in the principle that high-quality clinical research must reflect real-world complexity while maintaining scientific validity and transparency.
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* Research Principles Grid */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Research driven by clinical reality",
                                desc: "Designed to support pragmatic, clinically embedded research, capturing the heterogeneity, comorbidity, and longitudinal trajectories that characterise real-world care.",
                                icon: Microscope,
                                color: "teal"
                            },
                            {
                                title: "Structure before scale",
                                desc: "Prioritising structured data capture and standardised clinical definitions. Consistent data models and validated scores support reproducibility and comparability.",
                                icon: Database,
                                color: "blue"
                            },
                            {
                                title: "Transparency and interpretability",
                                desc: "Analytical outputs are traceable back to clearly defined inputs, supporting methodological transparency, peer review, and regulatory scrutiny.",
                                icon: FileSearch,
                                color: "indigo"
                            },
                            {
                                title: "Longitudinal insight",
                                desc: "Capturing repeated measures of physiology, symptoms, and functional status enables investigation of disease progression and treatment response over time.",
                                icon: BarChart3,
                                color: "emerald"
                            },
                            {
                                title: "Integration of patient perspective",
                                desc: "Incorporating patient-reported outcomes and functional measures to support research that reflects both clinical and experiential dimensions of health.",
                                icon: Users2,
                                color: "rose"
                            },
                            {
                                title: "Ethical use of data",
                                desc: "Guided by principles of data minimisation, proportionality, and respect for patient autonomy, aligning with GDPR and ethical approximations.",
                                icon: ShieldCheck,
                                color: "slate"
                            },
                            {
                                title: "Collaboration & Reproducibility",
                                desc: "Standardised data structures and transparent methodologies facilitate data sharing, meta-analysis, and replication across institutions.",
                                icon: Globe2,
                                color: "cyan"
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
                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-teal-50 transition-all">
                                    <item.icon className="h-6 w-6 text-slate-600 group-hover:text-teal-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
                                <p className="text-slate-600 leading-relaxed text-sm">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Discovery Section */}
            <section className="py-24 bg-slate-50 relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto bg-white p-12 rounded-[40px] border border-slate-200 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="flex flex-col md:flex-row gap-12 items-center">
                            <div className="flex-1">
                                <h2 className="text-3xl font-bold text-slate-900 mb-6">Supporting discovery without overclaiming</h2>
                                <p className="text-slate-600 leading-relaxed mb-6">
                                    CLARA™ is designed to support hypothesis generation, observational research, and evaluation of clinical processes and outcomes.
                                </p>
                                <p className="text-slate-600 leading-relaxed">
                                    The platform does not presuppose causal inference where it cannot be justified, and is intended to complement—rather than replace—traditional experimental and clinical trial methodologies.
                                </p>
                            </div>
                            <div className="w-full md:w-64 aspect-square bg-slate-900 rounded-3xl flex items-center justify-center relative group">
                                <div className="absolute inset-0 bg-teal-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                                <BarChart3 className="h-20 w-20 text-teal-400 relative z-10" />
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
