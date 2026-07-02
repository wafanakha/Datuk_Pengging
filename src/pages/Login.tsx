import React, { useState } from "react";
import { supabase } from "../database/supabaseClient";
import { Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Username dan password harus diisi");
      return;
    }

    setLoading(true);

    // Map username to email (e.g., admincs -> admincs@sapa.local)
    const email = username.includes("@") ? username : `${username}@sapa.local`;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error("Username atau password salah!");
        console.error("Auth error:", error.message);
      } else {
        toast.success("Selamat datang kembali!");
        navigate("/");
      }
    } catch (err: any) {
      toast.error("Terjadi kesalahan koneksi.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 overflow-hidden font-sans">
      {/* Background blobs for premium glassmorphism effect */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse delay-75"></div>

      {/* Main card */}
      <div className="relative w-full max-w-md p-8 mx-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-10">
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-teal-500/10 rounded-2xl mb-4 border border-teal-500/20">
            {/* Elegant Logo icon */}
            <svg
              className="w-10 h-10 text-teal-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            SAPA Arcawinangun
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Sistem Administrasi Pelayanan & Monografi Warga
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2"
            >
              Username / Email
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-500" />
              </div>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admincs"
                className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2"
            >
              Password
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="block w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-500 hover:text-slate-300 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-teal-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Memproses Masuk...
                </>
              ) : (
                "Masuk ke Dashboard"
              )}
            </button>
          </div>
        </form>

        {/* Footer note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500">
            Kelurahan Arcawinangun, Kabupaten Banyumas
          </p>
        </div>
      </div>
    </div>
  );
}
