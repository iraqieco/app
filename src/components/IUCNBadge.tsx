const IUCN: Record<string, { label: string; bg: string; text: string; border: string }> = {
  EX: { label: 'منقرض',                       bg: '#000000', text: '#ffffff', border: '#000000' },
  EW: { label: 'منقرض في البرية',              bg: '#3d3d3d', text: '#ffffff', border: '#3d3d3d' },
  CR: { label: 'مهدد بخطر انقراض أقصى',       bg: '#CC0000', text: '#ffffff', border: '#CC0000' },
  EN: { label: 'مهدد بالانقراض',              bg: '#CC6600', text: '#ffffff', border: '#CC6600' },
  VU: { label: 'معرض للخطر',                  bg: '#CCCC00', text: '#000000', border: '#999900' },
  NT: { label: 'قريب من التهديد',              bg: '#6b7c3a', text: '#ffffff', border: '#6b7c3a' },
  LC: { label: 'أقل اهتمامًا',                bg: '#006600', text: '#ffffff', border: '#006600' },
  DD: { label: 'بيانات غير كافية',             bg: '#6b8fa8', text: '#ffffff', border: '#6b8fa8' },
  NE: { label: 'غير مُقيّم',                  bg: '#eeeeee', text: '#555555', border: '#cccccc' },
};

export function IUCNBadge({ status }: { status: string | null | undefined }) {
  const key = (status ?? '').trim().toUpperCase();
  const match = IUCN[key];

  if (!match) {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
        style={{ background: '#eeeeee', color: '#555555', border: '1px solid #cccccc' }}
      >
        <span className="opacity-70">IUCN</span>
        <span>غير محدد</span>
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ background: match.bg, color: match.text, border: `1px solid ${match.border}` }}
    >
      <span className="opacity-80">{key}</span>
      <span className="w-px h-3 bg-current opacity-30" />
      <span>{match.label}</span>
    </span>
  );
}

/** Returns the raw IUCN config for a status code, useful for theming */
export function getIUCNConfig(status: string | null | undefined) {
  const key = (status ?? '').trim().toUpperCase();
  return IUCN[key] ?? null;
}
