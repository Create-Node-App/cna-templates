import { Skeleton, SkeletonCard, SkeletonStats } from '@/shared/components/ui/skeleton';

export default function TenantLoading() {
  return (
    <div className="space-y-6 entrance-fade">
      {/* Page header skeleton */}
      <div className="rounded-lg bg-card border border-border shadow-sm p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <SkeletonStats count={5} />

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
