export default function Loading() {
  return (
    <div className="pt-10">
      <div className="skeleton mb-3 h-10 w-64" />
      <div className="skeleton mb-6 h-5 w-96 max-w-full" />
      <div className="mb-6 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-10 w-32 rounded-full" />
        ))}
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton h-[124px]" />
        ))}
      </div>
    </div>
  );
}
