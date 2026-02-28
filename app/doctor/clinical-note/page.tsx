import { AIClinicalNote } from "@/components/ai-clinical-note/ai-clinical-note"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "AI Clinical Note | Doctor Assist",
    description:
        "AI-assisted clinical note generation for SOAP, Progress, Discharge, Referral, and OPD notes. AI-generated content must be reviewed before clinical use.",
}

export default function ClinicalNotePage() {
    return <AIClinicalNote />
}
