"use client";

import React, { useEffect, useState } from "react";
import "@/styles/admin.css";

interface LoveStoryItem {
  year: string;
  title: string;
  description: string;
}

interface GiftAccountItem {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Form states
  const [groomName, setGroomName] = useState("");
  const [groomNickname, setGroomNickname] = useState("");
  const [groomParents, setGroomParents] = useState("");
  const [brideName, setBrideName] = useState("");
  const [brideNickname, setBrideNickname] = useState("");
  const [brideParents, setBrideParents] = useState("");

  // Akad
  const [akadDate, setAkadDate] = useState("");
  const [akadTime, setAkadTime] = useState("");
  const [akadVenue, setAkadVenue] = useState("");
  const [akadAddress, setAkadAddress] = useState("");
  const [akadMapsUrl, setAkadMapsUrl] = useState("");

  // Resepsi
  const [resepsiDate, setResepsiDate] = useState("");
  const [resepsiTime, setResepsiTime] = useState("");
  const [resepsiVenue, setResepsiVenue] = useState("");
  const [resepsiAddress, setResepsiAddress] = useState("");
  const [resepsiMapsUrl, setResepsiMapsUrl] = useState("");

  // Love Story & Gifts lists
  const [loveStory, setLoveStory] = useState<LoveStoryItem[]>([]);
  const [giftInfo, setGiftInfo] = useState<GiftAccountItem[]>([]);
  const [musicUrl, setMusicUrl] = useState("");
  
  // Customization (Themes & Images)
  const [theme, setTheme] = useState("sage");
  const [heroImage, setHeroImage] = useState("");
  const [groomImage, setGroomImage] = useState("");
  const [brideImage, setBrideImage] = useState("");
  const [coupleImage, setCoupleImage] = useState("");
  const [galleryImagesText, setGalleryImagesText] = useState("");

  // Section Visibility Toggles
  const [showLoveStory, setShowLoveStory] = useState(true);
  const [showGiftInfo, setShowGiftInfo] = useState(true);
  const [showRsvp, setShowRsvp] = useState(true);
  const [showGallery, setShowGallery] = useState(true);
  const [showAkad, setShowAkad] = useState(true);
  const [showResepsi, setShowResepsi] = useState(true);

