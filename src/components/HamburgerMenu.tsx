import { useState } from "react";
import { Link } from "wouter";
import { Menu, X, Home, Info, Users, HeartHandshake, MessageCircle, ChevronDown, ChevronUp, LogIn } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// ─── Section data ─────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: "home",
    icon: Home,
    title: "الرئيسية",
    href: "/",
    content: null,
  },
  {
    id: "about",
    icon: Info,
    title: "حول",
    href: null,
    content: (
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground mb-2">المصادر المعتمدة في المشروع:</p>
        <ol className="space-y-1.5 list-decimal list-inside">
          {[
            "قوائم التحقق الأكاديمية.",
            "بحوث الجامعات والمعاهد.",
            "بحوث متحف التاريخ الطبيعي العراقي.",
            "الكتب الكلاسيكية (روبرت هات، بشير اللوس، والمسح البريطاني).",
            "المنصات وقواعد البيانات العالمية مثل iNaturalist و eBird وقواعد بيانات الكائنات الحية العالمية.",
          ].map((src, i) => (
            <li key={i} className="text-sm text-muted-foreground leading-relaxed">
              {src}
            </li>
          ))}
        </ol>
      </div>
    ),
  },
  {
    id: "who",
    icon: Users,
    title: "من نحن",
    href: null,
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        مشروع تطوعي يهدف إلى دراسة وحماية البيئة، بدأ في العراق ويهدف إلى التوسع عالميًا بإذن الله.
      </p>
    ),
  },
  {
    id: "support",
    icon: HeartHandshake,
    title: "الدعم",
    href: null,
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        لا يوجد دعم متاح حاليًا.
      </p>
    ),
  },
  {
    id: "contact",
    icon: MessageCircle,
    title: "التواصل",
    href: null,
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        <span className="font-mono font-semibold text-primary">@iraqi_eco</span> على جميع منصات التواصل الاجتماعي.
      </p>
    ),
  },
  {
    id: "admin-login",
    icon: LogIn,
    title: "تسجيل الإدارة",
    href: "/admin/login",
    content: null,
  },
] as const;

// ─── Accordion item ───────────────────────────────────────────────────────────

function SectionItem({
  section,
  onNavigate,
}: {
  section: (typeof SECTIONS)[number];
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const Icon = section.icon;

  if (section.href) {
    return (
      <Link
        href={section.href}
        onClick={onNavigate}
        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/8 transition-colors group"
      >
        <span
          className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
          style={{ background: "hsl(123 43% 92%)" }}
        >
          <Icon className="w-4 h-4 text-primary" />
        </span>
        <span className="font-semibold text-foreground text-[15px] group-hover:text-primary transition-colors">
          {section.title}
        </span>
      </Link>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-border/50">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
      >
        <span
          className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
          style={{ background: "hsl(123 43% 92%)" }}
        >
          <Icon className="w-4 h-4 text-primary" />
        </span>
        <span className="font-semibold text-foreground text-[15px] flex-grow text-right">
          {section.title}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 bg-muted/20 border-t border-border/40">
          {section.content}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function HamburgerMenu() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="القائمة"
          className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-primary/10 transition-colors text-primary"
        >
          <Menu className="w-5 h-5" />
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="w-80 max-w-[90vw] p-0 flex flex-col" dir="rtl">
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b flex-row items-center justify-between">
          <SheetTitle className="text-base font-bold text-primary">القائمة</SheetTitle>
        </SheetHeader>

        {/* Logo strip */}
        <div
          className="flex items-center gap-3 px-5 py-4 border-b"
          style={{ background: "hsl(123 43% 97%)" }}
        >
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
            style={{ background: "hsl(123, 43%, 24%)" }}
          >
            <img
              src="/pwa-192x192.png"
              alt="عراقي إيكو"
              className="w-8 h-8 rounded-lg object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <div>
            <p className="font-bold text-primary text-sm leading-tight">عراقي إيكو</p>
            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
              قاعدة بيانات الكائنات الحية في العراق
            </p>
          </div>
        </div>

        {/* Navigation sections */}
        <nav className="flex-grow overflow-y-auto px-4 py-4 space-y-2">
          {SECTIONS.map((section) => (
            <SectionItem
              key={section.id}
              section={section}
              onNavigate={() => setSheetOpen(false)}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t text-center">
          <p className="text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} عراقي إيكو — جميع الحقوق محفوظة
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

