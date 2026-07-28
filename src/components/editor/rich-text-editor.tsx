"use client";

import * as React from "react";
import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link2,
  ImageIcon,
  Undo2,
  Redo2,
  Heading1,
  Heading2,
  Heading3,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Code,
  RemoveFormatting,
} from "lucide-react";

// Tiptap Extension to preserve style and class attributes on all rich text elements
const PreserveStyleAndClass = Extension.create({
  name: "preserveStyleAndClass",
  addGlobalAttributes() {
    return [
      {
        types: [
          "heading",
          "paragraph",
          "listItem",
          "bulletList",
          "orderedList",
          "blockquote",
          "table",
          "tableRow",
          "tableHeader",
          "tableCell",
          "image",
          "link",
        ],
        attributes: {
          style: {
            default: null,
            parseHTML: (element: HTMLElement) => element.getAttribute("style"),
            renderHTML: (attributes: { style?: string }) => {
              if (!attributes.style) return {};
              return { style: attributes.style };
            },
          },
          class: {
            default: null,
            parseHTML: (element: HTMLElement) => element.getAttribute("class"),
            renderHTML: (attributes: { class?: string }) => {
              if (!attributes.class) return {};
              return { class: attributes.class };
            },
          },
        },
      },
    ];
  },
});

export interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
  minHeight?: string;
}

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Start writing or paste HTML content…",
  className,
  editable = true,
  minHeight = "14rem",
}: RichTextEditorProps): React.ReactElement {
  const [showHtmlSource, setShowHtmlSource] = React.useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    parseOptions: {
      preserveWhitespace: "full",
    },
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      PreserveStyleAndClass,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.configure({ allowBase64: true }),
      Placeholder.configure({ placeholder }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    editable,
    onUpdate: ({ editor: ed }) => {
      onChange?.(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class: "rich-content rich-content-editor tiptap focus:outline-none px-4 py-3",
        style: `min-height: ${minHeight}`,
      },
    },
  });

  React.useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div
        className={cn("rounded-xl border border-border bg-card animate-pulse", className)}
        style={{ minHeight }}
      />
    );
  }

  const setLink = (): void => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", prev || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = (): void => {
    const url = window.prompt("Image URL");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  const addTable = (): void => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const tools: {
    icon: React.ElementType;
    label: string;
    action: () => void;
    active?: boolean;
    disabled?: boolean;
  }[] = [
    {
      icon: Undo2,
      label: "Undo",
      action: () => editor.chain().focus().undo().run(),
      disabled: !editor.can().undo(),
    },
    {
      icon: Redo2,
      label: "Redo",
      action: () => editor.chain().focus().redo().run(),
      disabled: !editor.can().redo(),
    },
    {
      icon: Heading1,
      label: "Heading 1",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      active: editor.isActive("heading", { level: 1 }),
    },
    {
      icon: Heading2,
      label: "Heading 2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
    },
    {
      icon: Heading3,
      label: "Heading 3",
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: editor.isActive("heading", { level: 3 }),
    },
    {
      icon: Bold,
      label: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
    },
    {
      icon: Italic,
      label: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
    },
    {
      icon: UnderlineIcon,
      label: "Underline",
      action: () => editor.chain().focus().toggleUnderline().run(),
      active: editor.isActive("underline"),
    },
    {
      icon: Strikethrough,
      label: "Strike",
      action: () => editor.chain().focus().toggleStrike().run(),
      active: editor.isActive("strike"),
    },
    {
      icon: AlignLeft,
      label: "Align Left",
      action: () => editor.chain().focus().setTextAlign("left").run(),
      active: editor.isActive({ textAlign: "left" }),
    },
    {
      icon: AlignCenter,
      label: "Align Center",
      action: () => editor.chain().focus().setTextAlign("center").run(),
      active: editor.isActive({ textAlign: "center" }),
    },
    {
      icon: AlignRight,
      label: "Align Right",
      action: () => editor.chain().focus().setTextAlign("right").run(),
      active: editor.isActive({ textAlign: "right" }),
    },
    {
      icon: AlignJustify,
      label: "Align Justify",
      action: () => editor.chain().focus().setTextAlign("justify").run(),
      active: editor.isActive({ textAlign: "justify" }),
    },
    {
      icon: List,
      label: "Bullet list",
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
    {
      icon: ListOrdered,
      label: "Ordered list",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
    {
      icon: Quote,
      label: "Blockquote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      active: editor.isActive("blockquote"),
    },
    {
      icon: Minus,
      label: "Divider",
      action: () => editor.chain().focus().setHorizontalRule().run(),
    },
    { icon: Link2, label: "Link", action: setLink, active: editor.isActive("link") },
    { icon: ImageIcon, label: "Image", action: addImage },
    { icon: TableIcon, label: "Table", action: addTable },
    {
      icon: RemoveFormatting,
      label: "Clear Formatting",
      action: () => editor.chain().focus().unsetAllMarks().clearNodes().run(),
    },
    {
      icon: Code,
      label: "HTML Source",
      action: () => setShowHtmlSource((prev) => !prev),
      active: showHtmlSource,
    },
  ];

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card shadow-xs overflow-hidden focus-within:ring-2 focus-within:ring-ring/30 focus-within:border-primary/40 transition-shadow",
        className,
      )}
    >
      {editable ? (
        <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 px-2 py-1.5">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Button
                key={tool.label}
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={tool.action}
                disabled={tool.disabled}
                aria-label={tool.label}
                title={tool.label}
                className={cn(
                  "h-7 w-7 text-muted-foreground",
                  tool.active && "bg-primary/15 text-primary font-bold",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </Button>
            );
          })}
        </div>
      ) : null}
      {showHtmlSource ? (
        <div className="p-3">
          <textarea
            value={value}
            onChange={(e) => {
              const newHtml = e.target.value;
              onChange?.(newHtml);
              editor.commands.setContent(newHtml, { emitUpdate: false });
            }}
            placeholder="Edit raw HTML source code..."
            className="w-full font-mono text-xs p-3 rounded-lg border border-border bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary"
            style={{ minHeight }}
          />
        </div>
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}

export default RichTextEditor;
