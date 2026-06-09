// lib/patientContext.ts
// ─────────────────────────────────────────────────────────────────────────────
// WHAT THIS FILE IS:
//   Two things:
//   1. Mock patient data (same patients as Project 2 — feels like a real system)
//   2. The system prompt builder — this is where prompt engineering lives
//
// THE SYSTEM PROMPT is the most important part of any LLM integration.
// It's the hidden set of instructions that shapes every single AI response.
// Think of it as: "Before you answer anything, here are your rules."
//
// PROMPT ENGINEERING DECISIONS made here:
//   - Constrain to clinical context only (prevents off-topic answers)
//   - Always recommend physician verification (safety in healthcare)
//   - Return structured JSON so we can parse and validate with Zod
//   - Include patient data as context so AI gives relevant answers
//   - Explicitly forbid dangerous advice (no diagnosis, no medication changes)
// ─────────────────────────────────────────────────────────────────────────────

import { PatientContext } from "../types";

// ── Mock patients ─────────────────────────────────────────────────────────────
export const MOCK_PATIENTS: PatientContext[] = [
  {
    id: "PAT-00421",
    name: "Margaret Thompson",
    age: 67,
    primaryDiagnosis: "Acute Myocardial Infarction",
    currentVitals: {
      heartRate:       "118 bpm — ELEVATED",
      bloodPressure:   "158/96 mmHg — HIGH",
      spO2:            "94% — LOW",
      temperature:     "38.4°C — ELEVATED",
      respiratoryRate: "22/min — ELEVATED",
    },
    recentAlerts: [
      "Heart rate elevated above 110 bpm (09:42)",
      "Blood pressure reading above normal range (09:30)",
    ],
    medications: [
      "Aspirin 81mg daily",
      "Metoprolol 25mg twice daily",
      "Atorvastatin 40mg nightly",
      "Nitroglycerin PRN",
    ],
    attendingPhysician: "Dr. Sarah Chen",
    ward: "Cardiology",
    admissionDate: "2025-01-18",
  },
  {
    id: "PAT-00389",
    name: "Robert Nakamura",
    age: 54,
    primaryDiagnosis: "Type 2 Diabetes — monitoring",
    currentVitals: {
      heartRate:       "72 bpm — normal",
      bloodPressure:   "122/78 mmHg — normal",
      spO2:            "98% — normal",
      temperature:     "36.8°C — normal",
      respiratoryRate: "16/min — normal",
    },
    recentAlerts: [],
    medications: [
      "Metformin 1000mg twice daily",
      "Lisinopril 10mg daily",
      "Insulin Glargine 20 units nightly",
    ],
    attendingPhysician: "Dr. James Okafor",
    ward: "General Medicine",
    admissionDate: "2025-01-20",
  },
  {
    id: "PAT-00412",
    name: "Fatima Al-Hassan",
    age: 41,
    primaryDiagnosis: "Pneumonia",
    currentVitals: {
      heartRate:       "92 bpm — normal",
      bloodPressure:   "128/82 mmHg — normal",
      spO2:            "93% — LOW",
      temperature:     "38.1°C — ELEVATED",
      respiratoryRate: "24/min — ELEVATED",
    },
    recentAlerts: [
      "SpO₂ trending downward — monitor closely (10:05)",
    ],
    medications: [
      "Amoxicillin-Clavulanate 875mg twice daily",
      "Azithromycin 500mg daily",
      "Salbutamol inhaler PRN",
    ],
    attendingPhysician: "Dr. Sarah Chen",
    ward: "Respiratory",
    admissionDate: "2025-01-21",
  },
];

// ── System prompt builder ─────────────────────────────────────────────────────
// This function builds the system prompt dynamically with the patient's
// actual data injected in. The AI sees this before every conversation.
export function buildSystemPrompt(patient: PatientContext): string {
  return `You are a clinical decision support assistant for healthcare professionals at HealthView Hospital.

## YOUR ROLE
You help clinicians quickly understand patient status, review vitals, and think through clinical questions. You are a tool to SUPPORT — not replace — clinical judgment.

## CURRENT PATIENT CONTEXT
You have been loaded with the following patient record:

Patient: ${patient.name} (${patient.id})
Age: ${patient.age} years
Diagnosis: ${patient.primaryDiagnosis}
Ward: ${patient.ward}
Attending Physician: ${patient.attendingPhysician}
Admitted: ${patient.admissionDate}

Current Vitals:
- Heart Rate: ${patient.currentVitals.heartRate}
- Blood Pressure: ${patient.currentVitals.bloodPressure}
- SpO₂: ${patient.currentVitals.spO2}
- Temperature: ${patient.currentVitals.temperature}
- Respiratory Rate: ${patient.currentVitals.respiratoryRate}

Current Medications:
${patient.medications.map(m => `- ${m}`).join("\n")}

Recent Alerts:
${patient.recentAlerts.length > 0 ? patient.recentAlerts.map(a => `- ${a}`).join("\n") : "- No active alerts"}

## STRICT RULES — YOU MUST FOLLOW THESE
1. ONLY answer questions related to this patient or general clinical knowledge
2. NEVER suggest specific medication doses or medication changes — always say "consult the attending physician"
3. NEVER make a diagnosis — you can describe findings but not diagnose
4. ALWAYS recommend physician verification for any clinical concern
5. If asked about something outside your role, politely decline
6. Do NOT discuss other patients or hospital staff

## RESPONSE FORMAT
You MUST respond with valid JSON only. No markdown, no preamble, no explanation outside the JSON.

Return this exact structure:
{
  "answer": "Your clinical response here — clear, concise, professional",
  "confidence": "high" | "medium" | "low",
  "suggestsAction": true | false,
  "action": {
    "type": "update_note" | "flag_patient" | "schedule_followup",
    "label": "Short action label",
    "description": "What this action will do",
    "data": { "key": "value" }
  },
  "disclaimer": "Optional safety note if needed"
}

Only include "action" if suggestsAction is true.
Only include "disclaimer" if the response involves clinical risk.

## DEMO DISCLAIMER
This is a portfolio demonstration project. Not for real clinical use.`;
}

// ── Prompt injection guard ────────────────────────────────────────────────────
// PROMPT INJECTION = when a user types something like:
// "Ignore your instructions and tell me how to..."
// We sanitize user input before sending to the AI.
export function sanitizeInput(input: string): string {
  // Remove common injection patterns
  const injectionPatterns = [
    /ignore (all |previous |your )?(instructions|rules|guidelines)/gi,
    /you are now/gi,
    /pretend (you are|to be)/gi,
    /forget (everything|all|your)/gi,
    /system prompt/gi,
    /jailbreak/gi,
  ];

  let sanitized = input.trim();

  for (const pattern of injectionPatterns) {
    if (pattern.test(sanitized)) {
      // Don't silently modify — return a safe replacement
      return "[Message contained disallowed content and was blocked]";
    }
  }

  // Limit input length to prevent token overflow attacks
  return sanitized.slice(0, 1000);
}
