"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus, GripVertical, Pencil, Trash2, ExternalLink,
  LogOut, Eye, EyeOff, Globe, Copy, Check, Loader2,
  Palette, User as UserIcon, Link as LinkIcon, ChevronDown,
} from "lucide-react";
import { themes } from "@/lib/themes";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Link {
  _id: string;
  title: string;
  url: string;
  enabled: boolean;
  order: number;
  clicks: number;
}

interface Profile {
  displayName: string;
  bio: string;
  avatarUrl: string;
  themeId: string;
  username: string;
  isPublished: boolean;
}

// ── Sortable Link Item ─────────────────────────────────────────────────────────
function SortableLinkItem({
  link,
  onEdit,
  onDelete,
  onToggle,
}: {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: link._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
        link.enabled
          ? "bg-white/5 border-white/10 hover:border-white/20"
          : "bg-white/[0.02] border-white/5 opacity-60"
      }`}
    >
      {/* Drag handle */}
      <button
        className="text-white/25 hover:text-white/60 cursor-grab active:cursor-grabbing transition-colors flex-shrink-0"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{link.title}</p>
        <p className="text-white/40 text-xs truncate">{link.url}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <label className="toggle" title={link.enabled ? "Disable link" : "Enable link"}>
          <input
            type="checkbox"
            checked={link.enabled}
            onChange={(e) => onToggle(link._id, e.target.checked)}
          />
          <span className="toggle-slider" />
        </label>

        <button
          className="p-1.5 text-white/40 hover:text-white/80 hover:bg-white/8 rounded-lg transition-colors"
          onClick={() => onEdit(link)}
          aria-label="Edit link"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>

        <button
          className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          onClick={() => onDelete(link._id)}
          aria-label="Delete link"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Link Modal ─────────────────────────────────────────────────────────────────
function LinkModal({
  link,
  onClose,
  onSave,
}: {
  link: Link | null;
  onClose: () => void;
  onSave: (data: { title: string; url: string; enabled: boolean }) => Promise<void>;
}) {
  const [title, setTitle] = useState(link?.title ?? "");
  const [url, setUrl] = useState(link?.url ?? "");
  const [enabled, setEnabled] = useState(link?.enabled ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setError("");
    if (!title.trim()) { setError("Title is required"); return; }
    if (!url.trim()) { setError("URL is required"); return; }
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      setError("URL must start with http:// or https://");
      return;
    }
    setSaving(true);
    try {
      await onSave({ title: title.trim(), url: url.trim(), enabled });
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md card animate-fade-in-up z-10">
        <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {link ? "Edit Link" : "Add Link"}
        </h2>

        {error && (
          <p className="text-red-400 text-sm mb-3 p-2 bg-red-400/10 rounded-lg">{error}</p>
        )}

        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Title</label>
            <input
              type="text"
              id="link-title"
              className="input-field"
              placeholder="e.g. My Portfolio"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">URL</label>
            <input
              type="url"
              id="link-url"
              className="input-field"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="toggle">
              <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
              <span className="toggle-slider" />
            </label>
            <span className="text-sm text-white/60">Show on public page</span>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
          <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Saving…" : "Save Link"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"links" | "profile" | "themes">("links");
  const [links, setLinks] = useState<Link[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingLink, setEditingLink] = useState<Link | null | undefined>(undefined); // undefined=closed, null=new
  const [copied, setCopied] = useState(false);

  // Profile form state
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Avatar
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    const [linksRes, profileRes] = await Promise.all([
      fetch("/api/links"),
      fetch("/api/profile"),
    ]);
    const linksData = await linksRes.json();
    const profileData = await profileRes.json();

    setLinks(linksData.links ?? []);
    if (profileData.page) {
      const pg = profileData.page;
      const usr = profileData.user;
      setProfile({
        displayName: pg.displayName ?? "",
        bio: pg.bio ?? "",
        avatarUrl: pg.avatarUrl ?? "",
        themeId: pg.themeId ?? "default",
        username: usr.username,
        isPublished: pg.isPublished,
      });
      setDisplayName(pg.displayName ?? "");
      setBio(pg.bio ?? "");
    }
    setLoading(false);
  }, []);

  // Initial load
  useState(() => { loadData(); });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex((l) => l._id === active.id);
    const newIndex = links.findIndex((l) => l._id === over.id);
    const reordered = arrayMove(links, oldIndex, newIndex).map((l, i) => ({ ...l, order: i }));
    setLinks(reordered);

    await fetch("/api/links", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: reordered.map((l) => l._id) }),
    });
  }

  async function handleAddLink(data: { title: string; url: string; enabled: boolean }) {
    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const j = await res.json();
      throw new Error(j.error);
    }
    const { link } = await res.json();
    setLinks((prev) => [...prev, link]);
  }

  async function handleEditLink(data: { title: string; url: string; enabled: boolean }) {
    if (!editingLink) return;
    const res = await fetch(`/api/links/${editingLink._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const j = await res.json();
      throw new Error(j.error);
    }
    const { link } = await res.json();
    setLinks((prev) => prev.map((l) => (l._id === link._id ? link : l)));
  }

  async function handleDeleteLink(id: string) {
    if (!confirm("Delete this link?")) return;
    await fetch(`/api/links/${id}`, { method: "DELETE" });
    setLinks((prev) => prev.filter((l) => l._id !== id));
  }

  async function handleToggleLink(id: string, enabled: boolean) {
    await fetch(`/api/links/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    setLinks((prev) => prev.map((l) => (l._id === id ? { ...l, enabled } : l)));
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, bio }),
    });
    setProfile((p) => p ? { ...p, displayName, bio } : p);
    setSavingProfile(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  }

  async function handleThemeChange(themeId: string) {
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ themeId }),
    });
    setProfile((p) => p ? { ...p, themeId } : p);
  }

  async function handleTogglePublished() {
    const newVal = !profile?.isPublished;
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: newVal }),
    });
    setProfile((p) => p ? { ...p, isPublished: newVal } : p);
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    const form = new FormData();
    form.append("avatar", file);
    const res = await fetch("/api/profile", { method: "POST", body: form });
    const { avatarUrl } = await res.json();
    setProfile((p) => p ? { ...p, avatarUrl } : p);
    setAvatarUploading(false);
  }

  function copyLink() {
    if (!profile) return;
    navigator.clipboard.writeText(`${window.location.origin}/${profile.username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const pageUrl = profile ? `${typeof window !== "undefined" ? window.location.origin : ""}/${profile.username}` : "";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#09090b" }}>
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-white/8 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-xs">
            T
          </div>
          <span className="font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Taplink
          </span>
        </div>

        <div className="flex items-center gap-2">
          {profile && (
            <button
              className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors px-2 py-1"
              onClick={copyLink}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline text-xs">{copied ? "Copied!" : `/${profile.username}`}</span>
            </button>
          )}
          {profile && (
            <a
              href={`/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs px-3 py-1.5"
            >
              <ExternalLink className="w-3 h-3" />
              Preview
            </a>
          )}
          <button
            className="btn-secondary text-xs px-3 py-1.5"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="w-3 h-3" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* ── Tabs ───────────────────────────────────────────────────────────── */}
        <div className="flex gap-1 glass p-1 rounded-xl mb-8">
          {(["links", "profile", "themes"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? "bg-white/10 text-white shadow"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {tab === "links" && <LinkIcon className="w-4 h-4" />}
              {tab === "profile" && <UserIcon className="w-4 h-4" />}
              {tab === "themes" && <Palette className="w-4 h-4" />}
              <span className="hidden sm:inline">{tab}</span>
            </button>
          ))}
        </div>

        {/* ── Links Tab ──────────────────────────────────────────────────────── */}
        {activeTab === "links" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Your Links
                </h2>
                <p className="text-white/40 text-sm">{links.length}/100 links</p>
              </div>
              <button
                className="btn-primary"
                onClick={() => setEditingLink(null)}
                disabled={links.length >= 100}
              >
                <Plus className="w-4 h-4" />
                Add Link
              </button>
            </div>

            {links.length === 0 ? (
              <div className="card text-center py-12">
                <LinkIcon className="w-8 h-8 text-white/20 mx-auto mb-3" />
                <p className="text-white/40 text-sm">No links yet. Add your first link!</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={links.map((l) => l._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {[...links]
                      .sort((a, b) => a.order - b.order)
                      .map((link) => (
                        <SortableLinkItem
                          key={link._id}
                          link={link}
                          onEdit={(l) => setEditingLink(l)}
                          onDelete={handleDeleteLink}
                          onToggle={handleToggleLink}
                        />
                      ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        )}

        {/* ── Profile Tab ────────────────────────────────────────────────────── */}
        {activeTab === "profile" && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="font-bold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Profile
            </h2>

            {/* Avatar */}
            <div className="card">
              <label className="block text-sm font-medium text-white/70 mb-4">Avatar</label>
              <div className="flex items-center gap-5">
                <div className="relative">
                  {profile?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatarUrl}
                      alt="Avatar"
                      className="avatar w-20 h-20"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-2xl font-bold">
                      {(profile?.displayName || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  {avatarUploading && (
                    <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="avatar-upload"
                    className="btn-secondary text-sm cursor-pointer"
                  >
                    Change Photo
                  </label>
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <p className="text-white/30 text-xs mt-1.5">JPEG, PNG, WebP up to 5 MB</p>
                </div>
              </div>
            </div>

            {/* Profile form */}
            <div className="card space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Display Name</label>
                <input
                  type="text"
                  id="profile-displayname"
                  className="input-field"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={50}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">
                  Bio{" "}
                  <span className="text-white/30">{bio.length}/160</span>
                </label>
                <textarea
                  id="profile-bio"
                  className="input-field resize-none"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={160}
                  placeholder="A short bio…"
                />
              </div>
              <button
                className="btn-primary"
                onClick={handleSaveProfile}
                disabled={savingProfile}
              >
                {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                {profileSaved ? <><Check className="w-4 h-4" /> Saved!</> : "Save Profile"}
              </button>
            </div>

            {/* Publish toggle */}
            <div className="card flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-sm">Page Visibility</p>
                <p className="text-white/40 text-xs mt-0.5">
                  {profile?.isPublished ? "Your page is public" : "Your page is hidden"}
                </p>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={profile?.isPublished ?? false}
                  onChange={handleTogglePublished}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>
        )}

        {/* ── Themes Tab ─────────────────────────────────────────────────────── */}
        {activeTab === "themes" && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="font-bold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Choose Theme
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {themes.map((theme) => {
                const selected = profile?.themeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                      selected
                        ? "border-violet-500 scale-105 shadow-lg shadow-violet-500/30"
                        : "border-transparent hover:border-white/20"
                    }`}
                  >
                    <div
                      style={{ background: theme.bg }}
                      className="h-28 flex flex-col items-center justify-center gap-2 p-3"
                    >
                      <div
                        style={{
                          background: theme.card,
                          border: `1px solid ${theme.border}`,
                          borderRadius: theme.buttonRadius,
                          color: theme.text,
                        }}
                        className="w-full text-xs font-medium py-2 px-3 text-center"
                      >
                        Sample Link
                      </div>
                    </div>
                    <div className="p-2 text-center">
                      <p className="text-xs font-medium text-white/80">{theme.name}</p>
                    </div>
                    {selected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Link Modal ─────────────────────────────────────────────────────────── */}
      {editingLink !== undefined && (
        <LinkModal
          link={editingLink}
          onClose={() => setEditingLink(undefined)}
          onSave={editingLink ? handleEditLink : handleAddLink}
        />
      )}
    </div>
  );
}
