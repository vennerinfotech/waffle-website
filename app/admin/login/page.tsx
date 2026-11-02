"use client";

import { useState } from "react";
import { createClient } from "@/lib/db/client";
import { useRouter } from "next/navigation";
import { Crown, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-card">
        <div className="login-logo">
          <img src="/images/logo.png" alt="Waffle Castle Logo" className="login-logo-img" />
        </div>
        <h2>Welcome back</h2>
        <p>Sign in to manage your content and leads.</p>

        {error && <div className="login-error">⚠ {error}</div>}

        <form onSubmit={handleLogin} className="admin-form">
          <div className="form-group">
            <label className="form-label">
              <Mail size={13} style={{ display: "inline", marginRight: 6 }} />
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              className="form-input"
              placeholder="Enter Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={13} style={{ display: "inline", marginRight: 6 }} />
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="Enter Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  display: "flex",
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing in…" : "Sign In to Admin Panel"}
          </button>
        </form>
      </div>
    </div>
  );
}
