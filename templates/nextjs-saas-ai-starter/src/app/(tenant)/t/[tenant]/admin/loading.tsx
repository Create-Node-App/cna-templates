import { Skeleton, SkeletonStats, SkeletonTable } from '@/shared/components/ui/skeleton';

export default function AdminLoading() {
  return (
    <div className="space-y-6 entrance-fade" aria-busy="true" aria-live="polite">
      {/* Admin header skeleton */}
      <div className="rounded-lg bg-card border border-border shadow-sm p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
      </div>

      <SkeletonStats count={4} />
      <SkeletonTable rows={6} cols={5} />
    </div>
  );
}
