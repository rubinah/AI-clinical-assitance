// components/chat/ChatInterface.tsx
// ─────────────────────────────────────────────────────────────────────────────
// WHAT THIS FILE IS:
//   The core client component. This is where all the state lives:
//   - Which patient is selected
//   - The conversation history
//   - Loading / streaming state
//   - Pending confirmations
//
// "use client" because it uses useState, useEffect, useRef (React hooks)
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useState, useRef, useEffect, useId } from "react";
import { AIMessage, PatientContext, ValidatedAIResponse } from "../../types";
import { MessageBubble }     from "./MessageBubble";
import { ConfirmationCard }  from "./ConfirmationCard";
import { PatientContextPanel } from "./PatientContextPanel";
import { TypingIndicator }   from "./TypingIndicator";

// Re-import type since we need it from validation
import type { ValidatedAIResponse as VAR } from "../../lib/validation";

interface ChatInterfaceProps {
  patients: PatientContext[];
}

// Suggested quick questions a clinician might ask
const QUICK_PROMPTS = [
  "Summarise this patient's current status",
  "What vitals are outside normal range?",
  "Are there any medication concerns I should review?",
  "What should I monitor closely for this patient?",
];

export function ChatInterface({ patients }: ChatInterfaceProps) {
  const selectId = useId();

  const [selectedPatientId, setSelectedPatientId] = useState(patients[0].id);
  const [messages,     setMessages]     = useState<AIMessage[]>([]);
  const [input,        setInput]        = useState("");
  const [isLoading,    setIsLoading]    = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [showContext,  setShowContext]   = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLTextAreaElement>(null);

  const selectedPatient = patients.find(p => p.id === selectedPatientId)!;

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // When patient changes, clear the conversation
  const handlePatientChange = (id: string) => {
    setSelectedPatientId(id);
    setMessages([]);
    setError(null);
  };

  // ── Send a message ───────────────────────────────────────────────────────
  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    // Add user message immediately (optimistic update)
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      // Build conversation history for the API
      // We send the full history so the AI has context of the conversation
      const history = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          patientId: selectedPatientId,
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed — please try again");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Unknown error");
      }

      const aiResponse: VAR = data.response;

      // Build the AI message
      const assistantMessage: AIMessage = {
        id: `msg-${Date.now()}-ai`,
        role: "assistant",
        content: aiResponse.answer,
        timestamp: new Date(),
        requiresConfirmation: aiResponse.suggestsAction,
        confirmed: aiResponse.suggestsAction ? null : undefined,
        suggestedAction: aiResponse.suggestsAction ? aiResponse.action as AIMessage["suggestedAction"] : undefined,
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
      // Return focus to input after response
      inputRef.current?.focus();
    }
  };

  // Handle confirmation of AI-suggested actions
  const handleConfirm = (messageId: string, confirmed: boolean) => {
    setMessages(prev =>
      prev.map(m =>
        m.id === messageId ? { ...m, confirmed } : m
      )
    );
  };

  // Handle Enter key in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends, Shift+Enter adds a new line
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex h-full">

      {/* ── Left: Chat area ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Patient selector bar */}
        <div className="px-4 py-3 bg-card border-b border-border flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-2 flex-1">
            <label
              htmlFor={selectId}
              className="text-xs text-muted-foreground whitespace-nowrap"
            >
              Patient:
            </label>
            <select
              id={selectId}
              value={selectedPatientId}
              onChange={e => handlePatientChange(e.target.value)}
              className="bg-input text-foreground text-sm rounded-lg px-3 py-1.5 border border-border
                         focus:outline-none focus:ring-2 focus:ring-ring flex-1 max-w-xs"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.primaryDiagnosis}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle context panel */}
          <button
            onClick={() => setShowContext(v => !v)}
            aria-pressed={showContext}
            aria-label={showContext ? "Hide patient context" : "Show patient context"}
            className="text-xs text-muted-foreground hover:text-foreground border border-border
                       rounded-lg px-3 py-1.5 transition-colors
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {showContext ? "Hide Context" : "Show Context"}
          </button>
        </div>

        {/* Messages area */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
          role="log"
          aria-label="Chat conversation"
          aria-live="polite"
          aria-relevant="additions"
        >
          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
              <div>
                <p className="text-4xl mb-3" aria-hidden="true">🤖</p>
                <h2 className="text-lg font-semibold text-foreground">
                  AI Clinical Assistant
                </h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Ask me about <strong className="text-foreground">{selectedPatient.name}</strong>'s
                  current status, vitals, medications, or anything clinical.
                </p>
              </div>

              {/* Quick prompt buttons */}
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg"
                role="group"
                aria-label="Suggested questions"
              >
                {QUICK_PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-left text-xs text-foreground bg-card hover:bg-secondary
                               border border-border rounded-lg px-3 py-2.5 transition-colors
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    💬 {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map(message => (
            <div key={message.id}>
              <MessageBubble message={message} patientName={selectedPatient.name} />
              {/* Confirmation card for AI-suggested actions */}
              {message.role === "assistant" &&
               message.requiresConfirmation &&
               message.confirmed === null &&
               message.suggestedAction && (
                <ConfirmationCard
                  action={message.suggestedAction}
                  onConfirm={() => handleConfirm(message.id, true)}
                  onReject={() => handleConfirm(message.id, false)}
                />
              )}
              {/* Outcome messages */}
              {message.confirmed === true && (
                <p className="text-xs text-chart-1 ml-4 mt-1" role="status">
                  ✓ Action approved and recorded
                </p>
              )}
              {message.confirmed === false && (
                <p className="text-xs text-muted-foreground ml-4 mt-1" role="status">
                  ✗ Action declined
                </p>
              )}
            </div>
          ))}

          {/* Typing / loading indicator */}
          {isLoading && <TypingIndicator />}

          {/* Error state */}
          {error && (
            <div
              role="alert"
              className="bg-destructive/10 border border-destructive/40 rounded-lg px-4 py-3 text-sm text-destructive"
            >
              ⚠️ {error}
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Input bar ──────────────────────────────────────────────────── */}
        <div className="px-4 py-3 border-t border-border bg-card flex-shrink-0">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label htmlFor="chat-input" className="sr-only">
                Ask a clinical question about {selectedPatient.name}
              </label>
              <textarea
                id="chat-input"
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask about ${selectedPatient.name}… (Enter to send, Shift+Enter for new line)`}
                rows={2}
                disabled={isLoading}
                className="w-full bg-input text-foreground text-sm rounded-xl px-4 py-3
                           border border-border resize-none
                           placeholder:text-muted-foreground
                           focus:outline-none focus:ring-2 focus:ring-ring
                           disabled:opacity-50 disabled:cursor-not-allowed"
                aria-describedby="input-hint"
              />
              <p id="input-hint" className="sr-only">
                Press Enter to send. Press Shift+Enter for a new line.
              </p>
            </div>

            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              className="bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed
                         text-primary-foreground rounded-xl px-4 py-3 text-sm font-medium transition-colors
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                         flex items-center gap-2 flex-shrink-0"
            >
              {isLoading ? (
                <>
                  <span aria-hidden="true" className="animate-spin">⟳</span>
                  <span className="sr-only">Sending…</span>
                </>
              ) : (
                <>
                  <span aria-hidden="true">↑</span>
                  Send
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Right: Patient context panel ─────────────────────────────────── */}
      {showContext && (
        <PatientContextPanel patient={selectedPatient} />
      )}
    </div>
  );
}
