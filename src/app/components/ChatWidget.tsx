"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./ChatWidget.module.css";
import { graphqlClient } from "@/lib/graphql-client";

interface Message { role: "user" | "assistant"; content: string; }

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! 👋 I'm Nithish's AI assistant. Ask me anything about his skills, projects, or experience!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const mutation = `
        mutation ChatWithAI($message: String!, $sessionId: String!, $history: [ChatInputMessage]) {
          chatWithAI(message: $message, sessionId: $sessionId, history: $history) {
            content
            role
          }
        }
      `;

      const data = await graphqlClient.query(mutation, { 
        message: text, 
        sessionId, 
        history: messages.slice(-8).map(m => ({ role: m.role, content: m.content })) 
      });

      if (data?.chatWithAI) {
        setMessages((m) => [...m, { role: "assistant", content: data.chatWithAI.content }]);
        return;
      }

    } catch (error) {
      console.error("Chat error:", error);
      setMessages((m) => [...m, { role: "assistant", content: "⚠️ Couldn't connect to AI. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {/* Floating button */}
      <button
        className={`${styles.fab} ${open ? styles.fabOpen : ""}`}
        onClick={() => setOpen(!open)}
        aria-label="Open chat"
        id="chatbot-toggle"
      >
        {open ? "✕" : "💬"}
        {!open && <span className={styles.fabPulse} />}
      </button>

      {/* Chat window */}
      {open && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <div className={styles.headerAvatar}>🤖</div>
            <div>
              <div className={styles.headerName}>NR AI Assistant</div>
              <div className={styles.headerStatus}>
                <span className={styles.statusDot} />
                Powered by Ollama
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className={styles.messages}>
            {messages.map((msg, i) => (
              <div key={i} className={`${styles.msg} ${msg.role === "user" ? styles.msgUser : styles.msgBot}`}>
                {msg.role === "assistant" && <span className={styles.msgAvatar}>🤖</span>}
                <div className={styles.msgBubble}>{msg.content || <span className={styles.typing}>●●●</span>}</div>
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role === "user" && (
              <div className={`${styles.msg} ${styles.msgBot}`}>
                <span className={styles.msgAvatar}>🤖</span>
                <div className={styles.msgBubble}><span className={styles.typing}>●●●</span></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className={styles.inputRow}>
            <input
              ref={inputRef}
              className={styles.chatInput}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me anything..."
              disabled={loading}
              id="chat-input"
            />
            <button className={styles.sendBtn} onClick={send} disabled={loading || !input.trim()} id="chat-send">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
