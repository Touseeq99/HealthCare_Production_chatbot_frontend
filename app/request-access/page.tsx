'use client';

import { motion } from "framer-motion";
import {
    Lock,
    ShieldCheck,
    Stethoscope,
    ArrowLeft,
    ChevronRight,
    Send,
    Building2,
    Mail,
    User,
    Activity
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

export default function RequestAccessPage() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
    };

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
                        <Link href="/login">
                            <span className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors cursor-pointer">Sign In</span>
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
                            <Lock className="h-4 w-4" />
                            Secure Professional Access
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-bold mb-8 leading-tight"
                        >
                            Request Access to <br />
                            <span className="text-teal-400">CLARA™ Professional.</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-slate-400 leading-relaxed mb-8"
                        >
                            CLARA™ is restricted to licensed healthcare professionals and medical researchers. Please provide your details to request clinical access credentials.
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* Request Form Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-20">
                        {/* Form Side */}
                        <div className="lg:w-3/5">
                            {!isSubmitted ? (
                                <motion.div
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    variants={sectionVariants}
                                    className="bg-white rounded-[40px] border border-slate-100 p-8 md:p-12 shadow-2xl shadow-slate-200/50"
                                >
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                                <div className="relative">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                    <input
                                                        required
                                                        type="text"
                                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                                        placeholder="Dr. Sarah Mitchell"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Professional Email</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                    <input
                                                        required
                                                        type="email"
                                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                                        placeholder="s.mitchell@hospital.org"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Institution</label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                    <input
                                                        required
                                                        type="text"
                                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                                        placeholder="General Medical Center"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Specialty</label>
                                                <div className="relative">
                                                    <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                    <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all appearance-none cursor-pointer">
                                                        <option>Internal Medicine</option>
                                                        <option>Cardiology</option>
                                                        <option>Pulmonology</option>
                                                        <option>Emergency Care</option>
                                                        <option>Clinical Research</option>
                                                        <option>Other</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Clinical Registration Number (GMC, IMC, or equivalent)</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                                placeholder="Registration Number"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Reason for Access</label>
                                            <textarea
                                                rows={4}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                                                placeholder="Briefly describe your intended use (e.g., Clinical Decision Support, Research Study...)"
                                            />
                                        </div>

                                        <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 text-white py-8 rounded-2xl text-lg font-bold shadow-xl shadow-teal-500/20 group">
                                            Submit Request <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </Button>

                                        <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                                            By submitting this form, you agree that your professional details will be verified. Access is granted subject to identity confirmation and adherence to our Clinical Ethics Policy.
                                        </p>
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-teal-50 border border-teal-100 rounded-[40px] p-12 text-center"
                                >
                                    <div className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-teal-500/20">
                                        <ShieldCheck className="h-10 w-10 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-teal-900 mb-4">Request Submitted</h2>
                                    <p className="text-teal-700 mb-8 max-w-md mx-auto">
                                        Your application for clinical access is being reviewed by our medical governance team. We will verify your credentials and contact you via email within 2-3 business days.
                                    </p>
                                    <Link href="/">
                                        <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-100">
                                            Return to Home
                                        </Button>
                                    </Link>
                                </motion.div>
                            )}
                        </div>

                        {/* Info Side */}
                        <div className="lg:w-2/5 space-y-12">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-slate-900">Why verification?</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    CLARA™ is a professional clinical tool. To maintain patient safety and professional accountability, we verify the identity and registration of every user.
                                </p>
                            </div>

                            <div className="grid gap-6">
                                {[
                                    {
                                        title: "Evidence-Based Support",
                                        desc: "Traceable reasoning aligned with clinical guidelines.",
                                        icon: ShieldCheck
                                    },
                                    {
                                        title: "Secure Environment",
                                        desc: "Full GDPR and EU MDR compliance awareness.",
                                        icon: Lock
                                    },
                                    {
                                        title: "Collaborative Research",
                                        desc: "Tools for longitudinal assessment and data capture.",
                                        icon: Activity
                                    }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-5 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                            <item.icon className="h-5 w-5 text-teal-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                                            <p className="text-slate-500 text-sm">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
                                <div className="relative z-10">
                                    <h4 className="font-bold mb-4">Already have credentials?</h4>
                                    <Link href="/login">
                                        <Button className="bg-white text-slate-900 hover:bg-slate-100 w-full font-bold">
                                            Sign In to CLARA™
                                        </Button>
                                    </Link>
                                </div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Back to Home CTA */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-6 text-center">
                    <Link href="/">
                        <Button variant="ghost" className="gap-2 text-slate-600 hover:text-teal-600 flex items-center mx-auto">
                            <ArrowLeft className="h-4 w-4" /> Back to Home
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
