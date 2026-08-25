export function Avatar({
  name,
  color,
  size = 40,
}: {
  name: string;
  color: string;
  size?: number;
}) {
  return (
    <div
      className="rounded-2xl flex items-center justify-center font-bold text-white flex-shrink-0 font-display"
      style={{ width: size, height: size, background: color, fontSize: size * 0.42 }}
    >
      {name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}
