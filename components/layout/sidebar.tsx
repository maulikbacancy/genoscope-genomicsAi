"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dna, LayoutDashboard, Users, FolderOpen, FlaskConical, GitBranch,
  FileText, BarChart3, BookOpen, Settings, Shield, ChevronLeft, ChevronRight,
  Activity, Microscope, LogOut
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: UserRole[];
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/cases", label: "Cases", icon: FolderOpen },
  { href: "/samples", label: "Samples", icon: FlaskConical, roles: ["lab_technician", "geneticist", "org_admin", "super_admin"] },
  { href: "/variants", label: "Variants", icon: GitBranch, roles: ["geneticist", "org_admin", "super_admin"] },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/quality", label: "QC Metrics", icon: BarChart3, roles: ["lab_technician", "geneticist", "org_admin", "super_admin"] },
  { href: "/literature", label: "Literature", icon: BookOpen },
  { href: "/admin", label: "Admin", icon: Shield, roles: ["super_admin", "org_admin"] },
];

interface SidebarProps {
  userRole: UserRole;
  userName: string;
  userEmail: string;
}

export function Sidebar({ userRole, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const filteredNav = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <aside
      className="flex flex-col h-full transition-all duration-300 relative"
      style={{
        width: collapsed ? "72px" : "240px",
        background: "rgba(255,255,255,0.03)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 h-16 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 animate-pulse-glow"
          style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
          <Dna size={18} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-white text-lg whitespace-nowrap">GenoScope</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative"
              style={{
                background: isActive ? "rgba(59,130,246,0.15)" : "transparent",
                border: isActive ? "1px solid rgba(59,130,246,0.25)" : "1px solid transparent",
                color: isActive ? "#60a5fa" : "rgba(148,163,184,0.9)",
              }}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                  style={{ background: "#3b82f6" }} />
              )}
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
              {item.badge && !collapsed && (
                <span className="ml-auto text-xs px-1.5 py-0.5 rounded-md"
                  style={{ background: "rgba(59,130,246,0.2)", color: "#60a5fa" }}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2 rounded-xl"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{userName}</div>
              <div className="text-xs text-slate-500 truncate capitalize">{userRole.replace("_", " ")}</div>
            </div>
          </div>
        )}
        <button onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-slate-400 hover:text-rose-400"
          style={{ border: "1px solid transparent" }}
          title={collapsed ? "Sign out" : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sign out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{
          background: "#1e293b",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#94a3b8",
        }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
