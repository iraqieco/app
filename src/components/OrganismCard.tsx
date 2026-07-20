import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { Organism } from "@/lib/supabase";
import { IUCNBadge } from "./IUCNBadge";
import { Leaf, Eye, Edit, Trash2, Download, X, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// ─── constants ────────────────────────────────────────────────────────────────

const PRIMARY = "hsl(123, 43%, 24%)";
const PRIMARY_DARK_BORDER = "2px solid hsl(123, 43%, 22%)";

const PLACEHOLDER_SVG =
  `data:image/svg+xml;utf8,` +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#e8f5e9"/>
  <text x="400" y="270" font-family="sans-serif" font-size="22" fill="#2d6a4f" text-anchor="middle">Iraqi Eco</text>
  <text x="400" y="310" font-family="sans-serif" font-size="16" fill="#4a9068" text-anchor="middle">No Image Available</text>
</svg>`
  );

// ─── helpers ──────────────────────────────────────────────────────────────────

function safe(v: string | null | undefined): string {
  return (v ?? "").trim();
}
function display(v: string | null | undefined): string {
  const s = safe(v);
  return s.length > 0 ? s : "غير محدد";
}
function imgSrc(v: string | null | undefined): string {
  const s = safe(v);
  return s.length > 0 ? s : PLACEHOLDER_SVG;
}

// ─── logo badge ───────────────────────────────────────────────────────────────

function LogoBadge() {
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-md text-white text-sm font-bold tracking-wide shadow-sm"
      style={{ background: PRIMARY }}
    >
      عراقي إيكو
    </span>
  );
}

// ─── taxonomy row ─────────────────────────────────────────────────────────────

function TaxRow({ label, value }: { label: string; value: string | null | undefined }) {
  const v = display(value);
  const missing = v === "غير محدد";
  return (
    <div className="flex items-baseline gap-2 py-1 border-b border-dashed border-border/50 last:border-0">
      <span className="text-[11px] font-semibold text-muted-foreground min-w-[68px] shrink-0">{label}</span>
      <span className={`text-[12px] font-medium leading-snug ${missing ? "text-muted-foreground/40 italic" : "text-foreground"}`}>
        {v}
      </span>
    </div>
  );
}

// ─── props ────────────────────────────────────────────────────────────────────

interface OrganismCardProps {
  organism: Organism;
  isAdmin: boolean;
  onEdit?: (organism: Organism) => void;
  onDelete?: (organism: Organism) => void;
}

// ─── main card ────────────────────────────────────────────────────────────────

export function OrganismCard({ organism, isAdmin, onEdit, onDelete }: OrganismCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Ref to the live card element — used for pixel-perfect PNG capture
  const cardRef = useRef<HTMLElement>(null);

  const src = imgError ? PLACEHOLDER_SVG : imgSrc(organism.image_url);
  const hasRealImage = safe(organism.image_url).length > 0 && !imgError;
  const hasDescription = safe(organism.description).length > 0;

  // ── Download: capture the live card DOM directly ──────────────────────────
  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      // Wait for fonts so Arabic shaping is complete before capture
      await document.fonts.ready;

      const canvas = await html2canvas(cardRef.current, {
        scale: 2,               // 2× for high-DPI without changing proportions
        useCORS: true,          // allow cross-origin species images
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        // Capture at the element's natural size — no width/height override
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      });

      const link = document.createElement("a");
      link.download = `${safe(organism.scientific_name) || safe(organism.name_ar) || "species"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Download failed:", e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      {/* ══ Card ══
          ref is on the article so html2canvas captures exactly what you see.
          Dark green border is applied via inline style for consistent rendering. */}
      <article
        ref={cardRef as React.RefObject<HTMLDivElement>}
        className="group bg-card text-card-foreground rounded-2xl overflow-hidden shadow-sm
                   flex flex-col h-full transition-all duration-300
                   hover:shadow-lg hover:-translate-y-0.5"
        style={{ border: PRIMARY_DARK_BORDER }}
      >
        {/* ── Logo header — ABOVE the image, centered, outside the photo ── */}
        <div
          className="flex items-center justify-center py-3"
          style={{
            background: "hsl(123 43% 97%)",
            borderBottom: "1px solid hsl(123 43% 86%)",
          }}
        >
          <LogoBadge />
        </div>

        {/* ── Species image ── */}
        <div className="relative w-full overflow-hidden bg-muted/30" style={{ aspectRatio: "4/3" }}>
          <img
            src={src}
            alt={safe(organism.name_ar) || "صورة الكائن"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          {!hasRealImage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <Leaf className="w-12 h-12 mb-2 text-primary/25" />
              <span className="text-xs font-medium text-muted-foreground">لا توجد صورة</span>
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col flex-grow p-4 gap-3">

          {/* Names + conservation status */}
          <div>
            <h3 className="text-lg font-bold leading-tight text-foreground line-clamp-1">
              {display(organism.name_ar)}
            </h3>
            <p className="text-sm italic text-muted-foreground mt-0.5 line-clamp-1 font-serif" dir="ltr">
              {display(organism.scientific_name)}
            </p>
            <div className="mt-2">
              <IUCNBadge status={organism.conservation_status} />
            </div>
          </div>

          {/* Description — only if not empty */}
          {hasDescription && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {safe(organism.description)}
            </p>
          )}

          {/* Taxonomy table */}
          <div
            className="rounded-xl px-3 py-2"
            style={{
              background: "hsl(123 43% 97%)",
              border: "1px solid hsl(123 43% 86%)",
            }}
          >
            <p className="text-[10px] font-bold text-primary/70 uppercase tracking-wider mb-1.5">
              التصنيف العلمي
            </p>
            <TaxRow label="المملكة" value={organism.kingdom} />
            <TaxRow label="الشعبة"  value={organism.phylum} />
            <TaxRow label="الطائفة" value={organism['class']} />
            <TaxRow label="الرتبة"  value={null} />
            <TaxRow label="الفصيلة" value={organism.family} />
            <TaxRow label="الجنس"   value={null} />
            <TaxRow label="النوع"   value={null} />
          </div>

          {/* Action buttons */}
          <div className="mt-auto pt-1 grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs gap-1.5 rounded-xl"
              onClick={() => setDetailOpen(true)}
            >
              <Eye className="w-3.5 h-3.5" />
              عرض التفاصيل
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs gap-1.5 rounded-xl"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Download className="w-3.5 h-3.5" />}
              {downloading ? "جارٍ..." : "تحميل"}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              className="w-full text-xs gap-1.5 rounded-xl"
              onClick={() => onEdit?.(organism)}
            >
              <Edit className="w-3.5 h-3.5" />
              تعديل
            </Button>

            <Button
              variant="destructive"
              size="sm"
              className="w-full text-xs gap-1.5 rounded-xl"
              onClick={() => onDelete?.(organism)}
            >
              <Trash2 className="w-3.5 h-3.5" />
              حذف
            </Button>
          </div>
        </div>
      </article>

      {/* ══ Detail dialog ══ */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent
          className="max-w-lg w-full max-h-[92dvh] overflow-y-auto p-0 rounded-2xl border-0 shadow-2xl"
          dir="rtl"
        >
          {/* Image header */}
          <div className="relative w-full bg-muted" style={{ aspectRatio: "16/9" }}>
            <img
              src={src}
              alt={safe(organism.name_ar) || "صورة الكائن"}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20 pointer-events-none" />
            <button
              onClick={() => setDetailOpen(false)}
              className="absolute top-3 left-3 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            {/* Logo in dialog — small, top-center */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2">
              <div
                className="flex flex-col items-center justify-center w-10 h-10 rounded-lg shadow-lg"
                style={{ background: PRIMARY }}
              >
                <span className="text-[10px] font-black text-white leading-tight">عراقي</span>
                <span className="text-[10px] font-black text-white leading-tight">أيكو</span>
              </div>
            </div>
            {/* Names overlay */}
            <div className="absolute bottom-0 right-0 left-0 p-4">
              <h2 className="text-2xl font-bold text-white leading-tight drop-shadow">
                {display(organism.name_ar)}
              </h2>
              <p className="text-sm italic text-white/80 font-serif mt-0.5 drop-shadow" dir="ltr">
                {display(organism.scientific_name)}
              </p>
            </div>
          </div>

          {/* Dialog body */}
          <div className="p-5 space-y-5">
            {/* IUCN */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">حالة الحفظ:</span>
              <IUCNBadge status={organism.conservation_status} />
            </div>

            {/* Description */}
            {hasDescription && (
              <div>
                <p className="text-xs font-bold text-primary/70 uppercase tracking-wider mb-1.5">الوصف</p>
                <p className="text-sm text-foreground leading-relaxed">{safe(organism.description)}</p>
              </div>
            )}

            {/* Taxonomy */}
            <div>
              <p className="text-xs font-bold text-primary/70 uppercase tracking-wider mb-2">التصنيف العلمي</p>
              <div
                className="rounded-xl px-3 py-1"
                style={{ background: "hsl(123 43% 97%)", border: "1px solid hsl(123 43% 86%)" }}
              >
                <TaxRow label="المملكة" value={organism.kingdom} />
                <TaxRow label="الشعبة"  value={organism.phylum} />
                <TaxRow label="الطائفة" value={organism['class']} />
                <TaxRow label="الرتبة"  value={null} />
                <TaxRow label="الفصيلة" value={organism.family} />
                <TaxRow label="الجنس"   value={null} />
                <TaxRow label="النوع"   value={null} />
              </div>
            </div>

            {/* Image link */}
            {hasRealImage && (
              <div>
                <p className="text-xs font-bold text-primary/70 uppercase tracking-wider mb-1.5">رابط الصورة</p>
                <a
                  href={safe(organism.image_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary underline break-all"
                  dir="ltr"
                >
                  {safe(organism.image_url)}
                </a>
              </div>
            )}

            {!hasRealImage && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                لا توجد صورة مرتبطة بهذا الكائن.
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 flex-wrap pt-1">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs rounded-xl"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Download className="w-3.5 h-3.5" />}
                تحميل كصورة
              </Button>
              {isAdmin && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1.5 text-xs rounded-xl"
                    onClick={() => { setDetailOpen(false); onEdit?.(organism); }}
                  >
                    <Edit className="w-3.5 h-3.5" />
                    تعديل
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-1.5 text-xs rounded-xl"
                    onClick={() => { setDetailOpen(false); onDelete?.(organism); }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    حذف
                  </Button>
                </>
              )}
            </div>

            {organism.created_at && (
              <p className="text-[11px] text-muted-foreground/60 text-center pt-1">
                أُضيف في {new Date(organism.created_at).toLocaleDateString("ar-IQ", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