  // Upload States
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          const config = data.config;
          if (config) {
            setGroomName(config.groomName || "");
            setGroomNickname(config.groomNickname || "");
            setGroomParents(config.groomParents || "");
            setBrideName(config.brideName || "");
            setBrideNickname(config.brideNickname || "");
            setBrideParents(config.brideParents || "");
            setAkadDate(config.akadDate || "");
            setAkadTime(config.akadTime || "");
            setAkadVenue(config.akadVenue || "");
            setAkadAddress(config.akadAddress || "");
            setAkadMapsUrl(config.akadMapsUrl || "");
            setResepsiDate(config.resepsiDate || "");
            setResepsiTime(config.resepsiTime || "");
            setResepsiVenue(config.resepsiVenue || "");
            setResepsiAddress(config.resepsiAddress || "");
            setResepsiMapsUrl(config.resepsiMapsUrl || "");
            setMusicUrl(config.musicUrl || "");
            setTheme(config.theme || "sage");
            setHeroImage(config.heroImage || "");
            setGroomImage(config.groomImage || "");
            setBrideImage(config.brideImage || "");
            setCoupleImage(config.coupleImage || "");
            setShowLoveStory(config.showLoveStory !== false);
            setShowGiftInfo(config.showGiftInfo !== false);
            setShowRsvp(config.showRsvp !== false);
            setShowGallery(config.showGallery !== false);
            setShowAkad(config.showAkad !== false);
            setShowResepsi(config.showResepsi !== false);

            try {
              const gallery = JSON.parse(config.galleryImages || "[]");
              setGalleryImagesText(Array.isArray(gallery) ? gallery.join("\n") : "");
            } catch (e) {
              setGalleryImagesText("");
            }

            try {
              setLoveStory(JSON.parse(config.loveStory || "[]"));
            } catch (e) {
              setLoveStory([]);
            }

            try {
              setGiftInfo(JSON.parse(config.giftInfo || "[]"));
            } catch (e) {
              setGiftInfo([]);
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldSetter: (url: string) => void,
    fieldName: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(fieldName);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.url) {
          fieldSetter(data.url);
        } else {
          alert("Gagal mengunggah gambar: " + (data.error || "Format tidak didukung"));
        }
      } else {
        alert("Gagal mengunggah gambar.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengunggah.");
    } finally {
      setUploadingField(null);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField("gallery");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.url) {
          setGalleryImagesText((prev) => (prev ? `${prev}\n${data.url}` : data.url));
        } else {
          alert("Gagal mengunggah gambar: " + (data.error || "Format tidak didukung"));
        }
      } else {
        alert("Gagal mengunggah gambar.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengunggah.");
    } finally {
      setUploadingField(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groomName,
          groomNickname,
          groomParents,
          brideName,
          brideNickname,
          brideParents,
          akadDate,
          akadTime,
          akadVenue,
          akadAddress,
          akadMapsUrl,
          resepsiDate,
          resepsiTime,
          resepsiVenue,
          resepsiAddress,
          resepsiMapsUrl,
          musicUrl,
          theme,
          heroImage,
          groomImage,
          brideImage,
          coupleImage,
          galleryImages: JSON.stringify(
            galleryImagesText
              .split("\n")
              .map((url) => url.trim())
              .filter(Boolean)
          ),
          loveStory: JSON.stringify(loveStory),
          giftInfo: JSON.stringify(giftInfo),
          showLoveStory,
          showGiftInfo,
          showRsvp,
          showGallery,
          showAkad,
          showResepsi,
        }),
      });

      if (res.ok) {
        setMessage("Pengaturan berhasil disimpan!");
      } else {
        setMessage("Gagal menyimpan pengaturan.");
      }
    } catch (e) {
      console.error(e);
      setMessage("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  // Love Story Handlers
  const addStoryItem = () => {
    setLoveStory([...loveStory, { year: "", title: "", description: "" }]);
  };

  const removeStoryItem = (index: number) => {
    setLoveStory(loveStory.filter((_, i) => i !== index));
  };

  const updateStoryItem = (index: number, field: keyof LoveStoryItem, value: string) => {
    const updated = [...loveStory];
    updated[index][field] = value;
    setLoveStory(updated);
  };

  // Gift Account Handlers
  const addGiftItem = () => {
    setGiftInfo([...giftInfo, { bankName: "", accountName: "", accountNumber: "" }]);
  };

  const removeGiftItem = (index: number) => {
    setGiftInfo(giftInfo.filter((_, i) => i !== index));
  };

  const updateGiftItem = (index: number, field: keyof GiftAccountItem, value: string) => {
    const updated = [...giftInfo];
    updated[index][field] = value;
    setGiftInfo(updated);
  };

  if (loading) {
    return <p style={{ color: "var(--admin-text-sub)" }}>Memuat pengaturan...</p>;
  }

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-title">Pengaturan Pernikahan</h1>
        <p style={{ color: "var(--admin-text-sub)", fontSize: "0.95rem" }}>
          Kustomisasi informasi acara, kisah cinta, dan rekening kado digital di sini.
        </p>
      </div>

      <form onSubmit={handleSave}>
        {/* Mempelai Pria */}
        <div className="admin-card">
          <h2 className="card-title">Profil Mempelai Pria</h2>
          
          <div className="admin-grid-2">
            <div className="admin-input-group">
              <label className="admin-input-label">Nama Lengkap</label>
              <input
                type="text"
                className="admin-input"
                value={groomName}
                onChange={(e) => setGroomName(e.target.value)}
                required
              />
            </div>
            
            <div className="admin-input-group">
              <label className="admin-input-label">Nama Panggilan</label>
              <input
                type="text"
                className="admin-input"
                value={groomNickname}
                onChange={(e) => setGroomNickname(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="admin-input-group">
            <label className="admin-input-label">Nama Orang Tua &amp; Keterangan</label>
            <input
              type="text"
              className="admin-input"
              value={groomParents}
              onChange={(e) => setGroomParents(e.target.value)}
              placeholder="Contoh: Putra Pertama dari Bapak Ansori &amp; Ibu Ansori"
              required
            />
          </div>
        </div>

        {/* Mempelai Wanita */}
        <div className="admin-card">
          <h2 className="card-title">Profil Mempelai Wanita</h2>
          
          <div className="admin-grid-2">
            <div className="admin-input-group">
              <label className="admin-input-label">Nama Lengkap</label>
              <input
                type="text"
                className="admin-input"
                value={brideName}
                onChange={(e) => setBrideName(e.target.value)}
                required
              />
            </div>
            
            <div className="admin-input-group">
              <label className="admin-input-label">Nama Panggilan</label>
              <input
                type="text"
                className="admin-input"
                value={brideNickname}
                onChange={(e) => setBrideNickname(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="admin-input-group">
            <label className="admin-input-label">Nama Orang Tua &amp; Keterangan</label>
            <input
              type="text"
              className="admin-input"
              value={brideParents}
              onChange={(e) => setBrideParents(e.target.value)}
              placeholder="Contoh: Putri Kedua dari Bapak Arif &amp; Ibu Arif"
              required
            />
          </div>
        </div>

        {/* Acara Akad */}
        <div className="admin-card">
          <h2 className="card-title">Jadwal &amp; Lokasi Akad</h2>
          
          <div className="admin-grid-2">
            <div className="admin-input-group">
              <label className="admin-input-label">Tanggal Akad</label>
              <input
                type="date"
                className="admin-input"
                value={akadDate}
                onChange={(e) => setAkadDate(e.target.value)}
                required
              />
            </div>
            
            <div className="admin-input-group">
              <label className="admin-input-label">Waktu / Jam Akad</label>
              <input
                type="text"
                className="admin-input"
                value={akadTime}
                onChange={(e) => setAkadTime(e.target.value)}
                placeholder="Contoh: 08:00 - 10:00 WIB"
                required
              />
            </div>
          </div>

          <div className="admin-input-group">
            <label className="admin-input-label">Nama Tempat / Venue</label>
            <input
              type="text"
              className="admin-input"
              value={akadVenue}
              onChange={(e) => setAkadVenue(e.target.value)}
              placeholder="Contoh: Masjid Agung Al-Hikmah"
              required
            />
          </div>

          <div className="admin-input-group">
            <label className="admin-input-label">Alamat Lengkap</label>
            <input
              type="text"
              className="admin-input"
              value={akadAddress}
              onChange={(e) => setAkadAddress(e.target.value)}
              required
            />
          </div>

          <div className="admin-input-group">
            <label className="admin-input-label">Tautan Google Maps</label>
            <input
              type="text"
              className="admin-input"
              value={akadMapsUrl}
              onChange={(e) => setAkadMapsUrl(e.target.value)}
              placeholder="https://maps.app.goo.gl/..."
            />
          </div>
        </div>

        {/* Acara Resepsi */}
        <div className="admin-card">
          <h2 className="card-title">Jadwal &amp; Lokasi Resepsi</h2>
          
          <div className="admin-grid-2">
            <div className="admin-input-group">
              <label className="admin-input-label">Tanggal Resepsi</label>
              <input
                type="date"
                className="admin-input"
                value={resepsiDate}
                onChange={(e) => setResepsiDate(e.target.value)}
                required
              />
            </div>
            
            <div className="admin-input-group">
              <label className="admin-input-label">Waktu / Jam Resepsi</label>
              <input
                type="text"
                className="admin-input"
                value={resepsiTime}
                onChange={(e) => setResepsiTime(e.target.value)}
                placeholder="Contoh: 11:00 - 14:00 WIB"
                required
              />
            </div>
          </div>

          <div className="admin-input-group">
            <label className="admin-input-label">Nama Tempat / Venue</label>
            <input
              type="text"
              className="admin-input"
              value={resepsiVenue}
              onChange={(e) => setResepsiVenue(e.target.value)}
              placeholder="Contoh: Gedung Pertemuan Sasana Kriya"
              required
            />
          </div>

          <div className="admin-input-group">
            <label className="admin-input-label">Alamat Lengkap</label>
            <input
              type="text"
              className="admin-input"
              value={resepsiAddress}
              onChange={(e) => setResepsiAddress(e.target.value)}
              required
            />
          </div>

          <div className="admin-input-group">
            <label className="admin-input-label">Tautan Google Maps</label>
            <input
              type="text"
              className="admin-input"
              value={resepsiMapsUrl}
              onChange={(e) => setResepsiMapsUrl(e.target.value)}
              placeholder="https://maps.app.goo.gl/..."
            />
          </div>
        </div>

        {/* Love Story Timeline */}
        <div className="admin-card">
          <div className="card-title">
            <span>Kisah Cinta (Timeline)</span>
            <button type="button" className="admin-btn" onClick={addStoryItem}>
              + Tambah Cerita
            </button>
          </div>

          {loveStory.length === 0 ? (
            <p style={{ color: "var(--admin-text-sub)", fontStyle: "italic" }}>
              Belum ada item kisah cinta.
            </p>
          ) : (
            loveStory.map((item, idx) => (
              <div key={idx} className="admin-form-block">
                <button
                  type="button"
                  className="admin-block-delete-btn"
                  onClick={() => removeStoryItem(idx)}
                >
                  Hapus Item
                </button>
                
                <div className="admin-grid-timeline">
                  <div className="admin-input-group">
                    <label className="admin-input-label">Tahun</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={item.year}
                      onChange={(e) => updateStoryItem(idx, "year", e.target.value)}
                      placeholder="2020"
                      required
                    />
                  </div>
                  <div className="admin-input-group">
                    <label className="admin-input-label">Judul Momen</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={item.title}
                      onChange={(e) => updateStoryItem(idx, "title", e.target.value)}
                      placeholder="Momen pertama berteman"
                      required
                    />
                  </div>
                </div>
                <div className="admin-input-group">
                  <label className="admin-input-label">Deskripsi Cerita</label>
                  <textarea
                    className="admin-input"
                    rows={2}
                    value={item.description}
                    onChange={(e) => updateStoryItem(idx, "description", e.target.value)}
                    placeholder="Tulis cerita lengkap mengenai momen ini..."
                    required
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Gift Accounts */}
        <div className="admin-card">
          <div className="card-title">
            <span>Rekening Kado Digital</span>
            <button type="button" className="admin-btn" onClick={addGiftItem}>
              + Tambah Rekening
            </button>
          </div>

          {giftInfo.length === 0 ? (
            <p style={{ color: "var(--admin-text-sub)", fontStyle: "italic" }}>
              Belum ada item rekening terdaftar.
            </p>
          ) : (
            giftInfo.map((item, idx) => (
              <div key={idx} className="admin-form-block">
                <button
                  type="button"
                  className="admin-block-delete-btn"
                  onClick={() => removeGiftItem(idx)}
                >
                  Hapus Rekening
                </button>
                
                <div className="admin-grid-3">
                  <div className="admin-input-group">
                    <label className="admin-input-label">Nama Bank</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={item.bankName}
                      onChange={(e) => updateGiftItem(idx, "bankName", e.target.value)}
                      placeholder="BCA, Mandiri, dll."
                      required
                    />
                  </div>
                  <div className="admin-input-group">
                    <label className="admin-input-label">Nama Pemilik Rekening</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={item.accountName}
                      onChange={(e) => updateGiftItem(idx, "accountName", e.target.value)}
                      placeholder="a.n. Daffa"
                      required
                    />
                  </div>
                  <div className="admin-input-group">
                    <label className="admin-input-label">Nomor Rekening</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={item.accountNumber}
                      onChange={(e) => updateGiftItem(idx, "accountNumber", e.target.value)}
                      placeholder="123456789"
                      required
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pilihan Tema Desain */}
        <div className="admin-card">
          <h2 className="card-title">Kustomisasi Tema Desain</h2>
          
          <div className="admin-input-group">
            <label className="admin-input-label">Pilih Warna Tema</label>
            <select
              className="admin-input"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="sage">Sage Green &amp; Cream (Elegant &amp; Natural)</option>
              <option value="blue">Royal Blue &amp; Ice Blue (Cool &amp; Royal)</option>
              <option value="pink">Rose Pink &amp; Blush (Romantic &amp; Warm)</option>
              <option value="gold">Luxury Gold &amp; Ivory (Glamorous &amp; Premium)</option>
              <option value="purple">Lavender &amp; Violet (Elegant &amp; Romantic)</option>
              <option value="emerald">Emerald Green &amp; Gold (Premium &amp; Natural)</option>
              <option value="burgundy">Burgundy &amp; Rose Gold (Classic &amp; Deep)</option>
              <option value="dark">Charcoal &amp; Gold (Modern &amp; Luxury)</option>
              <option value="green-pink">Green &amp; Rose Pink (Organic &amp; Romance)</option>
            </select>
          </div>

          <div style={{ marginTop: "15px" }}>
            <p className="admin-input-label" style={{ marginBottom: "8px" }}>Pratinjau Palet Warna:</p>
            <div className="admin-flex-row">
              <div className="admin-color-preview-item">
                <span className="admin-color-dot" style={{ backgroundColor: "#A8BBA0" }}></span>
                <span className="admin-color-dot" style={{ backgroundColor: "#FFFBF5" }}></span>
                <span style={{ fontSize: "0.85rem", color: "var(--admin-text)" }}>Sage Green</span>
              </div>
              <div className="admin-color-preview-item">
                <span className="admin-color-dot" style={{ backgroundColor: "#8DA9C4" }}></span>
                <span className="admin-color-dot" style={{ backgroundColor: "#F4F8FA" }}></span>
                <span style={{ fontSize: "0.85rem", color: "var(--admin-text)" }}>Royal Blue</span>
              </div>
              <div className="admin-color-preview-item">
                <span className="admin-color-dot" style={{ backgroundColor: "#E8A598" }}></span>
                <span className="admin-color-dot" style={{ backgroundColor: "#FFF5F6" }}></span>
                <span style={{ fontSize: "0.85rem", color: "var(--admin-text)" }}>Rose Pink</span>
              </div>
              <div className="admin-color-preview-item">
                <span className="admin-color-dot" style={{ backgroundColor: "#D4AF37" }}></span>
                <span className="admin-color-dot" style={{ backgroundColor: "#FCFAF2" }}></span>
                <span style={{ fontSize: "0.85rem", color: "var(--admin-text)" }}>Luxury Gold</span>
              </div>
              <div className="admin-color-preview-item">
                <span className="admin-color-dot" style={{ backgroundColor: "#A78BFA" }}></span>
                <span className="admin-color-dot" style={{ backgroundColor: "#FAF8FC" }}></span>
                <span style={{ fontSize: "0.85rem", color: "var(--admin-text)" }}>Lavender Purple</span>
              </div>
              <div className="admin-color-preview-item">
                <span className="admin-color-dot" style={{ backgroundColor: "#34D399" }}></span>
                <span className="admin-color-dot" style={{ backgroundColor: "#F7FAF7" }}></span>
                <span style={{ fontSize: "0.85rem", color: "var(--admin-text)" }}>Emerald Green</span>
              </div>
              <div className="admin-color-preview-item">
                <span className="admin-color-dot" style={{ backgroundColor: "#D97706" }}></span>
                <span className="admin-color-dot" style={{ backgroundColor: "#FAF5F5" }}></span>
                <span style={{ fontSize: "0.85rem", color: "var(--admin-text)" }}>Burgundy</span>
              </div>
              <div className="admin-color-preview-item">
                <span className="admin-color-dot" style={{ backgroundColor: "#4E5C47" }}></span>
                <span className="admin-color-dot" style={{ backgroundColor: "#1A1D20" }}></span>
                <span style={{ fontSize: "0.85rem", color: "var(--admin-text)" }}>Charcoal Dark</span>
              </div>
              <div className="admin-color-preview-item">
                <span className="admin-color-dot" style={{ backgroundColor: "#A8BBA0" }}></span>
                <span className="admin-color-dot" style={{ backgroundColor: "#E8A598" }}></span>
                <span style={{ fontSize: "0.85rem", color: "var(--admin-text)" }}>Green &amp; Pink</span>
              </div>
            </div>
          </div>
        </div>

        {/* Kustomisasi Foto & Galeri */}
        <div className="admin-card">
          <h2 className="card-title">Kustomisasi Foto &amp; Galeri</h2>
          <p style={{ color: "var(--admin-text-sub)", fontSize: "0.85rem", marginBottom: "15px" }}>
            Masukkan tautan URL eksternal gambar Anda (misal dari Google Drive, Imgur, Unsplash, dll) atau unggah langsung berkas gambar dari komputer Anda.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div className="admin-input-group">
              <label className="admin-input-label">Tautan Foto Hero / Cover Utama</label>
              <input
                type="text"
                className="admin-input"
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
                placeholder="https://tautan-gambar-anda.com/hero.jpg"
                style={{ marginBottom: "10px" }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, setHeroImage, "hero")}
                  style={{ display: "none" }}
                  id="upload-hero"
                />
                <label
                  htmlFor="upload-hero"
                  className="admin-btn"
                  style={{ padding: "6px 12px", fontSize: "0.8rem", cursor: "pointer", display: "inline-block" }}
                >
                  {uploadingField === "hero" ? "Mengunggah..." : "Unggah Foto Hero"}
                </label>
                {heroImage && (
                  <span style={{ fontSize: "0.8rem", color: "var(--admin-primary)" }}>✓ Tersedia</span>
                )}
              </div>
            </div>
            
            <div className="admin-input-group">
              <label className="admin-input-label">Tautan Foto Pasangan (Couple)</label>
              <input
                type="text"
                className="admin-input"
                value={coupleImage}
                onChange={(e) => setCoupleImage(e.target.value)}
                placeholder="https://tautan-gambar-anda.com/couple.jpg"
                style={{ marginBottom: "10px" }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, setCoupleImage, "couple")}
                  style={{ display: "none" }}
                  id="upload-couple"
                />
                <label
                  htmlFor="upload-couple"
                  className="admin-btn"
                  style={{ padding: "6px 12px", fontSize: "0.8rem", cursor: "pointer", display: "inline-block" }}
                >
                  {uploadingField === "couple" ? "Mengunggah..." : "Unggah Foto Pasangan"}
                </label>
                {coupleImage && (
                  <span style={{ fontSize: "0.8rem", color: "var(--admin-primary)" }}>✓ Tersedia</span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div className="admin-input-group">
              <label className="admin-input-label">Tautan Foto Mempelai Pria</label>
              <input
                type="text"
                className="admin-input"
                value={groomImage}
                onChange={(e) => setGroomImage(e.target.value)}
                placeholder="https://tautan-gambar-anda.com/groom.jpg"
                style={{ marginBottom: "10px" }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, setGroomImage, "groom")}
                  style={{ display: "none" }}
                  id="upload-groom"
                />
                <label
                  htmlFor="upload-groom"
                  className="admin-btn"
                  style={{ padding: "6px 12px", fontSize: "0.8rem", cursor: "pointer", display: "inline-block" }}
                >
                  {uploadingField === "groom" ? "Mengunggah..." : "Unggah Foto Mempelai Pria"}
                </label>
                {groomImage && (
                  <span style={{ fontSize: "0.8rem", color: "var(--admin-primary)" }}>✓ Tersedia</span>
                )}
              </div>
            </div>

            <div className="admin-input-group">
              <label className="admin-input-label">Tautan Foto Mempelai Wanita</label>
              <input
                type="text"
                className="admin-input"
                value={brideImage}
                onChange={(e) => setBrideImage(e.target.value)}
                placeholder="https://tautan-gambar-anda.com/bride.jpg"
                style={{ marginBottom: "10px" }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, setBrideImage, "bride")}
                  style={{ display: "none" }}
                  id="upload-bride"
                />
                <label
                  htmlFor="upload-bride"
                  className="admin-btn"
                  style={{ padding: "6px 12px", fontSize: "0.8rem", cursor: "pointer", display: "inline-block" }}
                >
                  {uploadingField === "bride" ? "Mengunggah..." : "Unggah Foto Mempelai Wanita"}
                </label>
                {brideImage && (
                  <span style={{ fontSize: "0.8rem", color: "var(--admin-primary)" }}>✓ Tersedia</span>
                )}
              </div>
            </div>
          </div>

          <div className="admin-input-group" style={{ marginBottom: "0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label className="admin-input-label" style={{ margin: 0 }}>Tautan Galeri Foto (Satu URL per baris)</label>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryUpload}
                  style={{ display: "none" }}
                  id="upload-gallery"
                />
                <label
                  htmlFor="upload-gallery"
                  className="admin-btn"
                  style={{ padding: "4px 10px", fontSize: "0.75rem", cursor: "pointer" }}
                >
                  {uploadingField === "gallery" ? "Mengunggah..." : "+ Unggah Foto Ke Galeri"}
                </label>
              </div>
            </div>
            <textarea
              className="admin-input"
              rows={4}
              value={galleryImagesText}
              onChange={(e) => setGalleryImagesText(e.target.value)}
              placeholder="https://tautan-gambar-anda.com/galeri1.jpg&#10;https://tautan-gambar-anda.com/galeri2.jpg"
            />
          </div>
        </div>

        {/* Visibilitas Bagian Undangan */}
        <div className="admin-card">
          <h2 className="card-title">Visibilitas Bagian Undangan</h2>
          <p style={{ color: "var(--admin-text-sub)", fontSize: "0.85rem", marginBottom: "15px" }}>
            Pilih bagian (section) undangan mana saja yang ingin ditampilkan ke tamu.
          </p>

          <div className="admin-grid-2" style={{ gap: "15px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                id="toggle-story"
                checked={showLoveStory}
                onChange={(e) => setShowLoveStory(e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <label htmlFor="toggle-story" style={{ fontSize: "0.95rem", cursor: "pointer", userSelect: "none" }}>Tampilkan Kisah Cinta (Timeline)</label>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                id="toggle-gallery"
                checked={showGallery}
                onChange={(e) => setShowGallery(e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <label htmlFor="toggle-gallery" style={{ fontSize: "0.95rem", cursor: "pointer", userSelect: "none" }}>Tampilkan Galeri Foto</label>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                id="toggle-gift"
                checked={showGiftInfo}
                onChange={(e) => setShowGiftInfo(e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <label htmlFor="toggle-gift" style={{ fontSize: "0.95rem", cursor: "pointer", userSelect: "none" }}>Tampilkan Rekening Kado Digital</label>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                id="toggle-rsvp"
                checked={showRsvp}
                onChange={(e) => setShowRsvp(e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <label htmlFor="toggle-rsvp" style={{ fontSize: "0.95rem", cursor: "pointer", userSelect: "none" }}>Tampilkan Form RSVP Konfirmasi Kehadiran</label>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                id="toggle-akad"
                checked={showAkad}
                onChange={(e) => setShowAkad(e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <label htmlFor="toggle-akad" style={{ fontSize: "0.95rem", cursor: "pointer", userSelect: "none" }}>Tampilkan Jadwal Akad</label>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                id="toggle-resepsi"
                checked={showResepsi}
                onChange={(e) => setShowResepsi(e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <label htmlFor="toggle-resepsi" style={{ fontSize: "0.95rem", cursor: "pointer", userSelect: "none" }}>Tampilkan Jadwal Resepsi</label>
            </div>
          </div>
        </div>

        {/* Background Music */}
        <div className="admin-card">
          <h2 className="card-title">Musik Latar Belakang (MP3)</h2>
          <div className="admin-input-group">
            <label className="admin-input-label">URL Berkas Musik (.mp3)</label>
            <input
              type="text"
              className="admin-input"
              value={musicUrl}
              onChange={(e) => setMusicUrl(e.target.value)}
              placeholder="https://tautan-musik.com/lagu-nikah.mp3"
            />
            <p style={{ fontSize: "0.75rem", color: "var(--admin-text-sub)", marginTop: "4px" }}>
              *Biarkan kosong untuk menggunakan lagu instrumen romantis bawaan sistem.
            </p>
          </div>
        </div>

        {/* Save Bar */}
        <div className="admin-form-actions">
          {message && (
            <span className={`admin-save-msg ${message.includes("berhasil") ? "success" : "error"}`}>
              {message}
            </span>
          )}
          <button type="submit" className="admin-btn" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Semua Pengaturan"}
          </button>
        </div>
      </form>
    </div>
  );
}
