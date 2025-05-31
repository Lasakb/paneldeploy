import { useState } from "react";

export default function Home() {
  const [form, setForm] = useState({ name: "", email: "", password: "", ram: "1024" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) setResult(data);
    else setError(data.error || "Gagal membuat akun.");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-indigo-500 to-blue-600">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Daftar Akun Game Panel</h1>
        {result ? (
          <div className="space-y-4">
            <div className="bg-green-100 border border-green-400 text-green-700 rounded p-4">
              <strong>Akun berhasil dibuat!</strong>
              <p>Email: <span className="font-mono">{result.email}</span></p>
              <p>Password: <span className="font-mono">{result.password}</span></p>
              <p>
                <a href={result.panelUrl} target="_blank" className="underline text-blue-600 font-semibold">Login ke Panel</a>
              </p>
              <p>ID Server: <span className="font-mono">{result.serverId}</span></p>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              required
              type="text"
              placeholder="Nama"
              className="w-full px-3 py-2 border rounded"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            <input
              required
              type="email"
              placeholder="Email"
              className="w-full px-3 py-2 border rounded"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
            <input
              required
              type="password"
              placeholder="Password"
              className="w-full px-3 py-2 border rounded"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
            <select
              className="w-full px-3 py-2 border rounded"
              value={form.ram}
              onChange={e => setForm({ ...form, ram: e.target.value })}
            >
              <option value="1024">1 GB RAM</option>
              <option value="2048">2 GB RAM</option>
              <option value="4096">4 GB RAM</option>
            </select>
            {error && <div className="text-red-500">{error}</div>}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-bold py-2 rounded hover:bg-indigo-700 transition"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Daftar & Buat Server"}
            </button>
          </form>
        )}
      </div>
      <p className="text-white mt-6 opacity-70 text-xs">Powered by Pterodactyl API • Deploy di Vercel</p>
    </div>
  );
}