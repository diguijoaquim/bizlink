import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("skeleton", className)} />;
}

// Specific skeleton components for BizLink
export function BusinessCardSkeleton() {
  return (
    <div className="p-4 bg-card rounded-xl border bizlink-shadow-soft">
      <div className="flex items-start space-x-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-20 w-full rounded-lg" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="p-4 bg-card rounded-xl border bizlink-shadow-soft">
      <Skeleton className="h-32 w-full rounded-lg mb-4" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bizlink-animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
          {i % 2 === 0 ? <BusinessCardSkeleton /> : <ServiceCardSkeleton />}
        </div>
      ))}
    </div>
  );
}