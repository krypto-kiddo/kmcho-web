export default function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-bg-card border border-bg-border rounded-card p-5 ${className}`}
    >
      {children}
    </div>
  );
}