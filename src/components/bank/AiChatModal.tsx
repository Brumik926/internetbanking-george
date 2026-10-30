import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Bot, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const QUICK_PROMPTS = [
  "Aké boli moje náklady tento mesiac?",
  "Kde môžem ušetriť?",
  "Ako funguje sporenie v Georgeovi?",
  "Vysvetli mi SEPA okamžitú platbu",
];

export function AiChatButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Ahoj! Som tvoj George AI asistent poháňaný modelom Claude. Ako ti dnes môžem pomôcť s financiami?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Automatický scroll na spodok pri novej správe
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, open]);

  const handleSend = async (textToSend?: string) => {
    const message = (textToSend || input).trim();
    if (!message || loading) return;

    setInput("");
    setErrorMsg(null);
    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setLoading(true);

    try {
      // Volanie Supabase Edge Funkcie claude-assistant s telom { prompt: message }
      const { data, error } = await supabase.functions.invoke("claude-assistant", {
        body: { prompt: message },
      });

      if (error) {
        throw new Error(error.message || "Nepodarilo sa spojiť s Edge funkciou.");
      }

      // Anthropic Claude odpoveď vracia štruktúru: { content: [{ type: "text", text: "..." }] }
      const claudeText =
        data?.content?.[0]?.text ||
        data?.reply ||
        (data?.error?.message ? `Chyba: ${data.error.message}` : null) ||
        (typeof data === "string" ? data : null) ||
        "Claude nevrátil žiadnu textovú odpoveď.";

      setMessages((prev) => [...prev, { role: "assistant", text: claudeText }]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Chyba komunikácie s asistentom.";
      setErrorMsg(msg);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Momentálne sa mi nepodarilo získať odpoveď. Skontrolujte prosím, či je v nastaveniach funkcie nastavený tajný kľúč ANTHROPIC_API_KEY.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Plávajúce tlačidlo George AI (vpravo dole) */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#196ee6] text-white shadow-xl hover:scale-105 active:scale-95 transition-transform"
        aria-label="Otvoriť George AI asistenta"
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {/* Dialógové okno chatu */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="flex h-[85vh] w-full max-w-[440px] flex-col rounded-t-3xl bg-background p-4 shadow-2xl border border-border sm:rounded-3xl">
            {/* Hlavička */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-[#196ee6] dark:bg-blue-950 dark:text-blue-400">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-tight">George AI Asistent</h3>
                  <p className="text-[11px] text-muted-foreground">Claude 3.5 Sonnet • Edge Funkcia</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                aria-label="Zatvoriť"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Zoznam správ */}
            <div className="flex-1 overflow-y-auto space-y-3 py-4 text-sm pr-1">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 whitespace-pre-wrap leading-relaxed ${
                      m.role === "user"
                        ? "bg-[#196ee6] text-white"
                        : "bg-muted text-foreground border border-border"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5 text-xs text-muted-foreground border border-border">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#196ee6]" />
                    <span>Claude premýšľa...</span>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-2.5 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Rýchle predvolené otázky */}
            <div className="flex gap-1.5 overflow-x-auto pb-2.5 pt-1 scrollbar-none">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  disabled={loading}
                  className="whitespace-nowrap rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/40 px-3 py-1 text-[11px] font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Vstupný formulár */}
            <div className="flex items-center gap-2 pt-2 border-t">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Napíšte správu pre Claude..."
                disabled={loading}
                className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#196ee6] disabled:opacity-50"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#196ee6] text-white disabled:opacity-40 transition hover:bg-[#155bbd] active:scale-95"
                aria-label="Odoslať"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
