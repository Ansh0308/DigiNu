"use client";

import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function OfflineNotice() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside
      role="alert"
      aria-live="assertive"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 max-w-sm mx-auto bg-neutral-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-neutral-700 animate-slideUp text-xs sm:text-sm"
    >
      <div className="p-1.5 rounded-full bg-red-500/20 text-red-400 flex-shrink-0">
        <WifiOff className="w-4 h-4" aria-hidden="true" />
      </div>
      <div>
        <p className="font-semibold">You are currently offline</p>
        <p className="text-neutral-400 text-xs">Viewing offline cached menu.</p>
      </div>
    </aside>
  );
}

