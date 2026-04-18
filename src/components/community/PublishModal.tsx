"use client";

import { useState, KeyboardEvent } from "react";
import { X, Globe, Lock, Check, Copy, Tag } from "lucide-react";
import type { LicenseType } from "@/types";
import { cn } from "@/lib/utils";

// ─── License options ──────────────────────────────────────────────────────────

const LICENSE_OPTIONS: { value: LicenseType; label: string; description: string }[] = [
  { value: "cc_by", label: "CC BY", description: "Free to share and adapt with attribution" },
  { value: "cc_by_sa", label: "CC BY-SA", description: "Share alike — derivatives must use same license" },
  { value: "cc_by_nc", label: "CC BY-NC", description: "Non-commercial use only" },
  { value: "all_rights", label: "All Rights Reserved", description: "No reuse without explicit permission" },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  thumbnailUrl?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PublishModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  thumbnailUrl,
}: PublishModalProps) {
  const [title, setTitle] = useState(projectName);
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [license, setLicense] = useState<LicenseType>("cc_by");
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [shareLink, setShareLink] = useState("");

  if (!isOpen) return null;

  // ─── Tag management ─────────────────────────────────────────────────────────

  const addTag = (raw: string) => {
    const normalized = raw.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!normalized || tags.includes(normalized) || tags.length >= 10) return;
    setTags((prev) => [...prev, normalized]);
    setTagInput("");
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  // ─── Submit ──────────────────────────────────────────────────────────────────

  const handlePublish = async () => {
    if (!title.trim()) {
      setError("A title is required.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title: title.trim(),
          description: description.trim() || null,
          thumbnailUrl: thumbnailUrl ?? null,
          tags,
          license,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to publish");
      }

      const data = await res.json();
      const postId = data.post?.id ?? "unknown";
      setShareLink(`${window.location.origin}/community/${postId}`);
      setPublished(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyLink = () => {
    if (shareLink) navigator.clipboard.writeText(shareLink);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={!isSubmitting ? onClose : undefined}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-clay-200">
          <h2 className="font-display font-semibold text-clay-900 text-lg">
            Publish to Clay Commons
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg hover:bg-clay-100 text-clay-500 disabled:opacity-50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success state */}
        {published ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-sage-600" />
            </div>
            <h3 className="font-display text-xl font-semibold text-clay-900 mb-2">
              Published!
            </h3>
            <p className="text-sm text-clay-500 mb-6">
              Your work is now live on Clay Commons. Share the link below.
            </p>

            <div className="flex items-center gap-2 bg-clay-50 border border-clay-200 rounded-xl px-4 py-2.5 mb-6">
              <span className="flex-1 text-xs text-clay-700 truncate font-mono">{shareLink}</span>
              <button
                onClick={copyLink}
                className="flex-shrink-0 text-clay-500 hover:text-clay-700 transition-colors"
              >
                <Copy size={15} />
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-clay-500 hover:bg-clay-600 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto max-h-[80vh] space-y-5">
            {/* Thumbnail preview */}
            <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-clay-200 to-earth-300">
              {thumbnailUrl ? (
                <img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-clay-400 text-sm">
                  No thumbnail
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-clay-700 mb-1.5">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                placeholder="Give your piece a title..."
                className="w-full border border-clay-200 rounded-xl px-4 py-2.5 text-sm text-clay-800 placeholder:text-clay-300 focus:outline-none focus:ring-2 focus:ring-clay-400 bg-white"
              />
              <div className="text-right text-[10px] text-clay-300 mt-1">{title.length}/100</div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-clay-700 mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                placeholder="Describe your process, inspiration, materials..."
                rows={3}
                className="w-full border border-clay-200 rounded-xl px-4 py-2.5 text-sm text-clay-800 placeholder:text-clay-300 focus:outline-none focus:ring-2 focus:ring-clay-400 bg-white resize-none"
              />
              <div className="text-right text-[10px] text-clay-300 mt-1">{description.length}/500</div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-clay-700 mb-1.5">
                Tags
                <span className="ml-1 font-normal text-clay-400">(press Enter or comma to add)</span>
              </label>
              <div className="flex flex-wrap gap-1.5 border border-clay-200 rounded-xl px-3 py-2 min-h-[42px] bg-white focus-within:ring-2 focus-within:ring-clay-400">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 bg-clay-100 text-clay-700 px-2 py-0.5 rounded-full text-xs"
                  >
                    <Tag size={10} />
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-clay-900 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
                {tags.length < 10 && (
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => tagInput && addTag(tagInput)}
                    placeholder={tags.length === 0 ? "ceramics, wheel, stoneware..." : ""}
                    className="flex-1 min-w-[80px] text-xs text-clay-800 placeholder:text-clay-300 bg-transparent outline-none py-0.5"
                  />
                )}
              </div>
            </div>

            {/* License */}
            <div>
              <label className="block text-xs font-semibold text-clay-700 mb-1.5">License</label>
              <div className="grid grid-cols-2 gap-2">
                {LICENSE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setLicense(opt.value)}
                    className={cn(
                      "text-left p-3 rounded-xl border text-xs transition-colors",
                      license === opt.value
                        ? "border-clay-500 bg-clay-50 text-clay-800"
                        : "border-clay-200 bg-white text-clay-600 hover:border-clay-300"
                    )}
                  >
                    <div className="font-semibold mb-0.5">{opt.label}</div>
                    <div className="text-[10px] leading-snug text-clay-400">{opt.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Visibility */}
            <div className="flex items-center justify-between p-3 bg-clay-50 rounded-xl">
              <div className="flex items-center gap-2">
                {isPublic ? (
                  <Globe size={15} className="text-sage-600" />
                ) : (
                  <Lock size={15} className="text-clay-400" />
                )}
                <div>
                  <div className="text-xs font-semibold text-clay-800">
                    {isPublic ? "Public" : "Private"}
                  </div>
                  <div className="text-[10px] text-clay-400">
                    {isPublic ? "Visible to everyone on Clay Commons" : "Only you can see this"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={cn(
                  "relative w-10 h-5 rounded-full transition-colors flex-shrink-0",
                  isPublic ? "bg-sage-500" : "bg-ash-300"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
                    isPublic ? "left-[22px]" : "left-0.5"
                  )}
                />
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handlePublish}
              disabled={isSubmitting || !title.trim()}
              className="w-full py-3 bg-clay-500 hover:bg-clay-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish to Clay Commons"
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default PublishModal;
