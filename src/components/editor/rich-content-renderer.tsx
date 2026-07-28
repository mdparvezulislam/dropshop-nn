import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { sanitizeRichTextHtml } from "./html-sanitizer";

export interface RichContentRendererProps extends React.HTMLAttributes<HTMLDivElement> {
  content?: string;
  html?: string;
  sanitize?: boolean;
  className?: string;
}

export function RichContentRenderer({
  content,
  html,
  sanitize = true,
  className,
  ...props
}: RichContentRendererProps): React.ReactElement | null {
  const rawHtml = content ?? html ?? "";

  const finalHtml = React.useMemo(() => {
    if (!rawHtml) return "";
    return sanitize ? sanitizeRichTextHtml(rawHtml) : rawHtml;
  }, [rawHtml, sanitize]);

  if (!finalHtml) {
    return null;
  }

  return (
    <div
      className={cn("rich-content", className)}
      dangerouslySetInnerHTML={{ __html: finalHtml }}
      {...props}
    />
  );
}

export default RichContentRenderer;
