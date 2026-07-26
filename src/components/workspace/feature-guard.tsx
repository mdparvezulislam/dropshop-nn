"use client";

import * as React from "react";

export interface FeatureGuardProps {
  feature: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Feature flag guard. Checks if a feature flag is enabled.
 * Uses FeatureFlags from shared/core/feature-flags.ts.
 * Since FeatureFlags is in-memory, this component re-renders
 * based on the feature state passed as prop or fetched.
 */
export function FeatureGuard({
  feature,
  fallback = null,
  children,
}: FeatureGuardProps): React.ReactElement | null {
  const [enabled, setEnabled] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    let mounted = true;
    import("@/lib/core/feature-flags")
      .then(({ FeatureFlags }) => {
        if (mounted) {
          setEnabled(FeatureFlags.isEnabled(feature));
        }
      })
      .catch(() => {
        if (mounted) setEnabled(false);
      });
    return () => {
      mounted = false;
    };
  }, [feature]);

  if (enabled === null) return <>{fallback}</>;
  if (!enabled) return <>{fallback}</>;
  return <>{children}</>;
}

export default FeatureGuard;
