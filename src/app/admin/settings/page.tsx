"use client";

import React, { useEffect, useState } from "react";
import "@/styles/admin.css";
import { useAdminTheme } from "../layout";

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

/**
 * Visual tokens mirroring each design style pack in src/styles/invitation.css.
 * Kept in sync manually so the admin can preview a design without importing
 * the invitation stylesheet (its rules are scoped to .invitation-body).
 */
const DESIGNS = [
  {
    key: "classic",
    name: "Klasik Sage",
    note: "Sage & krem dengan sentuhan floral (tampilan saat ini).",
    bg: "#FFFBF5",
    surface: "#F7EFE5",
    titleFont: "var(--font-playfair), Georgia, serif",
    bodyFont: "var(--font-lora), Georgia, serif",
    titleColor: "#2F362E",
    textColor: "#555E53",
    accent: "#C9A96E",
    primary: "#A8BBA0",
    radius: "12px",
    pill: "9999px",
    ornament: "floral",
    titleScale: 1,
    upper: false,
  },
  {
    key: "romantic",
    name: "Romantis Rose",
    note: "Rose lembut, judul dengan huruf tulisan tangan, sudut membulat.",
    bg: "#FFF6F7",
    surface: "#FCE7EA",
    titleFont: "var(--font-great-vibes), cursive",
    bodyFont: "var(--font-lora), Georgia, serif",
    titleColor: "#4A2A34",
    textColor: "#74505C",
    accent: "#E39BAE",
    primary: "#E39BAE",
    radius: "20px",
    pill: "9999px",
    ornament: "floral",
    titleScale: 1.45,
    upper: false,
  },
  {
    key: "luxury",
    name: "Mewah Emas",
    note: "Ivory & emas, serif elegan, sudut tegas dan mewah.",
    bg: "#FCFAF3",
    surface: "#F3ECD9",
    titleFont: "var(--font-cormorant), Georgia, serif",
    bodyFont: "var(--font-lora), Georgia, serif",
    titleColor: "#3A3116",
    textColor: "#6A5C33",
    accent: "#B8912E",
    primary: "#C4A24C",
    radius: "2px",
    pill: "2px",
    ornament: "gold",
    titleScale: 1.12,
    upper: false,
  },
  {
    key: "minimalist",
    name: "Minimalis",
    note: "Netral bersih, tanpa ornamen, huruf sans-serif modern.",
    bg: "#FAFAFA",
    surface: "#F0F1F2",
    titleFont: "var(--font-poppins), system-ui, sans-serif",
    bodyFont: "var(--font-poppins), system-ui, sans-serif",
    titleColor: "#1F2937",
    textColor: "#4B5563",
    accent: "#9CA3AF",
    primary: "#4B5563",
    radius: "4px",
    pill: "4px",
    ornament: "none",
    titleScale: 0.88,
    upper: false,
  },
  {
    key: "royal",
    name: "Royal Navy",
    note: "Navy pekat & emas, huruf kapital Romawi, sangat formal.",
    bg: "#F6F7FA",
    surface: "#E7EAF2",
    titleFont: "var(--font-cinzel), Georgia, serif",
    bodyFont: "var(--font-lora), Georgia, serif",
    titleColor: "#101F35",
    textColor: "#33465F",
    accent: "#C9A227",
    primary: "#1E3A5F",
    radius: "2px",
    pill: "2px",
    ornament: "gold",
    titleScale: 0.72,
    upper: true,
  },
  {
    key: "rustic",
    name: "Rustic Terracotta",
    note: "Nuansa tanah hangat, kesan kertas kraft, ornamen lembut.",
    bg: "#FBF6EE",
    surface: "#F0E4D3",
    titleFont: "var(--font-playfair), Georgia, serif",
    bodyFont: "var(--font-lora), Georgia, serif",
    titleColor: "#3D2A1B",
    textColor: "#6A5340",
    accent: "#C98A3F",
    primary: "#B5714A",
    radius: "8px",
    pill: "9999px",
    ornament: "floral",
    titleScale: 0.95,
    upper: false,
  },
  {
    key: "modern",
    name: "Modern Editorial",
    note: "Monokrom tegas, huruf kapital tebal, tanpa ornamen.",
    bg: "#FFFFFF",
    surface: "#F2F2F2",
    titleFont: "var(--font-montserrat), system-ui, sans-serif",
    bodyFont: "var(--font-montserrat), system-ui, sans-serif",
    titleColor: "#111111",
    textColor: "#444444",
    accent: "#C05621",
    primary: "#111111",
    radius: "0px",
    pill: "0px",
    ornament: "none",
    titleScale: 0.92,
    upper: true,
  },
  {
    key: "tropical",
    name: "Tropis",
    note: "Hijau teal & daun palem, segar dan lapang.",
    bg: "#F4FBF8",
    surface: "#E1F1EA",
    titleFont: "var(--font-playfair), Georgia, serif",
    bodyFont: "var(--font-lora), Georgia, serif",
    titleColor: "#0F3B2E",
    textColor: "#3B6357",
    accent: "#E0A458",
    primary: "#2E9C86",
    radius: "16px",
    pill: "9999px",
    ornament: "floral",
    titleScale: 1,
    upper: false,
  },
] as const;

