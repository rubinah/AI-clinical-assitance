// app/chat/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// WHAT THIS FILE IS:
//   The main chat page. It wires together:
//   - Patient selector (top)
//   - Chat window (messages list)
//   - Patient context panel (sidebar)
//   - Input bar (bottom)
// ─────────────────────────────────────────────────────────────────────────────

import { ChatInterface } from "../../components/chat/ChatInterface";
import { MOCK_PATIENTS }  from "../../lib/patientContext";

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen bg-background">

      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">🏥</span>
          <div>
            <h1 className="font-bold text-foreground text-sm leading-tight">AI Clinical Assistant</h1>
            <p className="text-xs text-muted-foreground">HealthView Hospital · Decision Support</p>
          </div>
        </div>

        {/* Demo disclaimer — prominent and honest */}
        <div
          role="note"
          aria-label="Demo disclaimer"
          className="bg-amber-900/40 border border-amber-600/50 rounded-lg px-3 py-1.5 text-xs text-amber-300"
        >
          ⚠️ Demo only — not for real clinical use
        </div>
      </header>

      {/* Main content */}
      <main id="main-content" className="flex-1 overflow-hidden">
        {/* Pass patients down — ChatInterface is a Client Component */}
        <ChatInterface patients={MOCK_PATIENTS} />
      </main>
    </div>
  );
}
