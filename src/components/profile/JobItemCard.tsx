import { MapPin, Eye, Star as StarIcon, Image as ImageIcon } from "lucide-react";
import type { Job } from "@/lib/api";

interface JobItemCardProps {
  job: Job;
}

export function JobItemCard({ job }: JobItemCardProps) {
  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="grid grid-cols-[6rem,1fr] gap-3 items-stretch">
        <div className="w-full h-full min-h-[4rem] rounded-md overflow-hidden bg-muted flex items-center justify-center">
          {job.image_url ? (
            <img src={job.image_url} alt={job.title} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-foreground truncate">{job.title}</h4>
            {job.is_promoted && (
              <span className="text-xs text-yellow-700 bg-yellow-100 rounded px-2 py-0.5 flex items-center gap-1">
                <StarIcon className="h-3 w-3" /> Promovida
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-muted-foreground flex items-center gap-3">
            {job.location && (<span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>)}
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{job.views || 0}</span>
            <span>{job.created_at ? new Date(job.created_at).toLocaleDateString('pt-PT') : ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
