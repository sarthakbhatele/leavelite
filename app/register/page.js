"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json();
    if (res.ok) router.push("/login");
    else alert(data.msg);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl mb-4">Register</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input type="text" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} className="border p-2 rounded"/>
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="border p-2 rounded"/>
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="border p-2 rounded"/>
        <select value={role} onChange={e=>setRole(e.target.value)} className="border p-2 rounded">
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Register</button>
      </form>
    </div>
  );
}
