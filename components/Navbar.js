"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  };

  return (
    <nav className="bg-gray-800 text-white px-6 py-3 flex justify-between">
      <div>
        <Link href="/" className="font-bold text-lg">LeaveLite</Link>
      </div>
      <div className="flex gap-4">
        <Link href="/dashboard/user">Dashboard</Link>
        <button onClick={handleLogout} className="bg-red-600 px-3 py-1 rounded hover:bg-red-700">Logout</button>
      </div>
    </nav>
  );
}
