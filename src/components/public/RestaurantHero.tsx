"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, Phone, MessageCircle, Clock, Utensils, Sparkles, Award } from "lucide-react";
import { PublicRestaurantProfile } from "@/lib/sanitizer";
import { OperatingHoursModal } from "./OperatingHoursModal";

interface RestaurantHeroProps {
  restaurant: PublicRestaurantProfile;
}

export function RestaurantHero({ restaurant }: RestaurantHeroProps) {
  const [showHoursModal, setShowHoursModal] = useState(false);

  const cleanPhone = restaurant.phone?.replace(/[^0-9+]/g, "") || "";
  const cleanWhatsApp = restaurant.whatsapp?.replace(/[^0-9]/g, "") || "";
  const mapsUrl = restaurant.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.name} ${restaurant.address}`)}`
    : null;

  return (
    <>
      <header className="relative w-full overflow-hidden bg-[var(--surface-canvas)]">
        {/* Cover Banner with Ambient Radiant Vignette */}
        <div className="relative w-full h-52 sm:h-64 md:h-76 bg-gradient-to-br from-amber-900/30 via-orange-950/20 to-[var(--brand-primary)]/20 overflow-hidden">
          {restaurant.bannerUrl ? (
            <Image
              src={restaurant.bannerUrl}
              alt={`${restaurant.name} banner`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-cover transition-transform duration-700 ease-out hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-15">
              <Utensils className="w-40 h-40 text-amber-500" aria-hidden="true" />
            </div>
          )}

          {/* Luxury ambient multi-layer gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />

          {/* Saffron & Gold ambient warmth overlay */}
          <div className="absolute inset-0 bg-radial-[at_top_right] from-amber-500/20 via-transparent to-transparent pointer-events-none" />

          {/* Top subtle golden badge */}
          <div className="absolute top-4 left-4 sm:left-6 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-black/50 backdrop-blur-md text-amber-300 border border-amber-400/30 shadow-lg">
              <Sparkles className="w-3 h-3 text-amber-400" aria-hidden="true" />
              <span>Artisanal Kitchen</span>
            </span>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative -mt-16 sm:-mt-20 pb-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
            {/* Logo Avatar with Gold Accent Ring */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-[var(--surface-card)] border-4 border-[var(--surface-card)] shadow-2xl flex-shrink-0 flex items-center justify-center ring-2 ring-amber-400/40 transform transition-transform hover:scale-105 duration-300">
              {restaurant.logoUrl ? (
                <Image
                  src={restaurant.logoUrl}
                  alt={`${restaurant.name} logo`}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 text-[var(--brand-primary)]">
                  <Utensils className="w-10 h-10 mb-1" aria-hidden="true" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">DigiNu</span>
                </div>
              )}
            </div>

            {/* Restaurant Info & Title */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
                  <Award className="w-3 h-3 text-amber-600" aria-hidden="true" />
                  <span>Chef Curated</span>
                </span>
                <span className="text-xs text-[var(--text-muted)]">&bull;</span>
                <span className="text-xs font-medium text-[var(--text-muted)]">Pure Dining &bull; Tableside Service</span>
              </div>

              <h1 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] leading-tight">
                {restaurant.name}
              </h1>

              {restaurant.tagline && (
                <p className="text-sm sm:text-base text-[var(--text-muted)] mt-1 font-sans leading-relaxed">
                  {restaurant.tagline}
                </p>
              )}
            </div>
          </div>

          {/* Status Badge & Action Links */}
          <div className="mt-5 flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-2 border-t border-[var(--surface-border)]/60">
            {/* Operating Hours Interactive Pill */}
            <button
              type="button"
              onClick={() => setShowHoursModal(true)}
              aria-label="View operating hours schedule"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all duration-200 active:scale-95 ${
                restaurant.isOpenNow
                  ? "bg-emerald-500/10 text-emerald-800 border border-emerald-500/30 hover:bg-emerald-500/20"
                  : "bg-neutral-500/10 text-neutral-700 border border-neutral-500/25 hover:bg-neutral-500/20"
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  restaurant.isOpenNow ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"
                }`}
                aria-hidden="true"
              />
              <span>{restaurant.statusBadgeText}</span>
              <Clock className="w-3.5 h-3.5 opacity-60 ml-0.5" aria-hidden="true" />
            </button>

            {/* Address / Directions */}
            {mapsUrl && restaurant.address && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[var(--surface-card)] border border-[var(--surface-border)] text-[var(--text-primary)] hover:border-amber-400/60 hover:text-[var(--brand-primary)] shadow-xs transition-all active:scale-95"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                <span className="truncate max-w-[180px] sm:max-w-xs">{restaurant.address}</span>
              </a>
            )}

            {/* Phone Call */}
            {cleanPhone && (
              <a
                href={`tel:${cleanPhone}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[var(--surface-card)] border border-[var(--surface-border)] text-[var(--text-primary)] hover:border-amber-400/60 hover:text-[var(--brand-primary)] shadow-xs transition-all active:scale-95"
                aria-label={`Call ${restaurant.name}`}
              >
                <Phone className="w-3.5 h-3.5 text-[var(--brand-primary)]" aria-hidden="true" />
                <span>Call Restaurant</span>
              </a>
            )}

            {/* WhatsApp */}
            {cleanWhatsApp && (
              <a
                href={`https://wa.me/${cleanWhatsApp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all active:scale-95"
                aria-label="Contact on WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Operating Hours Modal */}
      <OperatingHoursModal
        isOpen={showHoursModal}
        onClose={() => setShowHoursModal(false)}
        hours={restaurant.operatingHours}
        restaurantName={restaurant.name}
      />
    </>
  );
}
