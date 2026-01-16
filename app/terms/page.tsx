'use client';

import { motion } from "framer-motion";
import {
  FileText,
  Gavel,
  ShieldAlert,
  Scale,
  UserCheck,
  Globe2,
  ArrowLeft,
  ChevronRight,
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

export default function TermsPage() {
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
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-white text-sm font-semibold mb-6"
            >
              <Gavel className="h-4 w-4" />
              Legal & Framework
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-slate-900 mb-8 leading-tight"
            >
              Terms & <br />
              <span className="text-indigo-600">Conditions.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-600 leading-relaxed mb-4"
            >
              Welcome to CLARA™ (and the MetaMedMD ecosystem). These Terms and Conditions govern your use of the platform and related services.
            </motion.p>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Last updated: January 2026</p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-20">

            {[
              {
                id: "1",
                title: "Purpose of the Application",
                icon: Info,
                items: [
                  "CLARA™ is a clinical decision support and research tool designed for use by licensed healthcare professionals.",
                  "It is intended to support, not replace, clinical judgment, diagnostic skill, and institutional protocols.",
                  "The application is not intended for use as a substitute for professional medical advice, diagnosis, or treatment."
                ]
              },
              {
                id: "2",
                title: "Professional Eligibility",
                icon: UserCheck,
                items: [
                  "You must be a licensed healthcare professional or an authorized researcher in your jurisdiction to use the professional tier of CLARA™.",
                  "By using the App, you warrant that you maintain all necessary credentials and that they remain in good standing.",
                  "Unauthorized use by non-professionals is strictly prohibited."
                ]
              },
              {
                id: "3",
                title: "Medical Disclaimer & Disclaimer of Warranties",
                icon: ShieldAlert,
                items: [
                  "The platform provides decision support outputs based on available data and programmed logic algorithms.",
                  "We do not guarantee that recommendations will be exhaustive, error-free, or perfectly aligned with every possible local clinical nuance.",
                  "The platform is provided 'as is'. Treating clinicians retain ultimate responsibility for every patient decision."
                ]
              },
              {
                id: "4",
                title: "User Responsibilities",
                icon: FileText,
                items: [
                  "You agree to enter data accurately and lawfully, ensuring you have the right to process any patient data provided.",
                  "You are responsible for the confidentiality of your credentials.",
                  "Misuse, reverse-engineering, or unauthorized extraction of the platform's logic models is prohibited."
                ]
              },
              {
                id: "5",
                title: "Intellectual Property",
                icon: Scale,
                items: [
                  "All intellectual property, including proprietary algorithms, reasoning frameworks, and trademarks, belongs to MetaMedMD.",
                  "Use of the App grants you a limited, non-transferable, revocable license for its intended professional purposes."
                ]
              },
              {
                id: "6",
                title: "Limitation of Liability",
                icon: Gavel,
                items: [
                  "MetaMedMD shall not be liable for any direct, indirect, or consequential damages arising from reliance on the platform's outputs.",
                  "Treating institutions are responsible for ensuring CLARA™ is used within their established clinical governance frameworks."
                ]
              },
              {
                id: "7",
                title: "Governing Law",
                icon: Globe2,
                items: [
                  "These terms are governed by the laws of Ireland. Exclusive jurisdiction for any disputes rests with the Irish courts."
                ]
              }
            ].map((section) => (
              <motion.div
                key={section.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={sectionVariants}
                className="group"
              >
                <div className="flex items-start gap-8">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    <section.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <span className="text-slate-300 text-sm font-mono">{section.id}.</span> {section.title}
                    </h2>
                    <ul className="space-y-4">
                      {section.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                          <p className="text-slate-600 leading-relaxed">{item}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Contact Support */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={sectionVariants}
              className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden"
            >
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-6">Questions regarding these terms?</h3>
                <p className="text-slate-400 mb-8 leading-relaxed">
                  Our professional governance team is available to discuss specifics of our service level agreements and institutional terms.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="mailto:info@metamedmd.com">
                    <Button className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-8 py-6 rounded-2xl">
                      Contact Legal Team
                    </Button>
                  </a>
                  <Link href="/contact">
                    <Button variant="ghost" className="text-white hover:bg-white/10 px-8 py-6 rounded-2xl">
                      General Enquiries
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/2" />
            </motion.div>

          </div>
        </div>
      </section>

      {/* Back to Home CTA */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6 text-center">
          <Link href="/">
            <Button variant="ghost" className="gap-2 text-slate-600 hover:text-indigo-600">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
