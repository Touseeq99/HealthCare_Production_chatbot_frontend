"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Plus, ChevronRight, Loader2, Calendar, Hash } from "lucide-react"
import { cn } from "@/lib/utils"
import { PatientListItem } from "./types"

interface PatientListProps {
  patients: PatientListItem[]
  selectedId: string | null
  isLoading: boolean
  onSelect: (id: string) => void
  onNewPatient: () => void
}

export function PatientList({
  patients,
  selectedId,
  isLoading,
  onSelect,
  onNewPatient,
}: PatientListProps) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-rose-100">
      {/* Header */}
      <div className="p-4 border-b border-rose-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-black uppercase tracking-widest text-rose-900">
              My Patients
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
            {patients.length}
          </span>
        </div>
        <button
          onClick={onNewPatient}
          className="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl py-2.5 text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          New Patient
        </button>
      </div>

      {/* Patient List */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 text-rose-400 animate-spin" />
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-10 px-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-3">
              <Users className="w-5 h-5 text-rose-300" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              No patients yet
            </p>
            <p className="text-[10px] text-slate-300 mt-1">
              Click "New Patient" to start
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {patients.map((p, i) => (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => onSelect(p.id)}
                className={cn(
                  "w-full text-left rounded-xl px-3 py-2.5 mb-1 transition-all group flex items-center gap-3",
                  selectedId === p.id
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                    : "hover:bg-rose-50 text-slate-700"
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0",
                    selectedId === p.id
                      ? "bg-white/20 text-white"
                      : "bg-rose-100 text-rose-600"
                  )}
                >
                  {p.patient_initials?.slice(0, 2).toUpperCase() || "??"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-xs font-black truncate",
                      selectedId === p.id ? "text-white" : "text-slate-800"
                    )}
                  >
                    {p.patient_initials}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {p.patient_mrn && (
                      <span
                        className={cn(
                          "text-[10px] font-bold flex items-center gap-0.5",
                          selectedId === p.id ? "text-rose-100" : "text-slate-400"
                        )}
                      >
                        <Hash className="w-2.5 h-2.5" />
                        {p.patient_mrn}
                      </span>
                    )}
                    {p.date_of_admission && (
                      <span
                        className={cn(
                          "text-[10px] font-bold flex items-center gap-0.5",
                          selectedId === p.id ? "text-rose-100" : "text-slate-400"
                        )}
                      >
                        <Calendar className="w-2.5 h-2.5" />
                        {new Date(p.date_of_admission).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight
                  className={cn(
                    "w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
                    selectedId === p.id ? "opacity-100 text-white" : "text-rose-400"
                  )}
                />
              </motion.button>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
