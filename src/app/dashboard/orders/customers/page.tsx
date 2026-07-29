"use client";

import * as React from "react";
import { CustomerDirectoryWorkspace } from "@/features/customer/components/customer-directory-workspace";

export default function CustomerOperationsPage(): React.ReactElement {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <CustomerDirectoryWorkspace />
    </div>
  );
}
