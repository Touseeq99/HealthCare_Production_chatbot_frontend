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

const ROTATING_QUOTES = [
  {
    text: "MetaMedMD brings structured clinical reasoning into the digital era. It integrates evidence, guidelines, and clinical context in a way that genuinely supports how physicians think.",
    author: "Senior Cardiologist",
  },
  {
    text: "What stands out about MetaMedMD is its emphasis on transparent, evidence-based reasoning rather than black-box AI. It mirrors the analytical approach clinicians use in real-world practice.",
    author: "Senior Cardiologist",
  },
  {
    text: "MetaMedMD has the potential to become an invaluable tool for clinicians navigating increasingly complex cardiovascular care. Its structured reasoning framework reflects how expert clinicians approach decision-making.",
    author: "Senior Cardiologist",
  },
];

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
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  const rotatingTexts = [
    "For Healthcare Workers: CLARA analyzes symptoms to provide rapid, evidence-based diagnostic pathways and generates precise clinical notes instantly.",
    "For Patients: CLARA translates complex medical data into clear, understandable insights, helping you navigate your health journey.",
    "How it Works: Input patient history, and our AI cross-references thousands of clinical guidelines to build an actionable, traceable plan."
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % rotatingTexts.length);
    }, 25000); // Changes every 25 seconds as requested

    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % ROTATING_QUOTES.length);
    }, 5000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(interval);
      clearInterval(quoteInterval);
    };
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
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-rose-100 selection:text-rose-900">
      <AuthHashHandler />

      {/* Experimental Disclaimer Banner */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-rose-600 text-white py-2.5 text-center text-[10px] md:text-xs font-black tracking-[0.2em] uppercase shadow-lg">
        <div className="flex items-center justify-center gap-3 px-4">
          <AlertTriangle className="h-3 w-3 md:h-4 md:h-4 animate-pulse" />
          <span>NOT FOR CLINICAL USE — STILL EXPERIMENTAL</span>
          <AlertTriangle className="h-3 w-3 md:h-4 md:h-4 animate-pulse" />
        </div>
      </div>

      {/* Navigation */}
      <nav
        className={`fixed top-10 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm py-4 border-b border-rose-100"
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
              <span className={`font-bold text-lg leading-none ${isScrolled ? "text-rose-950" : "text-rose-900"}`}>
                CLARA
              </span>
              <span className={`text-[10px] leading-none ${isScrolled ? "text-rose-500" : "text-rose-600"}`}>
                by MetaMedMD
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {["How It Works", "Clinical Evidence", "Use Cases", "Contact Us"].map((item) => {
              const isContact = item === "Contact Us";
              const href = isContact ? "/contact" : `/#${item.toLowerCase().replace(/\s+/g, "-")}`;
              const LinkComponent = isContact ? Link : "a";

              return (
                <LinkComponent
                  key={item}
                  href={href as any}
                  className={`text-sm font-semibold transition-colors hover:text-rose-500 ${isScrolled ? "text-slate-600" : "text-rose-900"
                    }`}
                >
                  {item}
                </LinkComponent>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className={`font-semibold transition-colors hover:bg-rose-50 rounded-full px-6 ${isScrolled ? "text-slate-600 hover:text-rose-600" : "text-rose-900 hover:text-rose-700"}`}>
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-rose-500 hover:bg-rose-600 text-white border-0 shadow-lg shadow-rose-500/20 rounded-full px-6">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen bg-white flex items-center pt-32 overflow-hidden">
        {/* Soft Pink Wavy Backgrounds */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[120%] bg-gradient-to-br from-rose-50 via-rose-100/30 to-transparent rounded-[100%] blur-3xl opacity-60" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[100%] bg-gradient-to-tr from-rose-100/40 via-transparent to-transparent rounded-[100%] blur-3xl opacity-50" />

          {/* Animated Wave Patterns (SVG) */}
          <svg className="absolute bottom-0 left-0 w-full h-[300px] text-rose-100/50" viewBox="0 0 1440 320">
            <path fill="currentColor" d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>

        <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-[#3D3D3D] leading-tight mb-6">
              Precision Clinical Reasoning <br />
              <span className="text-rose-500">for Modern Physicians and Patients</span>
            </h1>

            <div className="h-28 sm:h-20 mb-10">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentTextIndex}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="text-xl text-slate-600 leading-relaxed max-w-xl font-medium"
                >
                  {rotatingTexts[currentTextIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 mb-12">
              <Link href="/signup">
                <Button className="h-14 px-10 text-lg bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-xl shadow-rose-500/25 transition-all hover:scale-105 font-bold w-full sm:w-auto">
                  Sign Up
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="h-14 px-10 text-lg border-rose-200 text-rose-600 hover:bg-rose-50 rounded-full transition-all font-bold w-full sm:w-auto"
                >
                  Log In
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Visual - Auto-playing Video */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative flex justify-center items-center w-full"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-rose-200/40 rounded-full blur-[100px] -z-10 animate-pulse" />

            <div className="relative w-full max-w-2xl aspect-video rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(244,63,94,0.15)] border border-rose-100/50 bg-slate-50">
              {/* Fallback gradient while loading */}
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-50 to-slate-50 opacity-50" />

              <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                poster="/hero-poster.png"
                className="absolute inset-0 w-full h-full object-cover z-0"
              >
                {/* Dynamically loads the video from the Supabase public 'herovideo' bucket */}
                <source
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/herovideo/hero-video.mp4`}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>

            </div>
          </motion.div>
        </div>

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
      </section>

      {/* Challenge / Solution Section */}
      <motion.section
        className="py-32 bg-white relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
      >
        {/* Decorative Blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-rose-50 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 opacity-60" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-50 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 opacity-60" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-[#3D3D3D] mb-6">The Challenge. <span className="text-rose-500">The Solution.</span></h2>
            <p className="text-lg text-slate-500 leading-relaxed font-medium">
              Modern medicine demands more than any clinician can hold in working memory. CLARA bridges the gap with structured, evidence-led reasoning.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* The Problem */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-rose-100 rounded-2xl text-rose-600 shadow-sm">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">The Problem</h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { title: "Fragmented Data", desc: "Critical info scattered across systems", icon: Database },
                  { title: "Time Pressure", desc: "Decisions made under severe constraints", icon: Clock },
                  { title: "Guideline Overload", desc: "Impossible to keep up with updates", icon: FileText },
                  { title: "Communication Gaps", desc: "Difficulty conveying complex reasoning", icon: MessageSquare },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-rose-100/50 shadow-[0_10px_40px_rgba(244,63,94,0.03)] hover:shadow-[0_20px_50px_rgba(244,63,94,0.08)] transition-all duration-300 group"
                  >
                    <div className="p-3 bg-rose-50 rounded-xl h-fit w-fit mb-4 group-hover:bg-rose-100 transition-colors">
                      <item.icon className="h-5 w-5 text-rose-400" />
                    </div>
                    <h4 className="font-bold text-slate-800 mb-2 text-base leading-tight">{item.title}</h4>
                    <p className="text-slate-500 text-xs leading-relaxed font-medium">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* The Solution */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-rose-500 rounded-2xl text-white shadow-lg shadow-rose-500/20">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">The Solution</h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { title: "Structured Reasoning", desc: "Systematic expert-led approach", icon: Brain },
                  { title: "Evidence-Backed", desc: "Grounded in current research", icon: Shield },
                  { title: "Actionable Outputs", desc: "Concise, ready-to-use summaries", icon: ClipboardList },
                  { title: "Total Transparency", desc: "Full path to every conclusion", icon: FileSearch },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-white p-6 rounded-3xl border border-rose-200 shadow-[0_10px_40px_rgba(244,63,94,0.05)] hover:shadow-[0_20px_50px_rgba(244,63,94,0.12)] transition-all duration-300 group"
                  >
                    <div className="p-3 bg-rose-50 rounded-xl h-fit w-fit mb-4 group-hover:bg-rose-500 transition-colors">
                      <item.icon className="h-5 w-5 text-rose-500 group-hover:text-white transition-colors" />
                    </div>
                    <h4 className="font-bold text-slate-800 mb-2 text-base leading-tight">{item.title}</h4>
                    <p className="text-slate-500 text-xs leading-relaxed font-medium">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* How CLARA Works Section */}
      <motion.section
        id="how-it-works"
        className="py-32 bg-rose-50/20 relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <span className="inline-block px-4 py-1.5 rounded-full bg-rose-100 text-rose-600 font-bold text-xs uppercase tracking-widest mb-4">
              Our Methodology
            </span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-800 mb-6">How <span className="text-rose-500">CLARA</span> Works</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
              We mirror the complex cognitive processes of expert clinicians, making every step traceable and consistent.
            </p>
          </div>

          <div className="relative grid md:grid-cols-4 gap-10">
            {/* Elegant Flowing Line */}
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-rose-200 to-transparent -translate-y-1/2 hidden md:block z-0" />

            {[
              { step: "01", title: "Input Symptoms", desc: "Patient history and current symptoms are structured using semantic clinical mapping.", icon: ClipboardList },
              { step: "02", title: "AI Analysis", desc: "Our engine weighs evidence from thousands of sources and clinical guidelines.", icon: Brain },
              { step: "03", title: "Differential Diagnosis", desc: "A reasoned list of probabilities is generated with strict evidence alignment.", icon: FileSearch },
              { step: "04", title: "Clinical Insights", desc: "Final recommendations are provided with a complete reasoning trail.", icon: Activity },
            ].map((step, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="relative bg-white p-10 rounded-[40px] border border-rose-100 shadow-[0_15px_60px_rgba(244,63,94,0.06)] text-center group transition-all duration-500 hover:shadow-[0_40px_80px_rgba(244,63,94,0.12)] z-10"
              >
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1 rounded-full border border-rose-100 shadow-sm">
                  <span className="text-rose-500 font-bold text-sm tracking-tighter">{step.step}</span>
                </div>
                <div className="w-20 h-20 mx-auto bg-rose-50 rounded-[30px] flex items-center justify-center mb-8 text-rose-600 group-hover:bg-rose-500 group-hover:text-white transition-all duration-500 transform group-hover:rotate-6">
                  <step.icon className="h-10 w-10" />
                </div>
                <h3 className="font-extrabold text-[#3D3D3D] mb-4 text-xl tracking-tight">{step.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Evidence Section */}
      <motion.section
        className="py-32 bg-white relative"
        id="clinical-evidence"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <span className="text-rose-600 font-extrabold text-sm uppercase tracking-widest mb-6 block">Clinical Benchmarks</span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-800 mb-8 leading-tight">Grounded in <span className="text-rose-500">Evidence</span>, Driven by Accuracy</h2>
            <p className="text-lg text-slate-500 mb-12 leading-relaxed font-medium">
              CLARA doesn't just analyze; it validates. Our system is built on Level A evidence from RCTs, clinical trials, and internationally recognized healthcare guidelines.
            </p>

            <div className="grid sm:grid-cols-2 gap-8 mb-12">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-rose-500 to-rose-600 p-8 rounded-[40px] text-white shadow-xl shadow-rose-500/30"
              >
                <div className="text-4xl font-extrabold mb-2">95%</div>
                <div className="text-xs font-bold uppercase tracking-widest opacity-80">Diagnostic Accuracy</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white p-8 rounded-[40px] border border-rose-100 shadow-xl shadow-rose-500/5"
              >
                <div className="text-4xl font-extrabold text-rose-500 mb-2">40%</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Faster Assessments</div>
              </motion.div>
            </div>

            <Button className="h-14 px-10 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold shadow-lg transition-all group">
              View Detailed Whitepaper <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { title: "Published Trials", desc: "RCTs and peer-reviewed literature from major journals.", icon: FileText, sub: "Primary" },
              { title: "Clinical Guidelines", desc: "NICE, WHO, and AHA standards of care integrated.", icon: Shield, sub: "Standards" },
              { title: "Expert Opinion", desc: "Consensus statements from world-class specialists.", icon: Users, sub: "Contextual" },
              { title: "30k+ Cases", desc: "Real-world experience analyzed across diverse sectors.", icon: Activity, sub: "Insights" },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-3xl border border-rose-100 shadow-[0_10px_40px_rgba(30,41,59,0.03)] hover:shadow-[0_20px_60px_rgba(244,63,94,0.1)] transition-all duration-300 group"
              >
                <div className="mb-6 p-4 bg-rose-50 rounded-2xl w-fit group-hover:bg-rose-500 group-hover:text-white transition-all">
                  <card.icon className="h-6 w-6 text-rose-600 group-hover:text-white" />
                </div>
                <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2 block">{card.sub}</span>
                <h3 className="font-extrabold text-slate-800 mb-2 text-lg">{card.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Explainability & Ethics Section */}
      <motion.section
        id="ethics"
        className="py-32 bg-slate-900 text-white overflow-hidden relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        {/* Animated Dark Gradients */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-rose-900/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-xs uppercase tracking-widest mb-6">
              Ethics & Transparency
            </span>
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-8 leading-tight tracking-tight text-white font-primary">Designed for <span className="text-rose-400">Clinical Safety</span></h2>
            <p className="text-lg text-slate-400 mb-10 leading-relaxed font-medium font-secondary">
              CLARA is built with safety as the primary directive. We ensure that AI remains a tool in the clinician's hand, providing clarity without replacing professional judgment.
            </p>
            <div className="h-[240px] flex flex-col justify-center border-l-4 border-rose-500 pl-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuoteIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                  <p className="italic text-white/90 text-xl font-medium mb-4">
                    "{ROTATING_QUOTES[currentQuoteIndex].text}"
                  </p>
                  <p className="text-rose-400 font-bold text-sm tracking-widest uppercase">
                    — {ROTATING_QUOTES[currentQuoteIndex].author}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { title: "Not a Black Box", desc: "Every step is traceable. See exactly how the AI reached its clinical conclusion.", icon: Eye },
              { title: "Clinician Control", desc: "You are the final pilot. CLARA handles the navigation, you make the final call.", icon: Shield },
              { title: "Reasoned Verdicts", desc: "Distinguishes between evidence-based facts and clinical opinion.", icon: Scale },
              { title: "Patient Safety", desc: "Built with rigorous safety bounds to minimize errors and biases.", icon: Lock },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                whileHover={{ y: -5, backgroundColor: 'rgba(244, 63, 94, 0.05)' }}
                className="bg-white/5 backdrop-blur-md p-8 rounded-[40px] border border-white/10 hover:border-rose-500/30 transition-all duration-300 group"
              >
                <div className="mb-6 p-4 bg-white/10 rounded-2xl w-fit group-hover:bg-rose-500 group-hover:text-white transition-all">
                  <card.icon className="h-6 w-6 text-rose-400" />
                </div>
                <h3 className="font-extrabold text-white mb-3 text-lg leading-tight">{card.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Real-World Impact Section (NEW) */}
      <motion.section
        className="py-32 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-rose-500 font-extrabold text-sm uppercase tracking-widest mb-4 block">Case Studies</span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-800 mb-6">Real-World <span className="text-rose-500">Impact</span></h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="group relative h-[450px] rounded-[50px] overflow-hidden border border-rose-100 shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent z-10" />
              <div className="absolute inset-0 bg-rose-100 group-hover:scale-110 transition-transform duration-700">
                {/* Fallback pattern while image isn't available */}
                <div className="w-full h-full bg-rose-50 flex items-center justify-center">
                  <Activity className="w-20 h-20 text-rose-200" />
                </div>
              </div>
              <div className="absolute bottom-10 left-10 p-2 z-20 text-white max-w-sm">
                <span className="bg-rose-500 text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block">ED Triage Efficiency</span>
                <h3 className="text-3xl font-extrabold mb-4">Reducing Time to Diagnosis</h3>
                <p className="text-slate-300 font-medium leading-relaxed">
                  ED Triage reduced from <span className="text-white font-bold">4 hours to 45 minutes</span> using CLARA's rapid reasoning.
                </p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              className="group relative h-[450px] rounded-[50px] overflow-hidden border border-rose-100 shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent z-10" />
              <div className="absolute inset-0 bg-rose-100 group-hover:scale-110 transition-transform duration-700">
                <div className="w-full h-full bg-rose-50 flex items-center justify-center">
                  <Stethoscope className="w-20 h-20 text-rose-200" />
                </div>
              </div>
              <div className="absolute bottom-10 left-10 p-2 z-20 text-white max-w-sm">
                <span className="bg-rose-500 text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block">Diagnostic Safety</span>
                <h3 className="text-3xl font-extrabold mb-4 tracking-tight">Improving Outcomes</h3>
                <p className="text-slate-300 font-medium leading-relaxed">
                  Increased diagnostic accuracy to <span className="text-white font-bold">99%</span> across multi-morbid elderly clinical cases.
                </p>
              </div>
            </motion.div>
          </div>

          <div className="mt-20 text-center">
            <h3 className="text-2xl font-extrabold text-[#3D3D3D] mb-8">Ready to Transform Your Practice?</h3>
            <Button className="h-16 px-12 text-xl bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-2xl shadow-rose-500/25 transition-all hover:scale-105 font-bold">
              Get Started
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Use Cases Section */}
      <motion.section
        className="py-32 bg-rose-50/10"
        id="use-cases"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <span className="text-rose-500 font-extrabold text-xs uppercase tracking-[0.3em] mb-4 block">
              Omni-Channel Applications
            </span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-800 mb-6">Use <span className="text-rose-500">Cases</span></h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
              CLARA seamlessly integrates into every phase of the clinical lifecycle, from the bedside to the boardroom.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Clinical Decision Support", desc: "Real-time assistance during complex diagnostic and treatment decisions", icon: Stethoscope, bullet: "Evidence-aligned reasoning" },
              { title: "MDT Communication", desc: "Clear summaries for multidisciplinary meetings and consultations", icon: Users, bullet: "Structured handovers" },
              { title: "Patient Explanation", desc: "Generate accessible, clear explanations for patients and families", icon: MessageSquare, bullet: "Enhanced understanding" },
              { title: "Education & Training", desc: "Teaching structured reasoning to medical students and residents", icon: GraduationCap, bullet: "Better learning outcomes" },
              { title: "Documentation Trails", desc: "Auditable documentation with full clinical reasoning histories", icon: FileText, bullet: "Reduced medicolegal risk" },
              { title: "Handoff Continuity", desc: "Structured handover summaries for seamless shift transitions", icon: ArrowLeftRight, bullet: "Patient safety first" },
            ].map((card, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -12, scale: 1.02 }}
                className="bg-white p-10 rounded-[40px] border border-rose-100 shadow-[0_10px_40px_rgba(244,63,94,0.03)] hover:shadow-[0_30px_70px_rgba(244,63,94,0.1)] transition-all duration-500 group"
              >
                <div className="mb-8 p-4 bg-rose-50 rounded-2xl w-fit group-hover:bg-rose-500 group-hover:text-white transition-all duration-500 transform group-hover:-rotate-6">
                  <card.icon className="h-7 w-7 text-rose-600 group-hover:text-white" />
                </div>
                <h3 className="font-extrabold text-[#3D3D3D] mb-4 text-xl tracking-tight">{card.title}</h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">{card.desc}</p>
                <div className="pt-6 border-t border-rose-50 flex items-center gap-3 text-xs font-black text-rose-500 uppercase tracking-wider">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  {card.bullet}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Who It's For Section */}
      <motion.section
        className="py-32 bg-white relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-[#3D3D3D] mb-6">Who It's <span className="text-rose-500">For</span></h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-16 font-medium leading-relaxed">
            Scalable clinical intelligence designed for every stakeholder in the healthcare ecosystem.
          </p>

          <div className="inline-flex p-2 bg-rose-50 rounded-[30px] mb-16 shadow-inner border border-rose-100/50">
            {[
              { id: 'clinicians', label: 'Clinicians', icon: Stethoscope },
              { id: 'teams', label: 'Healthcare Teams', icon: Building2 },
              { id: 'innovators', label: 'Innovators', icon: Lightbulb }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-8 py-4 rounded-[25px] text-sm font-bold transition-all duration-500 ${activeTab === tab.id
                  ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/30'
                  : 'text-slate-500 hover:text-rose-600 hover:bg-white/50'
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-white rounded-[60px] p-12 lg:p-16 border border-rose-50 shadow-[0_50px_100px_rgba(244,63,94,0.08)] relative"
              >
                {/* Visual Accent */}
                <div className="absolute top-10 right-10 opacity-5">
                  <Activity className="w-40 h-40 text-rose-500" />
                </div>

                <div className="flex flex-col lg:flex-row items-center gap-16 text-left relative z-10">
                  <div className="w-24 h-24 bg-rose-500 rounded-[30px] flex items-center justify-center text-white shadow-2xl shadow-rose-500/40 transform -rotate-3">
                    {activeTab === 'clinicians' && <Stethoscope className="h-10 w-10" />}
                    {activeTab === 'teams' && <Users className="h-10 w-10" />}
                    {activeTab === 'innovators' && <Lightbulb className="h-10 w-10" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-extrabold text-slate-800 mb-8 tracking-tight">{audienceContent[activeTab].title}</h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                      {audienceContent[activeTab].items.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-4 group">
                          <div className="mt-1 p-1 rounded-full bg-rose-100 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                          <span className="text-slate-500 font-medium leading-tight group-hover:text-slate-800 transition-colors">{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-12">
                      <Button className="h-14 px-8 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-full font-bold transition-all border border-rose-200">
                        Explore {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Solutions
                      </Button>
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
