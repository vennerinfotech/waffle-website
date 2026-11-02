import { createClient } from "@/lib/db/server";
import Link from "next/link";
import {
  ShoppingBasket,
  BookOpen,
  Inbox,
  CalendarCheck,
  TrendingUp,
  Users,
  MapPin,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch counts in parallel
  const [
    { count: productCount },
    { count: activeProductCount },
    { count: blogCount },
    { count: publishedBlogCount },
    { count: contactCount },
    { count: franchiseCount },
    { count: eventCount },
    { count: newContactCount },
    { count: newFranchiseCount },
    { count: newEventCount },
    { count: storeCount },
    { count: activeStoreCount },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase.from("blog_posts").select("*", { count: "exact", head: true }),
    supabase
      .from("blog_posts")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true),
    supabase.from("contact_leads").select("*", { count: "exact", head: true }),
    supabase
      .from("franchise_leads")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("event_bookings")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("contact_leads")
      .select("*", { count: "exact", head: true })
      .eq("status", "New"),
    supabase
      .from("franchise_leads")
      .select("*", { count: "exact", head: true })
      .eq("status", "New"),
    supabase
      .from("event_bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "Pending"),
    supabase
      .from("stores")
      .select("*", { count: "exact", head: true })
      .then(res => res, () => ({ count: 0 })),
    supabase
      .from("stores")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .then(res => res, () => ({ count: 0 })),
  ]);

  const totalLeads =
    (contactCount ?? 0) + (franchiseCount ?? 0) + (eventCount ?? 0);
  const newLeads =
    (newContactCount ?? 0) +
    (newFranchiseCount ?? 0) +
    (newEventCount ?? 0);

  const stats = [
    {
      label: "Total Products",
      value: productCount ?? 0,
      sub: `${activeProductCount ?? 0} active`,
      icon: ShoppingBasket,
      color: "#f6a52a",
      bg: "rgba(246, 165, 42, 0.12)",
      href: "/admin/products",
    },
    {
      label: "Blog Posts",
      value: blogCount ?? 0,
      sub: `${publishedBlogCount ?? 0} published`,
      icon: BookOpen,
      color: "#3b82f6",
      bg: "rgba(59, 130, 246, 0.12)",
      href: "/admin/blogs",
    },
    {
      label: "Castles",
      value: storeCount ?? 0,
      sub: `${activeStoreCount ?? 0} active`,
      icon: MapPin,
      color: "#ec4899",
      bg: "rgba(236, 72, 153, 0.12)",
      href: "/admin/stores",
    },
    {
      label: "Total Leads",
      value: totalLeads,
      sub: `${newLeads} unreviewed`,
      icon: Users,
      color: "#22c55e",
      bg: "rgba(34, 197, 94, 0.12)",
      href: "/admin/leads",
    },
    {
      label: "Event Bookings",
      value: eventCount ?? 0,
      sub: `${newEventCount ?? 0} pending`,
      icon: CalendarCheck,
      color: "#a855f7",
      bg: "rgba(168, 85, 247, 0.12)",
      href: "/admin/events",
    },
  ];

  const quickActions = [
    { label: "Add Product", href: "/admin/products", icon: "🍽️" },
    { label: "New Blog Post", href: "/admin/blogs", icon: "✍️" },
    { label: "Manage Castles", href: "/admin/stores", icon: "🏰" },
    { label: "View Leads", href: "/admin/leads", icon: "📨" },
  ];

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="topbar-title">Dashboard</div>
          <div className="topbar-subtitle">
            Welcome back — here's what's happening
          </div>
        </div>
      </div>

      <div className="admin-content">
        {/* Stats */}
        <div className="stats-grid">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                href={stat.href}
                style={{ textDecoration: "none" }}
              >
                <div className="stat-card">
                  <div className="stat-card-header">
                    <div
                      className="stat-icon"
                      style={{ background: stat.bg }}
                    >
                      <Icon size={20} color={stat.color} />
                    </div>
                    <TrendingUp size={14} color="var(--text-muted)" />
                  </div>
                  <div className="stat-value">{stat.value}</div>
                  <div>
                    <div className="stat-label">{stat.label}</div>
                    <div
                      style={{
                        fontSize: 12,
                        color: stat.color,
                        fontWeight: 600,
                        marginTop: 2,
                      }}
                    >
                      {stat.sub}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="dashboard-grid">
          {/* Quick Actions */}
          <div className="admin-card">
            <div className="section-header" style={{ marginBottom: 16 }}>
              <div>
                <div className="section-title">Quick Actions</div>
                <div className="section-subtitle">Jump to common tasks</div>
              </div>
            </div>
            <div className="quick-actions-grid">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="quick-action-card"
                >
                  <span style={{ fontSize: 20 }}>{action.icon}</span>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Overview */}
          <div className="admin-card">
            <div className="section-header" style={{ marginBottom: 16 }}>
              <div>
                <div className="section-title">Inbox Overview</div>
                <div className="section-subtitle">
                  Unreviewed submissions by type
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                {
                  label: "Contact Messages",
                  count: newContactCount ?? 0,
                  color: "#3b82f6",
                  href: "/admin/leads",
                },
                {
                  label: "Franchise Applications",
                  count: newFranchiseCount ?? 0,
                  color: "#f6a52a",
                  href: "/admin/leads",
                },
                {
                  label: "Event Reservations",
                  count: newEventCount ?? 0,
                  color: "#a855f7",
                  href: "/admin/events",
                },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="inbox-item"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: "var(--admin-bg)",
                      borderRadius: 8,
                      border: "1px solid var(--admin-border)",
                      transition: "border-color 0.2s",
                      "--hover-color": item.color + "44",
                    } as React.CSSProperties}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        fontWeight: 500,
                      }}
                    >
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: item.count > 0 ? item.color : "var(--text-muted)",
                      }}
                    >
                      {item.count} new
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
