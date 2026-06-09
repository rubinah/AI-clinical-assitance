// types/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// WHAT THIS FILE IS:
//   All TypeScript types for the AI assistant app.
//
// KEY TYPE: AIMessage
//   This represents a single message in the chat.
//   The `role` field is critical — it tells the LLM who said what:
//   - "user"      = the clinician typing
//   - "assistant" = the AI responding
//   - "system"    = hidden instructions (never shown to user)
// ─────────────────────────────────────────────────────────────────────────────

export type MessageRole = "user" | "assistant" | "system";

export interface AIMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  // If the AI suggested an action (e.g. update a note), it needs confirmation
  requiresConfirmation?: boolean;
  confirmed?: boolean | null;  // null = pending, true = approved, false = rejected
  suggestedAction?: SuggestedAction;
}

// When the AI suggests something that would change data
// the clinician must explicitly confirm before it's "saved"
// This is the human-in-the-loop pattern — critical for responsible AI in healthcare
export interface SuggestedAction {
  type: "update_note" | "flag_patient" | "schedule_followup";
  label: string;         // "Add clinical note"
  description: string;   // What exactly will happen
  data: Record<string, string>;  // The data that would be saved
}

// Patient context passed to the AI as part of the system prompt
export interface PatientContext {
  id: string;
  name: string;
  age: number;
  primaryDiagnosis: string;
  currentVitals: {
    heartRate: string;
    bloodPressure: string;
    spO2: string;
    temperature: string;
    respiratoryRate: string;
  };
  recentAlerts: string[];
  medications: string[];
  attendingPhysician: string;
  ward: string;
  admissionDate: string;
}

// Zod-validated structured response from the AI
// When we ask the AI to return JSON, we validate it with this schema
export interface StructuredAIResponse {
  answer: string;
  confidence: "high" | "medium" | "low";
  suggestsAction: boolean;
  action?: {
    type: "update_note" | "flag_patient" | "schedule_followup";
    label: string;
    description: string;
    data: Record<string, string>;
  };
  disclaimer?: string;
}
