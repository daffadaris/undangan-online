"use client";

import React, { useEffect, useState } from "react";
import "@/styles/admin.css";

interface Wish {
  id: string;
  name: string;
  wishes: string;
  rsvpStatus: string;
  wishSentAt: string;
}

export default function AdminWishesPage() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [ownerUsers, setOwnerUsers] = useState<{ id: string; username: string; _count: { guests: number } }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  const fetchWishes = async () => {
    try {
      const params = selectedUserId ? `?userId=${selectedUserId}` : "";
      const res = await fetch(`/api/wishes${params}`);
      if (res.ok) {
        const data = await res.json();
        setWishes(data.wishes || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/auth").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.user) {
        setCurrentUser(d.user);
        if (d.user.role === "super_admin") {
          fetch("/api/users").then(r => r.json()).then(d => setOwnerUsers(d.users || []));
        }
      }
    });
  }, []);

  useEffect(() => {
    fetchWishes();
  }, [selectedUserId]);

  const handleDeleteWish = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus ucapan ini? (Tamu tetap ada, hanya ucapannya yang dihapus)")) return;

    try {
      // Re-use the PUT /api/guests/[id] endpoint by setting wishes to null
      const res = await fetch(`/api/guests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wishes: null }),
      });

      if (res.ok) {
        fetchWishes();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-title">Ucapan &amp; Doa Restu</h1>
        {currentUser?.role === "super_admin" && ownerUsers.length > 0 && (
          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <label style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--admin-text)" }}>Filter Pemilik:</label>
            <select
              className="admin-input"
              style={{ maxWidth: "280px", padding: "6px 12px" }}
              value={selectedUserId}
              onChange={(e) => { setSelectedUserId(e.target.value); setLoading(true); }}
            >
              <option value="">Semua Pemilik</option>
              {ownerUsers.map(u => (
                <option key={u.id} value={u.id}>{u.username} ({u._count.guests} tamu)</option>
              ))}
            </select>
          </div>
        )}
        <p style={{ color: "var(--admin-text-sub)", fontSize: "0.95rem" }}>
          Berikut adalah ucapan dan doa restu yang dikirimkan oleh tamu undangan.
        </p>
      </div>

      <div className="admin-card" style={{ padding: "0", overflow: "hidden" }}>
        {loading ? (
          <p style={{ padding: "30px", color: "var(--admin-text-sub)" }}>Memuat ucapan...</p>
        ) : wishes.length === 0 ? (
          <p style={{ padding: "30px", color: "var(--admin-text-sub)", fontStyle: "italic" }}>
            Belum ada ucapan dari tamu undangan.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Pengirim</th>
                  <th>RSVP</th>
                  <th>Isi Ucapan</th>
                  <th>Waktu Pengiriman</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {wishes.map((wish) => (
                  <tr key={wish.id}>
                    <td style={{ fontWeight: "600", width: "20%" }}>{wish.name}</td>
                    <td style={{ width: "15%" }}>
                      <span className={`badge badge-${wish.rsvpStatus}`}>
                        {wish.rsvpStatus === "confirmed" ? "Hadir" : wish.rsvpStatus === "declined" ? "Berhalangan" : "Pending"}
                      </span>
                    </td>
                    <td style={{ color: "var(--admin-text-sub)", fontSize: "0.9rem", lineHeight: "1.5" }}>
                      "{wish.wishes}"
                    </td>
                    <td style={{ width: "20%", fontSize: "0.85rem" }}>
                      {new Date(wish.wishSentAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td style={{ width: "10%" }}>
                      <button
                        className="admin-btn-danger"
                        style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                        onClick={() => handleDeleteWish(wish.id)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
