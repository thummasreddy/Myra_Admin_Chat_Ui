import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Palette, Pipette, Plus, X } from "lucide-react";
import { normalizeHexColor } from "@/lib/colors";
import { cn } from "@/lib/utils";

const colorGrid = [
  ["#FFFFFF", "#E5E7EB", "#D1D5DB", "#9CA3AF", "#6B7280", "#4B5563", "#374151", "#1F2937", "#111827", "#000000"],
  ["#083344", "#172554", "#1E1B4B", "#3B0764", "#500724", "#7F1D1D", "#7C2D12", "#78350F", "#713F12", "#1A2E05"],
  ["#155E75", "#1D4ED8", "#4C1D95", "#7E22CE", "#BE185D", "#DC2626", "#EA580C", "#D97706", "#CA8A04", "#365314"],
  ["#0891B2", "#2563EB", "#6D28D9", "#9333EA", "#DB2777", "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#65A30D"],
  ["#06B6D4", "#3B82F6", "#7C3AED", "#A855F7", "#EC4899", "#F87171", "#FB923C", "#FBBF24", "#FACC15", "#84CC16"],
  ["#22D3EE", "#60A5FA", "#8B5CF6", "#C084FC", "#F472B6", "#FCA5A5", "#FDBA74", "#FCD34D", "#FDE047", "#A3E635"],
  ["#67E8F9", "#93C5FD", "#A78BFA", "#D8B4FE", "#F9A8D4", "#FECACA", "#FED7AA", "#FDE68A", "#FEF08A", "#BEF264"],
  ["#A5F3FC", "#BFDBFE", "#C4B5FD", "#E9D5FF", "#FBCFE8", "#FEE2E2", "#FFEDD5", "#FEF3C7", "#FEF9C3", "#D9F99D"]
];

const presetColors = ["#001B5A", "#234D9A", "#C89A4B", "#D8B06A", "#22C55E", "#EF4444", "#6B7280"];

type ColorPickerTab = "grid" | "spectrum" | "sliders";

type BrandColorFieldProps = {
  value: string;
  onChange: (color: string) => void;
  id?: string;
  disabled?: boolean;
  className?: string;
};

type ColorPickerModalProps = {
  open: boolean;
  value: string;
  onChange: (color: string) => void;
  onClose: () => void;
};

export { normalizeHexColor };

