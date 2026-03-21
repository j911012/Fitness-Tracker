"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Scale,
  Dumbbell,
  UtensilsCrossed,
  CalendarDays,
} from "lucide-react";

const navItems = [
  { href: "/", label: "ホーム", icon: LayoutDashboard },
  { href: "/body", label: "体重", icon: Scale },
  { href: "/workouts", label: "筋トレ", icon: Dumbbell },
  { href: "/meals", label: "食事", icon: UtensilsCrossed },
  { href: "/calendar", label: "カレンダー", icon: CalendarDays },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background flex justify-around py-2 z-50">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex flex-col items-center gap-1 text-xs px-3 py-1 rounded-lg transition-colors hover:bg-accent",
            pathname === item.href && "font-medium text-primary",
          )}
        >
          <item.icon size={22} />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
