# Clinical Notes Feature — Frontend Implementation Guide

## Overview

This document describes every API endpoint, request/response shape, and the complete UI structure needed to implement the new **Clinical Notes** feature (Cardiology Edition).

---

## Authentication

All endpoints require a Bearer token in the `Authorization` header:
```
Authorization: Bearer <supabase_access_token>
```
Role must be `doctor` or `admin`.

---

## API Endpoints

### Base URL: `/api`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/clinical-note/generate` | Generate note / handover / discharge letter |
| `POST` | `/clinical-note/save-patient` | Save patient form to DB |
| `GET` | `/clinical-note/patients` | List current doctor's saved patients |
| `GET` | `/clinical-note/patients/{record_id}` | Load a single saved patient |
| `POST` | `/clinical-note/interpret-labs` | Interpret blood tests (eGFR, Troponin, CRP, D-Dimer) |

---

## 1. Generate Document

**POST** `/api/clinical-note/generate`

### Request Body (JSON)
```json
{
  "output_type": "CLINICAL_NOTE",
  "patient_data": { "...see PatientClinicalData below..." },
  "record_id": null
}
```

`output_type` values: `"CLINICAL_NOTE"` | `"HANDOVER_NOTE"` | `"DISCHARGE_LETTER"`

### Response Body
```json
{
  "output_type": "CLINICAL_NOTE",
  "note_type": "CARDIOLOGY",
  "generated_note": "## PATIENT IDENTIFICATION\n...",
  "sections": {
    "PATIENT IDENTIFICATION": "...",
    "PRESENTING COMPLAINT": "...",
    "DIAGNOSIS": "..."
  },
  "warnings": [],
  "disclaimer": "This note was AI-generated and must be reviewed..."
}
```

---

## 2. Save Patient

**POST** `/api/clinical-note/save-patient`

### Request Body
```json
{
  "patient_data": { "...PatientClinicalData..." },
  "record_id": null
}
```
Pass `record_id` as a string UUID to update an existing record; `null` to create new.

### Response Body
```json
{
  "record_id": "uuid-string",
  "file_path": "dr.smith/2026-03-15_JD.json",
  "message": "Patient record saved successfully."
}
```

---

## 3. List Patients

**GET** `/api/clinical-note/patients`

### Response Body
```json
{
  "patients": [
    {
      "id": "uuid",
      "patient_initials": "J.D.",
      "patient_mrn": "MRN-001",
      "date_of_admission": "2026-03-15",
      "created_at": "2026-03-15T10:00:00Z",
      "updated_at": "2026-03-15T10:00:00Z",
      "file_path": "dr.smith/2026-03-15_JD.json"
    }
  ]
}
```

---

## 4. Get Single Patient

**GET** `/api/clinical-note/patients/{record_id}`

Returns the full record including `patient_data` JSONB. Use to reload a saved patient into the form.

---

## 5. Interpret Blood Tests

**POST** `/api/clinical-note/interpret-labs`

### Request Body
```json
{
  "egfr": 45.0,
  "egfr_unit": "mL/min/1.73m²",
  "troponin": 0.05,
  "troponin_unit": "ng/mL",
  "troponin_url": "0.04",
  "crp": 85.0,
  "crp_unit": "mg/L",
  "d_dimer": 1.2,
  "d_dimer_unit": "mg/L FEU",
  "patient_age": 68
}
```
All fields are optional — pass only the tests that have values.

### Response Body
```json
{
  "interpretations": {
    "eGFR": {
      "value": 45.0,
      "unit": "mL/min/1.73m²",
      "stage": "Stage G3a — Mildly-moderately decreased",
      "interpretation": "Consistent with moderate CKD. Consider nephrology review.",
      "flag": "ABNORMAL"
    },
    "troponin": {
      "value": 0.05,
      "unit": "ng/mL",
      "interpretation": "Minimally above URL. Serial troponin recommended.",
      "flag": "ELEVATED"
    },
    "CRP": {
      "value": 85.0,
      "unit": "mg/L",
      "interpretation": "Significantly elevated. Consistent with active inflammation.",
      "flag": "HIGH"
    },
    "d_dimer": {
      "value": 1.2,
      "unit": "mg/L FEU",
      "interpretation": "Above age-adjusted cutoff (0.68). Consider CTPA to exclude PE.",
      "flag": "ELEVATED"
    }
  },
  "overall_summary": "Multiple abnormal results requiring clinical correlation.",
  "warnings": []
}
```

