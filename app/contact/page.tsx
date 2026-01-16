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
                            <MessageCircle className="h-4 w-4" />
                            Contact Us
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-bold text-slate-900 mb-8 leading-tight"
                        >
                            Connect with <span className="text-teal-500">CLARA™</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-slate-600 leading-relaxed max-w-2xl"
                        >
                            CLARA™ is a clinician-led digital platform. We welcome professional enquiries, research collaborations, and partnership discussions.
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* Contact Cards */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8 mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="p-8 rounded-3xl bg-slate-900 text-white shadow-xl shadow-slate-200"
                        >
                            <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center mb-6">
                                <Mail className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Email Us</h3>
                            <p className="text-slate-400 text-sm mb-6">For general and professional enquiries.</p>
                            <a href="mailto:info@metamedmd.com" className="text-teal-400 font-bold text-lg hover:underline transition-all">
                                info@metamedmd.com
                            </a>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="p-8 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-100"
                        >
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
                                <MapPin className="h-6 w-6 text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">International Offices</h3>
                            <p className="text-slate-500 text-sm mb-4">Supporting global collaboration and operations.</p>
                            <address className="not-italic text-slate-600 text-sm leading-relaxed">
                                28 Upper Pembroke Street<br />
                                Dublin 2<br />
                                Ireland
                            </address>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="p-8 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-100"
                        >
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
                                <Clock className="h-6 w-6 text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Response Time</h3>
                            <p className="text-slate-500 text-sm mb-4">We value your time and aim for prompt communication.</p>
                            <div className="text-teal-600 font-bold text-lg">
                                2–3 Business Days
                            </div>
                        </motion.div>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                            <Info className="h-6 w-6 text-teal-500" />
                            Scope of Enquiries
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                "Clinical and professional enquiries related to platform use",
                                "Research and academic collaboration",
                                "Technical support and access queries",
                                "Data protection, privacy, and consent-related matters",
                                "Regulatory, compliance, and governance enquiries",
                                "General information and partnership discussions"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                    <span className="text-slate-700 text-sm">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Important Notice Section */}
            <section className="py-20 bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-3xl mx-auto bg-slate-800/50 backdrop-blur-md border border-slate-700 p-10 rounded-[40px] text-center">
                        <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-white mb-4">Important Notice</h2>
                        <p className="text-slate-300 leading-relaxed mb-6">
                            CLARA™ does not provide medical advice, diagnosis, or emergency services.
                        </p>
                        <p className="text-slate-400 text-sm mb-0">
                            If you have urgent health concerns, please contact your healthcare provider or local emergency services. All clinical decisions remain the responsibility of the treating healthcare professional.
                        </p>
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
