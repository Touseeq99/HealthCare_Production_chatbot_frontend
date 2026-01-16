'use client';

import { motion } from "framer-motion";
import {
    ClipboardCheck,
    FileText,
    Target,
    Gavel,
    ShieldCheck,
    Globe2,
    Eye,
    BarChart,
    ArrowLeft,
    CheckCircle2,
    Lock
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

export default function CompliancePage() {
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
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold mb-6"
                        >
                            <Gavel className="h-4 w-4" />
                            Regulatory Compliance
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-bold text-slate-900 mb-8 leading-tight"
                        >
                            Continuous process, <br />
                            not a <span className="text-blue-600">one-time requirement.</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-slate-600 leading-relaxed mb-8"
                        >
                            CLARA™ is developed and operated with a strong commitment to regulatory compliance, clinical governance, and responsible deployment within healthcare environments.
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* Compliance Detailed Grid */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12">
                        {[
                            {
                                title: "Regulatory Awareness & Alignment",
                                desc: "Designed with awareness of applicable regulatory frameworks governing digital health technologies. CLARA supports use within established institutional governance structures.",
                                details: "Consideration of European regulatory frameworks, including the Medical Device Regulation (EU MDR), supporting appropriate classification and documentation.",
                                icon: Target
                            },
                            {
                                title: "Defined Intended Use",
                                desc: "Clearly defining intended use is central to compliance. CLARA is intended as a clinical decision support and research support platform.",
                                details: "Does not provide autonomous diagnosis, treatment recommendations, or emergency medical services. All functionality is developed within this defined scope.",
                                icon: ClipboardCheck
                            },
                            {
                                title: "Quality Management & Documentation",
                                desc: "Development guided by principles consistent with recognised quality management standards for healthcare software.",
                                details: "Structured documentation of system functionality, version control, change management, and traceability to support internal governance and regulatory review.",
                                icon: FileText
                            },
                            {
                                title: "Data Protection & Privacy",
                                desc: "Designed to align with applicable data protection legislation, including the General Data Protection Regulation (GDPR).",
                                details: "Compliance measures include data minimisation, purpose limitation, role-based access control, and support for data subject rights.",
                                icon: Lock
                            },
                            {
                                title: "Clinical & Research Governance",
                                desc: "Supports auditability and documentation to enable clinical oversight and quality assurance within local governance frameworks.",
                                details: "Research use is subject to appropriate ethical approval, institutional governance, and informed consent processes.",
                                icon: ShieldCheck
                            },
                            {
                                title: "Ongoing Monitoring & Review",
                                desc: "Compliance is an ongoing obligation involving periodic reviews and monitoring of use.",
                                details: "Includes feedback from clinical and research users to ensure continued alignment with clinical standards and best practices.",
                                icon: Eye
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={item.title}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={sectionVariants}
                                transition={{ delay: i * 0.1 }}
                                className="flex flex-col md:flex-row gap-8 p-10 rounded-[32px] bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-500/5 transition-all group"
                            >
                                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white flex items-center justify-center border border-slate-100 group-hover:bg-blue-600 group-hover:border-blue-500 transition-all duration-500 shadow-sm">
                                    <item.icon className="h-7 w-7 text-blue-600 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
                                    <p className="text-slate-600 leading-relaxed mb-4 text-sm font-medium">{item.desc}</p>
                                    <p className="text-slate-500 text-sm leading-relaxed pb-4 border-b border-slate-200 mb-4">{item.details}</p>
                                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest">
                                        <CheckCircle2 className="h-4 w-4" /> Fully Compliant
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Global Flexibility */}
            <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-bold mb-8">
                                <Globe2 className="h-4 w-4" /> Jurisdictional Flexibility
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">Adapting to your <span className="text-blue-400">local regulations.</span></h2>
                            <p className="text-xl text-slate-400 leading-relaxed">
                                CLARA™ is designed to support deployment across multiple jurisdictions, recognising that regulatory and governance requirements may vary by region.
                            </p>
                        </div>
                        <div className="lg:w-1/2 grid grid-cols-2 gap-4">
                            <div className="p-8 rounded-3xl bg-slate-800/50 border border-slate-700 backdrop-blur-sm">
                                <h4 className="font-bold mb-2">EU GDPR</h4>
                                <p className="text-xs text-slate-500">Full Alignment</p>
                            </div>
                            <div className="p-8 rounded-3xl bg-slate-800/50 border border-slate-700 backdrop-blur-sm mt-8">
                                <h4 className="font-bold mb-2">EU MDR</h4>
                                <p className="text-xs text-slate-500">Framework Aware</p>
                            </div>
                            <div className="p-8 rounded-3xl bg-slate-800/50 border border-slate-700 backdrop-blur-sm">
                                <h4 className="font-bold mb-2">Local Governance</h4>
                                <p className="text-xs text-slate-500">Flexible Integration</p>
                            </div>
                            <div className="p-8 rounded-3xl bg-slate-800/50 border border-slate-700 backdrop-blur-sm mt-8">
                                <h4 className="font-bold mb-2">Clinical Audit</h4>
                                <p className="text-xs text-slate-500">Full Traceability</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Back to Home CTA */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6 text-center">
                    <Link href="/">
                        <Button variant="ghost" className="gap-2 text-slate-600 hover:text-blue-600 transition-colors">
                            <ArrowLeft className="h-4 w-4" /> Back to Home
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
