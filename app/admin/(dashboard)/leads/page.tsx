"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/db/client";
import { Inbox, ChevronDown } from "lucide-react";

interface ContactLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  created_at: string;
}

interface FranchiseLead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  contact_no: string;
  city: string;
  state: string;
  plan_to_start: string;
  status: string;
  created_at: string;
}

const CONTACT_STATUSES = ["New", "Reviewed", "Replied"];
const FRANCHISE_STATUSES = ["New", "Reviewed", "Replied"];

function statusBadgeClass(status: string) {
  if (status === "New") return "badge badge-new";
  if (status === "Reviewed") return "badge badge-reviewed";
  if (status === "Replied") return "badge badge-replied";
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

export default function LeadsPage() {
  const supabase = createClient();
  const [tab, setTab] = useState<"contact" | "franchise">("contact");
  const [contactLeads, setContactLeads] = useState<ContactLead[]>([]);
  const [franchiseLeads, setFranchiseLeads] = useState<FranchiseLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [{ data: cl }, { data: fl }] = await Promise.all([
      supabase
        .from("contact_leads")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("franchise_leads")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);
    setContactLeads(cl ?? []);
    setFranchiseLeads(fl ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const updateContactStatus = async (id: string, status: string) => {
    await supabase.from("contact_leads").update({ status }).eq("id", id);
    setContactLeads((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status } : x))
    );
  };

  const updateFranchiseStatus = async (id: string, status: string) => {
    await supabase.from("franchise_leads").update({ status }).eq("id", id);
    setFranchiseLeads((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status } : x))
    );
  };

  const newContactCount = contactLeads.filter(
    (l) => l.status === "New"
  ).length;
  const newFranchiseCount = franchiseLeads.filter(
    (l) => l.status === "New"
  ).length;

  return (
    <>
      <div className="admin-topbar">
        <Inbox size={18} color="var(--gold)" />
        <div style={{ flex: 1 }}>
          <div className="topbar-title">Leads Inbox</div>
          <div className="topbar-subtitle">
            Contact messages and franchise applications
          </div>
        </div>
      </div>

      <div className="admin-content">
        {/* Tabs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div className="admin-tabs">
            <button
              className={`admin-tab ${tab === "contact" ? "active" : ""}`}
              onClick={() => setTab("contact")}
            >
              Contact Messages
              {newContactCount > 0 && (
                <span className="sidebar-badge">{newContactCount}</span>
              )}
            </button>
            <button
              className={`admin-tab ${tab === "franchise" ? "active" : ""}`}
              onClick={() => setTab("franchise")}
            >
              Franchise Applications
              {newFranchiseCount > 0 && (
                <span className="sidebar-badge">{newFranchiseCount}</span>
              )}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="admin-loader">
            <div className="spinner" />
            Loading leads…
          </div>
        ) : tab === "contact" ? (
          <ContactTable
            leads={contactLeads}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            updateStatus={updateContactStatus}
            statuses={CONTACT_STATUSES}
          />
        ) : (
          <FranchiseTable
            leads={franchiseLeads}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            updateStatus={updateFranchiseStatus}
            statuses={FRANCHISE_STATUSES}
          />
        )}
      </div>
    </>
  );
}

function ContactTable({
  leads,
  expandedId,
  setExpandedId,
  updateStatus,
  statuses,
}: {
  leads: ContactLead[];
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  updateStatus: (id: string, status: string) => void;
  statuses: string[];
}) {
  if (leads.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📨</div>
        <p>No contact messages yet.</p>
      </div>
    );
  }

  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Received</th>
            <th>View</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <>
              <tr key={lead.id}>
                <td>
                  <strong>{lead.name}</strong>
                </td>
                <td>
                  <a
                    href={`mailto:${lead.email}`}
                    style={{ color: "var(--gold)", textDecoration: "none" }}
                  >
                    {lead.email}
                  </a>
                </td>
                <td>{lead.phone || "—"}</td>
                <td>
                  <select
                    className="form-select"
                    style={{ padding: "4px 8px", fontSize: 12, width: "auto" }}
                    value={lead.status}
                    onChange={(e) => updateStatus(lead.id, e.target.value)}
                  >
                    {statuses.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  {formatDate(lead.created_at)}
                </td>
                <td>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() =>
                      setExpandedId(expandedId === lead.id ? null : lead.id)
                    }
                  >
                    <ChevronDown
                      size={14}
                      style={{
                        transform:
                          expandedId === lead.id
                            ? "rotate(180deg)"
                            : "none",
                        transition: "transform 0.2s",
                      }}
                    />
                    {expandedId === lead.id ? "Close" : "View"}
                  </button>
                </td>
              </tr>
              {expandedId === lead.id && (
                <tr key={`${lead.id}-detail`}>
                  <td colSpan={6}>
                    <div className="detail-panel">
                      <div className="detail-row">
                        <span className="detail-label">Message</span>
                        <span className="detail-value">
                          {lead.message || "—"}
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
  );
}

function FranchiseTable({
  leads,
  expandedId,
  setExpandedId,
  updateStatus,
  statuses,
}: {
  leads: FranchiseLead[];
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  updateStatus: (id: string, status: string) => void;
  statuses: string[];
}) {
  if (leads.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🏰</div>
        <p>No franchise applications yet.</p>
      </div>
    );
  }

  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email / Phone</th>
            <th>Location</th>
            <th>Timeline</th>
            <th>Status</th>
            <th>Received</th>
            <th>View</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <>
              <tr key={lead.id}>
                <td>
                  <strong>
                    {lead.first_name} {lead.last_name}
                  </strong>
                </td>
                <td>
                  <div>
                    <a
                      href={`mailto:${lead.email}`}
                      style={{ color: "var(--gold)", textDecoration: "none" }}
                    >
                      {lead.email}
                    </a>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {lead.contact_no}
                    </div>
                  </div>
                </td>
                <td>
                  {lead.city}, {lead.state}
                </td>
                <td>
                  <span className="badge badge-gold">{lead.plan_to_start}</span>
                </td>
                <td>
                  <select
                    className="form-select"
                    style={{ padding: "4px 8px", fontSize: 12, width: "auto" }}
                    value={lead.status}
                    onChange={(e) => updateStatus(lead.id, e.target.value)}
                  >
                    {statuses.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  {formatDate(lead.created_at)}
                </td>
                <td>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() =>
                      setExpandedId(expandedId === lead.id ? null : lead.id)
                    }
                  >
                    <ChevronDown
                      size={14}
                      style={{
                        transform:
                          expandedId === lead.id
                            ? "rotate(180deg)"
                            : "none",
                        transition: "transform 0.2s",
                      }}
                    />
                    {expandedId === lead.id ? "Close" : "View"}
                  </button>
                </td>
              </tr>
              {expandedId === lead.id && (
                <tr key={`${lead.id}-detail`}>
                  <td colSpan={7}>
                    <div className="detail-panel">
                      <div className="detail-row">
                        <span className="detail-label">Full Contact</span>
                        <span className="detail-value">
                          {lead.first_name} {lead.last_name} · {lead.email} ·{" "}
                          {lead.contact_no}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Location</span>
                        <span className="detail-value">
                          {lead.city}, {lead.state}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Plan to Start</span>
                        <span className="detail-value">{lead.plan_to_start}</span>
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
  );
}
