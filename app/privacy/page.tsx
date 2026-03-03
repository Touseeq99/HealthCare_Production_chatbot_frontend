'use client';

import { motion } from "framer-motion";
import {
  Lock,
  EyeOff,
  ShieldCheck,
  UserPlus,
  Database,
  FileCheck,
  ArrowLeft,
  ChevronRight,
  Fingerprint,
  Users
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

export default function PrivacyPage() {
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
      <section className="pt-40 pb-20 bg-rose-50/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.08),transparent)] pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 text-[10px] font-black uppercase tracking-[0.2em] mb-8"
            >
              <Lock className="h-4 w-4" />
              Privacy-First Healthcare
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black text-rose-950 mb-8 leading-tight tracking-tighter uppercase"
            >
              Data Privacy & <br />
              <span className="text-rose-500 italic font-medium lowercase font-serif tracking-normal">Confidentiality.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-600 leading-relaxed mb-4 font-secondary font-medium"
            >
              At CLARA™, we treat data protection as a clinical necessity, not just a legal requirement. We are committed to securing your professional and clinical information.
            </motion.p>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-8">Revision Date: January 2026</p>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-20 items-start">

            {/* Left Column: Data Principles */}
            <div className="space-y-16">
              <h2 className="text-4xl font-extrabold text-slate-900 border-b border-rose-100 pb-8 tracking-tight">Information Flow</h2>

              {[
                {
                  title: "Clinical Data Protection",
                  desc: "We process health-related information and clinical entries exclusively to provide decision support. We do not use clinical data for advertising or sales.",
                  icon: ShieldCheck
                },
                {
                  title: "Professional Identity",
                  desc: "Personal information such as your name, registration number, and hospital affiliation is collected strictly for identity verification and audit purposes.",
                  icon: Fingerprint
                },
                {
                  title: "Purpose Limitation",
                  desc: "Data usage is restricted to improving the accuracy, safety, and clinical performance of CLARA™. We follow the principle of data minimisation.",
                  icon: EyeOff
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={sectionVariants}
                  className="flex gap-8 group"
                >
                  <div className="flex-shrink-0 w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white group-hover:rotate-6 transition-all duration-500 ease-out">
                    <item.icon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-slate-800 mb-4 group-hover:text-rose-600 transition-colors tracking-tight">{item.title}</h3>
                    <p className="text-slate-500 leading-relaxed text-sm font-medium">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Right Column: Technical & Institutional */}
            <div className="space-y-12 bg-rose-50/20 p-12 md:p-16 rounded-[60px] border border-rose-100 shadow-[0_40px_100px_rgba(244,63,94,0.04)]">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-10 flex items-center gap-3 tracking-tight">
                <Database className="h-8 w-8 text-rose-500" />
                Infrastructure
              </h2>

              <ul className="space-y-10">
                <li className="flex items-start gap-6">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0 mt-1">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xl font-extrabold text-slate-800 mb-2 tracking-tight">Advanced Encryption</h4>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium">Advanced AES-256 encryption for data at rest and TLS 1.3 for data in transit across all environments.</p>
                  </div>
                </li>
                <li className="flex items-start gap-6">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0 mt-1">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xl font-extrabold text-slate-800 mb-2 tracking-tight">Access Control</h4>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium">Strict role-based access controls and identity verification to ensure only authorized personnel interact with system logs.</p>
                  </div>
                </li>
                <li className="flex items-start gap-6">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0 mt-1">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xl font-extrabold text-slate-800 mb-2 tracking-tight">Patient Rights</h4>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium">Fully aligned with GDPR (EU/EEA) and equivalent data protection legislation, including rights of access, deletion, and portability.</p>
                  </div>
                </li>
              </ul>

              <div className="pt-10 mt-10 border-t border-rose-100">
                <div className="flex items-center gap-4 text-slate-500 text-sm italic font-medium">
                  <span className="font-extrabold text-rose-600 not-italic">Institutional Users:</span>
                  Please refer to your organisation's Data Processing Agreement (DPA) for local specifics.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Contact Side */}
      <section className="py-32 bg-white relative overflow-hidden border-t border-rose-100">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-black text-rose-950 mb-8 tracking-tighter uppercase font-primary">Exercise Your Privacy Rights</h2>
            <p className="text-slate-600 text-xl mb-12 font-secondary font-medium leading-relaxed">
              If you wish to exercise your rights under the GDPR, or have questions regarding our clinical data handling, please contact our Data Protection Officer.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a href="mailto:privacy@metamedmd.com" className="w-full sm:w-auto">
                <Button className="bg-rose-500 hover:bg-rose-600 text-white font-black h-16 px-12 rounded-full w-full shadow-2xl shadow-rose-500/20 uppercase tracking-widest text-xs">
                  Contact DPO
                </Button>
              </a>
              <Link href="/contact" className="w-full sm:w-auto">
                <Button variant="ghost" className="text-slate-500 hover:bg-rose-50 hover:text-rose-600 h-16 px-12 rounded-full w-full font-black uppercase tracking-widest text-xs">
                  General Inquiries
                </Button>
              </Link>
            </div>
            <p className="mt-20 text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">
              Dublin · Ireland · HQ
            </p>
          </div>
        </div>
      </section>

      {/* Back to Home CTA */}
      <section className="py-24 bg-white">
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
