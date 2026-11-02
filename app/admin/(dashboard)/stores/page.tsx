"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/db/client";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  MapPin,
  ExternalLink,
} from "lucide-react";

interface Store {
  id: string;
  name: string;
  city: string;
  address: string;
  link: string;
  directions_link: string;
  is_active: boolean;
  created_at: string;
}

const BLANK: Omit<Store, "id" | "created_at"> = {
  name: "",
  city: "",
  address: "",
  link: "",
  directions_link: "",
  is_active: true,
};

export default function StoresPage() {
  const supabase = createClient();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Store | null>(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("stores")
      .select("*")
      .order("city", { ascending: true })
      .order("name", { ascending: true });
    setStores(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Dynamically extract all unique cities for filtering
  const uniqueCities = useMemo(() => {
    const cities = new Set<string>();
    stores.forEach((s) => {
      if (s.city) cities.add(s.city);
    });
    return ["All", ...Array.from(cities).sort()];
  }, [stores]);

  const filtered = stores.filter((s) => {
    const matchCity = cityFilter === "All" || s.city === cityFilter;
    const searchLower = search.toLowerCase();
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(searchLower) ||
      s.city.toLowerCase().includes(searchLower) ||
      s.address.toLowerCase().includes(searchLower);
    return matchCity && matchSearch;
  });

  const openAdd = () => {
    setEditing(null);
    setForm(BLANK);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (s: Store) => {
    setEditing(s);
    setForm({
      name: s.name,
      city: s.city,
      address: s.address,
      link: s.link || "",
      directions_link: s.directions_link || "",
      is_active: s.is_active,
    });
    setError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.city.trim() || !form.address.trim()) {
      setError("Name, City, and Address are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        const { error: err } = await supabase
          .from("stores")
          .update({ ...form, updated_at: new Date().toISOString() })
          .eq("id", editing.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase
          .from("stores")
          .insert([form]);
        if (err) throw err;
      }
      await fetchStores();
      closeModal();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error: err } = await supabase
      .from("stores")
      .delete()
      .eq("id", id);
    if (!err) {
      setStores((prev) => prev.filter((s) => s.id !== id));
    }
    setDeleteId(null);
  };

  const handleToggleActive = async (s: Store) => {
    await supabase
      .from("stores")
      .update({ is_active: !s.is_active })
      .eq("id", s.id);
    setStores((prev) =>
      prev.map((x) =>
        x.id === s.id ? { ...x, is_active: !x.is_active } : x
      )
    );
  };

  return (
    <>
      <div className="admin-topbar">
        <MapPin size={18} color="var(--gold)" />
        <div style={{ flex: 1 }}>
          <div className="topbar-title">Castle Locator</div>
          <div className="topbar-subtitle">Manage store locations and order links</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} />
          <span className="btn-text">Add Location</span>
        </button>
      </div>

      <div className="admin-content">
        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 20,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div className="search-input-wrapper">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              className="form-input search-input"
              placeholder="Search locations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="admin-tabs" style={{ flexWrap: "wrap" }}>
            {uniqueCities.map((city) => (
              <button
                key={city}
                className={`admin-tab ${cityFilter === city ? "active" : ""}`}
                onClick={() => setCityFilter(city)}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="admin-table-wrapper">
          {loading ? (
            <div className="admin-loader">
              <div className="spinner" />
              Loading locations…
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🏰</div>
              <p>No locations found. Add your first castle location!</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>City</th>
                  <th>Location Name</th>
                  <th>Address</th>
                  <th>Order Link</th>
                  <th>Directions</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <span className="badge badge-gold">{s.city}</span>
                    </td>
                    <td>
                      <strong>Waffle Castle - {s.name}</strong>
                    </td>
                    <td style={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <span>{s.address}</span>
                    </td>
                    <td>
                      {s.link ? (
                        <a
                          href={s.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sidebar-link"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "4px 8px",
                            background: "var(--gold-dim)",
                            color: "var(--gold)",
                            borderRadius: 6,
                            fontSize: 11,
                            textDecoration: "none",
                            width: "auto",
                          }}
                        >
                          Order Site <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>None</span>
                      )}
                    </td>
                    <td>
                      {s.directions_link ? (
                        <a
                          href={s.directions_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sidebar-link"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "4px 8px",
                            background: "rgba(66,133,244,0.12)",
                            color: "#4285F4",
                            borderRadius: 6,
                            fontSize: 11,
                            textDecoration: "none",
                            width: "auto",
                          }}
                        >
                          Maps <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>Auto</span>
                      )}
                    </td>
                    <td>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={s.is_active}
                          onChange={() => handleToggleActive(s)}
                        />
                        <span className="toggle-slider" />
                      </label>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => openEdit(s)}
                        >
                          <Pencil size={13} />
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteId(s.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                {editing ? "Edit Castle Location" : "Add Castle Location"}
              </span>
              <button className="modal-close" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {error && (
                <div
                  style={{
                    background: "var(--danger-dim)",
                    color: "var(--danger)",
                    padding: "10px 14px",
                    borderRadius: 8,
                    fontSize: 13,
                    marginBottom: 16,
                  }}
                >
                  ⚠ {error}
                </div>
              )}
              <div className="admin-form">
                <div className="form-row-grid">
                  <div className="form-group">
                    <label className="form-label">Location/Outlet Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Ranjit Avenue or Koramangala 7th Block"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Ahmedabad or Amritsar"
                      value={form.city}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Address *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Koramangala 7th Block, Bengaluru, Karnataka"
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Zomato / Swiggy / Ordering Link (Optional)</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://www.zomato.com/..."
                    value={form.link}
                    onChange={(e) =>
                      setForm({ ...form, link: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Google Maps / Directions Link (Optional)</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://maps.google.com/?q=... or https://goo.gl/maps/..."
                    value={form.directions_link}
                    onChange={(e) =>
                      setForm({ ...form, directions_link: e.target.value })
                    }
                  />
                  <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, display: "block" }}>
                    Leave blank to auto-generate from the store address.
                  </span>
                </div>

                <div className="form-group">
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) =>
                        setForm({ ...form, is_active: e.target.checked })
                      }
                      style={{ width: 16, height: 16, cursor: "pointer" }}
                    />
                    Make this location active on the locator page
                  </label>
                </div>

                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
                  <button className="btn btn-ghost" onClick={closeModal} disabled={saving}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Location"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title" style={{ color: "var(--danger)" }}>Delete Location</span>
              <button className="modal-close" onClick={() => setDeleteId(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 20 }}>
                Are you sure you want to delete this location? This action cannot be undone.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(deleteId)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
