"use client";

import { createClient } from "@/lib/db/client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBasket,
  BookOpen,
  Inbox,
  CalendarCheck,
  LogOut,
  Crown,
  Sparkles,
  MapPin,
} from "lucide-react";
import "./admin.css";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "CMS",
    section: true,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: ShoppingBasket,
  },
  {
    label: "Blog Posts",
    href: "/admin/blogs",
    icon: BookOpen,
  },
  {
    label: "Past Events",
    href: "/admin/past-events",
    icon: Sparkles,
  },
  {
    label: "Castle Locator",
    href: "/admin/stores",
    icon: MapPin,
  },

  {
    label: "Inbox",
    section: true,
  },
  {
    label: "Leads",
    href: "/admin/leads",
    icon: Inbox,
  },
  {
    label: "Event Bookings",
    href: "/admin/events",
    icon: CalendarCheck,
  },
];

export default function AdminSidebar({
  userEmail,
  onClose,
}: {
  userEmail: string | undefined;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const isActive = (item: { href?: string; exact?: boolean }) => {
    if (!item.href) return false;
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  const initials = userEmail
    ? userEmail.substring(0, 2).toUpperCase()
    : "WC";

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo">
          <img src="/images/logo.png" alt="Waffle Castle Logo" className="w-16 h-16" />
        </div>
        <div className="sidebar-logo-text">
          <strong>Waffle Castle</strong>
          <span>Admin Panel</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, i) => {
          if ("section" in item && item.section) {
            return (
              <p key={i} className="sidebar-section-label">
                {item.label}
              </p>
            );
          }
          if (!item.href) return null;
          const Icon = item.icon!;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive(item) ? "active" : ""}`}
              onClick={onClose}
            >
              <Icon size={18} className="link-icon" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <strong>Admin</strong>
            <span>{userEmail ?? "—"}</span>
          </div>
          <button
            className="signout-btn"
            onClick={handleSignOut}
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
