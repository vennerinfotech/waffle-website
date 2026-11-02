"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/db/client";
import { CalendarCheck, ChevronDown } from "lucide-react";

interface EventBooking {
  id: string;
  name: string;
  phone: string;
  email: string;
  event_type: string;
  message: string;
  status: string;
  created_at: string;
}

const STATUSES = ["Pending", "Confirmed", "Rejected"];

function statusBadgeClass(status: string) {
  if (status === "Pending") return "badge badge-pending";
  if (status === "Confirmed") return "badge badge-confirmed";
  if (status === "Rejected") return "badge badge-rejected";
  return "badge";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventsPage() {
  const supabase = createClient();
  const [bookings, setBookings] = useState<EventBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("event_bookings")
      .select("*")
      .order("created_at", { ascending: false });
    setBookings(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("event_bookings").update({ status }).eq("id", id);
    setBookings((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status } : x))
    );
  };

  const filtered =
    filter === "All"
      ? bookings
      : bookings.filter((b) => b.status === filter);

  const pendingCount = bookings.filter((b) => b.status === "Pending").length;

  return (
    <>
      <div className="admin-topbar">
        <CalendarCheck size={18} color="var(--gold)" />
        <div style={{ flex: 1 }}>
          <div className="topbar-title">Event Bookings</div>
          <div className="topbar-subtitle">
            Table reservations and event enquiries
          </div>
        </div>
        {pendingCount > 0 && (
          <span
            className="badge badge-pending"
            style={{ fontSize: 13, padding: "5px 12px" }}
          >
            {pendingCount} pending
          </span>
        )}
      </div>

      <div className="admin-content">
        {/* Filter Tabs */}
        <div style={{ marginBottom: 20 }}>
          <div className="admin-tabs">
            {["All", ...STATUSES].map((s) => (
              <button
                key={s}
                className={`admin-tab ${filter === s ? "active" : ""}`}
                onClick={() => setFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="admin-loader">
            <div className="spinner" />
            Loading bookings…
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎉</div>
            <p>No event bookings yet.</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Event Type</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => (
                  <>
                    <tr key={booking.id}>
                      <td>
                        <strong>{booking.name}</strong>
                      </td>
                      <td>
                        <div>
                          <a
                            href={`mailto:${booking.email}`}
                            style={{
                              color: "var(--gold)",
                              textDecoration: "none",
                              display: "block",
                            }}
                          >
                            {booking.email}
                          </a>
                          <span
                            style={{
                              fontSize: 12,
                              color: "var(--text-muted)",
                            }}
                          >
                            {booking.phone}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-gold">
                          {booking.event_type}
                        </span>
                      </td>
                      <td>
                        <select
                          className="form-select"
                          style={{
                            padding: "4px 8px",
                            fontSize: 12,
                            width: "auto",
                          }}
                          value={booking.status}
                          onChange={(e) =>
                            updateStatus(booking.id, e.target.value)
                          }
                        >
                          {STATUSES.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {formatDate(booking.created_at)}
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() =>
                            setExpandedId(
                              expandedId === booking.id ? null : booking.id
                            )
                          }
                        >
                          <ChevronDown
                            size={14}
                            style={{
                              transform:
                                expandedId === booking.id
                                  ? "rotate(180deg)"
                                  : "none",
                              transition: "transform 0.2s",
                            }}
                          />
                          {expandedId === booking.id ? "Close" : "View"}
                        </button>
                      </td>
                    </tr>
                    {expandedId === booking.id && (
                      <tr key={`${booking.id}-detail`}>
                        <td colSpan={6}>
                          <div className="detail-panel">
                            <div className="detail-row">
                              <span className="detail-label">
                                Message / Special Requests
                              </span>
                              <span className="detail-value">
                                {booking.message || "No message provided"}
                              </span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">
                                Quick Reply
                              </span>
                              <span className="detail-value">
                                <a
                                  href={`mailto:${booking.email}?subject=Your%20Waffle%20Castle%20Reservation&body=Hi%20${booking.name},%0A%0AThank%20you%20for%20your%20${booking.event_type}%20request!`}
                                  className="btn btn-primary btn-sm"
                                  style={{ textDecoration: "none" }}
                                >
                                  Reply via Email
                                </a>
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
