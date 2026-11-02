"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/db/client";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  ShoppingBasket,
  UploadCloud,
  Link2,
} from "lucide-react";

interface Product {
  id: string;
  title: string;
  category: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

const CATEGORIES = [
  "All",
  "Waffle",
  "Mini Pancake",
  "Shakes & Beverages",
  "Waffle Stick",
  "Sizzling Sweet Deals",
  "Waffle Cake",
];

const BLANK: Omit<Product, "id" | "created_at"> = {
  title: "",
  category: "Waffle",
  image_url: "/images/waffle-main.png",
  is_active: true,
};

export default function ProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
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

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    setProducts(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filtered = products.filter((p) => {
    const matchCat =
      categoryFilter === "All" || p.category === categoryFilter;
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const openAdd = () => {
    setEditing(null);
    setForm(BLANK);
    setError(null);
    setManualUrlMode(false);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      title: p.title,
      category: p.category,
      image_url: p.image_url,
      is_active: p.is_active,
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
    if (!form.title.trim() || !form.category.trim()) {
      setError("Title and category are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        const { error: err } = await supabase
          .from("products")
          .update({ ...form, updated_at: new Date().toISOString() })
          .eq("id", editing.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase
          .from("products")
          .insert([form]);
        if (err) throw err;
      }
      await fetchProducts();
      closeModal();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error: err } = await supabase
      .from("products")
      .delete()
      .eq("id", id);
    if (!err) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
    setDeleteId(null);
  };

  const handleToggleActive = async (p: Product) => {
    await supabase
      .from("products")
      .update({ is_active: !p.is_active })
      .eq("id", p.id);
    setProducts((prev) =>
      prev.map((x) =>
        x.id === p.id ? { ...x, is_active: !x.is_active } : x
      )
    );
  };

  return (
    <>
      <div className="admin-topbar">
        <ShoppingBasket size={18} color="var(--gold)" />
        <div style={{ flex: 1 }}>
          <div className="topbar-title">Products</div>
          <div className="topbar-subtitle">Manage your menu items</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} />
          <span className="btn-text">Add Product</span>
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
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="admin-tabs" style={{ flexWrap: "wrap" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`admin-tab ${categoryFilter === cat ? "active" : ""}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="admin-table-wrapper">
          {loading ? (
            <div className="admin-loader">
              <div className="spinner" />
              Loading products…
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🍽️</div>
              <p>No products found. Add your first one!</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <img
                        src={p.image_url}
                        alt={p.title}
                        className="image-preview"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/images/waffle-main.png";
                        }}
                      />
                    </td>
                    <td>
                      <strong>{p.title}</strong>
                    </td>
                    <td>
                      <span className="badge badge-gold">{p.category}</span>
                    </td>
                    <td>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={p.is_active}
                          onChange={() => handleToggleActive(p)}
                        />
                        <span className="toggle-slider" />
                      </label>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => openEdit(p)}
                        >
                          <Pencil size={13} />
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteId(p.id)}
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
                {editing ? "Edit Product" : "Add Product"}
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
                      placeholder="Royal Belgian Waffle"
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-select"
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                    >
                      {CATEGORIES.filter((c) => c !== "All").map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                 <div className="form-group">
                  <label className="form-label">Product Image</label>
                  {manualUrlMode ? (
                    <>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="/images/waffle-main.png"
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
                      {form.image_url && form.image_url !== "/images/waffle-main.png" ? (
                        <div className="upload-preview-container">
                          <img
                            src={form.image_url}
                            alt="Preview"
                            className="upload-preview-thumbnail"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/images/waffle-main.png";
                            }}
                          />
                          <div className="upload-preview-details">
                            <span className="upload-preview-name">Selected Image</span>
                            <span className="upload-preview-url">{form.image_url}</span>
                          </div>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => setForm({ ...form, image_url: "/images/waffle-main.png" })}
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
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
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--text-secondary)",
                    }}
                  >
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
                {saving ? "Saving…" : editing ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div
          className="modal-overlay"
          onClick={() => setDeleteId(null)}
        >
          <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Delete Product?</span>
              <button
                className="modal-close"
                onClick={() => setDeleteId(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                This action cannot be undone. The product will be permanently
                removed.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-ghost"
                onClick={() => setDeleteId(null)}
              >
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
