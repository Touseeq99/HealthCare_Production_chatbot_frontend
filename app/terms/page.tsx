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
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 text-[10px] font-black uppercase tracking-[0.2em] mb-8"
            >
              <Gavel className="h-4 w-4" />
              Legal & Framework
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black text-rose-950 mb-8 leading-tight tracking-tighter uppercase"
            >
              Terms & <br />
              <span className="text-rose-500 italic font-medium lowercase font-serif tracking-normal">Conditions.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-600 leading-relaxed mb-4 font-secondary font-medium"
            >
              Welcome to CLARA™ (and the MetaMedMD ecosystem). These Terms and Conditions govern your use of the platform and related services.
            </motion.p>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-8">Last Updated: January 2026</p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto space-y-24">

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
                title: "Medical Disclaimer",
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
                <div className="flex items-start gap-10">
                  <div className="flex-shrink-0 w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white group-hover:rotate-6 transition-all duration-500 ease-out shadow-sm">
                    <section.icon className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-extrabold text-slate-800 mb-8 flex items-center gap-3 tracking-tight">
                      <span className="text-rose-300 text-sm font-black uppercase tracking-tighter">Section {section.id}</span>
                      <span className="w-2 h-2 rounded-full bg-rose-200" />
                      {section.title}
                    </h2>
                    <ul className="space-y-6">
                      {section.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-4 group/item">
                          <div className="mt-2.5 w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 shadow-[0_0_10px_rgba(244,63,94,0.4)]" />
                          <p className="text-slate-500 leading-relaxed font-medium group-hover/item:text-slate-900 transition-colors text-lg">{item}</p>
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
              className="bg-white rounded-[40px] p-12 md:p-16 border border-rose-100 relative overflow-hidden shadow-xl"
            >
              <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center text-center md:text-left">
                <div className="flex-1">
                  <h3 className="text-4xl font-black mb-6 text-rose-950 tracking-tighter uppercase font-primary">Questions regarding these terms?</h3>
                  <p className="text-slate-600 text-lg mb-0 leading-relaxed font-secondary font-medium lg:max-w-xl">
                    Our professional governance team is available to discuss specifics of our service level agreements and institutional terms.
                  </p>
                </div>
                <div className="flex flex-col gap-4 w-full md:w-auto">
                  <a href="mailto:info@metamedmd.com">
                    <Button className="bg-rose-500 text-white hover:bg-rose-600 font-black h-16 px-12 rounded-full transition-all hover:scale-105 shadow-2xl shadow-rose-500/20 w-full uppercase tracking-widest text-xs">
                      Contact Legal Team
                    </Button>
                  </a>
                  <Link href="/contact" className="w-full">
                    <Button variant="ghost" className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 h-16 px-12 rounded-full font-black w-full uppercase tracking-widest text-xs">
                      General Enquiries
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            </motion.div>

          </div>
        </div>
      </section>

      {/* Back to Home CTA */}
      <section className="py-24 bg-rose-50/10">
        <div className="container mx-auto px-6 text-center">
          <Link href="/">
            <Button variant="ghost" className="gap-2 text-slate-600 hover:text-rose-600 font-extrabold h-12 px-10 rounded-full">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
