'use client';

import { motion } from "framer-motion";
import {
    Mail,
    MapPin,
    Clock,
    ArrowLeft,
    MessageCircle,
    Stethoscope,
    Microscope,
    ShieldAlert,
    HelpCircle,
    Building,
    Info
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

export default function ContactPage() {
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
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-xs font-black uppercase tracking-[0.2em] mb-6 shadow-sm"
                        >
                            <MessageCircle className="h-4 w-4" />
                            Contact Us
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-extrabold text-[#3D3D3D] mb-8 leading-tight font-primary tracking-tight"
                        >
                            Connect with <span className="text-rose-500">CLARA™</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-slate-600 leading-relaxed max-w-2xl font-secondary font-medium"
                        >
                            CLARA™ is a clinician-led digital platform. We welcome professional enquiries, research collaborations, and partnership discussions.
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* Contact Cards */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8 mb-24">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="p-10 rounded-[40px] bg-[#1A0A0E] text-white shadow-2xl shadow-rose-950/20 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                            <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-rose-500/40 relative z-10">
                                <Mail className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-extrabold mb-3 tracking-tight relative z-10">Email Us</h3>
                            <p className="text-slate-400 text-sm mb-8 font-medium relative z-10">For general and professional enquiries.</p>
                            <a href="mailto:info@metamedmd.com" className="text-rose-400 font-extrabold text-xl hover:text-white transition-colors relative z-10">
                                info@metamedmd.com
                            </a>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="p-10 rounded-[40px] bg-white border border-rose-100 shadow-[0_20px_50px_rgba(244,63,94,0.05)] hover:shadow-[0_40px_80px_rgba(244,63,94,0.1)] transition-all duration-500"
                        >
                            <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-8">
                                <MapPin className="h-7 w-7 text-rose-500" />
                            </div>
                            <h3 className="text-2xl font-extrabold text-slate-800 mb-3 tracking-tight">International</h3>
                            <p className="text-slate-500 text-sm mb-6 font-medium">Supporting global collaboration and operations.</p>
                            <address className="not-italic text-slate-600 text-lg leading-relaxed font-semibold">
                                28 Upper Pembroke Street<br />
                                Dublin 2, Ireland
                            </address>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="p-10 rounded-[40px] bg-white border border-rose-100 shadow-[0_20px_50px_rgba(244,63,94,0.05)] hover:shadow-[0_40px_80px_rgba(244,63,94,0.1)] transition-all duration-500"
                        >
                            <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-8">
                                <Clock className="h-7 w-7 text-rose-500" />
                            </div>
                            <h3 className="text-2xl font-extrabold text-slate-800 mb-3 tracking-tight">Response Time</h3>
                            <p className="text-slate-500 text-sm mb-6 font-medium">We value your time and aim for prompt communication.</p>
                            <div className="text-rose-600 font-black text-2xl tracking-tight">
                                2–3 Business Days
                            </div>
                        </motion.div>
                    </div>

                    <div className="max-w-5xl mx-auto bg-rose-50/20 rounded-[60px] p-12 border border-rose-50">
                        <h2 className="text-3xl font-extrabold text-slate-800 mb-10 flex items-center gap-4 tracking-tight">
                            <div className="p-2 bg-rose-500 rounded-lg">
                                <Info className="h-6 w-6 text-white" />
                            </div>
                            Scope of Enquiries
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                "Clinical and professional enquiries related to platform use",
                                "Research and academic collaboration",
                                "Technical support and access queries",
                                "Data protection, privacy, and consent-related matters",
                                "Regulatory, compliance, and governance enquiries",
                                "General information and partnership discussions"
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4 p-5 bg-white rounded-3xl border border-rose-50 shadow-sm group hover:border-rose-200 transition-colors">
                                    <div className="mt-1.5 w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 animate-pulse" />
                                    <span className="text-slate-600 text-sm font-semibold leading-relaxed group-hover:text-slate-900 transition-colors">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Important Notice Section */}
            <section className="py-24 bg-[#1A0A0E] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(239,68,68,0.1),transparent)]" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 p-12 lg:p-16 rounded-[60px] text-center shadow-2xl">
                        <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
                            <ShieldAlert className="h-8 w-8 text-red-500" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-white mb-6 tracking-tight">Important Notice</h2>
                        <p className="text-slate-300 text-lg leading-relaxed mb-8 font-medium">
                            CLARA™ does not provide medical advice, diagnosis, or emergency services.
                        </p>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-2xl mx-auto opacity-80">
                            If you have urgent health concerns, please contact your healthcare provider or local emergency services. All clinical decisions remain the responsibility of the treating healthcare professional.
                        </p>
                    </div>
                </div>
            </section>

            {/* Back to Home CTA */}
            <section className="py-20 bg-white">
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
