import React from "react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import "@/styles/admin.css";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ userId?: string }>;
}

export default async function AdminDashboard({ searchParams }: Props) {
  const user = await getCurrentUser();
  const { userId: filterUserId } = await searchParams;

  // Build where clause: owner sees own data, super admin can filter
  const where: any = {};
  if (user && user.role !== "super_admin") {
    where.userId = user.userId;
  } else if (user?.role === "super_admin" && filterUserId) {
    where.userId = filterUserId;
  }

  // Fetch all users for super admin dropdown
  const allUsers = user?.role === "super_admin"
    ? await prisma.user.findMany({ orderBy: { username: "asc" }, select: { id: true, username: true, _count: { select: { guests: true } } } })
    : [];

  // 1. Query stats
  const totalGuests = await prisma.guest.count({ where });
  const confirmedCount = await prisma.guest.count({
    where: { ...where, rsvpStatus: "confirmed" },
  });
  const declinedCount = await prisma.guest.count({
    where: { ...where, rsvpStatus: "declined" },
  });
  const pendingCount = await prisma.guest.count({
    where: { ...where, rsvpStatus: "pending" },
  });
  const openedCount = await prisma.guest.count({
    where: { ...where, openedAt: { not: null } },
  });

  // Calculate total expected attendance size
  const sumConfirmedGuests = await prisma.guest.aggregate({
    where: { ...where, rsvpStatus: "confirmed" },
    _sum: { numberOfGuests: true },
  });
  const totalAttendees = sumConfirmedGuests._sum.numberOfGuests || 0;

  // Fetch recent rsvp logs (last 5 updates)
  const recentRsvps = await prisma.guest.findMany({
    where: {
      ...where,
      rsvpStatus: { not: "pending" },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 5,
    include: { owner: { select: { username: true } } },
  });

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-title">Dashboard Overview</h1>
        <p style={{ color: "var(--admin-text-sub)", fontSize: "0.95rem" }}>
          Informasi ringkas statistik undangan pernikahan Anda.
        </p>
      </div>

      {/* User filter for super admin */}
      {user?.role === "super_admin" && allUsers.length > 0 && (
        <form method="GET" action="/admin" style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <label style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--admin-text)", whiteSpace: "nowrap" }}>Filter Pemilik:</label>
          <select
            name="userId"
            className="admin-input"
            style={{ maxWidth: "280px", padding: "6px 12px" }}
            defaultValue={filterUserId || ""}
          >
            <option value="">Semua Pemilik</option>
            {allUsers.map(u => (
              <option key={u.id} value={u.id}>{u.username} ({u._count.guests} tamu)</option>
            ))}
          </select>
          <button type="submit" className="admin-btn" style={{ padding: "6px 16px", fontSize: "0.85rem" }}>Filter</button>
          {filterUserId && (
            <a href="/admin" className="admin-btn" style={{ padding: "6px 16px", fontSize: "0.85rem", background: "#E5E7EB", color: "#374151", textDecoration: "none" }}>Reset</a>
          )}
        </form>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Undangan</span>
          <span className="stat-value">{totalGuests}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Telah Dibuka</span>
          <span className="stat-value">{openedCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Konfirmasi Hadir</span>
          <span className="stat-value">{confirmedCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Pax Kehadiran</span>
          <span className="stat-value">{totalAttendees}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Berhalangan</span>
          <span className="stat-value">{declinedCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Belum Merespon</span>
          <span className="stat-value">{pendingCount}</span>
        </div>
      </div>

      {/* Recent RSVPs Table */}
      <div className="admin-card">
        <div className="card-title">Respon RSVP Terbaru</div>
        
        {recentRsvps.length === 0 ? (
          <p style={{ color: "var(--admin-text-sub)", fontStyle: "italic" }}>
            Belum ada konfirmasi kehadiran terbaru.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Tamu</th>
                  {user?.role === "super_admin" && <th>Pemilik</th>}
                  <th>Status RSVP</th>
                  <th>Pax</th>
                  <th>Waktu Update</th>
                </tr>
              </thead>
              <tbody>
                {recentRsvps.map((guest: any) => (
                  <tr key={guest.id}>
                    <td style={{ fontWeight: "600" }}>{guest.name}</td>
                    {user?.role === "super_admin" && (
                      <td style={{ color: "var(--accent-gold)", fontWeight: 500 }}>{guest.owner?.username || "-"}</td>
                    )}
                    <td>
                      <span className={`badge badge-${guest.rsvpStatus}`}>
                        {guest.rsvpStatus === "confirmed" ? "Hadir" : "Berhalangan"}
                      </span>
                    </td>
                    <td>{guest.rsvpStatus === "confirmed" ? guest.numberOfGuests : "-"}</td>
                    <td>
                      {new Date(guest.updatedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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
