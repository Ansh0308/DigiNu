import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Utensils,
  Ban,
  Layers,
  Sparkles,
  Plus,
  ExternalLink,
  Store,
  Clock,
  ArrowRight,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Quick86Switch } from "@/components/admin/Quick86Switch";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const [profile, activeDishes, soldOutDishes, categoriesCount, recentItems, operatingHours] =
    await Promise.all([
      prisma.restaurantProfile.findFirst(),
      prisma.menuItem.count({ where: { isAvailable: true, isVisible: true } }),
      prisma.menuItem.count({ where: { isAvailable: false } }),
      prisma.menuCategory.count({ where: { isActive: true } }),
      prisma.menuItem.findMany({
        take: 6,
        orderBy: { updatedAt: "desc" },
        include: { category: { select: { name: true } } },
      }),
      prisma.operatingHours.findMany({
        orderBy: { dayOfWeek: "asc" },
      }),
    ]);

  const currencySymbol = profile?.currencySymbol || "$";
  const currencyPosition = profile?.currencyPosition || "PREFIX";
  const aiBalance = profile?.aiCreditsBalance ?? 30;
  const aiLimit = profile?.aiCreditsMonthlyLimit ?? 30;
  const aiUsagePercent = Math.min(100, Math.round(((aiLimit - aiBalance) / aiLimit) * 100));

  // Determine today's operational status
  const currentDayOfWeek = new Date().getDay(); // 0 = Sun .. 6 = Sat
  const todayHours = operatingHours.find((h) => h.dayOfWeek === currentDayOfWeek);

  const formatPrice = (price: unknown) => {
    const val = Number(price).toFixed(2);
    return currencyPosition === "PREFIX" ? `${currencySymbol}${val}` : `${val} ${currencySymbol}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner & Operational Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[var(--surface-border)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              {profile?.name || "Restaurant"} &bull; Console
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              ● Live
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Welcome back, <span className="font-semibold text-[var(--text-primary)]">{session.user.name || session.user.email}</span>. Here is your restaurant&apos;s current operational status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/menu/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[var(--brand-primary)] text-white hover:opacity-90 transition-opacity shadow-xs focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Dish</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-[var(--surface-card)] text-[var(--text-primary)] border border-[var(--surface-border)] hover:border-[var(--brand-primary)] transition-colors shadow-xs"
          >
            <span>Live Menu</span>
            <ExternalLink className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </Link>
        </div>
      </div>

      {/* Metric Tiles (SCR-ADMIN-02) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Active Dishes */}
        <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Active Dishes</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-editorial text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
              {activeDishes}
            </span>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">Ready for diner orders</p>
          </div>
        </div>

        {/* Metric 2: Sold Out Dishes (86'd) */}
        <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Sold Out (86&apos;d)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Ban className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-editorial text-3xl sm:text-4xl font-bold text-rose-600 dark:text-rose-400">
              {soldOutDishes}
            </span>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">Marked unavailable</p>
          </div>
        </div>

        {/* Metric 3: Active Categories */}
        <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Categories</span>
            <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-[var(--text-primary)]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-editorial text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
              {categoriesCount}
            </span>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">Menu sections active</p>
          </div>
        </div>

        {/* Metric 4: AI Culinary Credits */}
        <div className="p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">AI Studio Credits</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="font-editorial text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
                {aiBalance}
              </span>
              <span className="text-xs font-medium text-[var(--text-muted)]">/ {aiLimit} left</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-[var(--surface-border)] h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${100 - aiUsagePercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Operational Highlights & Today's Hours Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--canvas-bg)] border border-[var(--surface-border)] flex items-center justify-center text-[var(--brand-primary)] shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Today&apos;s Schedule ({new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date())})
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {todayHours?.isClosed
                ? "Kitchen is currently marked as CLOSED today"
                : `Service hours: ${todayHours?.openTime || "11:00"} – ${todayHours?.closeTime || "22:00"}`}
            </p>
          </div>
        </div>
        <Link
          href="/admin/profile#hours"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--brand-primary)] hover:underline"
        >
          <span>Adjust Schedule</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 86 Floor Hub: Quick Dish Availability Toggles */}
      <div className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-editorial text-lg font-bold text-[var(--text-primary)]">
              Quick 86 Floor Hub
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              1-tap availability control. Toggling immediately updates the customer menu in real time.
            </p>
          </div>
          <Link
            href="/admin/menu"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-primary)] hover:underline"
          >
            <span>View All ({activeDishes + soldOutDishes})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentItems.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--text-muted)]">
            No dishes created yet. Click &quot;Add Dish&quot; above to add your first menu item.
          </div>
        ) : (
          <div className="divide-y divide-[var(--surface-border)]">
            {recentItems.map((dish) => (
              <div
                key={dish.id}
                className="py-3 flex items-center justify-between gap-4 hover:bg-[var(--canvas-bg)] px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      dish.isAvailable ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                        {dish.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-border)] text-[var(--text-muted)] shrink-0">
                        {dish.category.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)] tabular-nums">
                      {formatPrice(dish.price)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-[11px] font-medium hidden sm:inline ${
                      dish.isAvailable ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {dish.isAvailable ? "Available" : "Sold Out"}
                  </span>
                  <Quick86Switch
                    itemId={dish.id}
                    dishName={dish.name}
                    initialAvailable={dish.isAvailable}
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/categories"
          className="p-4 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] hover:border-[var(--brand-primary)] transition-all group flex items-center justify-between"
        >
          <div>
            <h3 className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)]">
              Categories & Ordering
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Organize and sort sections</p>
          </div>
          <Layers className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--brand-primary)]" />
        </Link>

        <Link
          href="/admin/menu"
          className="p-4 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] hover:border-[var(--brand-primary)] transition-all group flex items-center justify-between"
        >
          <div>
            <h3 className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)]">
              Dishes & 86 Hub
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Manage full culinary catalog</p>
          </div>
          <Utensils className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--brand-primary)]" />
        </Link>

        <Link
          href="/admin/profile"
          className="p-4 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] hover:border-[var(--brand-primary)] transition-all group flex items-center justify-between"
        >
          <div>
            <h3 className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)]">
              Brand & Theming
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Colors, typography & hours</p>
          </div>
          <Store className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--brand-primary)]" />
        </Link>
      </div>
    </div>
  );
}
