// lib/gtag.ts
export const GA_TRACKING_ID = "G-9NZ12CS2M1";

// Registra pageview no GA4 (só roda se gtag já estiver carregado)
export function pageview(url: string) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("config", GA_TRACKING_ID, {
      page_path: url,
    });
  }
}

// (Opcional) eventos personalizados
export function gaEvent(action: string, params: Record<string, any> = {}) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", action, params);
  }
}
