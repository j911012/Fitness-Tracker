"use client";

import Link from "next/link";
import { Settings } from "lucide-react";

export function TopBar() {
  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-4 md:px-6">
      <p className="font-bold text-base md:hidden">FitTrack</p>
      <div className="flex-1" />
      <Link
        href="/settings"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <Settings size={20} />
      </Link>
    </header>
  );
}
