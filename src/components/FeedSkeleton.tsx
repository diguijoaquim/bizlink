import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FeedSkeleton() {
  return (
    <Card className="w-full border-border bg-card">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 pb-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="w-6 h-6 rounded" />
        </div>

        {/* Content */}
        <div className="px-4 pb-3">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-3" />
        </div>

        {/* Image */}
        <Skeleton className="w-full h-64" />

        {/* Actions */}
        <div className="flex items-center justify-between p-4 pt-3">
          <div className="flex items-center gap-4">
            <Skeleton className="w-6 h-6" />
            <Skeleton className="w-6 h-6" />
            <Skeleton className="w-6 h-6" />
          </div>
          <Skeleton className="w-6 h-6" />
        </div>

        {/* Stats */}
        <div className="px-4 pb-3">
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-3 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

export function FeedSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <FeedSkeleton key={i} />
      ))}
    </div>
  );
}
