export default function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-[10px] tracking-[0.2em] uppercase text-text-muted font-medium">
        {label}
      </span>
      <div className="flex-1 h-px bg-bg-border" />
    </div>
  );
}