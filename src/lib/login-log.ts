import { supabase } from "@/integrations/supabase/client";

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

/** Určí, či bol prístup za posledných 10 minút (Online) */
export function isOnline(dateStr: string): boolean {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  return diffMs >= 0 && diffMs < 10 * 60 * 1000;
}

/** Vráti slovenský popis relatívneho času: Online / Naposledy pred X min / Dnes o HH:mm */
export function formatLastSeen(dateStr: string): { label: string; isOnline: boolean } {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMin / 60);

  if (diffMin < 10) {
    return { label: "Online", isOnline: true };
  }
  if (diffMin < 60) {
    return { label: `Naposledy pred ${diffMin} min`, isOnline: false };
  }
  if (diffHours < 24) {
    const time = date.toLocaleTimeString("sk-SK", { hour: "2-digit", minute: "2-digit" });
    return { label: `Dnes o ${time}`, isOnline: false };
  }

  const formatted = date.toLocaleDateString("sk-SK", {
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return { label: formatted, isOnline: false };
}

/** Ticho zaznamená jeden prístup za reláciu prehliadača */
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

/** Načíta posledných 30 prístupov do Nastavení */
export async function listLogins(): Promise<LoginEvent[]> {
  const { data } = await supabase
    .from("login_events")
    .select("id,email,device,created_at")
    .order("created_at", { ascending: false })
    .limit(30);
  return data ?? [];
}

/** Načíta najnovší cudzí prístup pre príčinkové oznámenie v Prehľade */
export async function getLatestForeignLogin(): Promise<LoginEvent | null> {
  const currentId = sessionStorage.getItem("george-current-login-id");
  const { data } = await supabase
    .from("login_events")
    .select("id,email,device,created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  if (!data || data.length === 0) return null;
  const foreign = data.find((e) => e.id !== currentId);
  return foreign ?? null;
}
