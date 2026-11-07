export default function Loading() {
  return (
    <div>
      <div className="skeleton -mt-16 h-[300px] rounded-none sm:h-[380px] lg:h-[440px]" />
      <div className="relative -mt-40 sm:-mt-48">
        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="skeleton aspect-[2/3] w-36 sm:w-44 lg:w-full" />
            <div className="skeleton h-11" />
            <div className="skeleton h-72" />
          </div>
          <div className="space-y-4 lg:pt-28">
            <div className="skeleton h-12 w-3/4" />
            <div className="skeleton h-5 w-1/3" />
            <div className="flex gap-3 pt-2">
              <div className="skeleton h-14 w-14 rounded-full" />
              <div className="skeleton h-14 w-40" />
            </div>
            <div className="skeleton mt-6 h-12" />
            <div className="skeleton h-40" />
          </div>
        </div>
      </div>
    </div>
  );
}
