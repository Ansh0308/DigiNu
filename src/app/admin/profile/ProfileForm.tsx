"use client";

import React, { useState } from "react";
import { Store, Palette, Globe, Clock, Save, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface OperatingHour {
  id?: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

interface ProfileData {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  aboutStory: string | null;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  currencyCode: string;
  currencySymbol: string;
  currencyPosition: string;
  themePreset: string;
  primaryColor: string;
  accentColor: string;
}

interface ProfileFormProps {
  initialProfile: ProfileData;
  initialHours: OperatingHour[];
}

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const THEME_PRESETS = [
  {
    id: "warm-cream",
    name: "Warm Cream (Editorial)",
    description: "Alabaster backdrop with terracotta accents. Perfect for bistros, trattorias & fine dining.",
    canvasBg: "#FDFCF7",
    primaryColor: "#C85A32",
    textColor: "#1A1A1A",
  },
  {
    id: "clean-white",
    name: "Clean White (Contemporary)",
    description: "High-contrast minimalist canvas. Ideal for modern cafes, sushi bars & health eateries.",
    canvasBg: "#FFFFFF",
    primaryColor: "#0F172A",
    textColor: "#0F172A",
  },
  {
    id: "midnight-charcoal",
    name: "Midnight Charcoal (Lounge)",
    description: "Dark mode atmospheric ambiance. Crafted for cocktail bars, steakhouses & evening venues.",
    canvasBg: "#121214",
    primaryColor: "#E11D48",
    textColor: "#F1F5F9",
  },
];

export function ProfileForm({ initialProfile, initialHours }: ProfileFormProps) {
  const { toast } = useToast();

  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [hours, setHours] = useState<OperatingHour[]>(() => {
    // Ensure all 7 days exist
    const map = new Map(initialHours.map((h) => [h.dayOfWeek, h]));
    return Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      openTime: map.get(i)?.openTime || "11:00",
      closeTime: map.get(i)?.closeTime || "22:00",
      isClosed: map.get(i)?.isClosed ?? false,
    }));
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingHours, setSavingHours] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const response = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          tagline: profile.tagline || null,
          aboutStory: profile.aboutStory || null,
          address: profile.address || null,
          phone: profile.phone || null,
          whatsapp: profile.whatsapp || null,
          currencyCode: profile.currencyCode,
          currencySymbol: profile.currencySymbol,
          currencyPosition: profile.currencyPosition,
          themePreset: profile.themePreset,
          primaryColor: profile.primaryColor,
          accentColor: profile.accentColor,
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData?.error?.message || "Failed to update profile");
      }

      setProfile(resData.data);
      toast.success("Restaurant branding and profile updated successfully.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving profile";
      toast.error(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleHoursSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingHours(true);

    try {
      const response = await fetch("/api/admin/profile/hours", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hours),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData?.error?.message || "Failed to update operating hours");
      }

      setHours(resData.data);
      toast.success("7-day operating hours saved and live.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving operating hours";
      toast.error(msg);
    } finally {
      setSavingHours(false);
    }
  };

  const updateHourField = (dayIndex: number, field: keyof OperatingHour, value: unknown) => {
    setHours((prev) =>
      prev.map((item) => (item.dayOfWeek === dayIndex ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-6 border-b border-[var(--surface-border)]">
        <h1 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Profile & Theming Studio
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Customize your restaurant&apos;s digital identity, visual brand colors, currency format, and operating hours.
        </p>
      </div>

      <form onSubmit={handleProfileSubmit} className="space-y-8">
        {/* SECTION 1: Restaurant Identity */}
        <section className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--surface-border)]">
            <Store className="w-5 h-5 text-[var(--brand-primary)]" aria-hidden="true" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Restaurant Identity & Contact
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="restaurant-name" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Restaurant Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="restaurant-name"
                type="text"
                required
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--canvas-bg)] border border-[var(--surface-border)] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-hidden transition-colors"
                placeholder="e.g. Trattoria Bella Italia"
              />
            </div>

            <div>
              <label htmlFor="restaurant-tagline" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Tagline / Subtitle
              </label>
              <input
                id="restaurant-tagline"
                type="text"
                value={profile.tagline || ""}
                onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--canvas-bg)] border border-[var(--surface-border)] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-hidden transition-colors"
                placeholder="e.g. Wood-Fired Artisanal Cucina & Wine Bar"
                maxLength={160}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="restaurant-story" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                About Story (Displayed on public menu header)
              </label>
              <textarea
                id="restaurant-story"
                rows={3}
                value={profile.aboutStory || ""}
                onChange={(e) => setProfile({ ...profile, aboutStory: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--canvas-bg)] border border-[var(--surface-border)] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-hidden transition-colors resize-y"
                placeholder="Crafting generational handmade pasta recipes since 1984..."
                maxLength={2000}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="restaurant-address" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Physical Address
              </label>
              <input
                id="restaurant-address"
                type="text"
                value={profile.address || ""}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--canvas-bg)] border border-[var(--surface-border)] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-hidden transition-colors"
                placeholder="e.g. 142 Via Della Spiga, Milan"
                maxLength={255}
              />
            </div>

            <div>
              <label htmlFor="restaurant-phone" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Telephone Number
              </label>
              <input
                id="restaurant-phone"
                type="tel"
                value={profile.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--canvas-bg)] border border-[var(--surface-border)] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-hidden transition-colors"
                placeholder="+1 (555) 234-5678"
                maxLength={30}
              />
            </div>

            <div>
              <label htmlFor="restaurant-whatsapp" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                WhatsApp Direct Number
              </label>
              <input
                id="restaurant-whatsapp"
                type="tel"
                value={profile.whatsapp || ""}
                onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--canvas-bg)] border border-[var(--surface-border)] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-hidden transition-colors"
                placeholder="+1 (555) 987-6543"
                maxLength={30}
              />
            </div>
          </div>
        </section>

        {/* SECTION 2: Localization & Currency */}
        <section className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--surface-border)]">
            <Globe className="w-5 h-5 text-[var(--brand-primary)]" aria-hidden="true" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Currency & Localization
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label htmlFor="currency-code" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Currency Code (ISO)
              </label>
              <input
                id="currency-code"
                type="text"
                required
                maxLength={3}
                value={profile.currencyCode}
                onChange={(e) => setProfile({ ...profile, currencyCode: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--canvas-bg)] border border-[var(--surface-border)] text-[var(--text-primary)] uppercase font-mono focus:border-[var(--brand-primary)] focus:outline-hidden"
                placeholder="USD"
              />
            </div>

            <div>
              <label htmlFor="currency-symbol" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Currency Symbol
              </label>
              <input
                id="currency-symbol"
                type="text"
                required
                maxLength={5}
                value={profile.currencySymbol}
                onChange={(e) => setProfile({ ...profile, currencySymbol: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--canvas-bg)] border border-[var(--surface-border)] text-[var(--text-primary)] font-mono focus:border-[var(--brand-primary)] focus:outline-hidden"
                placeholder="$"
              />
            </div>

            <div>
              <label htmlFor="currency-position" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Symbol Position
              </label>
              <select
                id="currency-position"
                value={profile.currencyPosition}
                onChange={(e) => setProfile({ ...profile, currencyPosition: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--canvas-bg)] border border-[var(--surface-border)] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-hidden"
              >
                <option value="PREFIX">Prefix ({profile.currencySymbol}14.50)</option>
                <option value="SUFFIX">Suffix (14.50 {profile.currencySymbol})</option>
              </select>
            </div>
          </div>
        </section>

        {/* SECTION 3: Brand Colors & Theme Presets */}
        <section className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--surface-border)]">
            <Palette className="w-5 h-5 text-[var(--brand-primary)]" aria-hidden="true" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Brand Theming & Visual Palette
            </h2>
          </div>

          {/* Theme Presets Radio Cards */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-3">
              Theme Preset
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {THEME_PRESETS.map((preset) => {
                const selected = profile.themePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() =>
                      setProfile({
                        ...profile,
                        themePreset: preset.id,
                        primaryColor: preset.primaryColor,
                      })
                    }
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selected
                        ? "border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/20 bg-[var(--canvas-bg)]"
                        : "border-[var(--surface-border)] hover:border-stone-400 bg-[var(--surface-card)]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          {preset.name}
                        </span>
                        <div
                          className="w-4 h-4 rounded-full border border-black/10"
                          style={{ backgroundColor: preset.primaryColor }}
                        />
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                        {preset.description}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[var(--surface-border)] flex items-center gap-2">
                      <div
                        className="w-5 h-3 rounded-xs border border-black/10"
                        style={{ backgroundColor: preset.canvasBg }}
                      />
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">
                        Canvas Preview
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Hex Color Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-[var(--surface-border)]">
            <div>
              <label htmlFor="primary-color" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Primary Brand Color (Hex)
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="primary-color-picker"
                  type="color"
                  value={profile.primaryColor}
                  onChange={(e) => setProfile({ ...profile, primaryColor: e.target.value })}
                  className="w-10 h-10 p-1 rounded-lg border border-[var(--surface-border)] bg-[var(--canvas-bg)] cursor-pointer"
                  aria-label="Pick primary brand color"
                />
                <input
                  id="primary-color"
                  type="text"
                  maxLength={7}
                  value={profile.primaryColor}
                  onChange={(e) => setProfile({ ...profile, primaryColor: e.target.value })}
                  className="flex-1 px-3.5 py-2.5 rounded-xl text-xs bg-[var(--canvas-bg)] border border-[var(--surface-border)] text-[var(--text-primary)] font-mono uppercase focus:border-[var(--brand-primary)] focus:outline-hidden"
                  placeholder="#C85A32"
                />
              </div>
            </div>

            <div>
              <label htmlFor="accent-color" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Accent Highlight Color (Hex)
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="accent-color-picker"
                  type="color"
                  value={profile.accentColor}
                  onChange={(e) => setProfile({ ...profile, accentColor: e.target.value })}
                  className="w-10 h-10 p-1 rounded-lg border border-[var(--surface-border)] bg-[var(--canvas-bg)] cursor-pointer"
                  aria-label="Pick accent highlight color"
                />
                <input
                  id="accent-color"
                  type="text"
                  maxLength={7}
                  value={profile.accentColor}
                  onChange={(e) => setProfile({ ...profile, accentColor: e.target.value })}
                  className="flex-1 px-3.5 py-2.5 rounded-xl text-xs bg-[var(--canvas-bg)] border border-[var(--surface-border)] text-[var(--text-primary)] font-mono uppercase focus:border-[var(--brand-primary)] focus:outline-hidden"
                  placeholder="#F59E0B"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[var(--brand-primary)] text-white hover:opacity-90 transition-opacity shadow-xs cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)] disabled:opacity-50"
            >
              {savingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile & Branding</span>
                </>
              )}
            </button>
          </div>
        </section>
      </form>

      {/* SECTION 4: 7-Day Operating Hours */}
      <form id="hours" onSubmit={handleHoursSubmit}>
        <section className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--surface-border)]">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-[var(--brand-primary)]" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                  7-Day Operating Hours
                </h2>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Configure opening and closing schedules for each day of the week.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingHours}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--brand-primary)] text-white hover:opacity-90 transition-opacity shadow-xs cursor-pointer disabled:opacity-50"
            >
              {savingHours ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Schedule</span>
                </>
              )}
            </button>
          </div>

          <div className="divide-y divide-[var(--surface-border)]">
            {hours.map((hour) => {
              const dayName = DAYS_OF_WEEK[hour.dayOfWeek];
              return (
                <div
                  key={hour.dayOfWeek}
                  className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    hour.isClosed ? "opacity-60 bg-[var(--canvas-bg)] px-3 rounded-lg" : ""
                  }`}
                >
                  <div className="w-32">
                    <span className="text-xs font-bold text-[var(--text-primary)] block">
                      {dayName}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {hour.isClosed ? "Closed all day" : "Kitchen service"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text-primary)] select-none">
                      <input
                        type="checkbox"
                        checked={hour.isClosed}
                        onChange={(e) =>
                          updateHourField(hour.dayOfWeek, "isClosed", e.target.checked)
                        }
                        className="rounded border-[var(--surface-border)] text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                      />
                      <span className="font-medium text-rose-600 dark:text-rose-400">Mark Closed</span>
                    </label>

                    {!hour.isClosed && (
                      <div className="flex items-center gap-2">
                        <div>
                          <label htmlFor={`open-${hour.dayOfWeek}`} className="sr-only">
                            {dayName} opening time
                          </label>
                          <input
                            id={`open-${hour.dayOfWeek}`}
                            type="time"
                            required={!hour.isClosed}
                            value={hour.openTime}
                            onChange={(e) =>
                              updateHourField(hour.dayOfWeek, "openTime", e.target.value)
                            }
                            className="px-2.5 py-1.5 rounded-lg text-xs bg-[var(--canvas-bg)] border border-[var(--surface-border)] font-mono text-[var(--text-primary)]"
                          />
                        </div>
                        <span className="text-xs text-[var(--text-muted)]">to</span>
                        <div>
                          <label htmlFor={`close-${hour.dayOfWeek}`} className="sr-only">
                            {dayName} closing time
                          </label>
                          <input
                            id={`close-${hour.dayOfWeek}`}
                            type="time"
                            required={!hour.isClosed}
                            value={hour.closeTime}
                            onChange={(e) =>
                              updateHourField(hour.dayOfWeek, "closeTime", e.target.value)
                            }
                            className="px-2.5 py-1.5 rounded-lg text-xs bg-[var(--canvas-bg)] border border-[var(--surface-border)] font-mono text-[var(--text-primary)]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </form>
    </div>
  );
}

