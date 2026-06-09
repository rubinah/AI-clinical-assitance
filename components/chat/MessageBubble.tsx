// components/chat/MessageBubble.tsx
// Individual chat message — styled differently for user vs AI

"use client";

import { AIMessage } from "../../types";

interface MessageBubbleProps {
  message: AIMessage;
  patientName: string;
}

export function MessageBubble({ message, patientName }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const time   = message.timestamp.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>

      {/* Avatar */}
      <div
        aria-hidden="true"
        className={[
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-accent text-accent-foreground",
        ].join(" ")}
      >
        {isUser ? "RH" : "AI"}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {isUser ? "You" : `AI — re: ${patientName}`}
          </span>
          <time className="text-xs text-muted-foreground">{time}</time>
        </div>

        <div
          className={[
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-secondary text-secondary-foreground rounded-tl-sm",
          ].join(" ")}
        >
          {/* Preserve line breaks in AI responses */}
          {message.content.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              {i < message.content.split("\n").length - 1 && <br />}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
