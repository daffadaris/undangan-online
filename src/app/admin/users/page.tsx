"use client";

import React, { useEffect, useState } from "react";
import "@/styles/admin.css";

interface UserRow {
  id: string;
  username: string;
  role: string;
  createdAt: string;
  _count: { guests: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else if (res.status === 403) {
        setError("Anda tidak memiliki akses ke halaman ini.");
      } else {
        setError("Gagal memuat data pengguna.");
      }
    } catch (e) {
      setError("Gagal memuat data pengguna.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername, password: newPassword }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewUsername("");
        setNewPassword("");
        fetchUsers();
      } else {
        const data = await res.json();
        setCreateError(data.error || "Gagal membuat pengguna.");
      }
    } catch (e) {
      setCreateError("Terjadi kesalahan.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const res = await fetch(`/api/users?id=${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDeleteTarget(null);
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus pengguna.");
      }
    } catch (e) {
      alert("Terjadi kesalahan.");
    }
  };

  if (error) {
    return (
      <div>
        <div className="admin-header">
          <h1 className="admin-title">Manajemen Pengguna</h1>
        </div>
        <div className="admin-card">
          <p style={{ color: "var(--admin-text-sub)", fontStyle: "italic" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-title">Manajemen Pengguna</h1>
        <p style={{ color: "var(--admin-text-sub)", fontSize: "0.95rem" }}>
          Kelola pemilik undangan. Setiap pengguna memiliki data tamu dan konfigurasi sendiri.
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button className="admin-btn" onClick={() => setShowCreateModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Tambah Pengguna
        </button>
      </div>

      <div className="admin-card">
        <div className="card-title">Daftar Pengguna</div>

        {loading ? (
          <p style={{ color: "var(--admin-text-sub)", fontStyle: "italic" }}>Memuat...</p>
        ) : users.length === 0 ? (
          <p style={{ color: "var(--admin-text-sub)", fontStyle: "italic" }}>
            Belum ada pengguna selain super admin.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>URL Undangan</th>
                  <th>Role</th>
                  <th>Jumlah Tamu</th>
                  <th>Dibuat</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: "600" }}>{u.username}</td>
                    <td>
                      <code style={{
                        background: "var(--primary-sage-light)",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "0.82rem",
                      }}>
                        /{u.username}/[nama-tamu]
                      </code>
                    </td>
                    <td>                    <td>                      <span className={`badge ${u.role === "super_admin" ? "badge-confirmed" : "badge-pending"}`}>
                        {u.role === "super_admin" ? "Super Admin" : "Owner"}
                      </span>
                    </td>
                    <td>{u._count.guests}</td>
                    <td>
                      {new Date(u.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      {u.role !== "super_admin" && (
                        <button
                          className="admin-btn"
                          style={{
                            background: "#FEE2E2",
                            color: "#DC2626",
                            border: "1px solid #FECACA",
                            padding: "4px 12px",
                            fontSize: "0.8rem",
                          }}
                          onClick={() => setDeleteTarget(u)}
                        >
                          Hapus
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: "20px", fontFamily: "var(--font-serif)", color: "var(--admin-text)" }}>
              Tambah Pengguna Baru
            </h2>
            <form onSubmit={handleCreate}>
              <div className="admin-input-group">
                <label className="admin-input-label">Username</label>
                <input
                  type="text"
                  className="admin-input"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="contoh: budi-sari"
                  required
                />
                <p style={{ fontSize: "0.75rem", color: "var(--admin-text-sub)", marginTop: "4px" }}>
                  URL undangan: /<strong>{newUsername || "username"}</strong>/nama-tamu
                </p>
              </div>
              <div className="admin-input-group">
                <label className="admin-input-label">Password</label>
                <input
                  type="password"
                  className="admin-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                />
              </div>
              {createError && (
                <p style={{ color: "#EF4444", fontSize: "0.85rem", marginBottom: "12px" }}>{createError}</p>
              )}
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" className="admin-btn" style={{ background: "#E5E7EB", color: "#374151" }} onClick={() => setShowCreateModal(false)}>
                  Batal
                </button>
                <button type="submit" className="admin-btn" disabled={creating}>
                  {creating ? "Membuat..." : "Buat Pengguna"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: "16px", fontFamily: "var(--font-serif)", color: "var(--admin-text)" }}>
              Hapus Pengguna
            </h2>
            <p style={{ marginBottom: "20px", color: "var(--admin-text-sub)" }}>
              Yakin ingin menghapus <strong>{deleteTarget.username}</strong>? Semua data tamu dan konfigurasi akan ikut terhapus.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button className="admin-btn" style={{ background: "#E5E7EB", color: "#374151" }} onClick={() => setDeleteTarget(null)}>
                Batal
              </button>
              <button className="admin-btn" style={{ background: "#DC2626", color: "#fff" }} onClick={handleDelete}>
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
