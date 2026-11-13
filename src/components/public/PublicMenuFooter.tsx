export function PublicMenuFooter() {
  return (
    <footer className="w-full border-t border-[var(--surface-border)] bg-[var(--surface-card)] py-8 px-4 text-center text-xs text-[var(--text-muted)] space-y-2">
      <p className="font-medium">
        Powered by{" "}
        <span className="font-editorial font-bold text-[var(--brand-primary)]">
          DigiNu
        </span>{" "}
        &bull; Digital Restaurant Menu
      </p>
      <p className="opacity-75">
        QR-Powered Read-Only Dining &bull; All orders taken tableside by server staff
      </p>
    </footer>
  );
}

