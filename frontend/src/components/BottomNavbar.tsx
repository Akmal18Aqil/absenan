"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, CheckSquare, BarChart2, ScanLine } from "lucide-react";

export function BottomNavbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Beranda", href: "/", icon: Home },
    { name: "Santri", href: "/mahasantri", icon: User },
    { name: "Setoran", href: "/admin/fast-track", icon: ScanLine },
    { name: "Lalaran", href: "/admin/lalaran", icon: CheckSquare },
    { name: "Dosen", href: "/dosen", icon: CheckSquare },
    { name: "Laporan", href: "/laporan", icon: BarChart2 },
  ];

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? "text-blue-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" : ""}`} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
