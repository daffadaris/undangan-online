"use client";

import React, { useEffect, useState } from "react";
import "@/styles/admin.css";

interface Guest {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  group: string | null;
  rsvpStatus: string;
  numberOfGuests: number;
  wishes: string | null;
  openedAt: string | null;
}

export default function AdminGuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterRsvp, setFilterRsvp] = useState("");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  // Form inputs
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [group, setGroup] = useState("");
  
  // Edit inputs
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editGroup, setEditGroup] = useState("");
  const [editRsvp, setEditRsvp] = useState("");
  const [editPax, setEditPax] = useState(1);

  // Origin for links
  const [origin, setOrigin] = useState("");

  const fetchGuests = async () => {
    try {
      const res = await fetch("/api/guests");
      if (res.ok) {
        const data = await res.json();
        setGuests(data.guests || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, group }),
      });

      if (res.ok) {
        setName("");
        setPhone("");
        setGroup("");
        setShowAddModal(false);
        fetchGuests();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuest) return;

    try {
      const res = await fetch(`/api/guests/${selectedGuest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          group: editGroup,
          rsvpStatus: editRsvp,
          numberOfGuests: editPax,
        }),
      });

      if (res.ok) {
        setShowEditModal(false);
        setSelectedGuest(null);
        fetchGuests();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteGuest = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus tamu ini?")) return;

    try {
      const res = await fetch(`/api/guests/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchGuests();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Tautan undangan berhasil disalin!");
  };

  const getWhatsAppLink = (guest: Guest) => {
    const groom = "Daffa";
    const bride = "Regina";
    const link = `${origin}/${guest.slug}`;
    const text = encodeURIComponent(`Halo Bapak/Ibu/Saudara/i *${guest.name}*,

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami, *${groom} & ${bride}*.

Berikut detail undangan digital dan informasi lengkap mengenai acara kami dapat diakses melalui tautan berikut:
${link}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu kepada kami.

Terima kasih.`);

    // Clean up phone number (replace space/dash and format with 62)
    let formattedPhone = guest.phone || "";
    formattedPhone = formattedPhone.replace(/\D/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "62" + formattedPhone.substring(1);
    }
    
    return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${text}`;
  };

  const openEditModal = (guest: Guest) => {
    setSelectedGuest(guest);
    setEditName(guest.name);
    setEditPhone(guest.phone || "");
    setEditGroup(guest.group || "");
    setEditRsvp(guest.rsvpStatus);
    setEditPax(guest.numberOfGuests);
    setShowEditModal(true);
  };

  // Client-side CSV export
  const exportToCSV = () => {
    const headers = ["Nama", "Grup", "No HP", "Status RSVP", "Pax Kehadiran", "Sudah Dibuka", "Ucapan"];
    const rows = guests.map(g => [
      g.name,
      g.group || "-",
      g.phone || "-",
      g.rsvpStatus === "confirmed" ? "Hadir" : g.rsvpStatus === "declined" ? "Berhalangan" : "Pending",
      g.rsvpStatus === "confirmed" ? g.numberOfGuests : 0,
      g.openedAt ? "Ya" : "Belum",
      g.wishes || "-"
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");


    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `daftar_tamu_wedding_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Extract unique groups for filters
  const groupsList = Array.from(new Set(guests.map(g => g.group).filter(Boolean))) as string[];

  // Filter and search guests
  const filteredGuests = guests.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchesGroup = filterGroup ? g.group === filterGroup : true;
    const matchesRsvp = filterRsvp ? g.rsvpStatus === filterRsvp : true;
    return matchesSearch && matchesGroup && matchesRsvp;
  });

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-title">Daftar Tamu Undangan</h1>
        
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="admin-btn-outline" onClick={exportToCSV}>
            Ekspor ke CSV
          </button>
          <button className="admin-btn" onClick={() => setShowAddModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Tambah Tamu
          </button>
        </div>
      </div>

      {/* Filters Board */}
      <div className="admin-card" style={{ padding: "20px", marginBottom: "20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <input
              type="text"
              className="admin-input"
              placeholder="Cari nama tamu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div style={{ minWidth: "150px" }}>
            <select className="admin-input" value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}>
              <option value="">Semua Grup</option>
              {groupsList.map(grp => (
                <option key={grp} value={grp}>{grp}</option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: "150px" }}>
            <select className="admin-input" value={filterRsvp} onChange={(e) => setFilterRsvp(e.target.value)}>
              <option value="">Semua RSVP</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Hadir</option>
              <option value="declined">Berhalangan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Guests Table */}
      <div className="admin-card" style={{ padding: "0", overflow: "hidden" }}>
        {loading ? (
          <p style={{ padding: "30px", color: "var(--admin-text-sub)" }}>Memuat data tamu...</p>
        ) : filteredGuests.length === 0 ? (
          <p style={{ padding: "30px", color: "var(--admin-text-sub)", fontStyle: "italic" }}>
            Tidak ada data tamu yang cocok.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Tamu</th>
                  <th>Grup</th>
                  <th>No HP</th>
                  <th>Link Undangan</th>
                  <th>Status</th>
                  <th>Pax</th>
                  <th>Sudah Dibuka</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map((guest) => (
                  <tr key={guest.id}>
                    <td style={{ fontWeight: "600" }}>{guest.name}</td>
                    <td>{guest.group || "-"}</td>
                    <td>{guest.phone || "-"}</td>
                    <td>
                      <button
                        onClick={() => copyToClipboard(`${origin}/${guest.slug}`)}
                        className="admin-btn-outline"
                        style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                      >
                        Salin Link
                      </button>
                    </td>
                    <td>
                      <span className={`badge badge-${guest.rsvpStatus}`}>
                        {guest.rsvpStatus === "confirmed" ? "Hadir" : guest.rsvpStatus === "declined" ? "Berhalangan" : "Pending"}
                      </span>
                    </td>
                    <td>{guest.rsvpStatus === "confirmed" ? guest.numberOfGuests : "-"}</td>
                    <td>{guest.openedAt ? "Ya" : "Belum"}</td>
                    <td>
                      <div className="table-actions">
                        {guest.phone && (
                          <a
                            href={getWhatsAppLink(guest)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="action-btn"
                            title="Kirim ke WhatsApp"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                          </a>
                        )}
                        <button className="action-btn" title="Edit Tamu" onClick={() => openEditModal(guest)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                        </button>
                        <button className="action-btn" title="Hapus Tamu" style={{ color: "#EF4444" }} onClick={() => handleDeleteGuest(guest.id)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Guest Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-scale-in">
            <button className="modal-close" onClick={() => setShowAddModal(false)}>&times;</button>
            <h2 className="card-title" style={{ borderBottom: "1px solid var(--admin-border)", paddingBottom: "10px" }}>
              Tambah Tamu Baru
            </h2>
            
            <form onSubmit={handleAddGuest} style={{ marginTop: "20px" }}>
              <div className="admin-input-group">
                <label className="admin-input-label">Nama Tamu</label>
                <input
                  type="text"
                  className="admin-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  required
                />
              </div>

              <div className="admin-input-group">
                <label className="admin-input-label">Nomor WhatsApp (Opsional)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                />
              </div>

              <div className="admin-input-group">
                <label className="admin-input-label">Kategori / Grup (Opsional)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  placeholder="Contoh: Teman, Keluarga, Kantor"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "30px" }}>
                <button type="button" className="admin-btn-outline" onClick={() => setShowAddModal(false)}>
                  Batal
                </button>
                <button type="submit" className="admin-btn">
                  Simpan Tamu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Guest Modal */}
      {showEditModal && selectedGuest && (
        <div className="modal-overlay">
          <div className="modal-content animate-scale-in">
            <button className="modal-close" onClick={() => { setShowEditModal(false); setSelectedGuest(null); }}>&times;</button>
            <h2 className="card-title" style={{ borderBottom: "1px solid var(--admin-border)", paddingBottom: "10px" }}>
              Edit Tamu
            </h2>
            
            <form onSubmit={handleEditGuest} style={{ marginTop: "20px" }}>
              <div className="admin-input-group">
                <label className="admin-input-label">Nama Tamu</label>
                <input
                  type="text"
                  className="admin-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div className="admin-input-group">
                <label className="admin-input-label">Nomor WhatsApp</label>
                <input
                  type="text"
                  className="admin-input"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
              </div>

              <div className="admin-input-group">
                <label className="admin-input-label">Kategori / Grup</label>
                <input
                  type="text"
                  className="admin-input"
                  value={editGroup}
                  onChange={(e) => setEditGroup(e.target.value)}
                />
              </div>

              <div className="admin-input-group">
                <label className="admin-input-label">Status RSVP</label>
                <select className="admin-input" value={editRsvp} onChange={(e) => setEditRsvp(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Hadir</option>
                  <option value="declined">Berhalangan</option>
                </select>
              </div>

              {editRsvp === "confirmed" && (
                <div className="admin-input-group">
                  <label className="admin-input-label">Jumlah Pax Kehadiran</label>
                  <select className="admin-input" value={editPax} onChange={(e) => setEditPax(Number(e.target.value))}>
                    <option value="1">1 Orang</option>
                    <option value="2">2 Orang</option>
                    <option value="3">3 Orang</option>
                    <option value="4">4 Orang</option>
                    <option value="5">5 Orang</option>
                  </select>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "30px" }}>
                <button type="button" className="admin-btn-outline" onClick={() => { setShowEditModal(false); setSelectedGuest(null); }}>
                  Batal
                </button>
                <button type="submit" className="admin-btn">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