---

## Full Patient Data TypeScript Interface

```typescript
interface PatientClinicalData {
  patient_identification: {
    initials: string;                             // REQUIRED
    mrn?: string;
    dob?: string;                                 // YYYY-MM-DD
    age?: number;
    sex?: "Male" | "Female" | "Other" | "Prefer not to say";
    location?: string;
    date_of_admission?: string;                   // YYYY-MM-DD
    date_of_discharge?: string;                   // YYYY-MM-DD
    responsible_consultant?: string;
  };

  presenting_complaint: {
    complaints: {
      chest_pain: boolean;
      dyspnoea: boolean;
      syncope: boolean;
      palpitations: boolean;
      heart_failure_symptoms: boolean;
      stroke_embolic_event: boolean;
      other: boolean;
    };
    other_complaint?: string;
    duration?: string;
  };

  associated_symptoms: {
    nausea: boolean;
    diaphoresis: boolean;
    presyncope: boolean;
    orthopnoea: boolean;
    peripheral_oedema: boolean;
  };

  relevant_medical_history: {
    coronary_artery_disease: boolean;
    atrial_fibrillation: boolean;
    heart_failure: boolean;
    hypertension: boolean;
    diabetes: boolean;
    hyperlipidaemia: boolean;
    stroke_tia: boolean;
    chronic_kidney_disease: boolean;
    obesity: boolean;
    sleep_apnoea: boolean;
    prior_cardiac_surgery: boolean;
    prior_pci: boolean;
  };

  cardiovascular_risk_factors: {
    smoking_history: boolean;
    family_history_premature_cvd: boolean;
    hypertension: boolean;
    diabetes: boolean;
    dyslipidaemia: boolean;
    sedentary_lifestyle: boolean;
  };

  examination_findings: {
    vitals: {
      heart_rate?: string;           // "72 bpm"
      blood_pressure?: string;       // "120/80 mmHg"
      oxygen_saturation?: string;    // "98%"
      temperature?: string;          // "36.8°C"
    };
    clinical_findings: {
      signs_of_heart_failure: boolean;
      murmur: boolean;
      peripheral_oedema: boolean;
      raised_jvp: boolean;
      lung_crepitations: boolean;
    };
  };

  ecg: {
    rhythm?: string;
    heart_rate?: string;
    conduction_abnormalities?: string;
    st_t_changes?: string;
    qt_interval?: string;
    image_uploaded: boolean;
    ecg_image_path?: string;          // Supabase storage path after upload
  };

  cardiac_imaging: {
    echocardiography: {
      lvef?: string;                  // "55"
      lv_size?: string;
      rv_function?: string;
      lv_dilation?: "Yes" | "No" | "Not assessed";
      rwma?: "Yes" | "No" | "Not assessed";
      significant_valve_disease?: "Yes" | "No" | "Not assessed";
      valvular_disease?: string;
    };
  };

  key_investigations: {
    laboratory_tests: {
      troponin?: string;
      bnp_nt_probnp?: string;
      creatinine?: string;
      egfr?: string;
      haemoglobin?: string;
      electrolytes?: string;
      crp?: string;
      d_dimer?: string;
    };
    other_investigations: {
      ct_coronary_angiography: boolean;
      invasive_coronary_angiography: boolean;
      cardiac_mri: boolean;
    };
  };

  primary_diagnosis?: string;

  treatment_during_admission: {
    pci: boolean;
    antiarrhythmic_therapy: boolean;
    diuretics: boolean;
    anticoagulation: boolean;
    cardioversion: boolean;
    ablation: boolean;
  };

  medication_list_at_discharge: Array<{
    name: string;
    dose?: string;
    frequency?: string;
  }>;

  clinical_course: {
    hospital_course_summary?: string;
    complications?: string;
  };

  discharge_plan: {
    follow_up_clinic: boolean;
    cardiology_review: boolean;
    gp_follow_up: boolean;
    repeat_investigations: boolean;
  };

  lifestyle_advice: {
    smoking_cessation: boolean;
    exercise: boolean;
    diet: boolean;
    weight_management: boolean;
    alcohol_reduction: boolean;
  };

  additional_clinical_notes?: string;
}
```

---

