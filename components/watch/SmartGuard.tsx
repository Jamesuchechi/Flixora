'use client';

interface SmartGuardProps {
  isShieldActive: boolean;
  onRefresh: () => void;
  isReady?: boolean;
  className?: string;
}

/**
 * SmartGuard Cinema Ad-Shield — disabled.
 * The component is preserved as a no-op stub so existing imports remain valid.
 * All piracy-server logic has been removed from VideoPlayer; this guard is no longer needed.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SmartGuard(_props: SmartGuardProps) {
  return null;
}
