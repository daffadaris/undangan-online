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
  owner?: { username: string };
}

interface CSVRow {
  name: string;
  phone: string;
  group: string;
  include: boolean;
  error?: string;
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
  const [showCSVModal, setShowCSVModal] = useState(false);
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

  // CSV Import state
  const [csvRows, setCsvRows] = useState<CSVRow[]>([]);
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvResult, setCsvResult] = useState<{ imported: number; skipped: string[] } | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [defaultImportGroup, setDefaultImportGroup] = useState("");

  // Origin for links
  const [origin, setOrigin] = useState("");
  const [weddingConfig, setWeddingConfig] = useState<any>(null);
  const [whatsappTemplate, setWhatsappTemplate] = useState("");

  // Super admin: user filter
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [ownerUsers, setOwnerUsers] = useState<{ id: string; username: string; _count: { guests: number } }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  const fetchGuests = async () => {
    try {
      const params = selectedUserId ? `?userId=${selectedUserId}` : "";
      const res = await fetch(`/api/guests${params}`);
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
    // Fetch current user info
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
    fetchGuests();
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }

    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setWeddingConfig(data.config || null);
          setWhatsappTemplate(data.config?.whatsappTemplate || "");
        }
      } catch (e) {
        console.error("Failed to fetch settings config in guests page:", e);
      }
    };
    fetchConfig();
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

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        alert("Tautan undangan berhasil disalin!");
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        if (successful) {
          alert("Tautan undangan berhasil disalin!");
        } else {
          alert("Gagal menyalin tautan. Silakan salin secara manual.");
        }
      }
    } catch (err) {
      console.error("Gagal menyalin: ", err);
      alert("Gagal menyalin tautan. Silakan salin secara manual.");
    }
  };

  const getWhatsAppLink = (guest: Guest) => {
    const groom = weddingConfig?.groomNickname || "Daffa";
    const bride = weddingConfig?.brideNickname || "Regina";
    // Build link using owner username from guest data
    const ownerUsername = guest.owner?.username || "daffa-regina";
    const link = `${origin}/${ownerUsername}/${guest.slug}`;
    
    const defaultTemplate = `Halo Bapak/Ibu/Saudara/i *{{nama}}*,

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami, *{{pria}} & {{wanita}}*.

Berikut detail undangan digital dan informasi lengkap mengenai acara kami dapat diakses melalui tautan berikut:
{{tautan}}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu kepada kami.

Terima kasih.`;

    const template = whatsappTemplate || defaultTemplate;
    
    let message = template
      .replace(/{{nama}}/g, guest.name)
      .replace(/{{name}}/g, guest.name)
      .replace(/{{pria}}/g, groom)
      .replace(/{{groom}}/g, groom)
      .replace(/{{wanita}}/g, bride)
      .replace(/{{bride}}/g, bride)
      .replace(/{{link}}/g, link)
      .replace(/{{tautan}}/g, link);

    const text = encodeURIComponent(message);

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
    setEditPax(guest.numberOfGuests >= 1 ? guest.numberOfGuests : 1);
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

  // CSV Import — parse CSV file client-side
  const handleCSVFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(line => line.trim());
      if (lines.length === 0) return;

      // Detect separator: comma or semicolon
      const firstLine = lines[0];
      const separator = firstLine.includes(";") ? ";" : ",";

      // Check if first row is a header
      const firstCells = firstLine.split(separator).map(c => c.trim().replace(/^"|"$/g, "").toLowerCase());
      const isHeader = firstCells.some(c => 
        c === "nama" || c === "name" || c === "no hp" || c === "phone" || c === "grup" || c === "group"
      );

      const dataLines = isHeader ? lines.slice(1) : lines;

      // Detect column mapping from header
      let nameIdx = 0, phoneIdx = 1, groupIdx = 2;
      if (isHeader) {
        nameIdx = firstCells.findIndex(c => c === "nama" || c === "name");
        phoneIdx = firstCells.findIndex(c => c === "no hp" || c === "phone" || c === "no. hp" || c === "telepon" || c === "whatsapp" || c === "no whatsapp");
        groupIdx = firstCells.findIndex(c => c === "grup" || c === "group" || c === "kategori");
        if (nameIdx === -1) nameIdx = 0;
        if (phoneIdx === -1) phoneIdx = 1;
        if (groupIdx === -1) groupIdx = 2;
      }

      const parsed: CSVRow[] = dataLines.map(line => {
        const cells = line.split(separator).map(c => c.trim().replace(/^"|"$/g, ""));
        const rowName = (cells[nameIdx] || "").trim();
        return {
          name: rowName,
          phone: (cells[phoneIdx] || "").trim(),
          group: (cells[groupIdx] || "").trim(),
          include: !!rowName,
          error: !rowName ? "Nama kosong" : undefined,
        };
      }).filter(row => row.name || row.phone || row.group); // Remove completely empty rows

      setCsvRows(parsed);
      setCsvResult(null);
      setShowCSVModal(true);
    };
    reader.readAsText(file);

    // Reset the input so the same file can be selected again
    e.target.value = "";
  };

  const handleProcessPastedText = () => {
    if (!pastedText.trim()) return;

    const rawNames = pastedText.replace(/\r/g, "").split(/[,\n]/);
    const names = rawNames.map(n => n.trim()).filter(Boolean);

    const parsed: CSVRow[] = names.map(name => ({
      name,
      phone: "",
      group: defaultImportGroup.trim() || "",
      include: true,
    }));

    setCsvRows(parsed);
    setCsvResult(null);
  };

  const toggleCSVRow = (index: number) => {
    setCsvRows(prev => prev.map((row, i) => 
      i === index ? { ...row, include: !row.include } : row
    ));
  };

  const toggleAllCSVRows = (checked: boolean) => {
    setCsvRows(prev => prev.map(row => ({ ...row, include: !row.error && checked })));
  };

  const handleCSVImport = async () => {
    const toImport = csvRows.filter(r => r.include && !r.error);
    if (toImport.length === 0) return;

    setCsvImporting(true);
    try {
      const res = await fetch("/api/guests/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guests: toImport.map(r => ({
            name: r.name,
            phone: r.phone || undefined,
            group: r.group || undefined,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCsvResult({ imported: data.imported, skipped: data.skipped || [] });
        fetchGuests();
      } else {
        alert("Gagal mengimpor data tamu.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengimpor.");
    } finally {
      setCsvImporting(false);
    }
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

  const includedCount = csvRows.filter(r => r.include && !r.error).length;

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-title">Daftar Tamu Undangan</h1>

        {/* User filter for super admin */}
        {currentUser?.role === "super_admin" && ownerUsers.length > 0 && (
          <div className="user-filter-bar" style={{ marginTop: "12px" }}>
            <label className="user-filter-label">Filter Pemilik:</label>
            <select
              className="admin-input user-filter-select"
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

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
          <button className="admin-btn-outline" onClick={exportToCSV}>
            Ekspor CSV
          </button>
          {/* CSV Import Trigger */}
          <button 
            className="admin-btn-outline" 
            onClick={() => {
              setCsvRows([]);
              setCsvResult(null);
              setPastedText("");
              setDefaultImportGroup("");
              setShowCSVModal(true);
            }}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Impor Massal / CSV
          </button>
          
          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleCSVFileSelect}
            style={{ display: "none" }}
            id="csv-import-input"
          />
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
                  {currentUser?.role === "super_admin" && <th>Pemilik</th>}
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
                    {currentUser?.role === "super_admin" && (
                      <td style={{ color: "var(--accent-gold)", fontWeight: 500 }}>{guest.owner?.username || "-"}</td>
                    )}
                    <td>{guest.group || "-"}</td>
                    <td>{guest.phone || "-"}</td>
                    <td>
                      <button
                        onClick={() => copyToClipboard(`${origin}/${guest.owner?.username || "daffa-regina"}/${guest.slug}`)}
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

      {/* CSV Import Preview Modal */}
      {showCSVModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-scale-in" style={{ maxWidth: "700px" }}>
            <button className="modal-close" onClick={() => { setShowCSVModal(false); setCsvRows([]); setCsvResult(null); }}>&times;</button>
            <h2 className="card-title" style={{ borderBottom: "1px solid var(--admin-border)", paddingBottom: "10px" }}>
              Impor Tamu dari CSV
            </h2>

            {csvResult ? (
              /* Import Result */
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <div style={{
                  width: "60px", height: "60px", borderRadius: "50%",
                  background: "var(--admin-primary)", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 15px", fontSize: "1.8rem"
                }}>
                  ✓
                </div>
                <p style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "8px" }}>
                  {csvResult.imported} tamu berhasil diimpor!
                </p>
                {csvResult.skipped.length > 0 && (
                  <p style={{ color: "var(--admin-text-sub)", fontSize: "0.85rem" }}>
                    {csvResult.skipped.length} dilewati: {csvResult.skipped.join(", ")}
                  </p>
                )}
                <button
                  className="admin-btn"
                  style={{ marginTop: "20px" }}
                  onClick={() => { setShowCSVModal(false); setCsvRows([]); setCsvResult(null); }}
                >
                  Tutup
                </button>
              </div>
            ) : csvRows.length === 0 ? (
              /* Initial Import Options (Textarea or CSV file upload) */
              <div style={{ marginTop: "15px" }}>
                <div className="admin-input-group">
                  <label className="admin-input-label">Cara 1: Tempel Daftar Nama Tamu (Pisahkan dengan koma atau baris baru)</label>
                  <textarea
                    className="admin-input"
                    rows={6}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Contoh: Thoriq Afif Habibi, Mukhammad Ikhsan, Rheza Firmanda&#10;Atau masukkan satu nama per baris..."
                  />
                </div>

                <div className="admin-input-group" style={{ marginBottom: "25px" }}>
                  <label className="admin-input-label">Kategori / Grup Default untuk Nama yang Ditempel (Opsional)</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={defaultImportGroup}
                    onChange={(e) => setDefaultImportGroup(e.target.value)}
                    placeholder="Contoh: Teman, Keluarga, Kantor"
                  />
                </div>

                <div style={{
                  border: "2px dashed var(--admin-border)",
                  borderRadius: "8px",
                  padding: "20px",
                  textAlign: "center",
                  backgroundColor: "var(--admin-bg)",
                  marginBottom: "25px"
                }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: "500", color: "var(--admin-text)", marginBottom: "10px" }}>
                    Cara 2: Pilih / Unggah Berkas CSV
                  </p>
                  <label
                    htmlFor="csv-import-input"
                    className="admin-btn-outline"
                    style={{ cursor: "pointer", display: "inline-flex", padding: "8px 16px", fontSize: "0.8rem" }}
                  >
                    Pilih Berkas CSV (.csv)
                  </label>
                  <p style={{ fontSize: "0.75rem", color: "var(--admin-text-sub)", marginTop: "8px" }}>
                    Format kolom yang didukung: Nama, No HP (opsional), Grup (opsional)
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button
                    type="button"
                    className="admin-btn-outline"
                    onClick={() => { setShowCSVModal(false); setCsvRows([]); setCsvResult(null); }}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    className="admin-btn"
                    onClick={handleProcessPastedText}
                    disabled={!pastedText.trim()}
                  >
                    Proses Nama
                  </button>
                </div>
              </div>
            ) : (
              /* Preview Table */
              <div style={{ marginTop: "15px" }}>
                <p style={{ color: "var(--admin-text-sub)", fontSize: "0.85rem", marginBottom: "12px" }}>
                  Ditemukan <strong>{csvRows.length}</strong> baris data. Centang tamu yang ingin diimpor.
                </p>

                <div style={{ maxHeight: "350px", overflowY: "auto", border: "1px solid var(--admin-border)", borderRadius: "8px" }}>
                  <table className="data-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th style={{ width: "40px" }}>
                          <input
                            type="checkbox"
                            checked={csvRows.filter(r => !r.error).every(r => r.include)}
                            onChange={(e) => toggleAllCSVRows(e.target.checked)}
                            style={{ width: "16px", height: "16px", cursor: "pointer" }}
                          />
                        </th>
                        <th>Nama</th>
                        <th>No HP</th>
                        <th>Grup</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvRows.map((row, idx) => (
                        <tr key={idx} style={{ opacity: row.error ? 0.5 : 1 }}>
                          <td>
                            <input
                              type="checkbox"
                              checked={row.include}
                              onChange={() => toggleCSVRow(idx)}
                              disabled={!!row.error}
                              style={{ width: "16px", height: "16px", cursor: row.error ? "not-allowed" : "pointer" }}
                            />
                          </td>
                          <td style={{ fontWeight: "500" }}>
                            {row.name || <span style={{ color: "#EF4444", fontStyle: "italic" }}>Nama kosong</span>}
                          </td>
                          <td>{row.phone || "-"}</td>
                          <td>{row.group || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--admin-text-sub)" }}>
                    {includedCount} tamu akan diimpor
                  </span>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="button"
                      className="admin-btn-outline"
                      onClick={() => setCsvRows([])}
                    >
                      Kembali / Reset
                    </button>
                    <button
                      className="admin-btn"
                      onClick={handleCSVImport}
                      disabled={csvImporting || includedCount === 0}
                    >
                      {csvImporting ? "Mengimpor..." : `Impor ${includedCount} Tamu`}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