## Page Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  [📋 My Patients]  [+ New Patient]           [Dr. Smith ▼]          │
├──────────────────┬──────────────────────────────────────────────────┤
│                  │                                                   │
│  Patient List    │  Patient Form (7-step wizard)                     │
│  ──────────────  │  ──────────────────────────────                  │
│  > J.D. (03/15)  │                                                   │
│    JH (03/12)    │  Step 1: Patient Identification                   │
│    MB (03/10)    │  Step 2: Presenting Complaint                     │
│                  │  Step 3: History & Risk Factors                   │
│  [+ Add Patient] │  Step 4: Examination & ECG                        │
│                  │  Step 5: Investigations & Labs                    │
│                  │  Step 6: Diagnosis & Treatment                    │
│                  │  Step 7: Discharge & Clinical Course              │
│                  │                                                   │
│                  │  [💾 Save Patient]   [Generate ▼]                 │
│                  │                      ├─ 📄 Clinical Note          │
│                  │                      ├─ 🔄 Handover Note          │
│                  │                      └─ 📧 Discharge Letter       │
└──────────────────┴──────────────────────────────────────────────────┘
```

---

## Step-by-Step Form Fields

### Step 1 — Patient Identification
| Field | Type | Required |
|-------|------|----------|
| Patient Initials | text input | ✅ |
| MRN | text input | |
| Date of Birth | date picker | |
| Age | number input | |
| Sex | dropdown | |
| Location | text input | |
| Date of Admission | date picker | |
| Date of Discharge | date picker | |
| Responsible Consultant | text input | |

### Step 2 — Presenting Complaint
Checkboxes (tick any):
- [ ] Chest pain
- [ ] Dyspnoea
- [ ] Syncope
- [ ] Palpitations
- [ ] Heart failure symptoms
- [ ] Stroke / embolic event
- [ ] Other → reveal free-text field

| Field | Type |
|-------|------|
| Duration of symptoms | text input |
| Other complaint detail | textarea (conditional) |

### Step 3 — Symptoms & History

**Key Associated Symptoms** (checkboxes):
- [ ] Nausea  [ ] Diaphoresis  [ ] Presyncope  [ ] Orthopnoea  [ ] Peripheral oedema

**Relevant Medical History** (checkboxes):
- [ ] Coronary artery disease  [ ] Atrial fibrillation  [ ] Heart failure
- [ ] Hypertension  [ ] Diabetes  [ ] Hyperlipidaemia  [ ] Stroke/TIA
- [ ] Chronic kidney disease  [ ] Obesity  [ ] Sleep apnoea
- [ ] Prior cardiac surgery  [ ] Prior PCI

**Cardiovascular Risk Factors** (checkboxes):
- [ ] Smoking history  [ ] Family history of premature CVD  [ ] Hypertension
- [ ] Diabetes  [ ] Dyslipidaemia  [ ] Sedentary lifestyle

### Step 4 — Examination & ECG

**Vitals:**
| Field | Placeholder |
|-------|-------------|
| Heart rate | "72 bpm" |
| Blood pressure | "120/80 mmHg" |
| O2 saturation | "98%" |
| Temperature | "36.8°C" |

**Clinical findings** (checkboxes):
- [ ] Signs of heart failure  [ ] Murmur  [ ] Peripheral oedema  [ ] Raised JVP  [ ] Lung crepitations

**ECG:**
| Field | Type |
|-------|------|
| Rhythm | text input |
| Heart rate | text input |
| Conduction abnormalities | text input |
| ST/T changes | text input |
| QT interval | text input |
| Upload ECG image | file picker → upload to Supabase Storage |

### Step 5 — Investigations & Labs

**Echocardiography:**
| Field | Type |
|-------|------|
| LVEF (%) | text input |
| LV size | text input |
| RV function | text input |
| LV dilation | 3-way toggle: Yes / No / Not assessed |
| RWMA | 3-way toggle: Yes / No / Not assessed |
| Significant valve disease | 3-way toggle: Yes / No / Not assessed |
| Valvular disease detail | text input |

**Laboratory Tests:**
| Field | Placeholder |
|-------|-------------|
| Troponin | "0.04 ng/mL" |
| BNP / NT-proBNP | "500 pg/mL" |
| Creatinine | "110 μmol/L" |
| eGFR | "65 mL/min/1.73m²" |
| Haemoglobin | "130 g/L" |
| Electrolytes | "Na 140, K 4.1" |
| CRP | "8 mg/L" |
| D-Dimer | "0.5 mg/L FEU" |

➡️ **[Interpret Labs] button** — fires `POST /clinical-note/interpret-labs` and renders inline interpretation cards.

**Other Investigations** (checkboxes):
- [ ] CT coronary angiography  [ ] Invasive coronary angiography  [ ] Cardiac MRI

### Step 6 — Diagnosis & Treatment

| Field | Type |
|-------|------|
| Primary Diagnosis | text input |

**Treatment During Admission** (checkboxes):
- [ ] PCI  [ ] Antiarrhythmic therapy  [ ] Diuretics  [ ] Anticoagulation  [ ] Cardioversion  [ ] Ablation

**Medication list at discharge** — dynamic table with [+ Add Row]:
| Medication Name | Dose | Frequency | Action |
|-----------------|------|-----------|--------|
| Aspirin | 75mg | OD | 🗑️ |
| [text input] | [text] | [text] | ➕ / 🗑️ |

### Step 7 — Clinical Course & Discharge

| Field | Type |
|-------|------|
| Hospital course summary | textarea |
| Complications during admission | textarea |

**Discharge Plan** (checkboxes):
- [ ] Follow-up clinic  [ ] Cardiology review  [ ] GP follow-up  [ ] Repeat investigations

**Lifestyle Advice** (checkboxes):
- [ ] Smoking cessation  [ ] Exercise  [ ] Diet  [ ] Weight management  [ ] Alcohol reduction

| Field | Type |
|-------|------|
| Additional clinical notes | textarea (free text) |

---

## Generate Panel

When the doctor clicks **Generate**, show a dropdown:

| Icon | Label | `output_type` |
|------|-------|---------------|
| 📄 | Clinical Note | `CLINICAL_NOTE` |
| 🔄 | Handover Note | `HANDOVER_NOTE` |
| 📧 | Discharge Letter | `DISCHARGE_LETTER` |

**Result display:** right-side panel or full-screen modal with:
- Rendered markdown of `generated_note`
- Expandable sections from `sections` dict
- ⚠️ Yellow warning banner for items in `warnings[]`
- 🔴 Red disclaimer banner at bottom
- **Copy to Clipboard** and **Print** buttons

---

## Blood Test Interpretation Cards

After "Interpret Labs" returns, show inline cards:

```
┌──────────────────────────────┐
│  eGFR — 45 mL/min/1.73m²    │
│  ⚠️  Stage G3a                │
│  Mildly-moderately decreased │
│  Consider nephrology review. │
└──────────────────────────────┘

