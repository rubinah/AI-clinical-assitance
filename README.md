# 🤖 AI Clinical Assistant

An AI-powered clinical decision support tool built with **Next.js 14**, **Anthropic Claude API**, **TypeScript**, and **Zod** validation.

Combines health-tech domain knowledge with responsible AI engineering patterns — streaming chat, structured output validation, prompt injection protection, and human-in-the-loop confirmation for suggested actions.

🔗 **Live Demo:** [ai-clinical-assistant.vercel.app](#) ← _replace with your Vercel URL_

> ⚠️ **Demo only — not for real clinical use**

---

## ✨ Features

| Feature | What it does |
|---|---|
| **Streaming chat UI** | AI responses appear word by word (like ChatGPT) |
| **Patient context** | AI is loaded with real patient vitals, medications, alerts |
| **Prompt engineering** | System prompt constrains AI to clinical context only |
| **Zod validation** | Every AI response validated against schema before display |
| **Prompt injection protection** | User input sanitized before sending to API |
| **Human-in-the-loop** | AI-suggested actions require clinician approval before saving |
| **WCAG 2.1 AA** | Full keyboard navigation, ARIA, screen reader support |
| **Quick prompts** | Pre-built clinical questions to demonstrate capabilities |
| **Patient switcher** | Switch between 3 patients, each with different context |

---

## 🏗 Architecture

```
Browser (React)
    ↓ POST /api/chat (user message + patient ID)
Next.js Server Route (app/api/chat/route.ts)
    ↓ Builds system prompt with patient context
    ↓ Sanitizes input (prompt injection guard)
    ↓ Calls Anthropic Claude API
    ↓ Parses JSON response
    ↓ Validates with Zod schema
    ↑ Returns structured, validated response
Browser
    ↓ Renders message
    ↓ If action suggested → shows ConfirmationCard
    ↓ Clinician approves/declines → state updated
```

**Key design decision:** API key lives only on the server. The browser never sees it.

---

## 🛠 Tech Stack

| Tool | Purpose |
|---|---|
| Next.js 14 App Router | Full-stack framework |
| Anthropic Claude API | AI language model |
| TypeScript | Type safety |
| Zod | Runtime schema validation of AI responses |
| Tailwind CSS | Styling |

---

## 🚀 Run Locally

```bash
git clone https://github.com/rubinahuria/ai-clinical-assistant.git
cd ai-clinical-assistant

npm install

# Set up your API key
cp .env.local.example .env.local
# Edit .env.local and add your Anthropic API key
# Get one at: https://console.anthropic.com

npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Variables

```bash
# .env.local — never commit this file
ANTHROPIC_API_KEY=your_key_here
```

For Vercel deployment: add `ANTHROPIC_API_KEY` in Project Settings → Environment Variables.

---

## 💡 Prompt Engineering Decisions

The system prompt (`lib/patientContext.ts`) was designed to:

1. **Inject patient data** — vitals, medications, alerts as structured context
2. **Constrain to domain** — only answer clinical questions about this patient
3. **Enforce JSON output** — structured responses parseable by Zod
4. **Safety guardrails** — no medication changes, no diagnosis, always recommend physician
5. **Prevent hallucination** — confidence field signals uncertainty to the UI

---

## ♿ Accessibility

- `role="log"` on chat area with `aria-live="polite"` — screen readers announce new messages
- `role="dialog"` on confirmation cards — announced as requiring action
- `role="alert"` on errors — immediate announcement
- Full keyboard navigation throughout
- Skip-to-content link

---

## 🗂 Folder Structure

```
app/
├── api/chat/route.ts       ← Server-side Anthropic API call
├── chat/page.tsx           ← Main chat page
└── layout.tsx
components/chat/
├── ChatInterface.tsx       ← Main state container
├── MessageBubble.tsx       ← Individual chat messages
├── ConfirmationCard.tsx    ← Human-in-the-loop approval UI
├── TypingIndicator.tsx     ← Loading animation
└── PatientContextPanel.tsx ← AI context sidebar
lib/
├── patientContext.ts       ← Mock data + system prompt builder
└── validation.ts           ← Zod schema + safe parser
types/index.ts              ← All TypeScript interfaces
```

---

## 👩‍💻 Author

**Rubina Huria** — Front-End Developer  
[rubinahuria.com](https://rubinahuria.com) · Ontario, Canada
