import { supabase } from "@/integrations/supabase/client";
import { notify } from "@/lib/notifications";

export type LoginEvent = {
  id: string;
  user_id?: string;
  email: string;
  device: string;
  created_at: string;
};

export function describeDevice(ua: string): string {
  const os = /iPhone/.test(ua)
    ? "iPhone"
    : /iPad/.test(ua)
    ? "iPad"
    : /Android/.test(ua)
    ? "Android"
    : /Windows/.test(ua)
    ? "Windows"
    : /Mac OS X/.test(ua)
    ? "Mac"
    : /Linux/.test(ua)
    ? "Linux"
    : "Zariadenie";
  const br = /Edg\//.test(ua)
    ? "Edge"
    : /SamsungBrowser/.test(ua)
    ? "Samsung Internet"
    : /CriOS|Chrome\//.test(ua)
    ? "Chrome"
    : /FxiOS|Firefox\//.test(ua)
    ? "Firefox"
    : /Safari\//.test(ua)
    ? "Safari"
    : "prehliadač";
  return `${os} · ${br}`;
}

/** Zaznamená jeden prístup za reláciu prehliadača (otvorenie aplikácie). */
export async function recordLogin(userId: string, email: string) {
  const key = `george-login-logged:${userId}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, "1");
  const device = describeDevice(navigator.userAgent);
  const { data } = await supabase
    .from("login_events")
    .insert({ user_id: userId, email, device })
    .select("id")
    .maybeSingle();

  if (data?.id) {
    sessionStorage.setItem("george-current-login-id", data.id);
  }
}

export async function listLogins(): Promise<LoginEvent[]> {
  const { data } = await supabase
    .from("login_events")
    .select("id,email,device,created_at")
    .order("created_at", { ascending: false })
    .limit(30);
  return data ?? [];
}

/** Sleduje prístupy z iných zariadení a vyvolá upozornenie. */
export function setupLoginAlerts(currentUserId: string) {
  const currentLoginId = sessionStorage.getItem("george-current-login-id");
  const lastSeenKey = `george-last-seen-login:${currentUserId}`;

  // 1. Kontrola pri štarte aplikácie — či nepribudol vstup kým bola aplikácia zatvorená
  void supabase
    .from("login_events")
    .select("id,email,device,created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
    .then(({ data }) => {
      if (!data) return;
      const lastSeen = localStorage.getItem(lastSeenKey);
      if (!lastSeen) {
        localStorage.setItem(lastSeenKey, data.id);
        return;
      }
      if (data.id !== lastSeen && data.id !== currentLoginId) {
        localStorage.setItem(lastSeenKey, data.id);
        triggerLoginAlert(data);
      }
    });

  // 2. Počúvanie v reálnom čase (ak niekto otvorí Georgea v rovnakom čase na inom mobile)
  const channel = supabase
    .channel("realtime-login-alerts")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "login_events" },
      (payload) => {
        const newEvent = payload.new as LoginEvent;
        const currentId = sessionStorage.getItem("george-current-login-id");
        if (newEvent.id !== currentId) {
          localStorage.setItem(lastSeenKey, newEvent.id);
          triggerLoginAlert(newEvent);
        }
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

function triggerLoginAlert(event: LoginEvent) {
  const time = new Date(event.created_at).toLocaleTimeString("sk-SK", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const title = `Nový prístup do Georgea o ${time}`;
  const body = `${event.device}${event.email ? ` · ${event.email}` : ""}`;

  void notify("access", title, body);
}
