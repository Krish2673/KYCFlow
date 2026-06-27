export function Spinner({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div
        className={`animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600 ${className}`}
      />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner />
    </div>
  );
}
