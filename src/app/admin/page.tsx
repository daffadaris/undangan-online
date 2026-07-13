import React from "react";
import { prisma } from "@/lib/prisma";
import "@/styles/admin.css";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // 1. Query stats
  const totalGuests = await prisma.guest.count();
  const confirmedCount = await prisma.guest.count({
    where: { rsvpStatus: "confirmed" },
  });
  const declinedCount = await prisma.guest.count({
    where: { rsvpStatus: "declined" },
  });
  const pendingCount = await prisma.guest.count({
    where: { rsvpStatus: "pending" },
  });
  const openedCount = await prisma.guest.count({
    where: { openedAt: { not: null } },
  });

  // Calculate total expected attendance size
  const sumConfirmedGuests = await prisma.guest.aggregate({
    where: { rsvpStatus: "confirmed" },
    _sum: { numberOfGuests: true },
  });
  const totalAttendees = sumConfirmedGuests._sum.numberOfGuests || 0;

  // Fetch recent rsvp logs (last 5 updates)
  const recentRsvps = await prisma.guest.findMany({
    where: {
      rsvpStatus: { not: "pending" },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 5,
  });

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-title">Dashboard Overview</h1>
        <p style={{ color: "var(--admin-text-sub)", fontSize: "0.95rem" }}>
          Informasi ringkas statistik undangan pernikahan Anda.
        </p>
      </div>

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
                  <th>Status RSVP</th>
                  <th>Pax</th>
                  <th>Waktu Update</th>
                </tr>
              </thead>
              <tbody>
                {recentRsvps.map((guest: any) => (
                  <tr key={guest.id}>
                    <td style={{ fontWeight: "600" }}>{guest.name}</td>
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