export function BrandColorField({ value, onChange, id, disabled = false, className }: BrandColorFieldProps) {
  const [open, setOpen] = useState(false);
  const selectedColor = normalizeHexColor(value);

  return (
    <>
      <button
        id={id}
        type="button"
        className={cn(
          "flex min-h-11 w-full items-center justify-between gap-3 rounded-md border border-input bg-background px-3 py-2 text-left text-sm shadow-sm transition-all hover:border-primary/60 hover:bg-[var(--color-bg-muted)] focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
        disabled={disabled}
        aria-label={`Open brand color picker, selected ${selectedColor}`}
        onClick={() => setOpen(true)}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span
            className="h-8 w-12 shrink-0 rounded-md border border-black/10 shadow-inner"
            style={{ backgroundColor: selectedColor }}
            aria-hidden="true"
          />
          <span className="flex min-w-0 items-center gap-2 text-[var(--color-text-secondary)]">
            <Palette className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate font-semibold uppercase text-[var(--color-text-main)]">{selectedColor}</span>
          </span>
        </span>
      </button>

      <ColorPickerModal open={open} value={selectedColor} onChange={onChange} onClose={() => setOpen(false)} />
    </>
  );
}

export function ColorPickerModal({ open, value, onChange, onClose }: ColorPickerModalProps) {
  const [activeTab, setActiveTab] = useState<ColorPickerTab>("grid");
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const selectedColor = normalizeHexColor(value);

  useEffect(() => {
    if (!open) return;

    setActiveTab("grid");
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open || typeof document === "undefined") return null;

  function selectColor(color: string) {
    onChange(normalizeHexColor(color));
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-[var(--color-overlay)] backdrop-blur-[2px]" aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="brand-color-picker-title"
        className="relative z-10 max-h-[80vh] w-full overflow-hidden rounded-t-[28px] border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-main)] shadow-[0_-24px_70px_rgba(8,6,22,0.24)] sm:max-w-[640px] sm:rounded-[28px] sm:shadow-[0_28px_80px_rgba(8,6,22,0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="max-h-[80vh] overflow-y-auto px-4 pb-5 pt-3 sm:px-6 sm:pb-6">
          <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-slate-300/80 sm:hidden" />
          <div className="grid grid-cols-[44px_1fr_44px] items-center gap-2">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] shadow-sm transition-colors hover:bg-[var(--color-bg-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              aria-label="Eyedropper tool coming soon"
            >
              <Pipette className="h-4 w-4" />
            </button>
            <h2 id="brand-color-picker-title" className="text-center text-base font-semibold tracking-normal">
              Colors
            </h2>
            <button
              ref={closeButtonRef}
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] shadow-sm transition-colors hover:bg-[var(--color-bg-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              aria-label="Close color picker"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 rounded-full bg-[var(--color-bg-muted)] p-1">
            <div className="grid grid-cols-3 gap-1">
              {(["grid", "spectrum", "sliders"] as ColorPickerTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={cn(
                    "h-9 rounded-full px-3 text-sm font-semibold capitalize transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                    activeTab === tab
                      ? "bg-[var(--color-bg-card)] text-[var(--color-text-main)] shadow-sm"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)]"
                  )}
                  aria-pressed={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            {activeTab === "grid" ? (
              <ColorGrid selectedColor={selectedColor} onSelect={selectColor} />
            ) : (
              <ComingSoonPanel label={activeTab === "spectrum" ? "Spectrum" : "Sliders"} />
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div
                className="h-14 w-14 shrink-0 rounded-2xl border border-black/10 shadow-inner"
                style={{ backgroundColor: selectedColor }}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-[var(--color-text-muted)]">Selected color</p>
                <p className="mt-1 font-mono text-sm font-semibold uppercase text-[var(--color-text-main)]">{selectedColor}</p>
              </div>
            </div>
          </div>

          <PresetColorRow selectedColor={selectedColor} onSelect={selectColor} />
        </div>
      </div>
    </div>,
    document.body
  );
}

export function ColorGrid({ selectedColor, onSelect }: { selectedColor: string; onSelect: (color: string) => void }) {
  return (
    <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3 shadow-inner">
      <div className="grid grid-cols-[repeat(10,minmax(0,1fr))] gap-1.5">
        {colorGrid.flat().map((color) => {
          const normalizedColor = normalizeHexColor(color);
          const selected = normalizedColor === selectedColor;

          return (
            <button
              key={normalizedColor}
              type="button"
              className={cn(
                "aspect-square min-h-7 rounded-md border shadow-sm transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                normalizedColor === "#FFFFFF" ? "border-slate-300" : "border-black/5",
                selected && "scale-105 ring-2 ring-primary ring-offset-2 ring-offset-[var(--color-bg-surface)]"
              )}
              style={{ backgroundColor: normalizedColor }}
              aria-label={`Select color ${normalizedColor}`}
              aria-pressed={selected}
              onClick={() => onSelect(normalizedColor)}
            >
              {selected ? (
                <span className="flex h-full w-full items-center justify-center">
                  <Check
                    className={cn("h-4 w-4 drop-shadow", isLightColor(normalizedColor) ? "text-slate-950" : "text-white")}
                    aria-hidden="true"
                  />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PresetColorRow({ selectedColor, onSelect }: { selectedColor: string; onSelect: (color: string) => void }) {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {presetColors.map((color) => {
            const selected = color === selectedColor;

            return (
              <button
                key={color}
                type="button"
                className={cn(
                  "h-10 w-10 rounded-full border border-black/5 shadow-sm transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                  selected && "ring-2 ring-primary ring-offset-2 ring-offset-[var(--color-bg-card)]"
                )}
                style={{ backgroundColor: color }}
                aria-label={`Select preset color ${color}`}
                aria-pressed={selected}
                onClick={() => onSelect(color)}
              >
                {selected ? (
                  <span className="flex h-full w-full items-center justify-center">
                    <Check className={cn("h-4 w-4", isLightColor(color) ? "text-slate-950" : "text-white")} aria-hidden="true" />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          aria-label="Add custom color coming soon"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ComingSoonPanel({ label }: { label: string }) {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-[22px] border border-dashed border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 text-center">
      <div>
        <p className="text-sm font-semibold text-[var(--color-text-main)]">{label}</p>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Coming soon</p>
      </div>
    </div>
  );
}

function isLightColor(color: string) {
  const normalizedColor = normalizeHexColor(color);
  const red = Number.parseInt(normalizedColor.slice(1, 3), 16);
  const green = Number.parseInt(normalizedColor.slice(3, 5), 16);
  const blue = Number.parseInt(normalizedColor.slice(5, 7), 16);
  return (red * 299 + green * 587 + blue * 114) / 1000 > 170;
}
