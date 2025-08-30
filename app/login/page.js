"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      if (data.role === "admin") router.push("/dashboard/admin");
      else router.push("/dashboard/user");
    } else {
      alert(data.msg);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen  bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
  <div className="w-full max-w-sm bg-white shadow-lg rounded-2xl p-8">
    {/* Title */}
    <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Welcome Back 👋</h1>
    <p className="text-sm text-center text-gray-500 mb-6">Login to continue to LeaveLite</p>

    {/* Form */}
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input 
        type="email" 
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />
      <input 
        type="password" 
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />
      <button 
        type="submit" 
        className="bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
      >
        Login
      </button>
    </form>

    {/* Footer */}
    <p className="text-sm text-gray-500 text-center mt-6">
      Don’t have an account? <a href="/register" className="text-blue-600 hover:underline">Register</a>
    </p>
  </div>
</div>

  );
}
