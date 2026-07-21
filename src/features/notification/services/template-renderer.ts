import type { NotificationTemplate } from "../domain/notification-entity";

export function renderTemplateString(
  template: string | undefined,
  variables: Record<string, string | number | boolean | null | undefined>,
): string {
  if (!template) return "";
  return template.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, key: string) => {
    const value = variables[key];
    if (value === undefined || value === null) return "";
    return String(value);
  });
}

export interface RenderedMessage {
  title: string;
  body: string;
  subject?: string;
  emailBody?: string;
  smsBody?: string;
  pushTitle?: string;
  pushBody?: string;
  href?: string;
}

export function renderNotificationContent(
  template: NotificationTemplate | null,
  variables: Record<string, string | number | boolean | null | undefined>,
  fallback?: { title?: string; body?: string; href?: string },
): RenderedMessage {
  if (!template) {
    return {
      title: fallback?.title ?? (renderTemplateString("{{title}}", variables) || "Notification"),
      body: fallback?.body ?? (renderTemplateString("{{body}}", variables) || ""),
      href: fallback?.href,
      subject: fallback?.title,
      emailBody: fallback?.body,
      smsBody: fallback?.body,
    };
  }

  const vars = {
    ...Object.fromEntries((template.variables ?? []).map((v) => [v, ""])),
    ...variables,
  };

  return {
    title: renderTemplateString(template.inAppTitle, vars) || fallback?.title || template.name,
    body: renderTemplateString(template.inAppBody, vars) || fallback?.body || "",
    subject: renderTemplateString(template.subject, vars) || undefined,
    emailBody: renderTemplateString(template.emailBody, vars) || undefined,
    smsBody: renderTemplateString(template.smsBody, vars) || undefined,
    pushTitle: renderTemplateString(template.pushTitle, vars) || undefined,
    pushBody: renderTemplateString(template.pushBody, vars) || undefined,
    href: fallback?.href || template.defaultHref,
  };
}
