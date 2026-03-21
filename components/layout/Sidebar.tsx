"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Scale,
  Dumbbell,
  UtensilsCrossed,
  PersonStanding,
  CalendarDays,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/body", label: "体重", icon: Scale },
  { href: "/workouts", label: "筋トレ", icon: Dumbbell },
  { href: "/meals", label: "食事", icon: UtensilsCrossed },
  { href: "/cardio", label: "有酸素", icon: PersonStanding },
  { href: "/calendar", label: "カレンダー", icon: CalendarDays },
  { href: "/settings", label: "設定", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen border-r bg-background px-3 py-6 gap-1">
      <p className="font-bold text-lg px-3 mb-4">FitTrack</p>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent",
            pathname === item.href && "bg-accent font-medium",
          )}
        >
          <item.icon size={18} />
          {item.label}
        </Link>
      ))}
    </aside>
  );
}
