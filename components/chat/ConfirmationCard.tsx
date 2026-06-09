// components/chat/ConfirmationCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// WHAT THIS FILE IS:
//   The human-in-the-loop confirmation UI.
//
// WHY THIS MATTERS:
//   When AI suggests an action (add a clinical note, flag a patient),
//   we NEVER save it automatically. The clinician must explicitly approve.
//
//   This is responsible AI design in healthcare — the AI assists, humans decide.
//   This pattern is specifically what interviewers at health-tech companies ask about.
//   It also directly addresses WCAG 3.3.4 — Error Prevention for legal/medical data.
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { AIMessage } from "../../types";

interface ConfirmationCardProps {
  action: NonNullable<AIMessage["suggestedAction"]>;
  onConfirm: () => void;
  onReject:  () => void;
}

const ACTION_ICONS: Record<string, string> = {
  update_note:       "📝",
  flag_patient:      "🚩",
  schedule_followup: "📅",
};

export function ConfirmationCard({ action, onConfirm, onReject }: ConfirmationCardProps) {
  return (
    // role="dialog" + aria-label — this is an inline dialog requiring action
    <div
      role="dialog"
      aria-label={`Confirm action: ${action.label}`}
      className="ml-11 mt-2 bg-card border border-amber-600/50 rounded-xl p-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span aria-hidden="true" className="text-lg">{ACTION_ICONS[action.type] || "⚡"}</span>
        <div>
          <p className="text-sm font-semibold text-amber-300">AI Suggested Action</p>
          <p className="text-xs text-muted-foreground">{action.label}</p>
        </div>
      </div>

      {/* What will happen */}
      <p className="text-xs text-foreground mb-3 leading-relaxed">
        {action.description}
      </p>

      {/* Data preview */}
      {Object.keys(action.data).length > 0 && (
        <div className="bg-muted rounded-lg p-3 mb-3 text-xs font-mono">
          {Object.entries(action.data).map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <span className="text-muted-foreground">{key}:</span>
              <span className="text-foreground">{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="flex-1 bg-green-700 hover:bg-green-600 text-white text-xs font-medium
                     rounded-lg py-2 transition-colors
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
          aria-label={`Approve: ${action.label}`}
        >
          ✓ Approve
        </button>
        <button
          onClick={onReject}
          className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-medium
                     rounded-lg py-2 transition-colors
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Decline: ${action.label}`}
        >
          ✗ Decline
        </button>
      </div>

      <p className="text-xs text-muted-foreground mt-2 text-center">
        AI suggestions require clinical review before being saved
      </p>
    </div>
  );
}
