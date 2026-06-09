// components/chat/TypingIndicator.tsx
// Animated dots shown while AI is generating a response

export function TypingIndicator() {
  return (
    <div
      className="flex gap-3"
      role="status"
      aria-label="AI is thinking…"
    >
      <div
        aria-hidden="true"
        className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1"
      >
        AI
      </div>
      <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            aria-hidden="true"
            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
        <span className="sr-only">AI is generating a response…</span>
      </div>
    </div>
  );
}
