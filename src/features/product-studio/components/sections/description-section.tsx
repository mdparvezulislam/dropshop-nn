"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { StudioSection } from "../studio-layout";

const RichTextEditor = dynamic(
  () => import("@/components/editor/rich-text-editor").then((m) => ({ default: m.RichTextEditor })),
  { ssr: false },
);

export interface DescriptionSectionProps {
  value: string;
  onChange: (v: string) => void;
}

export function DescriptionSection({ value, onChange }: DescriptionSectionProps): React.ReactElement {
  return (
    <StudioSection id="description" title="Description" description="Rich product story with formatting and media">
      <RichTextEditor
        value={value}
        onChange={onChange}
        placeholder="Write a rich product story — features, specs narrative, care instructions…"
        minHeight="16rem"
      />
    </StudioSection>
  );
}
