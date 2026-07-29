"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/");
    } else {
      const data = await res.json();
      setError(data.error || "Login gagal");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0d0d14]">
      {/* Animated background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="login-card rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-32 h-32 relative mb-4 flex items-center justify-center">
              <img
                src="/Logo_DynoBoo.png"
                alt="DynoBoo Logo"
                className="object-contain drop-shadow-lg"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            <p className="text-sm text-[#64748b] mt-1">Masuk dengan akun SuperAdmin</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                </span>
                <input
                  id="login-username"
                  type="text"
                  className="login-input"
                  placeholder="superadmin"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  className="login-input"
                  style={{ paddingRight: 38 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#94a3b8] transition-colors"
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full login-btn mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  Memverifikasi...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                  Masuk
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-[#475569] mt-6">
            DynoBoo Admin Panel · Protected Area
          </p>
        </div>
      </div>

      <style>{`
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: blobMove 8s ease-in-out infinite alternate;
        }
        .blob-1 { width: 400px; height: 400px; background: rgba(2,132,199,0.15); top: -100px; left: -100px; animation-delay: 0s; }
        .blob-2 { width: 350px; height: 350px; background: rgba(6,182,212,0.12); bottom: -80px; right: -80px; animation-delay: 2s; }
        .blob-3 { width: 300px; height: 300px; background: rgba(14,165,233,0.1); bottom: 100px; left: 100px; animation-delay: 4s; }
        @keyframes blobMove {
          from { transform: scale(1) translate(0, 0); }
          to { transform: scale(1.1) translate(20px, -20px); }
        }
        .login-card {
          background: rgba(19, 19, 31, 0.85);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(20px);
        }
        .login-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 11px 14px 11px 38px;
          font-size: 14px;
          color: #f1f5f9;
          outline: none;
          transition: all 0.2s;
        }
        .login-input:focus {
          border-color: rgba(6,182,212,0.7);
          box-shadow: 0 0 0 3px rgba(6,182,212,0.15);
          background: rgba(255,255,255,0.07);
        }
        .login-input::placeholder { color: #475569; }
        .login-btn {
          padding: 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #0ea5e9, #06b6d4);
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.02em;
        }
        .login-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(14,165,233,0.4);
        }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
