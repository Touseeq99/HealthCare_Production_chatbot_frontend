// ─── Clinical Notes — Cardiology Edition — Types ─────────────────────────────

export type OutputType = "CLINICAL_NOTE" | "HANDOVER_NOTE" | "DISCHARGE_LETTER"
export type ThreeWay = "Yes" | "No" | "Not assessed"

export interface PatientClinicalData {
  patient_identification: {
    initials: string
    mrn?: string
    dob?: string
    age?: number
    sex?: "Male" | "Female" | "Other" | "Prefer not to say"
    location?: string
    date_of_admission?: string
    date_of_discharge?: string
    responsible_consultant?: string
  }
  presenting_complaint: {
    complaints: {
      chest_pain: boolean
      dyspnoea: boolean
      syncope: boolean
      palpitations: boolean
      heart_failure_symptoms: boolean
      stroke_embolic_event: boolean
      other: boolean
    }
    other_complaint?: string
    duration?: string
  }
  symptoms: {
    chest_pain_pressure: boolean
    chest_tightness_heaviness: boolean
    chest_pain_radiating: boolean
    shortness_of_breath: boolean
    breathlessness_on_exertion: boolean
    breathlessness_at_rest: boolean
    orthopnoea: boolean
    paroxysmal_nocturnal_dyspnoea: boolean
    rapid_irregular_heartbeat: boolean
    skipped_heartbeats: boolean
    syncope: boolean
    presyncope: boolean
    dizziness_lightheadedness: boolean
    fatigue: boolean
    reduced_exercise_tolerance: boolean
    peripheral_oedema: boolean
    abdominal_swelling: boolean
    sudden_weight_gain: boolean
    nausea_vomiting: boolean
    diaphoresis: boolean
    unexplained_weakness: boolean
    exertional_chest_pain: boolean
    exertional_syncope: boolean
    exertional_dyspnoea: boolean
    confusion_altered_state: boolean
    cold_clammy_extremities: boolean
    reduced_urine_output: boolean
    stroke_tia_symptoms: boolean
    sudden_vision_speech_disturbance: boolean
  }
  relevant_medical_history: {
    coronary_artery_disease: boolean
    atrial_fibrillation: boolean
    heart_failure: boolean
    hypertension: boolean
    diabetes: boolean
    hyperlipidaemia: boolean
    stroke_tia: boolean
    chronic_kidney_disease: boolean
    obesity: boolean
    sleep_apnoea: boolean
    prior_cardiac_surgery: boolean
    prior_pci: boolean
  }
  cardiovascular_risk_factors: {
    smoking_history: boolean
    family_history_premature_cvd: boolean
    hypertension: boolean
    diabetes: boolean
    dyslipidaemia: boolean
    sedentary_lifestyle: boolean
  }
  examination_findings: {
    vitals: {
      heart_rate?: string
      blood_pressure?: string
      oxygen_saturation?: string
      temperature?: string
    }
    clinical_findings: {
      signs_of_heart_failure: boolean
      murmur: boolean
      peripheral_oedema: boolean
      raised_jvp: boolean
      lung_crepitations: boolean
    }
  }
  ecg: {
    rhythm?: string
    heart_rate?: string
    conduction_abnormalities?: string
    st_t_changes?: string
    qt_interval?: string
    image_uploaded: boolean
    ecg_image_path?: string
  }
  cardiac_imaging: {
    echocardiography: {
      lvef?: string
      lv_size?: string
      rv_function?: string
      lv_dilation?: ThreeWay
      rwma?: ThreeWay
      significant_valve_disease?: ThreeWay
      valvular_disease?: string
    }
  }
  key_investigations: {
    laboratory_tests: {
      troponin?: string
      troponin_upper_limit?: string
      bnp_nt_probnp?: string
      creatinine?: string
      egfr?: string
      haemoglobin?: string
      sodium?: string
      potassium?: string
      crp?: string
      d_dimer?: string
    }
    other_investigations: {
      ct_coronary_angiography: boolean
      invasive_coronary_angiography: boolean
      cardiac_mri: boolean
    }
  }
  primary_diagnosis?: string
  treatment_during_admission: {
    pci: boolean
    antiarrhythmic_therapy: boolean
    diuretics: boolean
    anticoagulation: boolean
    cardioversion: boolean
    ablation: boolean
  }
  medication_list_at_discharge: Array<{ name: string; dose?: string; frequency?: string }>
  clinical_course: {
    hospital_course_summary?: string
    complications?: string
  }
  discharge_plan: {
    follow_up_clinic: boolean
    cardiology_review: boolean
    gp_follow_up: boolean
    repeat_investigations: boolean
  }
  lifestyle_advice: {
    smoking_cessation: boolean
    exercise: boolean
    diet: boolean
    weight_management: boolean
    alcohol_reduction: boolean
  }
  additional_clinical_notes?: string
}

