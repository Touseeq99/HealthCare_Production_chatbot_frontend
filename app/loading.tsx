'use client';

import { motion } from "framer-motion";
import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      {/* Soft Rose Background Gradients */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-rose-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

      <div className="relative flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-24 h-24 mb-10"
        >
          {/* Premium Pulsing rings */}
          <motion.div
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.15, 0, 0.15],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-[-20px] border border-rose-500/30 rounded-full"
          />
          <motion.div
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="absolute inset-[-10px] border border-rose-500/50 rounded-full"
          />

          <div className="absolute inset-0 bg-white rounded-[32px] flex items-center justify-center border border-rose-100 shadow-[0_20px_50px_rgba(244,63,94,0.1)] group">
            <div className="relative w-12 h-12 transition-transform duration-500 group-hover:scale-110">
              <Image
                src="/MetamedMDlogo (2).png"
                alt="CLARA Loader"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-rose-950 font-black tracking-tighter text-3xl font-primary">CLARA™</span>
            <span className="text-rose-500 text-[10px] uppercase tracking-[0.4em] font-black">by MetaMedMD</span>
          </div>

          <div className="flex gap-2.5 mt-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]"
              />
            ))}
          </div>

          <span className="text-slate-400 text-xs uppercase tracking-[0.2em] mt-6 font-bold max-w-[200px] leading-relaxed">
            Initializing Intelligent <br /> Clinical Reasoning
          </span>
        </motion.div>
      </div>
    </div>
  );
}
