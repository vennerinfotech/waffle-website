"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/db/client";
import { Plus, Pencil, Trash2, X, BookOpen, UploadCloud, Link2 } from "lucide-react";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  read_time: string;
  author: string;
  author_role: string;
  image_url: string;
  excerpt: string;
  content: string;
  is_published: boolean;
  created_at: string;
}

const BLANK: Omit<BlogPost, "id" | "created_at"> = {
  slug: "",
  title: "",
  category: "Waffle Science",
  date: new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }),
  read_time: "5 min read",
  author: "",
  author_role: "",
  image_url: "/images/waffle-main.png",
  excerpt: "",
  content: "",
  is_published: false,
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

export default function BlogsPage() {
  const supabase = createClient();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

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

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    setPosts(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const openAdd = () => {
    setEditing(null);
    setForm(BLANK);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (p: BlogPost) => {
    setEditing(p);
    setForm({
      slug: p.slug,
      title: p.title,
      category: p.category,
      date: p.date,
      read_time: p.read_time,
      author: p.author,
      author_role: p.author_role,
      image_url: p.image_url,
      excerpt: p.excerpt,
      content: p.content,
      is_published: p.is_published,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: editing ? prev.slug : slugify(title),
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim() || !form.author.trim()) {
      setError("Title, slug, and author are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        const { error: err } = await supabase
          .from("blog_posts")
          .update({ ...form, updated_at: new Date().toISOString() })
          .eq("id", editing.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase
          .from("blog_posts")
          .insert([form]);
        if (err) throw err;
      }
      await fetchPosts();
      setModalOpen(false);
      setEditing(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("blog_posts").delete().eq("id", id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setDeleteId(null);
  };

  const handleTogglePublish = async (p: BlogPost) => {
    await supabase
      .from("blog_posts")
      .update({ is_published: !p.is_published })
      .eq("id", p.id);
    setPosts((prev) =>
      prev.map((x) =>
        x.id === p.id ? { ...x, is_published: !x.is_published } : x
      )
    );
  };

  return (
    <>
      <div className="admin-topbar">
        <BookOpen size={18} color="var(--gold)" />
        <div style={{ flex: 1 }}>
          <div className="topbar-title">Blog Posts</div>
          <div className="topbar-subtitle">Create and manage articles</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} />
          <span className="btn-text">New Post</span>
        </button>
      </div>

      <div className="admin-content">
        <div className="admin-table-wrapper">
          {loading ? (
            <div className="admin-loader">
              <div className="spinner" />
              Loading posts…
            </div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">✍️</div>
              <p>No blog posts yet. Create your first one!</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id}>
                    <td style={{ maxWidth: 280 }}>
                      <strong style={{ display: "block", marginBottom: 2 }}>
                        {p.title}
                      </strong>
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          fontFamily: "monospace",
                        }}
                      >
                        /{p.slug}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-gold">{p.category}</span>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>
                          {p.author}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--text-muted)",
                          }}
                        >
                          {p.author_role}
                        </div>
                      </div>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{p.date}</td>
                    <td>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={p.is_published}
                          onChange={() => handleTogglePublish(p)}
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
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div
            className="modal"
            style={{ maxWidth: 740 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <span className="modal-title">
                {editing ? "Edit Blog Post" : "New Blog Post"}
              </span>
              <button
                className="modal-close"
                onClick={() => setModalOpen(false)}
              >
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
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="The Science Behind the Perfect Waffle"
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                  />
                </div>

                <div className="form-row-grid">
                  <div className="form-group">
                    <label className="form-label">Slug *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="science-of-perfect-waffle"
                      value={form.slug}
                      onChange={(e) =>
                        setForm({ ...form, slug: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Waffle Science"
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-row-grid">
                  <div className="form-group">
                    <label className="form-label">Author *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Chef Marcus Vance"
                      value={form.author}
                      onChange={(e) =>
                        setForm({ ...form, author: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Author Role</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Head Pastry Chef"
                      value={form.author_role}
                      onChange={(e) =>
                        setForm({ ...form, author_role: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-row-grid">
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="May 22, 2026"
                      value={form.date}
                      onChange={(e) =>
                        setForm({ ...form, date: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Read Time</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="5 min read"
                      value={form.read_time}
                      onChange={(e) =>
                        setForm({ ...form, read_time: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Blog Cover Image</label>
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
                </div>

                <div className="form-group">
                  <label className="form-label">Excerpt</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="A short summary of the post…"
                    value={form.excerpt}
                    onChange={(e) =>
                      setForm({ ...form, excerpt: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Content (HTML)</label>
                  <textarea
                    className="form-textarea"
                    rows={8}
                    placeholder="<p>Write your blog content here…</p>"
                    value={form.content}
                    onChange={(e) =>
                      setForm({ ...form, content: e.target.value })
                    }
                  />
                  <span className="form-hint">
                    Supports HTML tags: &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;,
                    &lt;li&gt;, &lt;strong&gt;, &lt;blockquote&gt; etc.
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={form.is_published}
                      onChange={(e) =>
                        setForm({ ...form, is_published: e.target.checked })
                      }
                    />
                    <span className="toggle-slider" />
                  </label>
                  <span
                    style={{ fontSize: 13, color: "var(--text-secondary)" }}
                  >
                    Published (visible on public blog)
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-ghost"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving…" : editing ? "Save Changes" : "Publish Post"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div
            className="modal"
            style={{ maxWidth: 400 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <span className="modal-title">Delete Post?</span>
              <button
                className="modal-close"
                onClick={() => setDeleteId(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                This will permanently delete the blog post. This cannot be
                undone.
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