export interface PatientListItem {
  id: string
  patient_initials: string
  patient_mrn?: string
  date_of_admission?: string
  created_at: string
  updated_at: string
  file_path?: string
}

export interface GenerateResponse {
  output_type: OutputType
  note_type: string
  generated_note: string
  sections: Record<string, string>
  warnings: string[]
  disclaimer: string
}

export interface LabInterpretation {
  value: number
  unit: string
  stage?: string
  interpretation: string
  flag: "NORMAL" | "BORDERLINE" | "ELEVATED" | "ABNORMAL" | "HIGH" | string
}

export interface MissingField {
  label: string
  step: number
}

export interface LabInterpretResponse {
  interpretations: {
    eGFR?: LabInterpretation
    troponin?: LabInterpretation
    CRP?: LabInterpretation
    d_dimer?: LabInterpretation
  }
  overall_summary: string
  warnings: string[]
}

export const defaultPatientData = (): PatientClinicalData => ({
  patient_identification: { initials: "" },
  presenting_complaint: {
    complaints: {
      chest_pain: false, dyspnoea: false, syncope: false,
      palpitations: false, heart_failure_symptoms: false,
      stroke_embolic_event: false, other: false,
    },
  },
  symptoms: {
    chest_pain_pressure: false, chest_tightness_heaviness: false, chest_pain_radiating: false,
    shortness_of_breath: false, breathlessness_on_exertion: false, breathlessness_at_rest: false,
    orthopnoea: false, paroxysmal_nocturnal_dyspnoea: false,
    rapid_irregular_heartbeat: false, skipped_heartbeats: false,
    syncope: false, presyncope: false, dizziness_lightheadedness: false,
    fatigue: false, reduced_exercise_tolerance: false, peripheral_oedema: false,
    abdominal_swelling: false, sudden_weight_gain: false,
    nausea_vomiting: false, diaphoresis: false, unexplained_weakness: false,
    exertional_chest_pain: false, exertional_syncope: false, exertional_dyspnoea: false,
    confusion_altered_state: false, cold_clammy_extremities: false, reduced_urine_output: false,
    stroke_tia_symptoms: false, sudden_vision_speech_disturbance: false,
  },
  relevant_medical_history: {
    coronary_artery_disease: false, atrial_fibrillation: false, heart_failure: false,
    hypertension: false, diabetes: false, hyperlipidaemia: false, stroke_tia: false,
    chronic_kidney_disease: false, obesity: false, sleep_apnoea: false,
    prior_cardiac_surgery: false, prior_pci: false,
  },
  cardiovascular_risk_factors: {
    smoking_history: false, family_history_premature_cvd: false, hypertension: false,
    diabetes: false, dyslipidaemia: false, sedentary_lifestyle: false,
  },
  examination_findings: {
    vitals: {},
    clinical_findings: {
      signs_of_heart_failure: false, murmur: false, peripheral_oedema: false,
      raised_jvp: false, lung_crepitations: false,
    },
  },
  ecg: { image_uploaded: false },
  cardiac_imaging: {
    echocardiography: {},
  },
  key_investigations: {
    laboratory_tests: {},
    other_investigations: {
      ct_coronary_angiography: false, invasive_coronary_angiography: false, cardiac_mri: false,
    },
  },
  treatment_during_admission: {
    pci: false, antiarrhythmic_therapy: false, diuretics: false,
    anticoagulation: false, cardioversion: false, ablation: false,
  },
  medication_list_at_discharge: [],
  clinical_course: {},
  discharge_plan: {
    follow_up_clinic: false, cardiology_review: false,
    gp_follow_up: false, repeat_investigations: false,
  },
  lifestyle_advice: {
    smoking_cessation: false, exercise: false, diet: false,
    weight_management: false, alcohol_reduction: false,
  },
})
