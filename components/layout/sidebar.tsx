"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Dna, LayoutDashboard, Users, FolderOpen, FlaskConical, GitBranch,
  FileText, BarChart3, BookOpen, Shield, ChevronLeft, ChevronRight, LogOut,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { UserRole } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients",  label: "Patients",  icon: Users },
  { href: "/cases",     label: "Cases",     icon: FolderOpen },
  { href: "/samples",   label: "Samples",   icon: FlaskConical,
    roles: ["lab_technician","geneticist","org_admin","super_admin"] },
  { href: "/variants",  label: "Variants",  icon: GitBranch,
    roles: ["geneticist","org_admin","super_admin"] },
  { href: "/reports",   label: "Reports",   icon: FileText },
  { href: "/quality",   label: "QC Metrics",icon: BarChart3,
    roles: ["lab_technician","geneticist","org_admin","super_admin"] },
  { href: "/literature",label: "Literature",icon: BookOpen },
  { href: "/admin",     label: "Admin",     icon: Shield,
    roles: ["super_admin","org_admin"] },
];

interface SidebarProps {
  userRole: UserRole;
  userName: string;
  userEmail: string;
}

export function Sidebar({ userRole, userName, userEmail }: SidebarProps) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const filtered  = NAV_ITEMS.filter((i) => !i.roles || i.roles.includes(userRole));
  const initials  = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const signOut = async () => {
    const sb = createClient();
    await sb.auth.signOut();
    router.push("/login");
  };

  return (
    <aside
      className="sidebar flex flex-col h-full relative transition-all duration-300"
      style={{ width: collapsed ? 68 : 236 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse-glow"
          style={{ background: "linear-gradient(135deg,#3b82f6,#06b6d4)" }}
        >
          <Dna size={18} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg whitespace-nowrap" style={{ color: "var(--text-primary)" }}>
            GenoScope
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {filtered.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative ${active ? "nav-item-active" : "nav-item"}`}
              title={collapsed ? item.label : undefined}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                  style={{ background: "var(--primary)" }} />
              )}
              <Icon size={17} className="flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 flex-shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-1"
            style={{ background: "var(--bg-hover)" }}>
            <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{userName}</div>
              <div className="text-xs capitalize truncate" style={{ color: "var(--text-muted)" }}>
                {userRole.replace(/_/g, " ")}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={signOut}
          className="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl"
          style={{ color: "var(--text-secondary)" }}
          title={collapsed ? "Sign out" : undefined}
        >
          <LogOut size={17} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sign out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110 z-10"
        style={{
          background: "var(--bg-card-solid)",
          border: "1px solid var(--border)",
          color: "var(--text-muted)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
