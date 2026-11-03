import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { hasUserPin, setUserPin, verifyUserPin } from "@/lib/pin-service";

export function PinSettings({ userId }: { userId: string | null }) {
  const [open, setOpen] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (userId) void hasUserPin(userId).then(setHasPin);
  }, [userId]);

  function reset() {
    setCurrent("");
    setNext("");
    setConfirm("");
    setError("");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setError("");
    if (!/^\d{4}$/.test(next)) return setError("Nový PIN musí mať presne 4 číslice.");
    if (next !== confirm) return setError("PIN kódy sa nezhodujú.");
    setBusy(true);
    try {
      if (hasPin) {
        const check = await verifyUserPin(userId, current);
        if (!check.valid) return setError("Súčasný PIN nie je správny.");
      }
      const res = await setUserPin(userId, next);
      if (!res.success) return setError(res.error ?? "PIN sa nepodarilo uložiť.");
      setHasPin(true);
      setOpen(false);
      reset();
      toast.success("George PIN bol uložený");
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-center text-xl font-mono tracking-[0.5em] outline-none focus:border-primary";

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-primary">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[15px] font-semibold">George PIN</p>
            <p className="text-[12px] text-muted-foreground">
              {hasPin ? "Vlastný PIN je nastavený" : "Nastavte si vlastný 4-miestny PIN"}
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={!userId}
          onClick={() => {
            reset();
            setOpen((o) => !o);
          }}
          className="text-[13px] font-semibold text-primary hover:underline"
        >
          {open ? "Zrušiť" : hasPin ? "Zmeniť" : "Nastaviť"}
        </button>
      </div>

      {open && (
        <form onSubmit={save} className="mt-4 space-y-3">
          {hasPin && (
            <input
              type="password" inputMode="numeric" maxLength={4} placeholder="Súčasný"
              value={current} onChange={(e) => setCurrent(e.target.value.replace(/\D/g, ""))}
              className={input} aria-label="Súčasný PIN"
            />
          )}
          <input
            type="password" inputMode="numeric" maxLength={4} placeholder="Nový"
            value={next} onChange={(e) => setNext(e.target.value.replace(/\D/g, ""))}
            className={input} aria-label="Nový PIN"
          />
          <input
            type="password" inputMode="numeric" maxLength={4} placeholder="Zopakovať"
            value={confirm} onChange={(e) => setConfirm(e.target.value.replace(/\D/g, ""))}
            className={input} aria-label="Zopakovať PIN"
          />
          {error && <p className="text-xs text-destructive text-center">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="h-11 w-full rounded-2xl bg-primary text-[14px] font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Ukladám…" : "Uložiť PIN"}
          </button>
        </form>
      )}
    </div>
  );
}
