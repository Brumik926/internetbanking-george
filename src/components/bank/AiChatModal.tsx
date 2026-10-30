import { useState } from "react";
import { Sparkles, X, Send, Bot } from "lucide-react";
import { useBankStore } from "@/lib/bank-store";
import { anonymizeFinances } from "@/lib/anonymize";
import { supabase } from "@/integrations/supabase/client";

const QUICK_PROMPTS = [
  "Aké boli moje náklady tento mesiac?",
  "Kde môžem ušetriť?",
  "Vysvetli mi poslednú transakciu",
  "Mám nastavený rozpočet na potraviny?",
];

export function AiChatButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    {
      role: "assistant",
      text: "Ahoj! Som tvoj George AI asistent. Ako ti dnes môžem pomôcť s financiami?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const { transactions, goals, budgets } = useBankStore();

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || input;
    if (!q.trim() || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setLoading(true);

    try {
      const sanitizedContext = anonymizeFinances(transactions, goals, budgets);

      // Volanie bezpečnej backend funkcie
      const { data, error } = await supabase.functions.invoke("claude-assistant", {
        body: {
          message: q,
          context: sanitizedContext,
        },
      });

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data?.reply || "Odpoveď sa nepodarilo vygenerovať." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Momentálne sa neviem spojiť so serverom. Skontroluj API kľúč." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Plávajúce tlačidlo vpravo dole */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#196ee6] text-white shadow-xl hover:scale-105 active:scale-95 transition"
        aria-label="Otvoriť AI asistenta"
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {/* Okno chatu */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
          <div className="flex h-[80vh] w-full max-w-[430px] flex-col rounded-t-3xl bg-background p-4 shadow-2xl border border-border sm:rounded-3xl">
            {/* Hlavička */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-[#196ee6] dark:bg-blue-950 dark:text-blue-400">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">George AI Asistent</h3>
                  <p className="text-[11px] text-muted-foreground">Claude 3.5 • Chránené súkromie</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Správy */}
            <div className="flex-1 overflow-y-auto space-y-3 py-4 text-sm">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
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
                  <div className="rounded-2xl bg-muted px-4 py-2 text-xs text-muted-foreground">
                    George premýšľa...
                  </div>
                </div>
              )}
            </div>

            {/* Rýchle otázky */}
            <div className="flex gap-2 overflow-x-auto pb-3 pt-1">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="whitespace-nowrap rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 px-3 py-1 text-xs text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2 pt-2 border-t">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Spýtaj sa Georgea..."
                className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#196ee6]"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#196ee6] text-white disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