┌──────────────────────────────┐
│  Troponin — 0.05 ng/mL       │
│  🔴 ELEVATED                  │
│  Above URL. Serial troponin  │
│  recommended.                │
└──────────────────────────────┘
```

**Color coding:**
- 🟢 Green = Normal / flag empty
- 🟡 Yellow = Borderline / BORDERLINE
- 🔴 Red = Elevated / ELEVATED / ABNORMAL / HIGH

---

## ECG Image Upload Flow

1. Doctor picks ECG image in Step 4.
2. Frontend uploads to **Supabase Storage** bucket `ecg-images` using the user's JWT directly.
3. Storage path: `{user_id}/{timestamp}_{patient_initials}.jpg`
4. On success, set form state: `ecg.image_uploaded = true`, `ecg.ecg_image_path = "<storage_path>"`
5. This is saved with the patient record and passed to the AI in the generate call.

---

## State Management

- Single `patientForm` state object typed as `PatientClinicalData`.
- Persist draft to `localStorage` keyed by `record_id` (or `"new"` for unsaved).
- On save success, update `record_id` in state from response.
- On user logout, clear localStorage drafts.

---

## Error Handling

| HTTP Status | Meaning | UI Action |
|-------------|---------|-----------|
| 400 | Validation error | Show field-level messages |
| 401 | Unauthenticated | Redirect to login |
| 403 | Not a doctor/admin | Show "Access denied" toast |
| 404 | Record not found | Show "Record not found" message |
| 429 | Rate limited | Show "Too many requests, please wait" |
| 500 | Server error | Show "Generation failed, please retry" |

---

## Key Implementation Notes

> [!IMPORTANT]
> Only `patient_identification.initials` is required. All other fields are optional — partial saves are fully supported.

> [!TIP]
> The generate endpoint does NOT require a saved record. You can generate directly from unsaved form state.

> [!NOTE]
> Each generate call creates a fresh document — it does not auto-save. The doctor must explicitly click "Save Patient" to persist the data.

> [!WARNING]
> Store the `record_id` returned by save-patient in component state so subsequent saves use the `UPDATE` path, not `INSERT`, avoiding duplicate records.