/**
 * Colour palettes mirroring the theme-* blocks in invitation.css.
 * "auto" is not a real theme class — it means "use the design's own
 * bundled palette", so the invitation renders without a theme-* class.
 */
const THEMES = [
  { key: "auto", label: "Ikuti Warna Desain (Otomatis)", primary: "", accent: "", bg: "", surface: "", titleColor: "", textColor: "" },
  { key: "sage", label: "Sage Green & Cream (Elegant & Natural)", primary: "#A8BBA0", accent: "#C9A96E", bg: "#FFFBF5", surface: "#F7EFE5", titleColor: "#2F362E", textColor: "#555E53" },
  { key: "blue", label: "Royal Blue & Ice Blue (Cool & Royal)", primary: "#8DA9C4", accent: "#D4AF37", bg: "#F4F8FA", surface: "#E6EEF2", titleColor: "#1E2530", textColor: "#455268" },
  { key: "pink", label: "Rose Pink & Blush (Romantic & Warm)", primary: "#E8A598", accent: "#C9A96E", bg: "#FFF5F6", surface: "#FDE8EA", titleColor: "#3D2D2D", textColor: "#6E5353" },
  { key: "gold", label: "Luxury Gold & Ivory (Glamorous & Premium)", primary: "#D4AF37", accent: "#AA8B13", bg: "#FCFAF2", surface: "#F4EED8", titleColor: "#3B331A", textColor: "#6B5C30" },
  { key: "purple", label: "Lavender & Violet (Elegant & Romantic)", primary: "#A78BFA", accent: "#D97706", bg: "#FAF8FC", surface: "#F0EAF5", titleColor: "#2E1065", textColor: "#5B21B6" },
  { key: "emerald", label: "Emerald Green & Gold (Premium & Natural)", primary: "#34D399", accent: "#D4AF37", bg: "#F7FAF7", surface: "#E8EFE9", titleColor: "#022C22", textColor: "#065F46" },
  { key: "burgundy", label: "Burgundy & Rose Gold (Classic & Deep)", primary: "#D97706", accent: "#C9A96E", bg: "#FAF5F5", surface: "#F5E6E6", titleColor: "#300008", textColor: "#540010" },
  { key: "dark", label: "Charcoal & Gold (Modern & Luxury)", primary: "#4E5C47", accent: "#D4AF37", bg: "#1A1D20", surface: "#24292E", titleColor: "#FCFAF2", textColor: "#E2E8F0" },
  { key: "green-pink", label: "Green & Rose Pink (Organic & Romance)", primary: "#A8BBA0", accent: "#E8A598", bg: "#F7FAF6", surface: "#F2EAE9", titleColor: "#2F362E", textColor: "#6E5353" },
  { key: "rose-green", label: "Rose & Sage Green (Soft & Elegant)", primary: "#C98B92", accent: "#8FA98A", bg: "#FFF7F6", surface: "#F3E7E4", titleColor: "#43302F", textColor: "#6B5150" },
  { key: "pink-green", label: "Pink & Fresh Green (Playful & Bright)", primary: "#E79EBB", accent: "#79A86F", bg: "#FDF7FA", surface: "#F1E8EE", titleColor: "#3B2E38", textColor: "#5F4E5A" },
] as const;

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  // Form states
  const [groomName, setGroomName] = useState("");
  const [groomNickname, setGroomNickname] = useState("");
  const [groomParents, setGroomParents] = useState("");
  const [brideName, setBrideName] = useState("");
  const [brideNickname, setBrideNickname] = useState("");
  const [brideParents, setBrideParents] = useState("");

  // Akad
  const [akadTitle, setAkadTitle] = useState("");
  const [akadDate, setAkadDate] = useState("");
  const [akadTime, setAkadTime] = useState("");
  const [akadVenue, setAkadVenue] = useState("");
  const [akadAddress, setAkadAddress] = useState("");
  const [akadMapsUrl, setAkadMapsUrl] = useState("");

  // Resepsi
  const [resepsiTitle, setResepsiTitle] = useState("");
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
  const [design, setDesign] = useState("classic");
  const [heroImage, setHeroImage] = useState("");
  const [groomImage, setGroomImage] = useState("");
  const [brideImage, setBrideImage] = useState("");
  const [coupleImage, setCoupleImage] = useState("");
  const [galleryImagesText, setGalleryImagesText] = useState("");
  const [groomImagePosition, setGroomImagePosition] = useState("center");
  const [brideImagePosition, setBrideImagePosition] = useState("center");
  const [heroImagePosition, setHeroImagePosition] = useState("center");

  // Section Visibility Toggles
  const [showLoveStory, setShowLoveStory] = useState(true);
  const [showGiftInfo, setShowGiftInfo] = useState(true);
  const [showRsvp, setShowRsvp] = useState(true);
  const [showGallery, setShowGallery] = useState(true);
  const [showAkad, setShowAkad] = useState(true);
  const [showResepsi, setShowResepsi] = useState(true);
  const [whatsappTemplate, setWhatsappTemplate] = useState("");

  // Upload States
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.role === "super_admin") setIsSuperAdmin(true);
      })
      .catch(() => {})
      .finally(() => setCheckingRole(false));
  }, []);

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
            setAkadTitle(config.akadTitle || "");
            setAkadDate(config.akadDate || "");
            setAkadTime(config.akadTime || "");
            setAkadVenue(config.akadVenue || "");
            setAkadAddress(config.akadAddress || "");
            setAkadMapsUrl(config.akadMapsUrl || "");
            setResepsiTitle(config.resepsiTitle || "");
            setResepsiDate(config.resepsiDate || "");
            setResepsiTime(config.resepsiTime || "");
            setResepsiVenue(config.resepsiVenue || "");
            setResepsiAddress(config.resepsiAddress || "");
            setResepsiMapsUrl(config.resepsiMapsUrl || "");
            setMusicUrl(config.musicUrl || "");
            setTheme(config.theme || "sage");
            setDesign(config.design || "classic");
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
            setWhatsappTemplate(config.whatsappTemplate || "");
            setGroomImagePosition(config.groomImagePosition || "center");
            setBrideImagePosition(config.brideImagePosition || "center");
            setHeroImagePosition(config.heroImagePosition || "center");

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
          akadTitle,
          akadDate,
          akadTime,
          akadVenue,
          akadAddress,
          akadMapsUrl,
          resepsiTitle,
          resepsiDate,
          resepsiTime,
          resepsiVenue,
          resepsiAddress,
          resepsiMapsUrl,
          musicUrl,
          theme,
          design,
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
          whatsappTemplate,
          groomImagePosition,
          brideImagePosition,
          heroImagePosition,
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

  if (loading || checkingRole) {
    return <p style={{ color: "var(--admin-text-sub)" }}>Memuat pengaturan...</p>;
  }

  if (isSuperAdmin) {
    return (
      <div>
        <div className="admin-header">
          <h1 className="admin-title">Pengaturan Acara</h1>
        </div>
        <div className="admin-card">
          <p style={{ color: "var(--admin-text-sub)" }}>
            Super admin tidak memiliki undangan sendiri dan tidak dapat mengubah undangan pemilik.
            Gunakan menu <strong>Pengguna</strong> untuk mengelola akun pemilik, atau filter
            <strong> Daftar Tamu</strong> / <strong>Ucapan</strong> untuk melihat data pemilik secara baca-saja.
          </p>
        </div>
      </div>
    );
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

          <div className="admin-input-group">
            <label className="admin-input-label">Judul Acara Akad</label>
            <input
              type="text"
              className="admin-input"
              value={akadTitle}
              onChange={(e) => setAkadTitle(e.target.value)}
              placeholder="Akad Nikah"
            />
          </div>
          
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

          <div className="admin-input-group">
            <label className="admin-input-label">Judul Acara Resepsi</label>
            <input
              type="text"
              className="admin-input"
              value={resepsiTitle}
              onChange={(e) => setResepsiTitle(e.target.value)}
              placeholder="Resepsi Pernikahan"
            />
          </div>
          
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

        {/* Pilihan Desain Undangan */}
        <div className="admin-card">
          <h2 className="card-title">Pilih Desain Undangan</h2>
          <p style={{ color: "var(--admin-text-sub)", fontSize: "0.85rem", marginBottom: "18px" }}>
            Setiap desain memiliki gaya, palet warna, dan huruf tersendiri. Pilih salah satu di
            bawah ini — perubahan langsung diterapkan pada undangan Anda setelah disimpan.
          </p>

          <div className="design-picker">
            {DESIGNS.map((d) => (
              <button
                type="button"
                key={d.key}
                className={`design-card ${design === d.key ? "active" : ""}`}
                onClick={() => setDesign(d.key)}
                aria-pressed={design === d.key}
              >
                <span
                  className="design-card-chip"
                  style={{ backgroundColor: d.bg, borderRadius: d.radius }}
                >
                  <span
                    className="design-card-chip-title"
                    style={{
                      fontFamily: d.titleFont,
                      color: d.titleColor,
                      fontSize: `${1.15 * d.titleScale}rem`,
                    }}
                  >
                    Aa
                  </span>
                  <span className="design-card-chip-dots">
                    <span style={{ backgroundColor: d.primary }} />
                    <span style={{ backgroundColor: d.accent }} />
                    <span style={{ backgroundColor: d.surface }} />
                  </span>
                </span>
                <span className="design-card-name">{d.name}</span>
                {design === d.key && <span className="design-card-check">✓ Dipilih</span>}
              </button>
            ))}
          </div>

          {/* Colour theme — overrides the design's bundled palette */}
          <div className="admin-input-group" style={{ marginTop: "24px" }}>
            <label className="admin-input-label">Pilih Warna Tema</label>
            <div className="admin-select-wrap">
              <select
                className="admin-input"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                {THEMES.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="design-preview-hint" style={{ marginTop: "6px" }}>
              Pilih <strong>Otomatis</strong> agar warna mengikuti desain yang dipilih, atau pilih
              palet sendiri untuk menimpa warna bawaan desain. Huruf dan ornamen tetap mengikuti
              desain.
            </p>
          </div>

          <div style={{ marginTop: "12px" }}>
            <p className="admin-input-label" style={{ marginBottom: "8px" }}>
              Pratinjau Palet Warna:
            </p>
            <div className="admin-flex-row">
              {THEMES.filter((t) => t.key !== "auto").map((t) => (
                <button
                  type="button"
                  key={t.key}
                  onClick={() => setTheme(t.key)}
                  className={`admin-color-preview-item admin-color-pick ${
                    theme === t.key ? "active" : ""
                  }`}
                >
                  <span className="admin-color-dot" style={{ backgroundColor: t.primary }}></span>
                  <span className="admin-color-dot" style={{ backgroundColor: t.bg }}></span>
                  <span style={{ fontSize: "0.85rem", color: "var(--admin-text)" }}>
                    {t.label.split(" (")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Live preview: design supplies the form, theme may override colour */}
          {(() => {
            const d = DESIGNS.find((x) => x.key === design) || DESIGNS[0];
            const t = THEMES.find((x) => x.key === theme);
            // An explicit theme overrides the design's bundled palette; "auto"
            // (or an unknown value) falls back to the design's own colours.
            const useTheme = t && t.key !== "auto";
            const pal = {
              bg: useTheme ? t.bg : d.bg,
              surface: useTheme ? t.surface : d.surface,
              titleColor: useTheme ? t.titleColor : d.titleColor,
              textColor: useTheme ? t.textColor : d.textColor,
              accent: useTheme ? t.accent : d.accent,
              primary: useTheme ? t.primary : d.primary,
            };
            const groom = groomNickname || "Andi";
            const bride = brideNickname || "Sari";
            return (
              <div className="design-preview-wrap">
                <div className="design-preview-head">
                  <span className="admin-input-label">
                    Pratinjau: {d.name}
                    {useTheme ? ` — warna ${t.label.split(" (")[0]}` : " — warna bawaan desain"}
                  </span>
                  <span className="design-preview-hint">{d.note}</span>
                </div>

                <div
                  className="design-preview-stage"
                  style={{
                    backgroundColor: pal.bg,
                    borderRadius: d.radius,
                    fontFamily: d.bodyFont,
                    color: pal.textColor,
                  }}
                >
                  {d.ornament === "floral" && (
                    <>
                      <svg className="design-preview-corner tl" viewBox="0 0 100 100" aria-hidden="true">
                        <path
                          d="M0 0C30 5 60 25 70 50C75 60 70 75 60 80C50 85 35 75 30 60C20 40 5 20 0 0Z"
                          fill={pal.primary}
                          opacity="0.25"
                        />
                        <path
                          d="M0 10C15 25 30 40 32 55C33 60 30 65 25 66C20 67 15 62 13 55C10 45 2 25 0 10Z"
                          fill={pal.accent}
                          opacity="0.3"
                        />
                      </svg>
                      <svg className="design-preview-corner br" viewBox="0 0 100 100" aria-hidden="true">
                        <path
                          d="M0 0C30 5 60 25 70 50C75 60 70 75 60 80C50 85 35 75 30 60C20 40 5 20 0 0Z"
                          fill={pal.primary}
                          opacity="0.25"
                        />
                      </svg>
                    </>
                  )}
                  {d.ornament === "gold" && (
                    <span
                      className="design-preview-frame"
                      style={{ borderColor: pal.accent, borderRadius: d.radius }}
                    />
                  )}

                  <span className="design-preview-eyebrow" style={{ color: pal.textColor }}>
                    The Wedding Of
                  </span>

                  <span
                    className="design-preview-names"
                    style={{
                      fontFamily: d.titleFont,
                      color: pal.titleColor,
                      fontSize: `${2.6 * d.titleScale}rem`,
                      textTransform: d.upper ? "uppercase" : "none",
                      letterSpacing: d.upper ? "2px" : "normal",
                    }}
                  >
                    {groom} &amp; {bride}
                  </span>

                  <span className="design-preview-divider">
                    <span style={{ backgroundColor: pal.accent }} />
                    {d.ornament !== "none" && (
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M12 2C12 2 15 6 15 9C15 12 12 13 12 13C12 13 9 12 9 9C9 6 12 2 12 2Z"
                          fill={pal.primary}
                        />
                        <circle cx="12" cy="15" r="2.5" fill={pal.accent} />
                      </svg>
                    )}
                    <span style={{ backgroundColor: pal.accent }} />
                  </span>

                  <span className="design-preview-date" style={{ color: pal.textColor }}>
                    08 Agustus 2026
                  </span>

                  <span
                    className="design-preview-card"
                    style={{ backgroundColor: pal.surface, borderRadius: d.radius }}
                  >
                    <span
                      className="design-preview-card-title"
                      style={{
                        fontFamily: d.titleFont,
                        color: pal.titleColor,
                        textTransform: d.upper ? "uppercase" : "none",
                      }}
                    >
                      Akad Nikah
                    </span>
                    <span className="design-preview-card-text">
                      Masjid Agung — 09.00 WIB
                    </span>
                  </span>

                  <span
                    className="design-preview-btn"
                    style={{ backgroundColor: pal.primary, borderRadius: d.pill, color: "#FFFFFF" }}
                  >
                    Buka Undangan
                  </span>
                </div>
              </div>
            );
          })()}
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
              <div style={{ marginTop: "12px" }}>
                <label style={{ fontSize: "0.75rem", color: "var(--admin-text-sub)", display: "block", marginBottom: "4px" }}>
                  Fokus Potong Gambar (Crop Alignment)
                </label>
                <div className="admin-select-wrap">
                  <select 
                    className="admin-input admin-input-sm" 
                    value={heroImagePosition} 
                    onChange={(e) => setHeroImagePosition(e.target.value)}
                  >
                    <option value="center">Tengah (Center)</option>
                    <option value="top">Atas (Top)</option>
                    <option value="bottom">Bawah (Bottom)</option>
                    <option value="left">Kiri (Left)</option>
                    <option value="right">Kanan (Right)</option>
                    <option value="center top">Tengah Atas</option>
                    <option value="center bottom">Tengah Bawah</option>
                  </select>
                </div>
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
              <div style={{ marginTop: "12px" }}>
                <label style={{ fontSize: "0.75rem", color: "var(--admin-text-sub)", display: "block", marginBottom: "4px" }}>
                  Fokus Potong Gambar (Crop Alignment)
                </label>
                <div className="admin-select-wrap">
                  <select 
                    className="admin-input admin-input-sm" 
                    value={groomImagePosition} 
                    onChange={(e) => setGroomImagePosition(e.target.value)}
                  >
                    <option value="center">Tengah (Center)</option>
                    <option value="top">Atas (Top)</option>
                    <option value="bottom">Bawah (Bottom)</option>
                    <option value="left">Kiri (Left)</option>
                    <option value="right">Kanan (Right)</option>
                    <option value="center top">Tengah Atas</option>
                    <option value="center bottom">Tengah Bawah</option>
                  </select>
                </div>
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
              <div style={{ marginTop: "12px" }}>
                <label style={{ fontSize: "0.75rem", color: "var(--admin-text-sub)", display: "block", marginBottom: "4px" }}>
                  Fokus Potong Gambar (Crop Alignment)
                </label>
                <div className="admin-select-wrap">
                  <select 
                    className="admin-input admin-input-sm" 
                    value={brideImagePosition} 
                    onChange={(e) => setBrideImagePosition(e.target.value)}
                  >
                    <option value="center">Tengah (Center)</option>
                    <option value="top">Atas (Top)</option>
                    <option value="bottom">Bawah (Bottom)</option>
                    <option value="left">Kiri (Left)</option>
                    <option value="right">Kanan (Right)</option>
                    <option value="center top">Tengah Atas</option>
                    <option value="center bottom">Tengah Bawah</option>
                  </select>
                </div>
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
            <label className="admin-toggle">
              <input
                type="checkbox"
                id="toggle-story"
                checked={showLoveStory}
                onChange={(e) => setShowLoveStory(e.target.checked)}
              />
              <span className="admin-toggle-track"></span>
              Tampilkan Kisah Cinta (Timeline)
            </label>
            
            <label className="admin-toggle">
              <input
                type="checkbox"
                id="toggle-gallery"
                checked={showGallery}
                onChange={(e) => setShowGallery(e.target.checked)}
              />
              <span className="admin-toggle-track"></span>
              Tampilkan Galeri Foto
            </label>

            <label className="admin-toggle">
              <input
                type="checkbox"
                id="toggle-gift"
                checked={showGiftInfo}
                onChange={(e) => setShowGiftInfo(e.target.checked)}
              />
              <span className="admin-toggle-track"></span>
              Tampilkan Rekening Kado Digital
            </label>

            <label className="admin-toggle">
              <input
                type="checkbox"
                id="toggle-rsvp"
                checked={showRsvp}
                onChange={(e) => setShowRsvp(e.target.checked)}
              />
              <span className="admin-toggle-track"></span>
              Tampilkan Form RSVP Konfirmasi Kehadiran
            </label>

            <label className="admin-toggle">
              <input
                type="checkbox"
                id="toggle-akad"
                checked={showAkad}
                onChange={(e) => setShowAkad(e.target.checked)}
              />
              <span className="admin-toggle-track"></span>
              Tampilkan Jadwal Akad
            </label>

            <label className="admin-toggle">
              <input
                type="checkbox"
                id="toggle-resepsi"
                checked={showResepsi}
                onChange={(e) => setShowResepsi(e.target.checked)}
              />
              <span className="admin-toggle-track"></span>
              Tampilkan Jadwal Resepsi
            </label>
          </div>
        </div>

        {/* Kustomisasi WhatsApp Invitation Message */}
        <div className="admin-card">
          <h2 className="card-title">Kustomisasi Pesan Undangan WhatsApp</h2>
          <p style={{ color: "var(--admin-text-sub)", fontSize: "0.85rem", marginBottom: "15px" }}>
            Tulis template pesan WhatsApp untuk mengundang tamu. Anda dapat menggunakan variabel-variabel berikut yang akan diganti secara otomatis:
            <br />
            <strong>{"{{nama}}"}</strong>: Nama Tamu, <strong>{"{{tautan}}"}</strong>: Tautan Undangan, <strong>{"{{pria}}"}</strong>: Panggilan Mempelai Pria, <strong>{"{{wanita}}"}</strong>: Panggilan Mempelai Wanita
          </p>
          <div className="admin-input-group">
            <label className="admin-input-label">Template Pesan WhatsApp</label>
            <textarea
              className="admin-input"
              rows={8}
              value={whatsappTemplate}
              onChange={(e) => setWhatsappTemplate(e.target.value)}
              placeholder={`Halo Bapak/Ibu/Saudara/i *{{nama}}*,

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami, *{{pria}} & {{wanita}}*.

Berikut detail undangan digital dan informasi lengkap mengenai acara kami dapat diakses melalui tautan berikut:
{{tautan}}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu kepada kami.

Terima kasih.`}
            />
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
