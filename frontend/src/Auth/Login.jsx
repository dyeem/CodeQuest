import { useState, useEffect } from "react";
import { User, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import bg from "../assets/loginbg.png";

import { useNavigate } from "react-router-dom";

import useAuth from "../hooks/auth.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase.config.js";

export default function Login() {
  const { admin: user, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login - JS CodeQuest";
  }, []);

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Invalid email or password.");
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center font-serif relative overflow-hidden"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div className="w-full flex flex-col items-center justify-center p-4 tracking-wide relative z-10">
        
        {/* Logo / Title Area */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-[#0c0a09] rounded-full border-2 border-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.3)] mb-4">
            <ShieldCheck size={48} className="text-[#d4af37]" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-[#e7e5e4] uppercase tracking-[0.2em] drop-shadow-lg text-center">
            Code<span className="text-[#d4af37]">Quest</span>
          </h1>
          <p className="text-[#a8a29e] tracking-widest uppercase text-sm mt-2">Teachers Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#1c1917] rounded-sm p-8 sm:p-12 shadow-[0_0_50px_rgba(0,0,0,0.8)] w-full max-w-md border border-[#44403c] relative overflow-hidden">
          {/* Decorative Corner Accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#d4af37]"></div>
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#d4af37]"></div>
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#d4af37]"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#d4af37]"></div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 w-full"
          >
            <h2 className="text-2xl font-bold text-center mb-2 text-[#e7e5e4] uppercase tracking-widest border-b border-[#292524] pb-4">
              LOGIN
            </h2>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#a8a29e] uppercase tracking-widest">Email Address</label>
              <div className="flex items-center bg-[#0c0a09] border border-[#44403c] rounded p-3 focus-within:border-[#d4af37] focus-within:shadow-[0_0_10px_rgba(212,175,55,0.1)] transition-all">
                <User className="w-5 h-5 text-[#57534e] mr-3" />
                <input
                  type="email"
                  className="w-full bg-transparent focus:outline-none text-[#e7e5e4] placeholder-[#292524]"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#a8a29e] uppercase tracking-widest">Password</label>
              <div className="flex items-center bg-[#0c0a09] border border-[#44403c] rounded p-3 focus-within:border-[#d4af37] focus-within:shadow-[0_0_10px_rgba(212,175,55,0.1)] transition-all">
                <Lock className="w-5 h-5 text-[#57534e] mr-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-transparent focus:outline-none text-[#e7e5e4] placeholder-[#292524]"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="ml-2 focus:outline-none text-[#a8a29e] hover:text-[#d4af37] transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-[#450a0a]/20 border border-[#7f1d1d] p-3 rounded text-[#f87171] text-xs text-center font-bold tracking-wide">
                {error}
              </div>
            )}

            {/* Button */}
            <button
              className="mt-4 bg-[#2c241b] text-[#d4af37] py-4 px-8 rounded font-bold text-sm uppercase tracking-[0.2em] border border-[#d4af37]/50 hover:bg-[#d4af37] hover:text-[#1c1917] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2 group"
              type="submit"
            >
              LOGIN <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}