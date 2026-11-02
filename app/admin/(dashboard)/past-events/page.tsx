"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/db/client";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Sparkles,
  UploadCloud,
  Link2,
} from "lucide-react";

interface PastEvent {
  id: string;
  title: string;
  spotlight_text: string;
  description: string;
  image_url: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
}

const BLANK = {
  title: "",
  spotlight_text: "",
  description: "",
  image_url: "/images/menu-cakes.png",
  tagsInput: "",
  is_active: true,
};

export default function PastEventsPage() {
  const supabase = createClient();
  const [events, setEvents] = useState<PastEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PastEvent | null>(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [manualUrlMode, setManualUrlMode] = useState(false);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to upload image.");
      }

      const data = await res.json();
      setForm((prev) => ({ ...prev, image_url: data.url }));
    } catch (e: any) {
      setError(e.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file.");
        return;
      }
      await handleFileUpload(file);
    }
  };

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("past_events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching past events:", error);
    } else {
      setEvents(data ?? []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const openAdd = () => {
    setEditing(null);
    setForm(BLANK);
    setError(null);
    setManualUrlMode(false);
    setModalOpen(true);
  };

  const openEdit = (e: PastEvent) => {
    setEditing(e);
    setForm({
      title: e.title,
      spotlight_text: e.spotlight_text,
      description: e.description,
      image_url: e.image_url,
      tagsInput: e.tags ? e.tags.join(", ") : "",
      is_active: e.is_active,
    });
    setError(null);
    setManualUrlMode(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setError("Title and description are required.");
      return;
    }
    setSaving(true);
    setError(null);

    const tagsArray = form.tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      title: form.title,
      spotlight_text: form.spotlight_text,
      description: form.description,
      image_url: form.image_url,
      tags: tagsArray,
      is_active: form.is_active,
    };

    try {
      if (editing) {
        const { error: err } = await supabase
          .from("past_events")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("id", editing.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase
          .from("past_events")
          .insert([payload]);
        if (err) throw err;
      }
      await fetchEvents();
      closeModal();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error: err } = await supabase
      .from("past_events")
      .delete()
      .eq("id", id);
    if (!err) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }
    setDeleteId(null);
  };

  const handleToggleActive = async (e: PastEvent) => {
    await supabase
      .from("past_events")
      .update({ is_active: !e.is_active })
      .eq("id", e.id);
    setEvents((prev) =>
      prev.map((x) =>
        x.id === e.id ? { ...x, is_active: !x.is_active } : x
      )
    );
  };

  return (
    <>
      <div className="admin-topbar">
        <Sparkles size={18} color="var(--gold)" />
        <div style={{ flex: 1 }}>
          <div className="topbar-title">Past Events</div>
          <div className="topbar-subtitle">Manage creator collabs and royal events</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} />
          <span className="btn-text">New Event</span>
        </button>
      </div>

      <div className="admin-content">
        <div className="admin-table-wrapper">
          {loading ? (
            <div className="admin-loader">
              <div className="spinner" />
              Loading events…
            </div>
          ) : events.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👑</div>
              <p>No past events yet. Add your first spotlight event!</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Spotlight Text</th>
                  <th>Tags</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <img
                        src={e.image_url}
                        alt={e.title}
                        className="image-preview"
                        onError={(el) => {
                          (el.target as HTMLImageElement).src =
                            "/images/menu-cakes.png";
                        }}
                      />
                    </td>
                    <td>
                      <strong>{e.title}</strong>
                    </td>
                    <td>
                      <span className="badge badge-gold">{e.spotlight_text || "Spotlight"}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 200 }}>
                        {e.tags && e.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: 10,
                              background: "rgba(92, 56, 26, 0.05)",
                              color: "var(--text-secondary)",
                              padding: "2px 6px",
                              borderRadius: 4,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={e.is_active}
                          onChange={() => handleToggleActive(e)}
                        />
                        <span className="toggle-slider" />
                      </label>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => openEdit(e)}
                        >
                          <Pencil size={13} />
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteId(e.id)}
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
                {editing ? "Edit Past Event" : "New Past Event"}
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
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Royal Crown Creator Collab"
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Spotlight Text</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="March 2026 Spotlight"
                      value={form.spotlight_text}
                      onChange={(e) =>
                        setForm({ ...form, spotlight_text: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="This March, Waffle Castle hosted an exclusive creator collab..."
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tags (comma-separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="#RoyalWaffleDay, #CreatorCollab, #FoodCreators"
                    value={form.tagsInput}
                    onChange={(e) =>
                      setForm({ ...form, tagsInput: e.target.value })
                    }
                  />
                  <span className="form-hint">Separate tags with commas.</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Event Cover Image</label>
                  {manualUrlMode ? (
                    <>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="/images/menu-cakes.png"
                        value={form.image_url}
                        onChange={(e) =>
                          setForm({ ...form, image_url: e.target.value })
                        }
                      />
                      <span className="form-hint">
                        Relative path to /public or an absolute URL
                      </span>
                      <button
                        type="button"
                        className="upload-mode-toggle"
                        onClick={() => setManualUrlMode(false)}
                      >
                        <UploadCloud size={12} /> Upload a file instead
                      </button>
                    </>
                  ) : (
                    <>
                      {form.image_url && form.image_url !== "/images/menu-cakes.png" ? (
                        <div className="upload-preview-container">
                          <img
                            src={form.image_url}
                            alt="Preview"
                            className="upload-preview-thumbnail"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/images/menu-cakes.png";
                            }}
                          />
                          <div className="upload-preview-details">
                            <span className="upload-preview-name">Selected Image</span>
                            <span className="upload-preview-url">{form.image_url}</span>
                          </div>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => setForm({ ...form, image_url: "/images/menu-cakes.png" })}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div
                          className={`upload-dropzone ${isDragOver ? "dragover" : ""}`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => document.getElementById("file-upload-input")?.click()}
                        >
                          <input
                            id="file-upload-input"
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) await handleFileUpload(file);
                            }}
                          />
                          {uploading ? (
                            <div className="admin-loader" style={{ padding: 0 }}>
                              <div className="spinner" />
                              <span>Uploading image…</span>
                            </div>
                          ) : (
                            <>
                              <div className="upload-icon-wrapper">
                                <UploadCloud size={28} />
                              </div>
                              <span className="upload-text">
                                Click to upload or drag & drop image
                              </span>
                              <span className="upload-subtext">
                                Supports PNG, JPG, JPEG, GIF or WEBP
                              </span>
                            </>
                          )}
                        </div>
                      )}
                      <button
                        type="button"
                        className="upload-mode-toggle"
                        onClick={() => setManualUrlMode(true)}
                      >
                        <Link2 size={12} /> Enter image URL manually
                      </button>
                    </>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) =>
                        setForm({ ...form, is_active: e.target.checked })
                      }
                    />
                    <span className="toggle-slider" />
                  </label>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    Active (visible on public site)
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving…" : editing ? "Save Changes" : "Create Event"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Delete Event?</span>
              <button className="modal-close" onClick={() => setDeleteId(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                Are you sure you want to delete this event? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(deleteId)}
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
