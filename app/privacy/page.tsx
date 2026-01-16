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
      <section className="pt-40 pb-20 bg-[#0F172A] text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.1),transparent)] pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-semibold mb-6"
            >
              <Lock className="h-4 w-4" />
              Privacy-First Healthcare
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold mb-8 leading-tight"
            >
              Data Privacy & <br />
              <span className="text-teal-400">Confidentiality.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-400 leading-relaxed mb-4"
            >
              At CLARA™, we treat data protection as a clinical necessity, not just a legal requirement. We are committed to securing your professional and clinical information.
            </motion.p>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-6">Updated: January 2026</p>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">

            {/* Left Column: Data Principles */}
            <div className="space-y-12">
              <h2 className="text-3xl font-bold text-slate-900 border-b border-slate-100 pb-6">Information Flow</h2>

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
                  className="flex gap-6 group"
                >
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                    <item.icon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Right Column: Technical & Institutional */}
            <div className="space-y-12 bg-slate-50 p-10 md:p-12 rounded-[40px] border border-slate-100">
              <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <Database className="h-8 w-8 text-teal-600" />
                Infrastructure
              </h2>

              <ul className="space-y-8">
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 flex-shrink-0 mt-1">
                    <FileCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Advanced Encryption</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">Advanced AES-256 encryption for data at rest and TLS 1.3 for data in transit across all environments.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 flex-shrink-0 mt-1">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Access Control</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">Strict role-based access controls and identity verification to ensure only authorized personnel interact with system logs.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 flex-shrink-0 mt-1">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Patient Rights</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">Fully aligned with GDPR (EU/EEA) and equivalent data protection legislation, including rights of access, deletion, and portability.</p>
                  </div>
                </li>
              </ul>

              <div className="pt-8 mt-8 border-t border-slate-200">
                <div className="flex items-center gap-4 text-slate-500 text-sm italic">
                  <span className="font-bold text-teal-600 not-italic">Institutional Users:</span>
                  Please refer to your organisation's Data Processing Agreement (DPA) for local specifics.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Contact Side */}
      <section className="py-24 bg-[#0F172A] text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Exercising your privacy rights</h2>
            <p className="text-slate-400 text-lg mb-12">
              If you wish to exercise your rights under the GDPR, or have questions regarding our clinical data handling, please contact our Data Protection Officer.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a href="mailto:privacy@metamedmd.com" className="w-full sm:w-auto">
                <Button className="bg-teal-500 hover:bg-teal-600 text-white font-bold h-16 px-10 rounded-2xl w-full">
                  Contact DPO
                </Button>
              </a>
              <Link href="/contact" className="w-full sm:w-auto">
                <Button variant="ghost" className="text-slate-300 hover:bg-white/5 h-16 px-10 rounded-2xl w-full">
                  General Inquiries
                </Button>
              </Link>
            </div>
            <p className="mt-12 text-slate-500 text-xs uppercase tracking-widest">
              28 Upper Pembroke Street, Dublin 2, Ireland
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
