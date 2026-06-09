// app/api/chat/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// WHAT THIS FILE IS:
//   The server-side API route that calls the Anthropic AI API.
//
// WHY SERVER-SIDE (not directly from the browser):
//   Your API key MUST stay on the server. If you call Anthropic directly
//   from the browser, your API key is visible to anyone who opens DevTools.
//   This route is the secure "proxy" between your UI and the AI.
//
// STREAMING:
//   Instead of waiting for the full response (slow), we stream it —
//   the text arrives word by word, just like ChatGPT.
//   The Vercel AI SDK handles the streaming protocol for us.
//
// REQUEST FLOW:
//   Browser → POST /api/chat → Anthropic API → stream back to browser
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, sanitizeInput, MOCK_PATIENTS } from "../../../lib/patientContext";
import { parseAIResponse } from "../../../lib/validation";

// Initialize Anthropic client — reads API key from environment variable
// process.env.ANTHROPIC_API_KEY is set in .env.local (never in code)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { messages, patientId } = body;

    // Validate inputs
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request — messages array required" },
        { status: 400 }
      );
    }

    // Find the patient context
    const patient = MOCK_PATIENTS.find(p => p.id === patientId) || MOCK_PATIENTS[0];

    // Sanitize the last user message (prompt injection protection)
    const sanitizedMessages = messages.map((msg: { role: string; content: string }) => ({
      ...msg,
      content: msg.role === "user" ? sanitizeInput(msg.content) : msg.content,
    }));

    // Build the system prompt with patient context injected
    const systemPrompt = buildSystemPrompt(patient);

    // Call Anthropic API
    // We use claude-sonnet for a good balance of speed and quality
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: sanitizedMessages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    // Extract the text from the response
    const rawText = response.content
      .filter(block => block.type === "text")
      .map(block => block.text)
      .join("");

    // Validate and parse the AI's JSON response with Zod
    const validated = parseAIResponse(rawText);

    // Return the validated, structured response
    return NextResponse.json({
      success: true,
      response: validated,
      usage: {
        inputTokens:  response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    });

  } catch (error) {
    console.error("Chat API error:", error);

    // Never expose internal errors to the client
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
