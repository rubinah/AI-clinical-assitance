// lib/validation.ts
// ─────────────────────────────────────────────────────────────────────────────
// WHAT THIS FILE IS:
//   Zod schema that validates the AI's JSON response.
//
// WHY ZOD VALIDATION:
//   LLMs can hallucinate or return malformed JSON.
//   If we just do JSON.parse() and trust the result, the app will crash
//   or show wrong data when the AI makes a mistake.
//
//   Zod lets us say: "The AI response MUST have these fields with these types.
//   If it doesn't, throw an error so we can handle it gracefully."
//
//   This is what interviewers mean by "production-quality AI integration."
//   Anyone can call an API. Handling bad responses correctly is the skill.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";

// ── Schema definition ─────────────────────────────────────────────────────────
export const AIResponseSchema = z.object({
  // Main answer — must be a non-empty string
  answer: z.string().min(1, "Answer cannot be empty"),

  // Confidence level — must be exactly one of these three values
  confidence: z.enum(["high", "medium", "low"]),

  // Whether the AI is suggesting an action
  suggestsAction: z.boolean(),

  // Action is optional — only present when suggestsAction is true
  action: z.object({
    type: z.enum(["update_note", "flag_patient", "schedule_followup"]),
    label: z.string(),
    description: z.string(),
    // Record<string, string> = an object with any string keys and string values
    data: z.record(z.string()),
  }).optional(),

  // Optional safety disclaimer
  disclaimer: z.string().optional(),
});

// TypeScript type inferred from the Zod schema
// So we don't have to define it twice — the schema IS the type source of truth
export type ValidatedAIResponse = z.infer<typeof AIResponseSchema>;

// ── Safe parser ───────────────────────────────────────────────────────────────
// Returns either the validated data or a safe fallback
export function parseAIResponse(raw: string): ValidatedAIResponse {
  try {
    // Step 1: Strip any markdown code fences the AI might have added
    // e.g. ```json { ... } ``` → { ... }
    const cleaned = raw
      .replace(/```json\n?/gi, "")
      .replace(/```\n?/gi, "")
      .trim();

    // Step 2: Parse JSON
    const parsed = JSON.parse(cleaned);

    // Step 3: Validate with Zod — throws ZodError if schema doesn't match
    const validated = AIResponseSchema.parse(parsed);

    return validated;

  } catch (error) {
    // If ANYTHING goes wrong (bad JSON, schema mismatch, missing fields)
    // return a safe fallback instead of crashing the UI

    console.error("AI response validation failed:", error);

    return {
      answer: "I wasn't able to process that request properly. Please try rephrasing your question or contact the attending physician directly.",
      confidence: "low",
      suggestsAction: false,
      disclaimer: "Response validation failed — please verify with clinical staff.",
    };
  }
}
