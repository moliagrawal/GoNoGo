export function ToolBadge({ name }: { name: string }) {
  const label = name === "get_weather" ? "Checking weather..." : "Calculating cost...";
  return (
    <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-gray-100 rounded-full px-3 py-1 my-1">
      <span className="animate-pulse">🔧</span> {label}
    </div>
  );
}
