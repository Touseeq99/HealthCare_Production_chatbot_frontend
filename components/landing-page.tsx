"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  ArrowRight,
  Brain,
  FileText,
  Clock,
  AlertTriangle,
  MessageSquare,
  CheckCircle2,
  Database,
  FileSearch,
  Stethoscope,
  Users,
  GraduationCap,
  ClipboardList,
  Activity,
  ArrowLeftRight,
  Eye,
  Scale,
  Lock,
  Lightbulb,
  Building2
} from "lucide-react";
import { AuthHashHandler } from "@/components/auth/auth-hash-handler";

// Animation variants for smooth section transitions
const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" as const }
  }
};

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<'clinicians' | 'teams' | 'innovators'>('clinicians');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const audienceContent = {
    clinicians: {
      title: "For Individual Clinicians",
      items: [
        "Accelerate diagnostic reasoning with evidence-aligned support",
        "Reduce cognitive load during complex case management",
        "Generate clear documentation and patient explanations",
        "Stay current with evolving guidelines and evidence"
      ]
    },
    teams: {
      title: "For Healthcare Teams",
      items: [
        "Standardise clinical reasoning across your organisation",
        "Improve MDT communication with structured summaries",
        "Reduce variation in care quality and decision-making",
        "Support training and professional development"
      ]
    },
    innovators: {
      title: "For Healthcare Innovators",
      items: [
        "Integrate clinical reasoning into your platforms via API",
        "Build next-generation clinical decision support tools",
        "Partner with us on research and development",
        "Access cutting-edge clinical AI capabilities"
      ]
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      <AuthHashHandler />
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm py-4 border-b border-slate-100"
          : "bg-transparent py-6"
          }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image
                src="/MetamedMDlogo (2).png"
                alt="MetaMedMD Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className={`font-bold text-lg leading-none ${isScrolled ? "text-slate-900" : "text-white"}`}>
                CLARA
              </span>
              <span className={`text-[10px] leading-none ${isScrolled ? "text-slate-500" : "text-slate-300"}`}>
                by MetaMedMD
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {["Platform", "Evidence", "Use Cases", "About"].map((item) => {
              const isAbout = item === "About";
              const href = isAbout ? "/about" : `/#${item.toLowerCase().replace(" ", "-")}`;
              const LinkComponent = isAbout ? Link : "a";

              return (
                <LinkComponent
                  key={item}
                  href={href as any}
                  className={`text-sm font-medium transition-colors hover:text-teal-400 ${isScrolled ? "text-slate-600" : "text-slate-300"
                    }`}
                >
                  {item}
                </LinkComponent>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className={`text-sm font-medium transition-colors hover:text-teal-400 ${isScrolled ? "text-slate-600" : "text-slate-300"
                }`}
            >
              Sign In
            </Link>
            <Link href="/signup">
              <Button className="bg-teal-500 hover:bg-teal-600 text-white border-0 shadow-lg shadow-teal-500/20">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] bg-[#0F172A] flex items-center pt-24 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Enhanced Shield Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-950/50 border border-teal-500/30 backdrop-blur-md mb-8 shadow-[0_0_15px_rgba(20,184,166,0.1)]"
            >
              <Shield className="h-4 w-4 text-teal-400 fill-teal-400/10" />
              <span className="text-sm font-semibold text-teal-400 tracking-wide">Clinical-Grade AI Reasoning</span>
            </motion.div>

            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Intelligent <span className="bg-gradient-to-r from-teal-400 to-teal-200 bg-clip-text text-transparent">Clinical Reasoning</span>
            </h1>

            <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-2xl">
              Evidence-based. Explainable. Clinician-led. CLARA mirrors the way expert clinicians think —
              structured, transparent, and grounded in the best available evidence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button className="h-14 px-8 text-lg bg-teal-500 hover:bg-teal-600 text-white rounded-lg shadow-lg shadow-teal-500/25 transition-all hover:scale-105">
                Explore the Platform <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                className="h-14 px-8 text-lg border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600 hover:text-white rounded-lg transition-all"
              >
                Built for Clinicians
              </Button>
            </div>

            <div className="flex flex-wrap gap-8 text-sm font-medium text-slate-400">
              {["Evidence-aligned", "Fully explainable", "Clinician-controlled"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hero Visual - Brain Connection */}
          <div className="relative h-[500px] hidden lg:block perspective-1000">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* The X-Shape Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                {/* Top Left to Center */}
                <line x1="20%" y1="20%" x2="50%" y2="50%" stroke="#14B8A6" strokeWidth="1" strokeOpacity="0.3" />
                {/* Top Right to Center */}
                <line x1="80%" y1="20%" x2="50%" y2="50%" stroke="#14B8A6" strokeWidth="1" strokeOpacity="0.3" />
                {/* Bottom Left to Center */}
                <line x1="20%" y1="80%" x2="50%" y2="50%" stroke="#14B8A6" strokeWidth="1" strokeOpacity="0.3" />
                {/* Bottom Right to Center */}
                <line x1="80%" y1="80%" x2="50%" y2="50%" stroke="#14B8A6" strokeWidth="1" strokeOpacity="0.3" />
              </svg>

              {/* Central Brain - Simple Bounce */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="relative z-10 w-32 h-32 bg-slate-800/80 backdrop-blur-md border border-teal-500/30 rounded-3xl flex items-center justify-center shadow-2xl shadow-teal-900/20"
              >
                <Brain className="h-16 w-16 text-teal-400" />
              </motion.div>

              {/* Corner Nodes - Absolute Positioning */}

              {/* Top Left: Evidence */}
              <div className="absolute top-[10%] left-[10%] flex flex-col items-center gap-3 z-20">
                <div className="w-16 h-16 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl flex items-center justify-center">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <span className="text-sm font-medium text-slate-400">Evidence</span>
              </div>

              {/* Top Right: Guidelines */}
              <div className="absolute top-[10%] right-[10%] flex flex-col items-center gap-3 z-20">
                <div className="w-16 h-16 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl flex items-center justify-center">
                  <Shield className="h-8 w-8 text-slate-400" />
                </div>
                <span className="text-sm font-medium text-slate-400">Guidelines</span>
              </div>

              {/* Bottom Left: Reasoning */}
              <div className="absolute bottom-[10%] left-[10%] flex flex-col items-center gap-3 z-20">
                <div className="w-16 h-16 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl flex items-center justify-center">
                  <Brain className="h-8 w-8 text-slate-400" />
                </div>
                <span className="text-sm font-medium text-slate-400">Reasoning</span>
              </div>

              {/* Bottom Right: Output */}
              <div className="absolute bottom-[10%] right-[10%] flex flex-col items-center gap-3 z-20">
                <div className="w-16 h-16 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl flex items-center justify-center">
                  <ArrowRight className="h-8 w-8 text-slate-400" />
                </div>
                <span className="text-sm font-medium text-slate-400">Output</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent pointer-events-none" />
      </section>

      {/* Challenge / Solution Section */}
      <motion.section
        className="py-32 bg-slate-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
      >
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">The Challenge. The Solution.</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Modern medicine demands more than any clinician can hold in working memory. CLARA bridges the gap.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* The Problem */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-red-100 rounded-xl text-red-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">The Problem</h3>
              </div>

              <div className="grid gap-6">
                {[
                  { title: "Fragmented Data", desc: "Critical information scattered across systems and sources", icon: Database },
                  { title: "Time Pressure", desc: "Complex decisions made under severe time constraints", icon: Clock },
                  { title: "Guideline Overload", desc: "Hundreds of guidelines impossible to keep current with", icon: FileText },
                  { title: "Communication Gaps", desc: "Difficulty conveying clinical reasoning to colleagues", icon: MessageSquare },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    custom={i}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0, transition: { delay: i * 0.1 } }
                    }}
                    className="bg-white p-6 rounded-xl shadow-sm border border-red-100 flex gap-5 hover:shadow-md transition-shadow"
                  >
                    <div className="p-3 bg-red-50 rounded-lg h-fit">
                      <item.icon className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1 text-lg">{item.title}</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* The Solution */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-teal-100 rounded-xl text-teal-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">The Solution</h3>
              </div>

              <div className="grid gap-6">
                {[
                  { title: "Structured Reasoning", desc: "Systematic approach mirroring expert clinical thinking", icon: Brain },
                  { title: "Evidence-Backed Logic", desc: "Every recommendation grounded in current evidence", icon: Shield },
                  { title: "Clear Summaries", desc: "Concise, actionable outputs ready for clinical use", icon: ClipboardList },
                  { title: "Explainable Outputs", desc: "Full transparency into how conclusions are reached", icon: FileSearch },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    custom={i}
                    variants={{
                      hidden: { opacity: 0, x: 20 },
                      visible: { opacity: 1, x: 0, transition: { delay: i * 0.1 } }
                    }}
                    className="bg-white p-6 rounded-xl shadow-sm border border-teal-100 flex gap-5 hover:shadow-md transition-shadow"
                  >
                    <div className="p-3 bg-teal-50 rounded-lg h-fit">
                      <item.icon className="h-6 w-6 text-teal-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1 text-lg">{item.title}</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* How CLARA Thinks Section */}
      <motion.section
        id="platform"
        className="py-32 bg-white relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-1.5 rounded-full bg-teal-50 text-teal-600 font-semibold text-sm mb-6">
              Core Differentiator
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-6">How CLARA Thinks</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              CLARA mirrors clinical reasoning — the same structured approach expert clinicians use, made consistent and transparent.
            </p>
          </div>

          <div className="relative grid md:grid-cols-4 gap-8">
            {/* Connection Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-teal-100 to-transparent -translate-y-1/2 hidden md:block" />

            {[
              { step: "01", title: "Clinical Input", desc: "Patient data, symptoms, and clinical context are structured and organized", icon: ClipboardList },
              { step: "02", title: "Evidence Alignment", desc: "Relevant guidelines, trials, and literature are identified and weighted", icon: FileText },
              { step: "03", title: "Logical Reasoning", desc: "Systematic analysis following clinical reasoning frameworks", icon: Brain },
              { step: "04", title: "Transparent Output", desc: "Clear recommendations with full explanation of reasoning path", icon: ArrowRight },
            ].map((step, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { delay: i * 0.2 } }
                }}
                className="relative bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center group hover:-translate-y-2 transition-transform duration-300 hover:shadow-xl hover:border-teal-100"
              >
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-2">
                  <span className="text-teal-500 font-bold text-sm tracking-widest">{step.step}</span>
                </div>
                <div className="w-16 h-16 mx-auto bg-teal-50 rounded-2xl flex items-center justify-center mb-6 text-teal-600 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 shadow-teal-100 shadow-lg group-hover:shadow-teal-500/30">
                  <step.icon className="h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h3 className="font-bold text-slate-900 mb-3 text-lg">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-16">
            <p className="text-slate-500 italic font-medium">
              "Intelligent but calm — every step visible, every conclusion traceable."
            </p>
          </div>
        </div>
      </motion.section>

      {/* Evidence Section */}
      <motion.section
        className="py-32 bg-slate-50"
        id="evidence"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block px-4 py-1.5 rounded-full bg-slate-200 text-slate-700 font-semibold text-sm mb-6">
              Scientific Foundation
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Evidence & Trust</h2>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed">
              CLARA's recommendations are grounded in the best available evidence. We clearly distinguish between evidence levels and maintain full transparency about sources.
            </p>

            <div className="flex flex-col gap-5 mb-10">
              <motion.div whileHover={{ x: 5 }} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                <span className="px-3 py-1 rounded bg-teal-100 text-teal-800 text-xs font-bold uppercase w-20 text-center tracking-wider">High</span>
                <span className="text-slate-700 text-sm font-medium">Strong evidence from multiple RCTs (Level A)</span>
              </motion.div>
              <motion.div whileHover={{ x: 5 }} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                <span className="px-3 py-1 rounded bg-amber-100 text-amber-800 text-xs font-bold uppercase w-20 text-center tracking-wider">Moderate</span>
                <span className="text-slate-700 text-sm font-medium">Limited RCT data or observational studies (Level B)</span>
              </motion.div>
              <motion.div whileHover={{ x: 5 }} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                <span className="px-3 py-1 rounded bg-red-100 text-red-800 text-xs font-bold uppercase w-20 text-center tracking-wider">Low</span>
                <span className="text-slate-700 text-sm font-medium">Expert opinion or case reports (Level C)</span>
              </motion.div>
            </div>

            <Button variant="link" className="text-teal-600 font-bold p-0 hover:text-teal-700 text-lg group">
              How CLARA uses evidence <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { title: "Published Trials", desc: "Randomised controlled trials and systematic reviews from peer-reviewed literature", icon: FileText, sub: "Primary Evidence" },
              { title: "Clinical Guidelines", desc: "International and national guidelines from recognised medical bodies", icon: Shield, sub: "Standards of Care" },
              { title: "Expert Opinion", desc: "Consensus statements and specialist recommendations clearly distinguished", icon: Users, sub: "Contextual Insight" },
              { title: "Continuous Updates", desc: "Regular integration of new evidence as it becomes available", icon: Activity, sub: "Living System" },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="mb-4 p-3 bg-slate-50 rounded-lg w-fit">
                  <card.icon className="h-6 w-6 text-slate-700" />
                </div>
                <span className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-2 block">{card.sub}</span>
                <h3 className="font-bold text-slate-900 mb-2 text-lg">{card.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Explainability & Ethics Section */}
      <motion.section
        id="about"
        className="py-32 bg-[#0F172A] text-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block px-4 py-1.5 rounded-full bg-teal-900/50 border border-teal-500/30 text-teal-400 font-semibold text-sm mb-6 shadow-glow">
              Transparency & Ethics
            </div>
            <h2 className="text-4xl font-bold mb-6">Explainability & Ethics</h2>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              CLARA is different from generic AI tools. We believe clinical AI must be transparent, controllable, and safe. Every design decision reflects these principles.
            </p>
            <div className="pl-6 border-l-4 border-teal-500 italic text-slate-400 text-lg">
              "A calm, brilliant colleague — clear-thinking, evidence-driven, and always explainable."
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: "Not a Black Box",
                desc: "Every recommendation comes with a complete reasoning chain. See exactly how conclusions are reached.",
                icon: Eye
              },
              {
                title: "Clinician Control",
                desc: "CLARA advises, you decide. The clinician always remains in full control of clinical decisions.",
                icon: Shield
              },
              {
                title: "Evidence vs Opinion",
                desc: "Clear separation between what is evidence-based and what requires clinical judgement.",
                icon: Scale
              },
              {
                title: "Designed for Safety",
                desc: "Built with clinical safety as the primary consideration. Conservative when uncertain.",
                icon: Lock
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:border-teal-500/30 transition-all hover:bg-slate-800"
              >
                <div className="mb-4 p-3 bg-slate-900 rounded-lg w-fit border border-slate-700">
                  <card.icon className="h-6 w-6 text-teal-400" />
                </div>
                <h3 className="font-bold text-white mb-2 text-lg">{card.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Use Cases Section */}
      <motion.section
        className="py-32 bg-slate-50"
        id="use-cases"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-1.5 rounded-full bg-teal-50 text-teal-600 font-semibold text-sm mb-6">
              Applications
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Use Cases</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              CLARA adapts to your workflow. From bedside decisions to teaching rounds, clinical reasoning that fits.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Clinical Decision Support",
                desc: "Real-time assistance during complex diagnostic and treatment decisions",
                icon: Stethoscope,
                bullet: "Faster, more confident decisions"
              },
              {
                title: "Multidisciplinary Communication",
                desc: "Clear summaries for MDT meetings and cross-specialty consultations",
                icon: Users,
                bullet: "Improved team coordination"
              },
              {
                title: "Patient Explanation",
                desc: "Generate clear, accessible explanations for patients and families",
                icon: Users,
                bullet: "Better patient understanding"
              },
              {
                title: "Education & Training",
                desc: "Teaching clinical reasoning to medical students and residents",
                icon: GraduationCap,
                bullet: "Structured learning experience"
              },
              {
                title: "Documentation & Summaries",
                desc: "Comprehensive clinical documentation with full reasoning trails",
                icon: FileText,
                bullet: "Complete, auditable records"
              },
              {
                title: "Handoff Communication",
                desc: "Structured handover summaries for shift changes and transfers",
                icon: ArrowLeftRight,
                bullet: "Seamless continuity of care"
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-teal-100 transition-all group"
              >
                <div className="mb-6 p-3 bg-teal-50 rounded-xl w-fit text-teal-600 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-300">
                  <card.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-xl text-slate-900 mb-3">{card.title}</h3>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">{card.desc}</p>
                <div className="flex items-center gap-2 text-xs font-bold text-teal-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  {card.bullet}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Who It's For Section */}
      <motion.section
        className="py-32 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Who It's For</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-16">
            CLARA is designed for anyone who values structured, evidence-based clinical reasoning.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Button
              variant={activeTab === 'clinicians' ? 'default' : 'outline'}
              className={`rounded-full px-8 py-6 text-base ${activeTab === 'clinicians' ? 'bg-teal-500 hover:bg-teal-600 border-none' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              onClick={() => setActiveTab('clinicians')}
            >
              <Stethoscope className="mr-2 h-5 w-5" /> Clinicians
            </Button>
            <Button
              variant={activeTab === 'teams' ? 'default' : 'outline'}
              className={`rounded-full px-8 py-6 text-base ${activeTab === 'teams' ? 'bg-teal-500 hover:bg-teal-600 border-none' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              onClick={() => setActiveTab('teams')}
            >
              <Building2 className="mr-2 h-5 w-5" /> Healthcare Teams
            </Button>
            <Button
              variant={activeTab === 'innovators' ? 'default' : 'outline'}
              className={`rounded-full px-8 py-6 text-base ${activeTab === 'innovators' ? 'bg-teal-500 hover:bg-teal-600 border-none' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              onClick={() => setActiveTab('innovators')}
            >
              <Lightbulb className="mr-2 h-5 w-5" /> Innovators
            </Button>
          </div>

          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl p-10 border border-slate-100 shadow-2xl shadow-slate-200/50"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                  <div className="bg-teal-50 p-6 rounded-2xl hidden md:block">
                    {activeTab === 'clinicians' && <Stethoscope className="h-10 w-10 text-teal-600" />}
                    {activeTab === 'teams' && <Users className="h-10 w-10 text-teal-600" />}
                    {activeTab === 'innovators' && <Lightbulb className="h-10 w-10 text-teal-600" />}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">{audienceContent[activeTab].title}</h3>
                    <div className="space-y-4">
                      {audienceContent[activeTab].items.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="mt-1 p-0.5 rounded-full bg-teal-100 text-teal-600">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                          <span className="text-slate-600 text-lg">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.section>


    </div>
  );
}
